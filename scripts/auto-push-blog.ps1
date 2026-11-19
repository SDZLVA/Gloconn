# Glooconn: push Claude's blog branches to GitHub (runs on this PC, with YOUR git login).
# Run by Windows Task Scheduler every 30 minutes. Safe to run many times:
#  - only local branches named milestone-*  whose last commit has "Co-Authored-By: Claude"
#  - newer than 3 days, older than 2 minutes, not already on GitHub, not already in main
#  - NEVER force-pushes; skips a branch if GitHub has commits it does not have
# Log: %LOCALAPPDATA%\glooconn-auto-push.log

$ErrorActionPreference = "Continue"
$repo = "C:\dev\Gloconn"
$log = Join-Path $env:LOCALAPPDATA "glooconn-auto-push.log"
function Log($m) { "$(Get-Date -Format s)  $m" | Add-Content -Path $log }

Set-Location $repo
git fetch origin --prune *> $null
if ($LASTEXITCODE -ne 0) { Log "fetch failed (offline?) - stopping"; exit 0 }

$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$rows = git for-each-ref --format="%(refname:short)|%(committerdate:unix)|%(objectname)" "refs/heads/milestone-*"
foreach ($row in $rows) {
  $p = $row -split "\|"
  $b = $p[0]; $age = $now - [int64]$p[1]; $sha = $p[2]
  if ($age -gt 259200 -or $age -lt 120) { continue }
  $msg = (git log -1 --format=%B $b) -join "`n"
  if ($msg -notmatch "Co-Authored-By: Claude") { continue }
  git merge-base --is-ancestor $b origin/main
  if ($LASTEXITCODE -eq 0) { continue }                       # already merged
  $remote = git rev-parse --verify -q "refs/remotes/origin/$b"
  if ($remote -eq $sha) { continue }                          # already pushed
  if ($remote) {
    git merge-base --is-ancestor $remote $b
    if ($LASTEXITCODE -ne 0) { Log "SKIP $b - GitHub has other commits (diverged)"; continue }
  }
  $out = git push origin "${b}:${b}" 2>&1
  if ($LASTEXITCODE -eq 0) { Log "PUSHED $b ($sha)" } else { Log "PUSH FAILED $b : $out" }
}
