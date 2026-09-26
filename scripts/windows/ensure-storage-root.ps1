# Fase 3 - garante que a pasta raiz de storage local existe.
# Rode a partir da raiz do projeto: C:\apps\lwos
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\windows\ensure-storage-root.ps1

$storageRoot = "C:\apps\lwos\storage"
if (-not (Test-Path $storageRoot)) {
  New-Item -ItemType Directory -Path $storageRoot -Force | Out-Null
  Write-Host "Criado: $storageRoot"
} else {
  Write-Host "Já existe: $storageRoot"
}
