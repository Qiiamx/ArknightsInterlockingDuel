<script setup>
import { useMatchStore } from '@/stores/match';
import MatchPublicOperator from './match-public-operator-box.vue';
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import CountDownWorker from '@/utils/countdown.js?worker';
const worker = new CountDownWorker();
const { SETTLEMENT_TIME } = useMatchStore();
const { match } = storeToRefs(useMatchStore());
const fullOpeningText = '正在建立神经连接... 检测到干员信号...';
const decodedText = ref('');
const iteration = ref(0);
const textTime = SETTLEMENT_TIME / 2 / fullOpeningText.length; //每个字符的时间
const totalTime = SETTLEMENT_TIME / 2 / 1000 + 's';
const className = ref('public-pool-container');
const showCrt = ref(false);
worker.onmessage = (e) => {
	if (e.data.cmd === 'fire') {
		decodeEffect();
	}
};
watch(
	() => match.value.step,
	(step) => {
		if (step == 1) {
			className.value = 'public-pool-container playing';
			showCrt.value = true;
			decodeEffect();
		} else {
			className.value = 'public-pool-container existing';
		}
	}
);
const decodeEffect = () => {
	decodedText.value = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
	decodedText.value = fullOpeningText
		.split('')
		.map((letter, index) => {
			if (index < iteration.value) {
				return fullOpeningText[index];
			}
			return characters[Math.floor(Math.random() * characters.length)];
		})
		.join('');
	iteration.value = iteration.value + 1;
	if (iteration.value > fullOpeningText.length + 1) {
		showCrt.value = false;
		iteration.value = 0;
	} else {
		worker.postMessage({ cmd: 'start', remain: textTime });
	}
};
</script>
<template>
	<Transition name="crt">
		<div v-if="match.step != 0 && showCrt" class="terminal-layer">
			<div class="terminal-grid"></div>
			<div class="terminal-container">
				<div class="terminal-header"><span class="status-dot"></span> SYSTEM_ACCESS // ROOT</div>
				<div class="terminal-body">
					<div class="decode-text">{{ decodedText }}<span class="cursor">_</span></div>
				</div>
				<div class="terminal-footer">[ CONNECTIONS: SECURE ] [ DATA: ENCRYPTED ]</div>
			</div>
		</div>
	</Transition>
	<div v-if="match.step != 0 && !showCrt" :class="className">
		<div class="pool-label">公共干员 / PUBLIC POOL</div>
		<div class="pool-cards">
			<div v-for="idx in match.publicOprs" :key="idx" class="mini-card">
				<MatchPublicOperator :opr-idx="idx"></MatchPublicOperator>
			</div>
		</div>
	</div>
</template>
<style scoped lang="css">
/* =========================================
   1. 机密终端特效 (Opening) - 灰白色主题
   ========================================= */

.crt-enter-active {
	animation: turn-on 0.4s ease-out;
}

.crt-leave-active {
	animation: turn-off 0.4s ease-in;
}

@keyframes turn-on {
	0% {
		transform: scale(1, 0.002) translate3d(0, 0, 0);
		opacity: 0;
		filter: brightness(3);
	}

	50% {
		transform: scale(1, 0.002) translate3d(0, 0, 0);
		opacity: 1;
	}

	100% {
		transform: scale(1, 1) translate3d(0, 0, 0);
		opacity: 1;
		filter: brightness(1);
	}
}

@keyframes turn-off {
	0% {
		transform: scale(1, 1);
		opacity: 1;
		filter: brightness(1);
	}

	50% {
		transform: scale(1, 0.002);
		opacity: 1;
	}

	100% {
		transform: scale(0, 0);
		opacity: 0;
		filter: brightness(0);
	}
}

.terminal-layer {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background: rgba(0, 0, 0, 0.95);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.terminal-grid {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(200, 200, 200, 0.1) 1px, transparent 1px),
		linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px);
	background-size: 40px 40px;
	z-index: 0;
	opacity: 0.3;
}

.terminal-container {
	font-family: 'Consolas', 'Monaco', monospace;
	color: #d0d0d0;
	/* 灰白色 */
	width: 600px;
	background: rgba(20, 20, 20, 0.95);
	border: 1px solid #d0d0d0;
	/* 灰白色边框 */
	padding: 2px;
	box-shadow: 0 0 20px rgba(200, 200, 200, 0.2);
	transform: scale(1.2);
	position: relative;
	z-index: 1;
}

.terminal-header {
	background: #d0d0d0;
	/* 灰白色背景 */
	color: #000;
	padding: 4px 8px;
	font-size: 12px;
	font-weight: bold;
	display: flex;
	align-items: center;
	gap: 6px;
}

.status-dot {
	width: 8px;
	height: 8px;
	background: #000;
	border-radius: 50%;
	animation: blink-dot 1s infinite;
}

.terminal-body {
	padding: 40px 20px;
	min-height: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.decode-text {
	font-size: 24px;
	letter-spacing: 2px;
	text-shadow: 0 0 8px rgba(200, 200, 200, 0.8);
	/* 灰白色光晕 */
}

.cursor {
	display: inline-block;
	width: 12px;
	height: 24px;
	background: #d0d0d0;
	/* 灰白色光标 */
	margin-left: 4px;
	animation: blink-cursor 0.8s steps(2) infinite;
	vertical-align: bottom;
}

.terminal-footer {
	border-top: 1px solid #444444;
	padding: 4px 8px;
	font-size: 10px;
	color: #888888;
	display: flex;
	justify-content: space-between;
}

@keyframes blink-dot {
	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0;
	}
}

@keyframes blink-cursor {
	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0;
	}
}

.public-pool-container {
	position: absolute;
	top: 1em;
	left: calc(50vw - 12vw - 12px);
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	pointer-events: none;
	transform: translate(0, calc(30vh)) scale(0);
	transform-origin: center center;
}

/* 仅当 .playing 存在时才触发动画 */
.public-pool-container.playing {
	animation: drawing v-bind(totalTime) ease-in forwards;
}
.public-pool-container.existing {
	transform: translate(0, 0) scale(1);
}

@keyframes drawing {
	0% {
		/* 动画开始先缩到最小 */
		transform: translate(0, calc(30vh)) scale(0);
	}
	15% {
		transform: translate(0, calc(30vh)) scale(2);
	}
	20% {
		/* 动画然后放大到中间 */
		transform: translate(0, calc(30vh)) scale(1.8);
	}

	75% {
		/* 动画保持在中间 */
		transform: translate(0, calc(30vh)) scale(1.8);
	}

	100% {
		/* 最终缩小到上方 */
		transform: translate(0, 0) scale(1);
	}
}

.pool-label {
	font-family:
		Rajdhani,
		Noto Sans SC,
		sans-serif;
	font-size: 1em;
	font-weight: 700;
	letter-spacing: 2px;
	color: #fff9;
	text-transform: uppercase;
	text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.pool-cards {
	display: flex;
	gap: 12px;
	pointer-events: auto;
}

.mini-card {
	width: 8vw;
	position: relative;
	transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	opacity: 0.85;
}
</style>
