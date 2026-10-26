$ErrorActionPreference = 'Stop'

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $workspaceRoot '.env'
$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCommand) {
    $dockerDirectory = Join-Path $env:ProgramFiles 'Docker\Docker\resources\bin'
    if (Test-Path (Join-Path $dockerDirectory 'docker.exe')) {
        $env:PATH = "$dockerDirectory;$env:PATH"
        $dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
    }
}
if (-not $dockerCommand) {
    throw 'Docker CLI is unavailable. Install Docker Desktop and open a new terminal.'
}

if (-not (Test-Path $envPath)) {
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rootBytes = New-Object byte[] 32
        $appBytes = New-Object byte[] 32
        $random.GetBytes($rootBytes)
        $random.GetBytes($appBytes)
        $rootPassword = [Convert]::ToBase64String($rootBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
        $appPassword = [Convert]::ToBase64String($appBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    }
    finally {
        $random.Dispose()
    }

    @(
        'MYSQL_DATABASE=peer_review_db'
        'MYSQL_USER=peer_review_app'
        "MYSQL_PASSWORD=$appPassword"
        "MYSQL_ROOT_PASSWORD=$rootPassword"
        'MYSQL_PORT=3307'
    ) | Set-Content -Path $envPath -Encoding Ascii

    Write-Output 'Created local .env credentials (ignored by Git).'
}
else {
    $existingSettings = @{}
    foreach ($line in Get-Content $envPath) {
        if ($line -match '^\s*([A-Z_]+)\s*=\s*(.*?)\s*$') {
            $existingSettings[$Matches[1]] = $Matches[2]
        }
    }
    foreach ($name in @('MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD', 'MYSQL_PORT')) {
        if (-not $existingSettings[$name]) {
            throw "The existing .env file is missing $name. Add it without replacing your other settings."
        }
    }
}

Push-Location $workspaceRoot
try {
    docker compose up -d mysql
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker Compose could not start MySQL.'
    }

    $deadline = (Get-Date).AddMinutes(2)
    $health = ''
    do {
        $containerId = docker compose ps -q mysql
        if ($LASTEXITCODE -ne 0 -or -not $containerId) {
            throw 'Could not find the MySQL container.'
        }
        $health = docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' $containerId
        if ($LASTEXITCODE -ne 0) {
            throw 'Could not check MySQL container health.'
        }
        if ($health -eq 'unhealthy' -or $health -eq 'exited') {
            throw "The MySQL container is not healthy (status: $health)."
        }
        if ($health -ne 'healthy') {
            Start-Sleep -Seconds 3
        }
    } while ($health -ne 'healthy' -and (Get-Date) -lt $deadline)

    if ($health -ne 'healthy') {
        throw 'MySQL did not become healthy within two minutes.'
    }

    docker compose ps mysql
}
finally {
    Pop-Location
}
