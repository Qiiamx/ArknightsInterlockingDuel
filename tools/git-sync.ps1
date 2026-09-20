#!/usr/bin/env pwsh
<#
  推送到远端：自动择路。

  背景：本机代理 127.0.0.1:7890 不常开，所以**不把代理当作默认路径**。
        直连 github.com:443 能通就走直连；直连不通、且代理恰好开着，才走代理；
        两者都不行就停下来提示你开代理，而不是反复重试干等。

  用法：
    pwsh tools/git-sync.ps1                     # 推送默认分支 random-select
    pwsh tools/git-sync.ps1 -Branch master
    pwsh tools/git-sync.ps1 -Tag v1.1           # 同时推送标签
    pwsh tools/git-sync.ps1 -Tag v1.1 -ForceTag # 标签需要移动时
    pwsh tools/git-sync.ps1 -DryRun             # 只探测并报告走哪条路，不推送
    pwsh tools/git-sync.ps1 -Route proxy        # 强制走代理（auto 为默认：直连优先）
#>
param(
	[string]$Branch = 'random-select',
	[string]$Tag,
	[switch]$ForceTag,
	[ValidateSet('auto', 'direct', 'proxy')][string]$Route = 'auto',
	[switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$ProxyUrl = 'http://127.0.0.1:7890'

# 带超时的 TCP 探测：避免 Test-NetConnection 在不通时干等 21 秒
function Test-Tcp([string]$HostName, [int]$Port, [int]$TimeoutMs) {
	try {
		$client = New-Object System.Net.Sockets.TcpClient
		$async = $client.BeginConnect($HostName, $Port, $null, $null)
		if ($async.AsyncWaitHandle.WaitOne($TimeoutMs, $false)) {
			$client.EndConnect($async)
			$client.Close()
			return $true
		}
		$client.Close()
		return $false
	} catch {
		return $false
	}
}

Write-Host '[git-sync] 探测线路…'
$direct = Test-Tcp 'github.com' 443 6000
$proxyUp = Test-Tcp '127.0.0.1' 7890 1000

if ($Route -eq 'proxy' -and -not $proxyUp) {
	Write-Host "[git-sync] 指定走代理，但 $ProxyUrl 没有在监听。" -ForegroundColor Yellow
	exit 2
}

if ($Route -eq 'direct') {
	$routeArgs = @(); $routeName = '直连（强制）'
} elseif ($Route -eq 'proxy') {
	$routeArgs = @('-c', "http.proxy=$ProxyUrl", '-c', "https.proxy=$ProxyUrl"); $routeName = "代理 $ProxyUrl（强制）"
} elseif ($direct) {
	# 默认：直连优先 —— 代理不常开，不把它当默认路径
	$routeArgs = @(); $routeName = '直连'
} elseif ($proxyUp) {
	$routeArgs = @('-c', "http.proxy=$ProxyUrl", '-c', "https.proxy=$ProxyUrl"); $routeName = "代理 $ProxyUrl（直连不通，回退）"
} else {
	Write-Host '[git-sync] 直连 github.com:443 不通，本地代理也没开。' -ForegroundColor Yellow
	Write-Host '           请先启动代理（127.0.0.1:7890）后再执行本脚本；' -ForegroundColor Yellow
	Write-Host '           或确认网络能直连 GitHub（可用 Test-NetConnection github.com -Port 443 自查）。' -ForegroundColor Yellow
	exit 2
}
Write-Host "[git-sync] 走 $routeName"

$env:GIT_TERMINAL_PROMPT = '0'   # 缺凭据时直接失败，不挂住
$targets = @($Branch)
if ($Tag) { $targets += $Tag }

foreach ($t in $targets) {
	$isTag = ($t -eq $Tag)
	# 注意顺序: -c 必须放在子命令 push 之前(git -c key=val push ...)
	$gitArgs = @() + $routeArgs + @('push')
	if ($isTag -and $ForceTag) { $gitArgs += '--force' }
	$gitArgs += @('origin', $t)

	if ($DryRun) {
		Write-Host ("[git-sync] (DryRun) git " + ($gitArgs -join ' '))
		continue
	}

	Write-Host ("[git-sync] git " + ($gitArgs -join ' '))
	& git @gitArgs
	if ($LASTEXITCODE -ne 0) {
		Write-Host "[git-sync] 推送 $t 失败（exit $LASTEXITCODE）。" -ForegroundColor Red
		Write-Host '           若刚才探测到直连可用但推送中途被重置，多半是线路抖动；' -ForegroundColor Red
		Write-Host '           重跑本脚本，或启动代理后再重跑。' -ForegroundColor Red
		exit 1
	}
}

if (-not $DryRun) {
	Write-Host '[git-sync] 完成。远端状态：' -ForegroundColor Green
	& git log --oneline -1
	foreach ($t in $targets) {
		$remote = (& git ls-remote origin $t) -split "`t" | Select-Object -First 1
		Write-Host ("  {0} → {1}" -f $t, ($remote ? $remote.Substring(0, 7) : '(未找到)'))
	}
}
