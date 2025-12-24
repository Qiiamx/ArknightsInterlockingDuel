<script setup>
import { useMatchStore } from '@/stores/match';
import { storeToRefs } from 'pinia';
const props = defineProps(['data', 'side']);
const { match, userInfo, team1, team2 } = storeToRefs(useMatchStore());
</script>
<template>
	<div v-if="match.step == 21 && !userInfo.team2 && team1.betIP" :class="`action-bubble high left`">
		<div class="bubble-content">
			<div class="bubble-header">
				<span class="warning-icon">⚠</span><span class="header-text">ACTION DETECTED</span>
			</div>
			<div class="bubble-body">队伍A使用了情报点！</div>
			<div class="scan-line"></div>
		</div>
		<div class="bubble-connector"></div>
	</div>
	<div v-if="match.step == 21 && !userInfo.team2 && team1.confirm" :class="`action-bubble left`">
		<div class="bubble-content">
			<div class="bubble-header">
				<span class="warning-icon">⚠</span><span class="header-text">ACTION DETECTED</span>
			</div>
			<div class="bubble-body" v-if="team1.decision == 1">
				队伍A消耗{{ userInfo.team1 ? team1.betCP : '???' }}调用点！
			</div>
			<div class="bubble-body" v-if="team1.decision == 2">队伍A选择休息！</div>
			<div class="bubble-body" v-if="team1.decision == 3">队伍A已经结束！</div>
			<div class="scan-line"></div>
		</div>
		<div class="bubble-connector"></div>
	</div>

	<div
		v-if="match.step == 21 && !userInfo.team1 && team2.betIP"
		:class="`action-bubble high right`"
	>
		<div class="bubble-content">
			<div class="bubble-header">
				<span class="warning-icon">⚠</span><span class="header-text">ACTION DETECTED</span>
			</div>
			<div class="bubble-body">队伍B使用了情报点！</div>
			<div class="scan-line"></div>
		</div>
		<div class="bubble-connector"></div>
	</div>
	<div v-if="match.step == 21 && !userInfo.team1 && team2.confirm" :class="`action-bubble right`">
		<div class="bubble-content">
			<div class="bubble-header">
				<span class="warning-icon">⚠</span><span class="header-text">ACTION DETECTED</span>
			</div>
			<div class="bubble-body" v-if="team2.decision == 1">
				队伍B消耗{{ userInfo.team2 ? team2.betCP : '???' }}调用点！
			</div>
			<div class="bubble-body" v-if="team2.decision == 2">队伍B选择休息！</div>
			<div class="bubble-body" v-if="team2.decision == 3">队伍B已经结束！</div>
			<div class="scan-line"></div>
		</div>
		<div class="bubble-connector"></div>
	</div>
</template>

<style scoped>
.action-bubble {
	position: absolute;
	bottom: 35vh;
	z-index: 90;
	width: 320px;
	pointer-events: none;
	width: 20vw;
}

.action-bubble.high {
	bottom: 50vh;
}

/* A队气泡：位于屏幕中心偏左 */
.action-bubble.left {
	left: 22vw;
}

/* B队气泡：位于屏幕中心偏右 */
.action-bubble.right {
	right: 22vw;
}

.bubble-content {
	background: rgba(20, 25, 30, 0.95); /* 加深背景 */
	border: 1px solid rgba(255, 255, 255, 0.2);
	padding: 15px;
	position: relative;
	overflow: hidden;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(10px);
}

.action-bubble.left .bubble-content {
	border-left: 4px solid #00c8ff;
	/* 科技切角 */
	clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
}

.action-bubble.right .bubble-content {
	border-right: 4px solid #ff3333;

	/* 科技切角 */
	clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
}

.bubble-header {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 8px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	padding-bottom: 4px;
}

.warning-icon {
	color: #ffcd00;
	font-size: 12px;
	animation: blink 1s infinite;
}

.header-text {
	font-family: 'Rajdhani', sans-serif;
	font-size: 10px;
	letter-spacing: 1px;
	color: #888;
	font-weight: 700;
}

.bubble-body {
	color: #fff;
	font-size: 2em;
	line-height: 1.5;
	font-family: 'Noto Sans SC', sans-serif;
	text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

.scan-line {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 2px;
	background: rgba(255, 255, 255, 0.3);
	animation: scan 2s linear infinite;
	opacity: 0.5;
}

@keyframes scan {
	0% {
		transform: translateY(0);
		opacity: 0;
	}
	10% {
		opacity: 1;
	}
	90% {
		opacity: 1;
	}
	100% {
		transform: translateY(100px);
		opacity: 0;
	}
}

@keyframes blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

/* 进出场动画 */
.bubble-pop-enter-active {
	animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.bubble-pop-leave-active {
	transition: all 0.3s ease-in;
}
.bubble-pop-leave-to {
	opacity: 0;
	transform: translateY(-20px);
}

@keyframes popIn {
	from {
		opacity: 0;
		transform: translateY(-20px) scale(0.9);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}
</style>
