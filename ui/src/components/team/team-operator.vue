<script setup>
import { computed, ref } from 'vue';
import TeamOperatorBox from './team-operator-box.vue';
import { operators, branches } from '@/utils/operator';
const props = defineProps(['oprs', 'side']);
const classes = ['全部', ...new Set(branches.map((t) => t.所属职业))];
const activeClasses = ref(classes[0]);
const clsList = computed(() => {
	let map = { 全部: [] };
	let detailOperators = props.oprs.map((i) => {
		return { idx: i, ...operators[i] };
	});
	for (let opr of detailOperators) {
		map['全部'].push(opr);
		if (!map[opr.职业]) {
			map[opr.职业] = [opr];
		} else {
			map[opr.职业].push(opr);
		}
	}
	for (let key in map) {
		if(key != '全部'){
			map[key].sort((t1, t2) => t2.稀有度 - t1.稀有度);
		}
	}
	return map;
});
</script>
<template>
	<div class="separator">
		<div class="line"></div>
		<div class="tag">干员列表 // ROSTER</div>
		<div class="line"></div>
	</div>
	<div v-if="props.oprs.length === 0" class="empty-state">
		<div>AWAITING DEPLOYMENT</div>
		<div class="sub">暂无干员调入</div>
	</div>
	<div v-else class="roster-container">
		<div class="filter-bar">
			<div class="filter-bar-container">
				<div
					v-for="cls in classes"
					:key="cls"
					:class="activeClasses == cls ? 'filter-bar-item active' : 'filter-bar-item'"
					@click="() => (activeClasses = cls)"
				>
					{{ cls }}({{ clsList[cls] ? clsList[cls].length : 0 }})
				</div>
			</div>
		</div>
		<div class="operator-list">
			<TeamOperatorBox :class="props.side"
				v-for="opr in clsList[activeClasses]"
				:key="opr.idx"
				:opr-idx="opr.idx"
				:show-cp="true"
			></TeamOperatorBox>
		</div>
	</div>
</template>

<style scoped lang="css">
.separator {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 0 15px;
	margin: 4px 0;
	/* 减少上下间距，从10px改为4px */
}

.separator .line {
	flex: 1;
	height: 1px;
	background: #444;
}

.separator .tag {
	font-size: 10px;
	color: #666;
	font-family: 'Rajdhani', sans-serif;
	letter-spacing: 1px;
	white-space: nowrap;
}

.roster-container {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 0 10px 10px 10px;
	display: flex;
}

.empty-state {
	text-align: center;
	color: #444;
	margin-top: 50px;
	font-family: 'Rajdhani', sans-serif;
}

.empty-state .sub {
	font-size: 10px;
	margin-top: 5px;
	color: #666;
}

.operator-list {
	flex: 1;
	overflow-y: visible;
}


.roster-container::-webkit-scrollbar {
	width: 4px;
}

.roster-container::-webkit-scrollbar-thumb {
	background: #444;
	border-radius: 2px;
}

.roster-container::-webkit-scrollbar-thumb:hover {
	background: #666;
}
.filter-bar {
	cursor: pointer;
	height: 100%;
	width: 4em;
}

.filter-bar-container{
	display: flex;
    flex-direction: column;
    gap: 0.5em;
    position: fixed;
}

.filter-bar-item:hover,
.active {
	color: #ffd700;
}
</style>
