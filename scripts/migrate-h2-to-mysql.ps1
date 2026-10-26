$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $workspaceRoot '.env'

if (-not (Test-Path $envPath)) {
    throw 'MySQL credentials are missing. Run scripts/setup-mysql.ps1 first.'
}
if (Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue) {
    throw 'Stop the running backend before migrating so the H2 database is not in use.'
}

$settings = @{}
foreach ($line in Get-Content $envPath) {
    if ($line -match '^\s*([A-Z_]+)\s*=\s*(.*?)\s*$') {
        $settings[$Matches[1]] = $Matches[2]
    }
}

foreach ($name in @('MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_PORT')) {
    if (-not $settings[$name]) {
        throw "The local .env file is missing $name."
    }
}

$environmentNames = @('SPRING_PROFILES_ACTIVE', 'DB_URL', 'DB_USER', 'DB_PASSWORD')
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
    $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

try {
    $env:SPRING_PROFILES_ACTIVE = 'mysql'
    $env:DB_URL = "jdbc:mysql://localhost:$($settings.MYSQL_PORT)/$($settings.MYSQL_DATABASE)?createDatabaseIfNotExist=true"
    $env:DB_USER = $settings.MYSQL_USER
    $env:DB_PASSWORD = $settings.MYSQL_PASSWORD

    Push-Location (Join-Path $workspaceRoot 'backend')
    try {
        & .\mvnw.cmd '-Dspring-boot.run.arguments=--app.migrate-h2-to-mysql=true' spring-boot:run
        if ($LASTEXITCODE -ne 0) {
            throw 'H2 to MySQL migration failed. Review the output above; the destination transaction was rolled back.'
        }
    }
    finally {
        Pop-Location
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
}
