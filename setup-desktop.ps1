#Requires -Version 5.1
<#
  Portfolio desktop setup
  Run in PowerShell: right-click this file > "Run with PowerShell",
  or from a terminal:  powershell -ExecutionPolicy Bypass -File .\setup-desktop.ps1

  What this does:
    1. Installs Git, GitHub CLI, and Node.js if missing (via winget)
    2. Sets your git identity to match your laptop
    3. Logs the GitHub CLI into your account and wires it up as git's credential helper
    4. Clones dylanarchitecture/portfolio to your Desktop
    5. Installs the Claude Code CLI
    6. Opens the folder in VS Code
#>

$ErrorActionPreference = "Stop"

function Test-Cmd($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

Write-Host "== Portfolio desktop setup ==" -ForegroundColor Cyan

$needsRestart = $false

if (-not (Test-Cmd git)) {
    Write-Host "Installing Git..." -ForegroundColor Yellow
    winget install --id Git.Git -e --source winget
    $needsRestart = $true
} else {
    Write-Host "Git already installed." -ForegroundColor Green
}

if (-not (Test-Cmd gh)) {
    Write-Host "Installing GitHub CLI..." -ForegroundColor Yellow
    winget install --id GitHub.cli -e --source winget
    $needsRestart = $true
} else {
    Write-Host "GitHub CLI already installed." -ForegroundColor Green
}

if (-not (Test-Cmd node)) {
    Write-Host "Installing Node.js LTS..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS.LTS -e --source winget
    $needsRestart = $true
} else {
    Write-Host "Node.js already installed." -ForegroundColor Green
}

if ($needsRestart) {
    Write-Host ""
    Write-Host "Git/GitHub CLI/Node.js were just installed. Close this window, open a NEW PowerShell window, and re-run this script to continue." -ForegroundColor Magenta
    exit
}

# Git identity — matches the laptop
if (-not (git config --global user.name)) {
    git config --global user.name "Dylan"
}
if (-not (git config --global user.email)) {
    git config --global user.email "dylanedaniels@gmail.com"
}
Write-Host "Git identity: $(git config --global user.name) <$(git config --global user.email)>" -ForegroundColor Green

# GitHub auth
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Logging into GitHub (browser will open)..." -ForegroundColor Yellow
    gh auth login
} else {
    Write-Host "Already logged into GitHub CLI." -ForegroundColor Green
}
gh auth setup-git

# Clone the repo
$targetDir = Join-Path $HOME "Desktop\portfolio"
if (Test-Path $targetDir) {
    Write-Host "Folder already exists at $targetDir — skipping clone." -ForegroundColor Yellow
} else {
    Write-Host "Cloning portfolio repo to $targetDir ..." -ForegroundColor Yellow
    gh repo clone dylanarchitecture/portfolio $targetDir
}

# Claude Code CLI
if (-not (Test-Cmd claude)) {
    Write-Host "Installing Claude Code CLI..." -ForegroundColor Yellow
    npm install -g @anthropic-ai/claude-code
} else {
    Write-Host "Claude Code CLI already installed." -ForegroundColor Green
}

# VS Code
if (Test-Cmd code) {
    Write-Host "Opening VS Code..." -ForegroundColor Green
    code $targetDir
} else {
    Write-Host "VS Code 'code' command not found on PATH — install from https://code.visualstudio.com/ and open $targetDir manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "== Done ==" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  1. In VS Code, open a terminal in $targetDir"
Write-Host "  2. Run: claude   (sign in with the same Anthropic account as your laptop)"
Write-Host "  3. To preview the site locally: python -m http.server 8080  then open http://localhost:8080"
Write-Host ""
Write-Host "Note: Claude's memory/context files live locally per machine and won't transfer automatically." -ForegroundColor DarkGray
Write-Host "They'll build back up naturally as you work from this machine — nothing to configure." -ForegroundColor DarkGray
