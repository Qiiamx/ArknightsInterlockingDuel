#!/usr/bin/env pwsh
<#
  推送到远端：自动择路，首选线路失败会自动换另一条。

  背景：本机代理 127.0.0.1:7890 不常开，所以**不把代理当作默认路径**。
        直连优先；直连推送失败时自动改走代理（若代理在监听），反之亦然。

  三个容易踩的点（本脚本负责处理）：
    1. 「直连」必须**显式清掉** git 配置里的代理（-c http.proxy= -c https.proxy=）。
       只探测到能连还不够 —— 不清配置的话 git 仍然会去连那个没开的代理，
       于是出现"探到直连可用、推送却报 Failed to connect to 127.0.0.1 port 7890"。
    2. **探针要探到 TLS 层**。GitHub 的 TCP 握手常常能过、TLS 阶段才被重置，
       只看端口通不通会把"其实推不动"报成"直连可用"。
    3. 探到能连 ≠ 推得动（线路抖动）。所以每条线路都重试，失败后自动换线路。

  用法：
    pwsh tools/git-sync.ps1                     # 推送默认分支 random-select
    pwsh tools/git-sync.ps1 -Branch master
    pwsh tools/git-sync.ps1 -Tag v1.3           # 同时推送标签
    pwsh tools/git-sync.ps1 -Tag v1.3 -ForceTag # 标签需要移动时
    pwsh tools/git-sync.ps1 -DryRun             # 只探测并报告会走哪条路，不推送
    pwsh tools/git-sync.ps1 -Route proxy        # 强制走代理（auto 为默认：直连优先）
#>
param(
	[string]$Branch = 'random-select',
	[string]$Tag,
	[switch]$ForceTag,
	[ValidateSet('auto', 'direct', 'proxy')][string]$Route = 'auto',
	[switch]$DryRun,
	[int]$Retry = 2
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

# TLS 探测：TCP 通了不代表能用 —— GitHub 经常在 TLS 阶段被重置
function Test-Tls([string]$HostName, [int]$Port, [int]$TimeoutMs) {
	try {
		$client = New-Object System.Net.Sockets.TcpClient
		$client.ReceiveTimeout = $TimeoutMs
		$client.SendTimeout = $TimeoutMs
		$async = $client.BeginConnect($HostName, $Port, $null, $null)
		if (-not $async.AsyncWaitHandle.WaitOne($TimeoutMs, $false)) { $client.Close(); return $false }
		$client.EndConnect($async)
		$ssl = New-Object System.Net.Security.SslStream($client.GetStream(), $false)
		$ssl.AuthenticateAsClient($HostName)
		$ok = $ssl.IsAuthenticated
		$ssl.Dispose(); $client.Close()
		return $ok
	} catch {
		return $false
	}
}

Write-Host '[git-sync] 探测线路…'
$direct = Test-Tls 'github.com' 443 8000
$directTcp = if ($direct) { $true } else { Test-Tcp 'github.com' 443 4000 }
$proxyUp = Test-Tcp '127.0.0.1' 7890 1000

# 直连: 显式把代理置空; 代理: 显式指定
$directArgs = @('-c', 'http.proxy=', '-c', 'https.proxy=')
$proxyArgs = @('-c', "http.proxy=$ProxyUrl", '-c', "https.proxy=$ProxyUrl")

$routes = @()
if ($Route -eq 'direct') {
	if (-not $direct) {
		Write-Host '[git-sync] 指定直连，但 github.com 的 TLS 握手不成功。' -ForegroundColor Yellow
		exit 2
	}
	$routes += @{ name = '直连（强制）'; args = $directArgs }
} elseif ($Route -eq 'proxy') {
	if (-not $proxyUp) {
		Write-Host "[git-sync] 指定走代理，但 $ProxyUrl 没有在监听。" -ForegroundColor Yellow
		exit 2
	}
	$routes += @{ name = "代理 $ProxyUrl（强制）"; args = $proxyArgs }
} else {
	if ($direct) { $routes += @{ name = '直连'; args = $directArgs } }
	if ($proxyUp) {
		$label = if ($direct) { "代理 $ProxyUrl（直连失败时的备选）" } else { "代理 $ProxyUrl（直连不通，回退）" }
		$routes += @{ name = $label; args = $proxyArgs }
	}
	if ($routes.Count -eq 0) {
		if ($directTcp) {
			Write-Host '[git-sync] github.com:443 端口能连上，但 TLS 握手不成功（多半被重置）。' -ForegroundColor Yellow
		} else {
			Write-Host '[git-sync] 直连 github.com:443 不通。' -ForegroundColor Yellow
		}
		Write-Host '           请启动代理（127.0.0.1:7890）后再执行本脚本。' -ForegroundColor Yellow
		exit 2
	}
}

$env:GIT_TERMINAL_PROMPT = '0'   # 缺凭据时直接失败，不挂住
$targets = @($Branch)
if ($Tag) { $targets += $Tag }

$pushed = $false
$usedArgs = @()
for ($ri = 0; $ri -lt $routes.Count; $ri++) {
	$r = $routes[$ri]
	for ($try = 1; $try -le [Math]::Max(1, $Retry); $try++) {
		if ($try -gt 1) { Write-Host "[git-sync] 第 $try 次尝试（$($r.name)）" -ForegroundColor Yellow }
		else { Write-Host "[git-sync] 走 $($r.name)" }
		$allOk = $true
		foreach ($t in $targets) {
			$isTag = ($t -eq $Tag)
			# 注意顺序: -c 必须放在子命令 push 之前(git -c key=val push ...)
			$gitArgs = @() + $r.args + @('push')
			if ($isTag -and $ForceTag) { $gitArgs += '--force' }
			$gitArgs += @('origin', $t)

			if ($DryRun) {
				Write-Host ("[git-sync] (DryRun) git " + ($gitArgs -join ' '))
				continue
			}

			Write-Host ("[git-sync] git " + ($gitArgs -join ' '))
			& git @gitArgs
			if ($LASTEXITCODE -ne 0) {
				Write-Host "[git-sync] $t 推送失败（exit $LASTEXITCODE）。" -ForegroundColor Yellow
				$allOk = $false
				break
			}
		}
		if ($DryRun) { $pushed = $true; break }
		if ($allOk) { $pushed = $true; $usedArgs = $r.args; break }
	}
	if ($pushed) { break }
	if ($ri -lt $routes.Count - 1) { Write-Host '[git-sync] 换下一条线路重试…' -ForegroundColor Yellow }
}

if (-not $pushed) {
	Write-Host '[git-sync] 所有可用线路都推送失败。' -ForegroundColor Red
	Write-Host '           启动代理（127.0.0.1:7890）后重跑，或稍后重试（可能是线路抖动）。' -ForegroundColor Red
	exit 1
}

if (-not $DryRun) {
	Write-Host '[git-sync] 完成。远端状态：' -ForegroundColor Green
	& git log --oneline -1
	foreach ($t in $targets) {
		# 核对远端状态时也要带上同一条线路的参数, 否则会去连那个没开的代理
		$remote = (& git @($usedArgs + @('ls-remote', 'origin', $t)) 2>$null) -split "`t" | Select-Object -First 1
		Write-Host ("  {0} → {1}" -f $t, ($remote ? $remote.Substring(0, 7) : '(未取到)'))
	}
}
