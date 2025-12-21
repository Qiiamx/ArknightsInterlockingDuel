<script setup>
import { useMatchStore } from '@/stores/match';
import { computed, onMounted, ref } from 'vue';
import operators from '@/assets/operators.json';
const { userInfo, match, team1, team2 } = useMatchStore();
const data = computed(() => {
	if (match.selectOpr == null || match.selectOpr == '' || match.selectOpr < 0) {
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
</script>
<template>
	<div v-if="data" class="bidding-scene">
		<div class="operator-card">
			<div class="mystery-content">
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
	animation: cardPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
/* 动画关键帧 */
@keyframes cardPop {
	from {
		transform: scale(0) translateY(50px);
		opacity: 0;
	}
	to {
		transform: scale(1) translateY(0);
		opacity: 1;
	}
}

.mystery-content,
.revealed-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 15px;
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
</style>
