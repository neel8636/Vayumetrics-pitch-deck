# Build Vayumetrics Alchemist video (normalize + overlays + outro + concat)
# Usage (from PowerShell):
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   cd "C:\Users\neel8\OneDrive\Desktop\videos_Alchemy"
#   .\build_alchemist_video.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ---------- PATHS ----------
$DIR   = "C:\Users\neel8\OneDrive\Desktop\videos_Alchemy"
$NEEL  = Join-Path $DIR "Neel_B@Intro.mp4"
$JAY1  = Join-Path $DIR "Jay_intro.mp4"
$JAY2  = Join-Path $DIR "Jay_tech_expl.mp4"
$LOGO  = Join-Path $DIR "VL.png"

# Outputs
$OUT_NEEL  = Join-Path $DIR "01_neel_labeled.mp4"
$OUT_JAY1  = Join-Path $DIR "02_jay_intro_labeled.mp4"
$OUT_JAY2  = Join-Path $DIR "03_jay_tech_labeled.mp4"
$OUT_OUTRO = Join-Path $DIR "04_outro.mp4"
$LIST      = Join-Path $DIR "concat.txt"
$FINAL     = Join-Path $DIR "Vayumetrics_Alchemist_Application_final.mp4"

# Use fontfile to avoid Fontconfig; note the escaped colon C\:/...
$FONTFILE = "C\:/Windows/Fonts/arial.ttf"

# ---------- CHECK FFMPEG ----------
try { $FFMPEG = (Get-Command ffmpeg -ErrorAction Stop).Path } catch { $FFMPEG = $null }
if (-not $FFMPEG) { throw "FFmpeg not found on PATH. Install (e.g. winget install Gyan.FFmpeg) or add to PATH." }

# ---------- INPUT VALIDATION ----------
foreach ($p in @($NEEL,$JAY1,$JAY2,$LOGO)) {
  if (-not (Test-Path $p)) { throw "Missing file: $p" }
}
if (-not (Test-Path ($FONTFILE -replace '/','\'))) {
  Write-Warning "Arial font not found at $($FONTFILE -replace '/','\'). Using drawtext default may show Fontconfig warnings."
}

# ---------- FUNCTION: Normalize + Overlay ----------
function Add-Overlay-Normalize {
  param(
    [Parameter(Mandatory)][string]$inFile,
    [Parameter(Mandatory)][string]$outFile,
    [Parameter(Mandatory)][string]$titleText
  )

  # IMPORTANT: No comments in filtergraph; single string
  $vf = @"
[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(1280-iw)/2:(720-ih)/2,setsar=1,fps=30,format=yuv420p[v];
[1:v]scale=160:-1[logo];
[v][logo]overlay=x=W-w-24:y=24,drawtext=fontfile='$FONTFILE':text='$titleText':x=24:y=H-th-24:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=10:enable='between(t,0,4)'[vo]
"@

  & $FFMPEG -y `
    -i "$inFile" -i "$LOGO" `
    -filter_complex $vf `
    -map "[vo]" -map 0:a? `
    -af "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,aresample=48000" `
    -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p `
    -c:a aac -b:a 160k -ar 48000 -ac 2 `
    "$outFile"

  if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed for $inFile" }
}

# ---------- STEP 1: Render normalized + labeled clips ----------
Write-Host "▶ Rendering Neel clip..."
Add-Overlay-Normalize -inFile $NEEL -outFile $OUT_NEEL -titleText "Neel Desai — Founder & CEO"

Write-Host "▶ Rendering Jay intro clip..."
Add-Overlay-Normalize -inFile $JAY1 -outFile $OUT_JAY1 -titleText "Jay — Co-Founder"

Write-Host "▶ Rendering Jay technical clip..."
Add-Overlay-Normalize -inFile $JAY2 -outFile $OUT_JAY2 -titleText "Product & Technical Overview — Jay"

# ---------- STEP 2: Build outro (5s black, logo bottom-right, centered text) ----------
Write-Host "▶ Building outro..."

$vf_outro = @"
[1:v]scale=160:-1[logo];
[0:v][logo]overlay=x=W-w-24:y=H-h-24,drawtext=fontfile='$FONTFILE':text='Thank you — Vayumetrics':x=(W-tw)/2:y=(H-th)/2:fontsize=48:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=20[outv]
"@

& $FFMPEG -y `
  -f lavfi -t 5 -i "color=c=black:s=1280x720:r=30" `
  -i "$LOGO" `
  -f lavfi -t 5 -i "anullsrc=channel_layout=stereo:sample_rate=48000" `
  -filter_complex $vf_outro `
  -map "[outv]" -map 2:a `
  -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p `
  -c:a aac -b:a 160k -ar 48000 -ac 2 `
  "$OUT_OUTRO"

if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed for outro" }

# ---------- STEP 3: Concat all segments ----------
Write-Host "▶ Concatenating segments..."
@(
  "file '$OUT_NEEL'"
  "file '$OUT_JAY1'"
  "file '$OUT_JAY2'"
  "file '$OUT_OUTRO'"
) | Set-Content -Encoding Ascii $LIST

# Try stream copy first (fast), then re-encode fallback
& $FFMPEG -y -f concat -safe 0 -i "$LIST" -c copy "$FINAL"
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Stream copy concat failed; re-encoding..."
  & $FFMPEG -y -f concat -safe 0 -i "$LIST" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 -ac 2 "$FINAL"
  if ($LASTEXITCODE -ne 0) { throw "FFmpeg concat failed" }
}

Write-Host ""
Write-Host "✅ Done -> $FINAL"
if (Test-Path $FINAL) { Start-Process "$FINAL" }
