using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Pim.Infrastructure.D365;

public sealed class D365HttpClient
{
    private readonly HttpClient _httpClient;
    private readonly D365TokenService _tokenService;
    private readonly D365Options _options;
    private readonly ILogger<D365HttpClient> _logger;
    private const int MaxRetries = 3;

    public D365HttpClient(HttpClient httpClient, D365TokenService tokenService, IOptions<D365Options> options, ILogger<D365HttpClient> logger)
    {
        _httpClient = httpClient;
        _tokenService = tokenService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<List<T>> GetAllAsync<T>(string entityPath, string? filter = null, string? select = null, int? top = null, CancellationToken ct = default)
    {
        var results = new List<T>();
        var url = BuildUrl(entityPath, filter, select, top);

        while (url is not null)
        {
            var response = await SendWithRetryAsync(url, ct);
            var odataResponse = await response.Content.ReadFromJsonAsync<ODataResponse<T>>(JsonOptions, ct)
                ?? throw new InvalidOperationException($"Failed to deserialize OData response from {url}");

            results.AddRange(odataResponse.Value);

            // Stop pagination if $top was specified (only fetch first page)
            url = top.HasValue ? null : odataResponse.NextLink;

            _logger.LogDebug("Fetched {Count} records from D365, total so far: {Total}", odataResponse.Value.Count, results.Count);
        }

        return results;
    }

    private string BuildUrl(string entityPath, string? filter, string? select, int? top)
    {
        var baseUrl = _options.BaseUrl.TrimEnd('/');
        var url = $"{baseUrl}/data/{entityPath}?cross-company=true";

        if (!string.IsNullOrWhiteSpace(filter))
            url += $"&$filter={filter}";
        if (!string.IsNullOrWhiteSpace(select))
            url += $"&$select={select}";
        if (top.HasValue)
            url += $"&$top={top.Value}";

        return url;
    }

    private async Task<HttpResponseMessage> SendWithRetryAsync(string url, CancellationToken ct)
    {
        for (int attempt = 0; attempt <= MaxRetries; attempt++)
        {
            var token = await _tokenService.GetAccessTokenAsync(ct);

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request, ct);

            if (response.IsSuccessStatusCode)
                return response;

            if (response.StatusCode == HttpStatusCode.TooManyRequests || (int)response.StatusCode >= 500)
            {
                if (attempt < MaxRetries)
                {
                    var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt + 1));
                    _logger.LogWarning("D365 request failed with {StatusCode}, retrying in {Delay}s (attempt {Attempt}/{Max})",
                        response.StatusCode, delay.TotalSeconds, attempt + 1, MaxRetries);
                    await Task.Delay(delay, ct);
                    continue;
                }
            }

            var errorBody = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("D365 request failed: {StatusCode} {Url} - {Body}", response.StatusCode, url, errorBody);
            response.EnsureSuccessStatusCode();
        }

        throw new InvalidOperationException("Exhausted retries for D365 request.");
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private sealed class ODataResponse<T>
    {
        [JsonPropertyName("value")]
        public List<T> Value { get; set; } = new();

        [JsonPropertyName("@odata.nextLink")]
        public string? NextLink { get; set; }
    }
}
