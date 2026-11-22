# Рендер готових постів у PNG через headless Microsoft Edge (Python/Node не потрібні).
#   powershell -ExecutionPolicy Bypass -File posts/render.ps1            — усі пости з posts.js
#   powershell -ExecutionPolicy Bypass -File posts/render.ps1 bf-last-days — один пост
# Результат: posts/export/<id>.png у точному розмірі полотна.
param([string[]]$Only)
$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
$out = Join-Path $dir 'export'
New-Item -ItemType Directory -Force $out | Out-Null

$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
          "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
          "$env:ProgramFiles\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Не знайдено Edge або Chrome' }

# id і розмір беремо з маніфесту posts.js:  { id: '...', w: 1080, h: 1350, ... }
$manifest = Get-Content (Join-Path $dir 'posts.js') -Raw -Encoding UTF8
$posts = [regex]::Matches($manifest, "id:\s*'([^']+)'[^}]*?w:\s*(\d+),\s*h:\s*(\d+)") |
  ForEach-Object { [pscustomobject]@{ Id = $_.Groups[1].Value; W = $_.Groups[2].Value; H = $_.Groups[3].Value } }
if ($Only) { $posts = $posts | Where-Object { $Only -contains $_.Id } }

$ErrorActionPreference = 'Continue'  # Edge пише службові попередження в stderr
$tmpProfile = Join-Path $env:TEMP 'andretan-render-profile'
foreach ($p in $posts) {
  $src = 'file:///' + ((Join-Path $dir "$($p.Id).html") -replace '\\', '/')
  $png = Join-Path $out "$($p.Id).png"
  & $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
    "--user-data-dir=$tmpProfile" "--window-size=$($p.W),$($p.H)" --virtual-time-budget=8000 `
    "--screenshot=$png" $src 2>$null | Out-Null
  if (Test-Path $png) { Write-Host "OK  $($p.Id).png  $($p.W)x$($p.H)" } else { Write-Host "ERR $($p.Id)" }
}
