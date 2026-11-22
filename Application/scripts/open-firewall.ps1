# Run once in an Administrator PowerShell so a phone on the same Wi-Fi can reach the AniLink server.
#   powershell -ExecutionPolicy Bypass -File scripts\open-firewall.ps1
$ruleName = 'AniLink Server (TCP 4000)'
if (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue) {
  Write-Host "Rule '$ruleName' already exists."
} else {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow -Profile Private,Public | Out-Null
  Write-Host "Added inbound rule '$ruleName'."
}
Write-Host 'Your PC addresses on this network:'
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } | ForEach-Object { Write-Host ("  http://{0}:4000" -f $_.IPAddress) }
