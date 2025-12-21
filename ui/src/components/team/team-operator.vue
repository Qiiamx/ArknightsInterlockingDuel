<script setup>
import TeamOperatorBox from './team-operator-box.vue';
const props = defineProps(['oprs']);
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
	<div class="roster-container">
		<div class="operator-list">
			<TeamOperatorBox
				v-for="idx in props.oprs"
				:key="idx"
				:opr-idx="idx"
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
	min-height: 0;
	/* 允许flex收缩 */
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
	display: flex;
	flex-direction: column;
	gap: 6px;
}
</style>
