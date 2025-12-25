<script setup>
import { useMatchStore } from '@/stores/match';
import { computed, onMounted, ref, watch } from 'vue';
import { operators } from '@/utils/operator';
import CountDownWorker from '@/utils/countdown.js?worker';
import BattleNumer from './battle-number.vue';
const { userInfo, match, team1, team2, WINNING_TIME } = useMatchStore();
// 1S 的时间用于干员动画，前面的时间用于对波
const playingTime = 1000; //干员动画时长
const spacingTime = 500; // 切换间隔时长
const duiboRate = 200; //对波变化频率
const duiboWinTime = 1000; //对波胜利动画时长
const playingTimeCssVal = playingTime / 1000 + 's';
const delayTime = WINNING_TIME - playingTime; //干员动画延迟播放时长
const delayTimeCssVal = delayTime / 1000 + 's';
const duiboTime = WINNING_TIME - playingTime - spacingTime; //对波总时长（还要留下间隔）
const duiboWinTimeCssVal = duiboWinTime / 1000 + 's';
const duiboBattleTime = duiboTime - duiboWinTime; //对波过程动画时长
const duiboRateCssVal = duiboRate / 1000 + 's';
const duiboCount = duiboBattleTime / duiboRate; //  过程动画时长 / 对波浮动间隔 = 对波浮动次数
const currentDuiboCount = ref(0); // 已经浮动的次数
const random = ref(0); // 对波浮动数
const duiboCls = ref('duibo-show');
const data = computed(() => {
	let obj = { ...operators[match.selectOpr] };
	if (userInfo.team1) {
		if (team1.showNames.indexOf(match.selectOpr) < 0) {
			delete obj.干员;
		}
		if (team1.showClasses.indexOf(match.selectOpr) < 0) {
			delete obj.职业;
		}
		if (team1.showBranches.indexOf(match.selectOpr) < 0) {
			delete obj.分支;
		}
		if (team1.showRares.indexOf(match.selectOpr) < 0) {
			delete obj.稀有度;
		}
		obj.cp = team1.recordCp[match.selectOpr];
	}

	if (userInfo.team2) {
		if (team2.showNames.indexOf(match.selectOpr) < 0) {
			delete obj.干员;
		}
		if (team2.showClasses.indexOf(match.selectOpr) < 0) {
			delete obj.职业;
		}
		if (team2.showBranches.indexOf(match.selectOpr) < 0) {
			delete obj.分支;
		}
		if (team2.showRares.indexOf(match.selectOpr) < 0) {
			delete obj.稀有度;
		}
		obj.cp = team2.recordCp[match.selectOpr];
	}

	if (userInfo.viewer) {
		// 双方选手都不可见时, 观众也不可见
		if (
			team1.showNames.indexOf(match.selectOpr) < 0 &&
			team2.showNames.indexOf(match.selectOpr) < 0
		) {
			delete obj.干员;
		}
		if (
			team1.showClasses.indexOf(match.selectOpr) < 0 &&
			team2.showClasses.indexOf(match.selectOpr) < 0
		) {
			delete obj.职业;
		}
		if (
			team1.showBranches.indexOf(match.selectOpr) < 0 &&
			team2.showBranches.indexOf(match.selectOpr) < 0
		) {
			delete obj.分支;
		}
		if (
			team1.showRares.indexOf(match.selectOpr) < 0 &&
			team2.showRares.indexOf(match.selectOpr) < 0
		) {
			delete obj.稀有度;
		}
		obj.cp = team1.recordCp[match.selectOpr] || team2.recordCp[match.selectOpr];
	}
	return obj;
});
const ban = computed(() => {
	//拼点一致 或 都 休息, ban
	return (team1.decision == 2 && team2.decision == 2) || (team1.decision == team2.decision && team1.decision == 1 && team1.betCP == team2.betCP);
});
const team = computed(() => {
	return ban.value
		? ''
		: team1.betCP > team2.betCP
			? 'win-left'
			: team2.betCP > team1.betCP
				? 'win-right'
				: team1.decision == 3 && team2.decision == 3
					? 'win-back'
					: '';
});

const worker = new CountDownWorker();
worker.onmessage = (e) => {
	if (e.data.cmd === 'fire') {
		if (currentDuiboCount.value < duiboCount - 1 && currentDuiboCount.value != -1) {
			// 对波过程
			random.value = Math.ceil(Math.random() * 80 - 50);
			currentDuiboCount.value = currentDuiboCount.value + 1;
			worker.postMessage({ cmd: 'start', remain: duiboRate });
		} else if (currentDuiboCount.value == -1) {
			// 对波结果
			duiboCls.value = 'duibo-show hide';
			currentDuiboCount.value = 0;
			if (team.value == 'win-left') {
				random.value = 50;
			} else if (team.value == 'win-right') {
				random.value = -50;
			}
		} else {
			currentDuiboCount.value = -1;
			random.value = 0;
			worker.postMessage({ cmd: 'start', remain: duiboWinTime - duiboRate });
		}
	}
};
const battleVisible = ref(false);
watch(
	() => match.step,
	(step) => {
		if (step != 23) {
			battleVisible.value = false;
		} else {
			battleVisible.value = true;
		}
	}
);
watch(battleVisible, (v) => {
	if (v && (team.value == 'win-left' || team.value == 'win-right')) {
		duiboCls.value = 'duibo-show';
		worker.postMessage({ cmd: 'start', remain: 0 });
	}
});
</script>
<template>
	<div :class="`bidding-scene ${match.step==23?'':'hide'}`">
		<div v-if="battleVisible && match.battle2" :class="duiboCls">
			<div class="duibo left" :style="{ flex: 50 + random }"></div>
			<div class="duibo right" :style="{ flex: 50 - random }"></div>
		</div>
		<BattleNumer
			v-if="battleVisible && match.battle1"
			:val-a="team1.betCP"
			:val-b="team2.betCP"
		></BattleNumer>
		<div :class="`operator-card ${team}`">
			<div v-if="ban" class="stamp-mark">OUT</div>
			<div :class="`mystery-content ${ban ? 'ban' : ''}`">
				<div class="portrait-content">
					<Transition name="flip">
						<img v-if="data.干员" :src="`/icon/头像_${data.干员}.png`" class="portrait" />
						<img v-else :src="`/images/${data.职业}.png`" class="portrait big-class-icon" />
					</Transition>
				</div>
				<div class="info-box">
					<div class="name">{{ data.干员 || `未知干员` }}</div>
					<div class="stars" v-if="data.稀有度">
						[{{ data.稀有度 }}] <template v-for="i in data.稀有度 - 0" :key="i">★</template>
					</div>
					<div class="sub" v-if="data.分支">{{ data.职业 }}-{{ data.分支 }}</div>
					<div class="sub" v-else-if="data.职业">{{ data.职业 }}</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style lang="css" scoped>
.bidding-scene {
	overflow: hidden;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 30px;
	z-index: -1;
	perspective: 1200px;
}
.bidding-scene.hide {
	display: none;
}

.operator-card {
	z-index: 510;
	width: 200px;
	height: 280px;
	background: #000c;
	border: 2px solid #444;
	border-radius: 8px;
	position: relative;
	transition: all 0.3s;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px;
	box-sizing: border-box;
	transform-style: preserve-3d;
}

.mystery-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 15px;
}

.stamp-mark {
	position: absolute;
	z-index: 1;
	font-size: 4em;
	font-weight: 900;
	color: #d50000;
	border: 0.1em solid #d50000;
	padding: 0 10px;
	transform: rotate(-15deg) scale(2);
	text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
	font-family: 'Black Ops One', 'Impact', 'Arial Black', sans-serif;
	animation: stamp-slam 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s forwards;
}

@keyframes stamp-slam {
	0% {
		transform: rotate(-15deg) scale(5);
		opacity: 0;
	}

	100% {
		transform: rotate(-15deg) scale(1);
		opacity: 1;
	}
}

.big-class-icon {
	width: 80px;
	height: 80px;
}
.portrait-content{
  	perspective: 1000px;
	width: 120px;
	height: 120px;
	position: relative;
}
.portrait {
	width: 120px;
	height: 120px;
	object-fit: cover;
	border-radius: 4px;
	backface-visibility: hidden;
	position: absolute;            /* 让两张卡片重叠 */
	top: 0;
	left: 0;
}
.flip-enter-active,
.flip-leave-active {
  transition: transform 0.6s;
}
.flip-enter-from {
  transform: rotateY(-180deg);
}
.flip-leave-to {
  transform: rotateY(180deg);
}
.info-box {
	text-align: center;
}

.name {
	font-size: 20px;
	font-weight: 700;
	color: #fff;
	margin-bottom: 5px;
}

.stars {
	color: gold;
	font-size: 16px;
	margin-bottom: 5px;
}

.sub {
	font-size: 14px;
	color: #888;
}

.ban {
	filter: grayscale(1) opacity(0.6);
}

.win-left {
	animation: slideLeft v-bind(playingTimeCssVal) v-bind(delayTimeCssVal) ease-out forwards;
	transform-origin: center center;
}

@keyframes slideLeft {
	0% {
	}

	100% {
		transform: translateX(-50vw) scaleX(0.01) scaleY(0.01);
		opacity: 0;
	}
}

.win-right {
	animation: slideRight v-bind(playingTimeCssVal) v-bind(delayTimeCssVal) ease-out forwards;
	transform-origin: center center;
}

@keyframes slideRight {
	0% {
	}

	100% {
		transform: translateX(50vw) scaleX(0.01) scaleY(0.01);
		opacity: 0;
	}
}

.win-back {
	animation: smoke v-bind(playingTimeCssVal) v-bind(delayTimeCssVal) ease-out forwards;
}

@keyframes smoke {
	0% {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0) scale(1) rotate(0);
	}

	100% {
		opacity: 0;
		filter: blur(8px);
		transform: translateY(-60px) scale(1.15) rotate(-5deg);
	}
}

.duibo-show {
	position: absolute;
	width: 100vw;
	height: 100vh;
	display: flex;
	z-index: 500;
	opacity: 1;
	/* transition: opacity v-bind(duiboWinTimeCssVal) v-bind(duiboWinTimeCssVal) linear; */
	transition: opacity v-bind(duiboWinTimeCssVal) linear;
}

.duibo-show.hide {
	opacity: 0;
}

.duibo-show .duibo {
	transition: flex v-bind(duiboRateCssVal) linear;
	flex: 100 1 0%;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 48em;
	overflow: hidden;
}

.duibo-show .left {
	background-color: #00aeef;
}

.duibo-show .right {
	background-color: #d50000;
}
</style>
