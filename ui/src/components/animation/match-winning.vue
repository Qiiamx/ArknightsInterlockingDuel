<script setup>
import { useMatchStore } from '@/stores/match';
import { computed, onMounted, ref } from 'vue';
import { operators } from '@/utils/operator';
const { userInfo, match, team1, team2, WINNING_TIME } = useMatchStore();
const delayTime = (WINNING_TIME - 1000) / 1000 + 's';
const playingTime = '1s';
const data = computed(() => {
	if (match.step != 23) {
		return null;
	}
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
	return !(team1.betCP != team2.betCP || (team1.decision == 3 && team2.decision == 3));
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
</script>
<template>
	<div v-if="data" class="bidding-scene">
		<div :class="`operator-card ${team}`">
			<div v-if="ban" class="stamp-mark">OUT</div>
			<div :class="`mystery-content ${ban ? 'ban' : ''}`">
				<img v-if="data.干员" :src="`/icon/头像_${data.干员}.png`" class="portrait" />
				<img v-else :src="`/images/${data.职业}.png`" class="big-class-icon" />
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

.operator-card {
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
	object-fit: contain;
}

.portrait {
	width: 120px;
	height: 120px;
	object-fit: cover;
	border-radius: 4px;
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
	animation: slideLeft v-bind(playingTime) v-bind(delayTime) cubic-bezier(0.6, 0, 0.4, 1) forwards;
	transform-origin: left center;
	position: relative;
	overflow: hidden;
}

@keyframes slideLeft {
	0% {
		transform: translateX(0) scale(1);
		opacity: 1;
	}

	100% {
		transform: translateX(-50vw) scaleX(0.01) scaleY(0.01);
		opacity: 0;
	}
}

.win-right {
	animation: slideRight v-bind(playingTime) v-bind(delayTime) cubic-bezier(0.6, 0, 0.4, 1) forwards;
	transform-origin: right center;
	position: relative;
	overflow: hidden;
}

@keyframes slideRight {
	0% {
		transform: translateX(0) scale(1);
		opacity: 1;
	}

	100% {
		transform: translateX(50vw) scaleX(0.01) scaleY(0.01);
		opacity: 0;
	}
}
.win-back {
	animation: smoke v-bind(playingTime) v-bind(delayTime) ease-out forwards;
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
</style>
