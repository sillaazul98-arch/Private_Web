$baseDir = $PSScriptRoot

$channels = @(
    @{ Json = "El servidor de Patimilechita - H - hen [1466190102995800198].json"; Dir = "hen" },
    @{ Json = "Dbh - Dbh - comics [1510753600786137190].json"; Dir = "comics" },
    @{ Json = "El servidor de Patimilechita - H - v [1499156011943067658].json"; Dir = "v" }
)

$total = 0
$downloaded = 0
$failed = 0

foreach ($ch in $channels) {
    $jsonPath = Join-Path $baseDir $ch.Json
    $outDir = Join-Path $baseDir "covers\$($ch.Dir)"
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null

    Write-Host "Processing $($ch.Dir)..." -ForegroundColor Cyan
    $raw = [IO.File]::ReadAllText($jsonPath)
    $json = $raw | ConvertFrom-Json

    $msgs = $json.messages | Where-Object { $_.content -match 'drive\.google\.com' -and $_.attachments.Count -gt 0 }

    foreach ($msg in $msgs) {
        $att = $msg.attachments[0]
        $ext = if ($att.fileName) { [IO.Path]::GetExtension($att.fileName) } else { ".jpg" }
        if (-not $ext) { $ext = ".jpg" }
        $outFile = Join-Path $outDir "$($att.id)$ext"

        if (Test-Path $outFile) {
            $downloaded++
            $total++
            continue
        }

        $total++
        try {
            $wc = New-Object System.Net.WebClient
            $wc.Headers.Add("User-Agent", "Mozilla/5.0")
            $wc.DownloadFile($att.url, $outFile)
            $downloaded++
            if ($downloaded % 50 -eq 0) {
                Write-Host "  Downloaded $downloaded / $total..." -ForegroundColor Green
            }
        } catch {
            $failed++
            Write-Host "  FAILED: $($att.id) - $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nDone! Downloaded: $downloaded, Failed: $failed, Total: $total" -ForegroundColor Green
