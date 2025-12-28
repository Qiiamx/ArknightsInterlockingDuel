<script setup>
import { useMatchStore } from '@/stores/match';
import { computed } from 'vue';
import { operators } from '@/utils/operator';
const { userInfo, match, team1, team2 } = useMatchStore();
const public3 = computed(()=>{
	if(!match.continueMind){
		let obj = { ...operators[match.publicOprs[2]] };
		return obj;
	}
	return null
})
const origin = computed(()=>{
	return {...operators[match.selectOpr]}
})
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
</script>
<template>
	<Transition name="hologram">
		<div v-if="match.step == 24" class="result-board-container">
			<div class="result-header">
				<span class="decor-line"></span>
				<span class="title-text">第{{ match.turn }}博弈回合信息汇总</span>
				<span class="decor-line"></span>
			</div>

			<div class="result-body">
				<div class="team-row team-a">
					<div class="team-tag">队伍A</div>
					<div class="action-text">
						{{ `消耗 ${team1.showBetIP} 情报点 ` }}
						{{ team1.decision == 1 ? `抓取(${team1.showBetCP} CP)` : '' }}
						{{ team1.decision == 2 ? `休息` : '' }}
						{{ team1.decision == 3 ? `已终止` : '' }}
					</div>
				</div>

				<div class="team-row team-b">
					<div class="team-tag">队伍B</div>
					<div class="action-text">
						{{ `消耗 ${team2.showBetIP} 情报点 ` }}
						{{ team2.decision == 1 ? `抓取(${team2.showBetCP} CP)` : '' }}
						{{ team2.decision == 2 ? `休息` : '' }}
						{{ team2.decision == 3 ? `已终止` : '' }}
					</div>
				</div>

				<div class="separator">---------------- 本回合角色获取情况 ----------------</div>

				<div
					v-if="team1.decision == 1 || team2.decision == 1"
					:class="
						team1.betCP > team2.betCP
							? 'outcome-row text-blue'
							: team1.betCP < team2.betCP
								? 'outcome-row text-red'
								: 'outcome-row text-yellow'
					"
				>
					<template v-if="team1.betCP > team2.betCP">
						{{ `干员"${data && data.干员 ? data.干员 : '???'}"被队伍A抓取` }}
					</template>
					<template v-else-if="team1.betCP < team2.betCP">
						{{ `干员"${data && data.干员 ? data.干员 : '???'}"被队伍B抓取` }}
					</template>
					<template v-else>
						{{ `干员"${data && data.干员 ? data.干员 : '???'}"及"${data.分支}"分支被禁用！` }}
					</template>
				</div>
				<div v-else-if="team1.decision == 2 && team2.decision == 2" class="outcome-row text-yellow">
					{{ `干员"${data && data.干员 ? data.干员 : '???'}"及"${data.分支}"分支被禁用！` }}
				</div>
				<div v-else class="outcome-row text-yellow">
					{{ `干员${(userInfo.owner || userInfo.viewer)?origin.干员:'???'}已重返有效池！` }}
				</div>
				<template v-if="!match.continueMind" >
					<div class="outcome-row text-yellow">
						{{ `隐藏公共干员是: ${public3?.干员}` }}
					</div>
					<div v-if="team1.quitTimeStamp < team2.quitTimeStamp" class="outcome-row text-yellow">
						队伍A先行终止博弈, 获得10CP
					</div>
					<div v-else-if="team1.quitTimeStamp > team2.quitTimeStamp" class="outcome-row text-yellow">
						队伍B先行终止博弈, 获得10CP
					</div>
					<div v-else class="outcome-row text-yellow">
						双方同时终止博弈(毫秒级对轴??????)
					</div>
				</template>
			</div>

			<div class="result-footer">
				<div class="loading-spinner-small"></div>
				<span>稍后将自动进行下一回合博弈，请各位做好准备...</span>
			</div>
		</div>
	</Transition>
</template>
<style lang="css" scoped>
.result-board-container {
	position: absolute;
	top: 45%;
	/* 【整体下移】从 40% 改为 45%，与按钮区域一起下移 */
	left: 50%;
	transform: translate(-50%, -50%);
	width: 700px;
	max-width: 90vw;
	background: rgba(10, 15, 20, 0.95);
	border: 2px solid rgba(100, 100, 100, 0.5);
	box-shadow:
		0 0 50px rgba(0, 0, 0, 0.8),
		inset 0 0 30px rgba(0, 150, 255, 0.1);
	color: #fff;
	font-family: 'Consolas', 'Courier New', monospace;
	visibility: visible !important;
	opacity: 1 !important;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	backdrop-filter: blur(10px);
}

.loading-data {
	padding: 40px;
	text-align: center;
	font-size: 18px;
	color: #00c8ff;
	letter-spacing: 2px;
}

.result-header {
	background: rgba(0, 0, 0, 0.6);
	padding: 15px 20px;
	text-align: center;
	font-size: 16px;
	letter-spacing: 3px;
	border-bottom: 1px solid rgba(100, 100, 100, 0.3);
	color: #aaa;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15px;
}

.decor-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(100, 100, 100, 0.5), transparent);
}

.title-text {
	font-weight: bold;
	color: #fff;
	white-space: nowrap;
}

.result-body {
	padding: 30px 40px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.team-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 20px;
	background: rgba(255, 255, 255, 0.05);
	border-left: 3px solid transparent;
	transition: all 0.3s;
}

.team-a {
	border-left-color: #00c8ff;
}

.team-b {
	border-left-color: #ff1744;
}

.team-tag {
	font-weight: bold;
	font-size: 18px;
	letter-spacing: 2px;
}

.team-a .team-tag {
	color: #00c8ff;
}

.team-b .team-tag {
	color: #ff1744;
}

.action-text {
	font-size: 14px;
	color: #ccc;
	text-align: right;
}

.separator {
	text-align: center;
	color: #666;
	font-size: 12px;
	letter-spacing: 2px;
	padding: 10px 0;
	border-top: 1px solid rgba(100, 100, 100, 0.2);
	border-bottom: 1px solid rgba(100, 100, 100, 0.2);
}

.outcome-row {
	text-align: center;
	font-size: 18px;
	font-weight: bold;
	padding: 20px;
	border: 2px dashed;
	background: rgba(0, 0, 0, 0.3);
	line-height: 1.6;
}

.text-blue {
	color: #00c8ff;
	border-color: #00c8ff;
	background: rgba(0, 200, 255, 0.1);
	box-shadow: 0 0 20px rgba(0, 200, 255, 0.2);
}

.text-red {
	color: #ff1744;
	border-color: #ff1744;
	background: rgba(255, 23, 68, 0.1);
	box-shadow: 0 0 20px rgba(255, 23, 68, 0.2);
}

.text-yellow {
	color: #ffd700;
	border-color: #ffd700;
	background: rgba(255, 215, 0, 0.1);
	box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.result-footer {
	background: rgba(0, 0, 0, 0.6);
	padding: 12px;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 10px;
	font-size: 11px;
	color: #888;
	letter-spacing: 1px;
	border-top: 1px solid rgba(100, 100, 100, 0.3);
}

.loading-spinner-small {
	width: 12px;
	height: 12px;
	border: 2px solid rgba(100, 100, 100, 0.3);
	border-top-color: #00c8ff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* 全息面板动画 */
.hologram-enter-active {
	animation: hologram-open 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.hologram-leave-active {
	animation: hologram-close 0.3s ease-out;
}

.hologram-enter-from,
.hologram-leave-to {
	opacity: 0;
	transform: translate(-50%, -50%) scaleY(0);
}

@keyframes hologram-open {
	0% {
		transform: translate(-50%, -50%) scaleY(0);
		opacity: 0;
	}

	100% {
		transform: translate(-50%, -50%) scaleY(1);
		opacity: 1;
	}
}

@keyframes hologram-close {
	0% {
		transform: translate(-50%, -50%) scaleY(1);
		opacity: 1;
	}

	100% {
		transform: translate(-50%, -50%) scaleY(0);
		opacity: 0;
	}
}
</style>
