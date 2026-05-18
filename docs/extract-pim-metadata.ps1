<#
.SYNOPSIS
    Extracts a PIM-relevant subset from the D365 dynamic-metadata.xml file
    using streaming XmlReader (fast on large files).

.DESCRIPTION
    The full D365 OData metadata file contains ~4,796 entity types (52 MB).
    This script filters it down to ~30 entities required for PIM integration,
    producing a slim XML suitable for OData proxy code generation.

    Two-pass approach:
      Pass 1: Stream the source XML, capture whitelisted EntityType blocks
              and matching EntitySet blocks.
      Pass 2: Scan captured EntityType blocks for type references, then
              stream again to capture referenced EnumType / ComplexType blocks.
    Pass 3: Write the slim XML.

.PARAMETER InputPath
    Path to the source dynamic-metadata.xml file.

.PARAMETER OutputPath
    Path where the slim metadata XML will be written.

.PARAMETER WhitelistPath
    Optional path to a text file with one entity name per line.
    If omitted, the built-in PIM whitelist is used.

.EXAMPLE
    .\extract-pim-metadata.ps1 -InputPath .\dynamic-metadata.xml -OutputPath .\pim-metadata.xml
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [Parameter(Mandatory = $false)]
    [string]$WhitelistPath
)

$ErrorActionPreference = 'Stop'

$defaultWhitelist = @(
    'ReleasedProductV2'
    'ReleasedProductMasterV2'
    'ReleasedProductVariantV2'
    'ProductMaster'
    'ProductVariant'
    'ProductCategoryHierarchy'
    'ProductCategory'
    'ProductCategoryAssignment'
    'ReleasedProductCategory'
    'ProductAttribute'
    'ProductAttributeValueV3'
    'ProductAttributeValueType'
    'ProductAttributeEnumerationTextTypeV3'
    'ProductAttributeTranslation'
    'InternalOrganizationProductAttributeMetadata'
    'ProductTranslation'
    'ProductMasterStyleTranslation'
    'ProductMasterColorTranslation'
    'ProductMasterSizeTranslation'
    'ProductMasterConfigurationTranslation'
    'ProductMasterVersionTranslation'
    'PhysicalProductDimensionDetails'
    'UnitOfMeasure'
    'UnitOfMeasureConversion'
    'ReleasedProductDocumentAttachment'
    'ProductDocumentAttachment'
    'BusinessDocumentDocuRef'
    'SalesPriceAgreement'
    'PurchasePriceAgreement'
    'ProductLifecycleState'
)

if ($WhitelistPath) {
    if (-not (Test-Path $WhitelistPath)) { throw "Whitelist not found: $WhitelistPath" }
    $whitelist = Get-Content $WhitelistPath |
        Where-Object { $_.Trim() -and -not $_.StartsWith('#') } |
        ForEach-Object { $_.Trim() }
    Write-Host "Loaded $($whitelist.Count) entities from $WhitelistPath"
} else {
    $whitelist = $defaultWhitelist
    Write-Host "Using default PIM whitelist: $($whitelist.Count) entities"
}

if (-not (Test-Path $InputPath)) { throw "Input not found: $InputPath" }

$wantedEntities = New-Object System.Collections.Generic.HashSet[string]
foreach ($n in $whitelist) { [void]$wantedEntities.Add($n) }

$inputSizeMb = [math]::Round((Get-Item $InputPath).Length / 1MB, 2)
Write-Host "Input size: $inputSizeMb MB"

# ---------------------------------------------------------------
# Pass 1: stream and collect EntityType + EntitySet blocks
# ---------------------------------------------------------------
Write-Host ""
Write-Host "Pass 1: scanning EntityTypes and EntitySets..."

$entityBlocks = @{}
$entitySetBlocks = @{}

$readerSettings = New-Object System.Xml.XmlReaderSettings
$readerSettings.IgnoreComments = $true
$readerSettings.IgnoreWhitespace = $false
$readerSettings.DtdProcessing = [System.Xml.DtdProcessing]::Ignore

$reader = [System.Xml.XmlReader]::Create($InputPath, $readerSettings)
try {
    while ($reader.Read()) {
        if ($reader.NodeType -ne [System.Xml.XmlNodeType]::Element) { continue }

        if ($reader.LocalName -eq 'EntityType') {
            $name = $reader.GetAttribute('Name')
            if ($name -and $wantedEntities.Contains($name)) {
                $xml = $reader.ReadOuterXml()
                $entityBlocks[$name] = $xml
            }
        }
        elseif ($reader.LocalName -eq 'EntitySet') {
            $name = $reader.GetAttribute('Name')
            $entityTypeAttr = $reader.GetAttribute('EntityType')
            # EntityType attribute is "Microsoft.Dynamics.DataEntities.<TypeName>"
            $shortType = $null
            if ($entityTypeAttr) {
                $idx = $entityTypeAttr.LastIndexOf('.')
                if ($idx -ge 0) { $shortType = $entityTypeAttr.Substring($idx + 1) }
            }
            if ($shortType -and $wantedEntities.Contains($shortType)) {
                $xml = $reader.ReadOuterXml()
                $entitySetBlocks[$name] = $xml
            }
        }
    }
}
finally {
    $reader.Close()
}

Write-Host "  EntityTypes captured: $($entityBlocks.Count) / $($wantedEntities.Count)"
Write-Host "  EntitySets captured:  $($entitySetBlocks.Count)"

$missing = $whitelist | Where-Object { -not $entityBlocks.ContainsKey($_) }
if ($missing.Count -gt 0) {
    Write-Warning "Missing entities: $($missing -join ', ')"
}

# ---------------------------------------------------------------
# Pass 2: find referenced types in captured blocks
# ---------------------------------------------------------------
Write-Host ""
Write-Host "Pass 2: resolving referenced types..."

$referencedTypes = New-Object System.Collections.Generic.HashSet[string]
$refRegex = [regex]'Microsoft\.Dynamics\.DataEntities\.([A-Za-z0-9_]+)'

foreach ($block in $entityBlocks.Values) {
    foreach ($m in $refRegex.Matches($block)) {
        [void]$referencedTypes.Add($m.Groups[1].Value)
    }
}
Write-Host "  Unique referenced type names: $($referencedTypes.Count)"

# ---------------------------------------------------------------
# Pass 3: stream and collect EnumType + ComplexType blocks
# ---------------------------------------------------------------
Write-Host ""
Write-Host "Pass 3: scanning EnumTypes and ComplexTypes..."

$enumBlocks = @{}
$complexBlocks = @{}

$reader = [System.Xml.XmlReader]::Create($InputPath, $readerSettings)
try {
    while ($reader.Read()) {
        if ($reader.NodeType -ne [System.Xml.XmlNodeType]::Element) { continue }

        if ($reader.LocalName -eq 'EnumType') {
            $name = $reader.GetAttribute('Name')
            if ($name -and $referencedTypes.Contains($name)) {
                $xml = $reader.ReadOuterXml()
                $enumBlocks[$name] = $xml
            }
        }
        elseif ($reader.LocalName -eq 'ComplexType') {
            $name = $reader.GetAttribute('Name')
            if ($name -and $referencedTypes.Contains($name)) {
                $xml = $reader.ReadOuterXml()
                $complexBlocks[$name] = $xml
            }
        }
    }
}
finally {
    $reader.Close()
}

Write-Host "  EnumTypes captured:    $($enumBlocks.Count)"
Write-Host "  ComplexTypes captured: $($complexBlocks.Count)"

# ---------------------------------------------------------------
# Build output XML
# ---------------------------------------------------------------
Write-Host ""
Write-Host "Building output XML..."

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="utf-8"?>')
[void]$sb.AppendLine('<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">')
[void]$sb.AppendLine('  <edmx:DataServices>')
[void]$sb.AppendLine('    <Schema Namespace="Microsoft.Dynamics.DataEntities" xmlns="http://docs.oasis-open.org/odata/ns/edm">')

foreach ($k in ($enumBlocks.Keys | Sort-Object))    { [void]$sb.AppendLine('      ' + $enumBlocks[$k]) }
foreach ($k in ($complexBlocks.Keys | Sort-Object)) { [void]$sb.AppendLine('      ' + $complexBlocks[$k]) }
foreach ($k in ($entityBlocks.Keys | Sort-Object))  { [void]$sb.AppendLine('      ' + $entityBlocks[$k]) }

[void]$sb.AppendLine('      <EntityContainer Name="Resources">')
foreach ($k in ($entitySetBlocks.Keys | Sort-Object)) {
    [void]$sb.AppendLine('        ' + $entitySetBlocks[$k])
}
[void]$sb.AppendLine('      </EntityContainer>')

[void]$sb.AppendLine('    </Schema>')
[void]$sb.AppendLine('  </edmx:DataServices>')
[void]$sb.AppendLine('</edmx:Edmx>')

[System.IO.File]::WriteAllText($OutputPath, $sb.ToString(), [System.Text.Encoding]::UTF8)

$outSize = (Get-Item $OutputPath).Length
$outSizeKb = [math]::Round($outSize / 1KB, 2)
$reduction = [math]::Round((1 - ($outSize / (Get-Item $InputPath).Length)) * 100, 2)

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  Output: $OutputPath"
Write-Host "  Size:   $outSizeKb KB ($reduction% reduction)"
Write-Host ""
Write-Host "Summary:"
Write-Host "  EntityTypes:  $($entityBlocks.Count)"
Write-Host "  EnumTypes:    $($enumBlocks.Count)"
Write-Host "  ComplexTypes: $($complexBlocks.Count)"
Write-Host "  EntitySets:   $($entitySetBlocks.Count)"
