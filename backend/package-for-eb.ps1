# ===========================================================
# Bazaar Hub — AWS Part 2 Backend Packaging Script
# Run this from the bazaar-hub/backend directory
# ===========================================================

$ErrorActionPreference = "Stop"
$ZipName = "bazaar-hub-backend.zip"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Bazaar Hub — EB Deployment Packager" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Remove old zip if it exists
if (Test-Path $ZipName) {
    Remove-Item $ZipName -Force
    Write-Host "[INFO] Removed old $ZipName" -ForegroundColor Yellow
}

# Files and folders to include
$includes = @(
    "src",
    "migrations",
    "Procfile",
    "package.json",
    "package-lock.json",
    ".ebextensions"
)

Write-Host "[INFO] Packaging the following items:" -ForegroundColor Green
$includes | ForEach-Object { Write-Host "       - $_" }

# Create a temp folder for staging
$tempDir = ".\eb-staging-temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy items to temp
foreach ($item in $includes) {
    if (Test-Path $item) {
        Copy-Item $item $tempDir -Recurse -Force
    } else {
        Write-Host "[WARN] $item not found, skipping." -ForegroundColor Yellow
    }
}

# Create the zip from temp folder contents
Compress-Archive -Path "$tempDir\*" -DestinationPath $ZipName -Force

# Cleanup temp
Remove-Item $tempDir -Recurse -Force

$size = (Get-Item $ZipName).Length / 1KB
Write-Host ""
Write-Host "[SUCCESS] Created $ZipName ($([math]::Round($size, 1)) KB)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload $ZipName to Elastic Beanstalk" -ForegroundColor White
Write-Host "  2. Set environment variables in EB console" -ForegroundColor White
Write-Host "  3. Build the frontend: cd ..\frontend && npm run build" -ForegroundColor White
Write-Host ""
