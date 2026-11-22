# Локальний сервер дизайн-системи:  powershell -ExecutionPolicy Bypass -File serve.ps1
#
# Публічні сторінки (index.html, published.html, posts/) — як і раніше.
# Редактор (editor/) і API (api/) — ЛИШЕ з секретним ключем:
#   http://localhost:5500/editor/?key=<ключ з .editor-key>
# Ключ генерується при першому запуску, лежить у .editor-key (не в git).
# Без ключа редактор відповідає 404 — ніби його не існує.
# Сервер слухає тільки localhost: з інших комп'ютерів він недоступний.
param([int]$Port = 5500)
$root = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\') + '\'
$utf8 = New-Object Text.UTF8Encoding $false

$keyFile = Join-Path $root '.editor-key'
if (-not (Test-Path $keyFile)) {
  $b = New-Object byte[] 24
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  [IO.File]::WriteAllText($keyFile, (-join ($b | ForEach-Object { $_.ToString('x2') })), $utf8)
}
$key = ([IO.File]::ReadAllText($keyFile)).Trim()

$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
  '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp';
  '.woff'='font/woff'; '.woff2'='font/woff2'; '.json'='application/json' }

function Send-Bytes($res, [int]$code, [string]$type, [byte[]]$bytes) {
  $res.StatusCode = $code
  $res.ContentType = $type
  $res.Headers.Add('Cache-Control', 'no-store')
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
}
function Send-Text($res, [int]$code, [string]$text) { Send-Bytes $res $code 'text/plain; charset=utf-8' $utf8.GetBytes($text) }
function Read-Body($req) {
  $sr = New-Object IO.StreamReader($req.InputStream, $utf8)
  try { $sr.ReadToEnd() } finally { $sr.Dispose() }
}

$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "ANDRE TAN DS   -> http://localhost:$Port/"
Write-Host "Редактор (лише для вас, нікому не пересилайте):"
Write-Host "               -> http://localhost:$Port/editor/?key=$key"

while ($l.IsListening) {
  $ctx = $l.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))

    # ── Приватна зона: editor/ та api/ ──
    if ($rel -eq 'editor' -or $rel.StartsWith('editor/') -or $rel.StartsWith('api/')) {
      $c = $req.Cookies['at_editor']
      $authed = $c -and $c.Value -eq $key
      if (-not $authed -and $req.QueryString['key'] -eq $key) {
        # ключ з посилання → у cookie (HttpOnly) і прибираємо його з адресного рядка
        $res.Headers.Add('Set-Cookie', "at_editor=$key; Path=/; HttpOnly; SameSite=Strict")
        $res.Redirect('/editor/')
        continue
      }
      if (-not $authed) { Send-Text $res 404 'Not found'; continue }
      $res.Headers.Add('X-Robots-Tag', 'noindex, nofollow')

      if ($rel.StartsWith('api/')) {
        if ($req.HttpMethod -ne 'POST') { Send-Text $res 405 'POST only'; continue }
        switch ($rel) {
          'api/theme' {
            $css = Read-Body $req
            if ($css.Length -gt 200000) { Send-Text $res 413 'Too large'; break }
            [IO.File]::WriteAllText((Join-Path $root 'theme.css'), $css, $utf8)
            Send-Text $res 200 'saved'
          }
          'api/render' {
            $out = & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'posts\render.ps1') 2>&1 | Out-String
            Send-Text $res 200 $out
          }
          'api/commit' {
            $msg = (Read-Body $req).Trim()
            if (-not $msg) { $msg = 'Theme: update from editor' }
            $msg = $msg -replace '[\r\n"]', ' '
            $out = & git -C $root add theme.css posts/export 2>&1 | Out-String
            $out += & git -C $root commit -m "$msg" -- theme.css posts/export 2>&1 | Out-String
            Send-Text $res 200 $out
          }
          default { Send-Text $res 404 'Not found' }
        }
        continue
      }
      if ($rel -eq 'editor') { $res.Redirect('/editor/'); continue }
    }

    # ── Статичні файли ──
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
    # службові файли не віддаємо: .editor-key, .git, *.ps1
    if (($rel -split '/' | Where-Object { $_.StartsWith('.') }) -or $rel.EndsWith('.ps1')) { Send-Text $res 404 'Not found'; continue }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if ($path.StartsWith($root) -and (Test-Path $path -PathType Leaf)) {
      $ext = [IO.Path]::GetExtension($path).ToLower()
      $type = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
      Send-Bytes $res 200 $type ([IO.File]::ReadAllBytes($path))
    } else { Send-Text $res 404 'Not found' }
  } catch {
    try { Send-Text $res 500 $_.Exception.Message } catch {}
  } finally {
    $res.Close()
  }
}
