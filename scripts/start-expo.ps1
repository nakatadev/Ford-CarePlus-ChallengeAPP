$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodeDir = Join-Path $projectRoot ".local-node\node-v20.20.2-win-x64"
$node = Join-Path $nodeDir "node.exe"
$npmCli = Join-Path $nodeDir "node_modules\npm\bin\npm-cli.js"

if (-not (Test-Path $node) -or -not (Test-Path $npmCli)) {
  Write-Host "Node portatil nao encontrado em $nodeDir"
  Write-Host "Execute primeiro o comando de instalacao indicado pelo assistente."
  exit 1
}

$env:PATH = "$nodeDir;$env:PATH"

& $node $npmCli start -- --host lan --port 8090 --clear
