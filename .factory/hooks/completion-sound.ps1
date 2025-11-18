# completion-sound.ps1
$input = [System.Console]::In.ReadToEnd()
$jsonData = $input | ConvertFrom-Json
$hookEvent = $jsonData.hook_event_name

if ($hookEvent -ne "Stop") {
  exit 0
}

# Windows - dùng beep
[Console]::Beep(4000, 500)
exit 0