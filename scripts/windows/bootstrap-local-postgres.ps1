param(
  [string]$PostgresUser = "postgres",
  [string]$HostName = "localhost",
  [int]$Port = 5432
)

$securePassword = Read-Host "Senha do PostgreSQL" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
$env:PGPASSWORD = $plainPassword

try {
  psql -U $PostgresUser -h $HostName -p $Port -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'lwos_db'" | Select-String -Quiet "1";
  if (-not $?) { throw "psql não retornou uma resposta válida." }
  psql -U $PostgresUser -h $HostName -p $Port -d postgres -c "SELECT 'CREATE DATABASE lwos_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lwos_db')\gexec"
  psql -U $PostgresUser -h $HostName -p $Port -d postgres -c "SELECT 'CREATE DATABASE lwos_db_test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'lwos_db_test')\gexec"
  Write-Host "Bancos lwos_db e lwos_db_test preparados." -ForegroundColor Green
  Write-Host "Copie .env.local.example para .env.local e informe a senha local." -ForegroundColor Yellow
}
finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}
