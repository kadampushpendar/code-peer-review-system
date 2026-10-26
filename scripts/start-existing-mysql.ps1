$ErrorActionPreference = 'Stop'

if (Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue) {
    throw 'Stop the running backend before migrating so the H2 database is not in use.'
}

$mysqlUser = Read-Host 'MySQL username'
if ([string]::IsNullOrWhiteSpace($mysqlUser)) {
    throw 'A MySQL username is required.'
}
$securePassword = Read-Host 'MySQL password' -AsSecureString
$passwordPointer = [IntPtr]::Zero

$environmentNames = @('SPRING_PROFILES_ACTIVE', 'DB_URL', 'DB_USER', 'DB_PASSWORD')
$previousEnvironment = @{}
foreach ($name in $environmentNames) {
    $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

try {
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:SPRING_PROFILES_ACTIVE = 'mysql'
    $env:DB_URL = 'jdbc:mysql://localhost:3306/peer_review_db?createDatabaseIfNotExist=true'
    $env:DB_USER = $mysqlUser
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    Push-Location (Join-Path $PSScriptRoot '..\backend')
    try {
        & .\mvnw.cmd '-Dspring-boot.run.arguments=--app.migrate-h2-to-mysql=true' spring-boot:run
        if ($LASTEXITCODE -ne 0) {
            throw 'H2 to MySQL migration failed. Review the output above; the destination transaction was rolled back.'
        }

        Write-Output 'Migration completed. Starting the backend with MySQL.'
        & .\mvnw.cmd spring-boot:run
        if ($LASTEXITCODE -ne 0) {
            throw 'The backend did not start successfully with MySQL.'
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    $securePassword.Dispose()

    foreach ($name in $environmentNames) {
        if ($null -eq $previousEnvironment[$name]) {
            Remove-Item "Env:$name" -ErrorAction SilentlyContinue
        }
        else {
            [Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name], 'Process')
        }
    }
}
