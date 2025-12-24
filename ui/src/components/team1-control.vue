<script setup>
import { useMatchStore } from '@/stores/match';
import { computed } from 'vue';
const { userInfo, match, team1, team2, teamOpr } = useMatchStore();
const calLockedCp = (n) => {
	return (
		!(match.step == 21) ||
		team1.lastCP < n ||
		(n !== 10 && team2.betFlag == false) ||
		team1.betFlag == false ||
		team1.confirm ||
    !match.countDownRunning
	);
};
const lockedRest = computed(() => {
	return !(match.step == 21) || team2.betFlag == false || team1.betFlag == false || team1.confirm || !match.countDownRunning;
});
const lockedTerminate = computed(() => {
	return !(match.step == 21) || team1.betFlag == false || team1.confirm || !match.countDownRunning;
});
const lockedGrab = computed(() => {
	return !(match.step == 21) || team1.betFlag == false || team1.confirm || !match.countDownRunning;
});
</script>
<template>
	<div v-if="userInfo.team1 && match.step == 21" class="control-deck-area role-PLAYER">
		<div class="player-panel">
			<div class="deck-label">战术终端 // TACTICAL INPUT</div>
			<div class="player-actions">
				<button
					:class="`ak-btn btn-rest ${team1.decision == '1' ? 'active' : ''}`"
					@click="teamOpr.rest"
					:disabled="lockedRest"
				>
					<div class="main-text">休息</div>
				</button>
				<div class="bid-wrapper">
					<div class="bid-amount-selector">
						<div class="bid-buttons-grid">
							<button
								:class="`bid-amount-btn ${calLockedCp(n) ? 'locked-amount' : ''} ${team1.decision == 1 && team1.betCP == n ? 'active' : ''}`"
								v-for="n in [1, 2, 3, 4, 5, 10, 15, 20]"
								:key="n"
								@click="teamOpr.useCP(n)"
								:disabled="calLockedCp(n)"
							>
								{{ n }}
							</button>
						</div>
					</div>
					<button class="ak-btn btn-capture" @click="teamOpr.confirm" :disabled="lockedGrab">
						<div class="glitch-text">确认</div>
					</button>
					<button class="ak-btn btn-ip" @click="teamOpr.useIP" :disabled="lockedGrab">
						<div class="glitch-text">调查</div>
					</button>
				</div>
				<button class="ak-btn btn-terminate" @click="teamOpr.quit" :disabled="lockedTerminate">
					<div class="main-text">终止</div>
				</button>
				<div class="choice-hint">
					当前选项: {{ team1.betCP > 0 ? '抓取' : team1.decision == 2 ? '休息' : '终止' }}
				</div>
			</div>
		</div>
		<!-- <div class="control-panel">
			<div class="control-info">TEAM A 指令 / CONSOLE</div>
			<div class="control-btn-group">
				<button
					v-for="n in [1, 2, 3, 4, 5, 10, 15, 20]"
					:key="n"
					@click="teamOpr.useCP(n)"
					:disabled="
						!(match.step == 21) ||
						team1.lastCP < n ||
						(n !== 10 && team2.betFlag == false) ||
						team1.betFlag == false
					"
					:class="team1.decision == 1 && team1.betCP == n ? 'active' : ''"
				>
					下注({{ n }})
				</button>
				<button
					@click="teamOpr.useIP"
					:disabled="!(match.step == 21) || team1.lastIP <= 0 || team1.betFlag == false"
				>
					调查
				</button>
				<button
					@click="teamOpr.rest"
					:disabled="!(match.step == 21) || team2.betFlag == false || team1.betFlag == false"
					:class="team1.decision == 2 ? 'active' : ''"
				>
					休息
				</button>
				<button
					@click="teamOpr.quit"
					:disabled="!(match.step == 21) || team1.betFlag == false"
					:class="team1.decision == 3 ? 'active' : ''"
				>
					结束!
				</button>
			</div>
		</div> -->
	</div>
</template>
<style scoped>
.control-deck-area {
	position: absolute;
	/* 垂直位置：75% 处 (整体下移) */
	top: 75%;
	left: 50%;
	transform: translate(-50%, -50%); /* 更大的后仰角度 */
	transform-style: preserve-3d;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); /* 缓慢过渡动画 */

	width: 40vw;
	padding: 1vh;

	/* 背景样式 (操作台底座) */
	background: rgba(20, 25, 30, 0.9);
	backdrop-filter: blur(5px);
	border: 1px solid #444;
	border-bottom: 4px solid #666;
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);

	pointer-events: auto;
	z-index: 100; /* 提高 z-index，确保在 BattleCenterConsole 之上 */

	/* 描边光晕层（伪元素） */
	position: relative;
}

/* 描边光晕层 */
.control-deck-area::before {
	content: '';
	position: absolute;
	top: -3px;
	left: -3px;
	right: -3px;
	bottom: -3px;
	border: 2px solid transparent;
	pointer-events: none;
	opacity: 0;
	transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	z-index: -1;
}

/* 队伍A选手：蓝色 */
.control-deck-area.role-PLAYER::before {
	opacity: 1;
	border-color: #00aeef; /* 队伍A：蓝色 */
	filter: drop-shadow(0 0 10px rgba(0, 174, 239, 0.6)) drop-shadow(0 0 20px rgba(0, 174, 239, 0.4))
		drop-shadow(0 0 30px rgba(0, 174, 239, 0.3));
}

.deck-label {
	font-family: 'Rajdhani', sans-serif;
	font-size: 10px;
	color: #666;
	border-bottom: 1px solid #333;
	margin-bottom: 15px;
	padding-bottom: 5px;
	text-align: right;
	letter-spacing: 1px;
}

/* =========================================
   通用按钮样式
   ========================================= */
.ak-btn {
	border: none;
	outline: none;
	cursor: pointer;
	font-family: 'Noto Sans SC', sans-serif;
	color: #fff;
	transition: all 0.2s;
	/* 机能风切角 */
	clip-path: polygon(
		10px 0,
		100% 0,
		100% calc(100% - 10px),
		calc(100% - 10px) 100%,
		0 100%,
		0 10px
	);
}

.ak-btn:active {
	transform: translateY(2px);
	filter: brightness(0.8);
}

.ak-btn:disabled {
	cursor: not-allowed;
	opacity: 0.6;
	filter: grayscale(1);
}

.control-panel {
	top: 80vh;
	left: 50vw;
	width: 38vw;
	transform: translateX(-19vw) translateY(-10vh);
	position: absolute;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: #14191ee6;
	border: 1px solid #444;
	border-bottom: 4px solid #666;
	box-shadow: 0 20px 50px #00000080;
}
.control-info {
	width: 95%;
	font-size: 0.5em;
	color: #666;
	padding-top: 1em;
	border-bottom: 1px solid #333;
	margin-bottom: 1em;
	padding-bottom: 0.3em;
	text-align: right;
	letter-spacing: 1px;
}
.control-btn-group {
	display: grid;
	grid-template-columns: repeat(3, 1fr); /* 显式 3 列 */
	padding-bottom: 1em;
	gap: 12px;
	max-height: 40vh;
	overflow-y: auto;
}
.control-btn-group button {
	clip-path: polygon(
		10px 0,
		100% 0,
		100% calc(100% - 10px),
		calc(100% - 10px) 100%,
		0 100%,
		0 10px
	);
	height: 3em;
	padding: 0 1.5em;
	cursor: pointer;
	font-size: 1.1em;
	font-weight: 600;
}
.control-btn-group button.active {
	background: #ffd700;
}

.player-actions {
	display: flex;
	align-items: stretch;
	justify-content: center;
	gap: 15px;
}

/* 1. 休息按钮 (绿色, 左侧) */
.btn-rest {
	flex: 0 0 100px;
	background: #2e7d32;
	border-bottom: 4px solid #1b5e20;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.btn-rest:hover:not(:disabled) {
	background: #388e3c;
	box-shadow: 0 0 15px rgba(46, 125, 50, 0.4);
}

.btn-rest:disabled {
	background: #333;
	border-color: #666;
	color: #666;
	opacity: 0.5;
	cursor: not-allowed;
}

/* 2. 博弈抓取组合 (黄色, 中间, 最大) */
.bid-wrapper {
	flex: 1; /* 占据剩余空间 */
	display: flex;
	flex-direction: row; /* 改为水平布局 */
	gap: 10px;
	align-items: stretch; /* 确保两个子元素高度一致 */
}

.bid-amount-selector {
	flex: 0 0 auto; /* 不伸缩，根据内容自适应 */
	background: #000;
	border: 1px solid #444;
	border-bottom: 4px solid #444; /* 添加底部边框，与按钮保持一致 */
	padding: 1vh;
	display: flex;
	flex-direction: column;
	gap: 0; /* 移除gap，改用margin控制间距 */
	position: relative;
	min-width: 200px; /* 设置最小宽度 */
	box-sizing: border-box; /* 确保padding和border包含在高度内 */
	justify-content: flex-end; /* 内容靠底部对齐 */
}

.bid-amount-selector.locked {
	border-color: #d50000;
	background: rgba(213, 0, 0, 0.1);
}

.bid-amount-selector .label {
	color: #666;
	font-size: 10px;
	margin-bottom: 8px; /* 标签和按钮之间的间距 */
	font-family: 'Rajdhani', sans-serif;
	flex-shrink: 0; /* 标签不收缩 */
}

.bid-buttons-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 4px;
	width: 100%;
	/* 移除 flex 相关属性，grid 不需要 */
}

.bid-amount-btn {
	background: #222;
	border: 1px solid #444;
	color: #ffd700;
	font-family: 'Rajdhani', sans-serif;
	font-size: 13px;
	font-weight: bold;
	padding: 6px 4px;
	cursor: pointer;
	transition: all 0.2s;
	outline: none;
	min-height: 28px;
}

.bid-amount-btn:hover {
	background: #333;
	border-color: #ffd700;
	box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}

.bid-amount-btn.active {
	background: #ffd700;
	color: #000;
	border-color: #ffd700;
	box-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
}

.bid-amount-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.bid-amount-btn.locked-amount:not(:disabled) {
	background: #d50000;
	color: #fff;
	border-color: #d50000;
	opacity: 0.6;
	cursor: not-allowed;
}

.bid-amount-btn.locked-amount.active {
	background: #ff6b6b;
	color: #fff;
}

.bid-amount-btn.locked-amount:disabled {
	opacity: 0.3;
	cursor: not-allowed;
	background: #333;
	border-color: #666;
	color: #666;
}

.btn-capture {
	flex: 1; /* 占据剩余空间 */
	min-width: 120px; /* 设置最小宽度，确保按钮不会太小 */
	background: #ffd700;
	color: #000;
	border-bottom: 4px solid #f9a825;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%; /* 与档位选择器高度一致 */
}

.btn-capture:hover {
	background: #ffea00;
	box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.btn-ip {
	flex: 0 0 100px;
	width: 100px; /* 明确设置宽度，避免在 column 布局中被拉伸 */
	background: #00aeef;
	border-bottom: 4px solid #39c9ff;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: #fff;
}
.btn-ip:hover {
  background: #55bce3;
	box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

.glitch-text {
	font-size: 20px;
	font-weight: 900;
	letter-spacing: 2px;
}

/* 3. 终止按钮 (红色, 与休息按钮样式一致) */
.btn-terminate {
	flex: 0 0 100px;
	width: 100px; /* 明确设置宽度，避免在 column 布局中被拉伸 */
	background: #d50000;
	border-bottom: 4px solid #b71c1c;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: #fff;
}

.btn-terminate:hover {
	background: #ff1744;
	box-shadow: 0 0 15px rgba(213, 0, 0, 0.4);
}

.btn-terminate:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	background: #333;
	color: #666;
	border-color: #666;
}

.main-text {
	font-size: 16px;
	font-weight: bold;
}

.sub-text {
	font-size: 12px;
	opacity: 0.8;
	margin-top: 2px;
}
.choice-hint {
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin-top: 15px;
	padding: 10px 20px;
	background: rgba(0, 0, 0, 0.8);
	border: 1px solid #00e5ff;
	color: #00e5ff;
	font-family: 'Noto Sans SC', sans-serif;
	font-size: 14px;
	white-space: nowrap;
	animation: fadeInUp 0.3s ease-out;
	z-index: 1000;
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}
</style>
