# Test D365 OData API - Check if entities are accessible
# Uses client_credentials flow to get token, then calls each entity with $top=1

$tenantId = "7b4aba43-984a-42fb-a496-af8b48e09c34"
$clientId = "1da19d9d-fba5-45a8-b200-652cc97c7c98"
$clientSecret = "IMo8Q~Xbh25bwNLCPJyRMfxTq9dEUS.fVbDHuc-R"
$scope = "https://responsevn-uat.sandbox.operations.dynamics.com/.default"
$baseUrl = "https://responsevn-uat.sandbox.operations.dynamics.com"

# Step 1: Get access token
Write-Host "=== Getting Access Token ===" -ForegroundColor Cyan
$tokenUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
$tokenBody = @{
    grant_type    = "client_credentials"
    client_id     = $clientId
    client_secret = $clientSecret
    scope         = $scope
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $token = $tokenResponse.access_token
    Write-Host "Token acquired successfully!" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "FAILED to get token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Define entities to test (from D365_Dynamic_Entity_Diagram.md)
$entities = @(
    @{ Name = "ProductLifecycleStates";                   Desc = "Product Lifecycle States" }
    @{ Name = "ProductCategoryHierarchies";               Desc = "Product Category Hierarchies" }
    @{ Name = "ProductCategories";                        Desc = "Product Categories" }
    @{ Name = "ProductCategoryAssignments";               Desc = "Product Category Assignments" }
    @{ Name = "ReleasedProductsV2";                       Desc = "Released Products V2 (pricing + dimensions)" }
    @{ Name = "ProductAttributes";                        Desc = "Product Attributes" }
    @{ Name = "ProductAttributeValues";                   Desc = "Product Attribute Values V3" }
    @{ Name = "ProductTranslations";                      Desc = "Product Translations" }
    @{ Name = "ProductMasterColorTranslations";           Desc = "Product Master Color Translations" }
    @{ Name = "ProductMasterSizeTranslations";            Desc = "Product Master Size Translations" }
    @{ Name = "ProductMasterStyleTranslations";           Desc = "Product Master Style Translations" }
    @{ Name = "ProductMasterConfigurationTranslations";   Desc = "Product Master Configuration Translations" }
    @{ Name = "ProductMasters";                           Desc = "Product Masters" }
    @{ Name = "ProductVariantsV2";                        Desc = "Product Variants V2" }
)

# Step 3: Test each entity
Write-Host "=== Testing D365 OData Entities ===" -ForegroundColor Cyan
Write-Host ("{0,-50} {1,-10} {2,-10} {3}" -f "Entity", "Status", "Records", "Sample") -ForegroundColor Yellow
Write-Host ("-" * 120)

$headers = @{
    Authorization = "Bearer $token"
}

$results = @()

foreach ($entity in $entities) {
    $url = "$baseUrl/data/$($entity.Name)?cross-company=true&`$top=2"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers -ContentType "application/json"
        $count = $response.value.Count
        $sample = ""
        if ($count -gt 0) {
            # Try to get a meaningful sample field
            $first = $response.value[0]
            $props = $first.PSObject.Properties | Where-Object { $_.Name -notlike "@odata*" } | Select-Object -First 3
            $sample = ($props | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ", "
            if ($sample.Length -gt 60) { $sample = $sample.Substring(0, 60) + "..." }
        }
        
        $status = if ($count -gt 0) { "OK" } else { "EMPTY" }
        $color = if ($count -gt 0) { "Green" } else { "Yellow" }
        Write-Host ("{0,-50} {1,-10} {2,-10} {3}" -f $entity.Name, $status, $count, $sample) -ForegroundColor $color
        
        $results += @{ Entity = $entity.Name; Status = $status; Count = $count; Error = "" }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $errorMsg = "HTTP $statusCode - $errorMsg"
        }
        if ($errorMsg.Length -gt 60) { $errorMsg = $errorMsg.Substring(0, 60) + "..." }
        
        Write-Host ("{0,-50} {1,-10} {2,-10} {3}" -f $entity.Name, "FAILED", "-", $errorMsg) -ForegroundColor Red
        
        $results += @{ Entity = $entity.Name; Status = "FAILED"; Count = 0; Error = $errorMsg }
    }
    
    # Small delay to avoid throttling
    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
$ok = ($results | Where-Object { $_.Status -eq "OK" }).Count
$empty = ($results | Where-Object { $_.Status -eq "EMPTY" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAILED" }).Count
Write-Host "  OK (has data): $ok" -ForegroundColor Green
Write-Host "  EMPTY (no data): $empty" -ForegroundColor Yellow
Write-Host "  FAILED (error): $failed" -ForegroundColor Red
Write-Host "  Total tested: $($results.Count)"
