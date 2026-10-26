$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $workspaceRoot '.env'

if (-not (Test-Path $envPath)) {
    throw 'MySQL credentials are missing. Run scripts/setup-mysql.ps1 first.'
}

$settings = @{}
foreach ($line in Get-Content $envPath) {
    if ($line -match '^\s*([A-Z_]+)\s*=\s*(.*?)\s*$' -and $Matches[1] -notmatch 'PASSWORD') {
        $settings[$Matches[1]] = $Matches[2]
    }
}

if (-not $settings.MYSQL_DATABASE -or -not $settings.MYSQL_USER -or -not $settings.MYSQL_PORT) {
    throw 'The local .env file is missing required MySQL settings.'
}

$settings.MYSQL_PASSWORD = (Get-Content $envPath | Where-Object { $_ -match '^MYSQL_PASSWORD=' } | Select-Object -First 1) -replace '^MYSQL_PASSWORD=', ''
if (-not $settings.MYSQL_PASSWORD) {
    throw 'The local .env file is missing MYSQL_PASSWORD.'
}

$environmentNames = @('SPRING_PROFILES_ACTIVE', 'DB_URL', 'DB_USER', 'DB_PASSWORD')
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
    $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

Push-Location (Join-Path $workspaceRoot 'backend')
try {
    $env:SPRING_PROFILES_ACTIVE = 'mysql'
    $env:DB_URL = "jdbc:mysql://localhost:$($settings.MYSQL_PORT)/$($settings.MYSQL_DATABASE)?createDatabaseIfNotExist=true"
    $env:DB_USER = $settings.MYSQL_USER
    $env:DB_PASSWORD = $settings.MYSQL_PASSWORD

    & .\mvnw.cmd spring-boot:run
    if ($LASTEXITCODE -ne 0) {
        throw 'The backend did not start successfully with MySQL.'
    }
}
finally {
    foreach ($name in $environmentNames) {
        if ($null -eq $previousEnvironment[$name]) {
            Remove-Item "Env:$name" -ErrorAction SilentlyContinue
        }
        else {
            [Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], 'Process')
        }
    }
    Pop-Location
}
