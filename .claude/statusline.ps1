# ATUM CREA Status Line - PowerShell
$ErrorActionPreference = 'SilentlyContinue'
$input = [Console]::In.ReadToEnd()

try {
    $data = $input | ConvertFrom-Json
    
    # Extract fields with null safety
    $model = if ($data.model.display_name) { $data.model.display_name } else { "?" }
    $currentDir = if ($data.workspace.current_dir) { $data.workspace.current_dir } else { "" }
    $dir = if ($currentDir) { Split-Path -Leaf $currentDir } else { "?" }
    
    # Context percentage
    $rawPct = if ($data.context_window.used_percentage) { $data.context_window.used_percentage } else { 0 }
    $pct = [int][math]::Floor($rawPct)
    
    # Cost
    $rawCost = if ($data.cost.total_cost_usd) { $data.cost.total_cost_usd } else { 0 }
    $cost = [string]::Format("{0:F2}", $rawCost)
    
    # ATUM CREA cycle phases based on context usage
    $phase = if ($pct -lt 20) { "RECHERCHER" }
             elseif ($pct -lt 40) { "PLANIFIER" }
             elseif ($pct -lt 60) { "CONSTRUIRE" }
             elseif ($pct -lt 80) { "VERIFIER" }
             else { "MEMORISER" }
    
    # Git branch if available
    $branch = ""
    try {
        $gitDir = git rev-parse --git-dir 2>$null
        if ($LASTEXITCODE -eq 0) {
            $gitBranch = git branch --show-current 2>$null
            if ($gitBranch) { $branch = " | $gitBranch" }
        }
    } catch {}
    
    # Time
    $time = Get-Date -Format 'HH:mm'
    
    # Output format: [Model] Phase | Dir | Context% | Cost | Time
    Write-Output "[$model] $phase | $dir$branch | ${pct}% | `$$cost | $time"
} catch {
    # Fallback in case of any error
    Write-Output "[ATUM] Error parsing status"
}
