<script setup>
import { useMatchStore } from '@/stores/match';
import { ref, computed, onMounted } from 'vue';
const { userInfo, team1, team2 } = useMatchStore();
import { operators } from '@/utils/operator';
const props = defineProps(['oprIdx', 'showCp']); // 干员索引, 是否显示调用点
const data = computed(() => {
	let obj = { ...operators[props.oprIdx] };
	if (userInfo.team1) {
		if (team1.showNames.indexOf(props.oprIdx) < 0) {
			delete obj.干员;
		}
		if (team1.showClasses.indexOf(props.oprIdx) < 0) {
			delete obj.职业;
		}
		if (team1.showBranches.indexOf(props.oprIdx) < 0) {
			delete obj.分支;
		}
		if (team1.showRares.indexOf(props.oprIdx) < 0) {
			delete obj.稀有度;
		}
		obj.cp = team1.recordCp[props.oprIdx];
	}

	if (userInfo.team2) {
		if (team2.showNames.indexOf(props.oprIdx) < 0) {
			delete obj.干员;
		}
		if (team2.showClasses.indexOf(props.oprIdx) < 0) {
			delete obj.职业;
		}
		if (team2.showBranches.indexOf(props.oprIdx) < 0) {
			delete obj.分支;
		}
		if (team2.showRares.indexOf(props.oprIdx) < 0) {
			delete obj.稀有度;
		}
		obj.cp = team2.recordCp[props.oprIdx];
	}

	if (userInfo.viewer) {
		// 双方选手都不可见时, 观众也不可见
		if (team1.showNames.indexOf(props.oprIdx) < 0 && team2.showNames.indexOf(props.oprIdx) < 0) {
			delete obj.干员;
		}
		if (
			team1.showClasses.indexOf(props.oprIdx) < 0 &&
			team2.showClasses.indexOf(props.oprIdx) < 0
		) {
			delete obj.职业;
		}
		if (
			team1.showBranches.indexOf(props.oprIdx) < 0 &&
			team2.showBranches.indexOf(props.oprIdx) < 0
		) {
			delete obj.分支;
		}
		if (team1.showRares.indexOf(props.oprIdx) < 0 && team2.showRares.indexOf(props.oprIdx) < 0) {
			delete obj.稀有度;
		}
		obj.cp = team1.recordCp[props.oprIdx] || team2.recordCp[props.oprIdx];
	}
	return obj;
});
</script>

<template>
	<div class="op-card rarity-6">
		<div class="op-media">
			<img
				:src="data.干员 ? `/icon/头像_${data.干员}.png` : `/images/${data.职业}.png`"
				class="op-avatar"
				alt="佩佩"
			/>
		</div>
		<div class="op-details">
			<div class="op-name">{{ data.干员 || '???' }}</div>
			<div class="op-sub">{{ data.分支 ? `${data.职业}-${data.分支}` : data.职业 }}</div>
		</div>
		<div class="op-stats">
			<div class="op-stars">
				<span v-if="data.稀有度" class="stars-text">
					<template v-for="i in data.稀有度 - 0" :key="i">★</template>
					[{{ data.稀有度 }}]
				</span>
				<span v-else class="stars-text"> ??? </span>
			</div>
			<div class="op-cost">{{ data.cp }}<span class="unit">CP</span></div>
		</div>
	</div>
	<!-- <div class="operator">
		<div>
			<span>干员: {{ data.干员 || '-' }}</span>
			&nbsp;
			<span>稀有度: {{ data.稀有度 ? data.稀有度 + '星' : '-' }}</span>
		</div>
		<div>
			<span>职业: {{ data.职业 || '-' }}</span>
			&nbsp;
			<span>分支: {{ data.分支 || '-' }}</span>
		</div>
		<div v-if="data.cp">调用点: {{ data.cp }}</div>
	</div> -->
</template>
<style scoped>
.operator {
	border: 1px solid #000;
}

/* 干员卡片 */
.op-card {
	display: flex;
	align-items: center;
	gap: 10px;
	background: #1a1a1a;
	border: 1px solid #333;
	padding: 6px;
	transition: all 0.2s;
	position: relative;
}

/* 选中态/交互态 */
.op-card.selectable {
	cursor: pointer;
}

.op-card.selectable:hover {
	border-color: #fff;
	background: #2a2a2a;
	transform: scale(1.02);
}

/* 稀有度边框 */
.rarity-6 {
	border-left: 3px solid #ff7f27;
}
.rarity-5 {
	border-left: 3px solid #ffd700;
}
.rarity-4 {
	border-left: 3px solid #a020f0;
}
.rarity-3 {
	border-left: 3px solid #00aeef;
}
.rarity-unknown {
	border-left: 3px solid #666;
}

/* 干员媒体（头像/图标） */
.op-media {
	width: 40px;
	height: 40px;
	background: #000;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.op-avatar {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.op-icon {
	width: 80%;
	height: 80%;
	object-fit: contain;
	opacity: 0.7;
}

/* 干员详情 */
.op-details {
	flex: 1;
	min-width: 0;
}

.op-name {
	font-size: 13px;
	font-weight: bold;
	color: #eee;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 2px;
}

.op-sub {
	font-size: 10px;
	color: #777;
}

/* 干员统计 */
.op-stats {
	text-align: right;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;
	flex-shrink: 0;
}

.op-stars {
	font-size: 10px;
	color: #ffd700;
	letter-spacing: -1px;
}

.op-stars.unknown {
	color: #444;
	letter-spacing: 0;
}

.stars-text {
	color: #ffd700;
}

.stars-unknown {
	color: #444;
	letter-spacing: 0;
}

.op-cost {
	font-size: 14px;
	font-weight: bold;
	color: #00aeef;
	font-family: 'Rajdhani', sans-serif;
}

.op-cost .unit {
	font-size: 8px;
	color: #555;
	margin-left: 1px;
}
</style>
