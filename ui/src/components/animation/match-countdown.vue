<script setup>
import { useMatchStore } from '@/stores/match';
import { onMounted, ref, watch } from 'vue';
import CountdownWorker from '@/utils/countdown.js?worker';
const { match } = useMatchStore();
const localCountDownLast = ref(0);
const localCountPercent = ref(100);
let worker = new CountdownWorker();

/* 1. 到点立即进入下一阶段 */
worker.onmessage = (e) => {
	if (e.data.cmd === 'fire') {
		draw();
	}
};
watch(
	() => match.countDownRunning,
	(run) => {
		if (run) {
			draw();
		}
	}
);
watch(
	() => match.countDownLast,
	(last) => {
		// 在暂停中变更时间的话，只渲染一次
		if (match.countDownRunning) {
			let now = Date.now();
			localCountDownLast.value = now > match.countDownTarget ? 0 : match.countDownTarget - now;
			localCountPercent.value = (localCountDownLast.value / match.countDownTotal) * 100;
		}
	}
);
const draw = () => {
	if (match.countDownRunning) {
		let now = Date.now();
		localCountDownLast.value = now > match.countDownTarget ? 0 : match.countDownTarget - now;
		localCountPercent.value = (localCountDownLast.value / match.countDownTotal) * 100;
		worker.postMessage({ cmd: 'start', remain: 10 });
	}
};
</script>
<template>
	<template v-if="match.step == 21 && match.countDownType">
		<div :class="`progress-container ${match.countDownRunning ? '' : 'paused'}`">
			<div class="progress-label">
				<div class="progress-track">
					<div
						:class="`progress-fill 
                    ${
											match.countDownRunning
												? localCountPercent > 60
													? 'bar-blue'
													: localCountPercent > 30
														? 'bar-orange'
														: 'bar-red'
												: 'bar-gray'
										}`"
						:style="{ transform: `scaleX(${localCountPercent + '%'})` }"
					></div>
				</div>
			</div>
			<span class="timer-value">{{ (localCountDownLast / 1000).toFixed(2) }}s</span>
		</div>
	</template>
</template>
<style lang="css" scoped>
.progress-container {
	position: absolute;
	top: 25%;
	left: 50%;
	transform: translate(-50%);
	width: 500px;
	z-index: 100;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: auto !important;
	padding: 10px;
}

.progress-container.paused {
	opacity: 0.6;
}

.progress-label {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	margin-bottom: 8px;
	position: relative;
	z-index: 2;
	font-family: Rajdhani, sans-serif;
	font-size: 14px;
	font-weight: 700;
	letter-spacing: 2px;
	color: #ffffffe6;
	text-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}

.timer-value {
	color: #00c8ff;
	font-family: Consolas, monospace;
	text-align: center;
}

.progress-track {
	width: 100%;
	height: 12px;
	background: #ffffff1a;
	border-radius: 4px;
	overflow: hidden;
	box-shadow: inset 0 2px 4px #0000004d;
	position: relative;
	z-index: 1;
}

.bar-blue {
	background: #00aeef;
	box-shadow: 0 0 15px rgba(0, 174, 239, 0.8);
}

.bar-orange {
	background: #ffd700;
	box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
}

.bar-red {
	background: #d50000;
	box-shadow: 0 0 15px rgba(213, 0, 0, 0.8);
}

.bar-gray {
	background: #666;
	box-shadow: 0 0 10px #64646480;
}

.progress-fill {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	transform-origin: center center;
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
	height: 100%;
	transition: 0.2s linear;
}
</style>
