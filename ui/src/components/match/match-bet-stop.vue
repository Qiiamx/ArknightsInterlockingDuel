<script setup>
import { useMatchStore } from '@/stores/match';
const { match } = useMatchStore();
</script>
<template>
	<Transition name="standby-fade">
		<div v-if="match.step == 3" class="standby-layer">
			<div class="standby-overlay"></div>
			<div class="standby-content">
				<div class="standby-icon">⚠</div>
				<div class="standby-title">本轮博弈已结束</div>
				<div class="standby-sub">SYSTEM SUSPENDED // AWAITING HOST INSTRUCTION</div>
				<div class="standby-loader">
					<div class="standby-bar"></div>
				</div>
			</div>
			<div class="standby-scanline"></div>
		</div>
	</Transition>
</template>
<style scoped lang="css">
.standby-layer {
	position: absolute;
	inset: 0;
	z-index: 150;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.45);
	pointer-events: none;
}

.standby-overlay {
	position: absolute;
	inset: 0;
	background: repeating-linear-gradient(
		0deg,
		rgba(0, 0, 0, 0.1),
		rgba(0, 0, 0, 0.1) 1px,
		transparent 1px,
		transparent 2px
	);
	z-index: 0;
}

.standby-content {
	position: relative;
	z-index: 2;
	text-align: center;
	color: #d0d0d0; /* 灰白色 */
	border: 2px solid #d0d0d0;
	padding: 40px 80px;
	background: rgba(20, 20, 20, 0.9);
	box-shadow: 0 0 30px rgba(200, 200, 200, 0.2);
	/* 类似呼吸灯 */
	animation: standby-pulse 3s infinite ease-in-out;
}

.standby-icon {
	font-size: 48px;
	margin-bottom: 20px;
}

.standby-title {
	font-size: 36px;
	font-weight: 900;
	letter-spacing: 4px;
	font-family: 'Oswald', 'Impact', 'Arial Black', sans-serif;
	margin-bottom: 10px;
}

.standby-sub {
	font-size: 14px;
	letter-spacing: 2px;
	font-family: 'Rajdhani', sans-serif;
	opacity: 0.8;
}

.standby-loader {
	width: 100%;
	height: 4px;
	background: rgba(200, 200, 200, 0.2);
	margin-top: 30px;
	position: relative;
	overflow: hidden;
}

.standby-bar {
	width: 30%;
	height: 100%;
	background: #d0d0d0;
	position: absolute;
	left: -30%;
	animation: standby-scan 2s infinite ease-in-out;
}

.standby-scanline {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 2px;
	background: rgba(200, 200, 200, 0.3);
	box-shadow: 0 0 10px rgba(200, 200, 200, 0.5);
	animation: scanline-move 5s linear infinite;
	z-index: 1;
	pointer-events: none;
}

/* 系统挂起层淡入淡出动画 */
.standby-fade-enter-active {
	transition: opacity 1s ease-in;
}

.standby-fade-leave-active {
	transition: opacity 0.5s ease-out;
}

.standby-fade-enter-from,
.standby-fade-leave-to {
	opacity: 0;
}

@keyframes standby-pulse {
	0%,
	100% {
		box-shadow: 0 0 20px rgba(200, 200, 200, 0.1);
		border-color: rgba(200, 200, 200, 0.6);
	}
	50% {
		box-shadow: 0 0 40px rgba(200, 200, 200, 0.3);
		border-color: rgba(200, 200, 200, 1);
	}
}

@keyframes standby-scan {
	0% {
		left: -30%;
	}
	50% {
		left: 100%;
	}
	100% {
		left: 100%;
	}
}

@keyframes scanline-move {
	0% {
		top: 0%;
		opacity: 0;
	}
	10% {
		top: 10%;
		opacity: 1;
	}
	90% {
		top: 90%;
		opacity: 1;
	}
	100% {
		top: 100%;
		opacity: 0;
	}
}
</style>
