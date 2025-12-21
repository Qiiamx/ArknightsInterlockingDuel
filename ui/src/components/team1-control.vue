<script setup>
import { useMatchStore } from '@/stores/match';
const { userInfo, match, team1, team2, teamOpr } = useMatchStore();
</script>
<template>
	<div v-if="userInfo.team1">
		<div class="control-panel">
			<div class="control-info">TEAM A 指令 / CONSOLE</div>
			<div class="control-btn-group">
				<button
					v-for="n in [1, 2, 3, 4, 5, 10, 15, 20]"
					:key="n"
					@click="teamOpr.useCP(n)"
					:disabled="
						!(match.step == 21) ||
						team1.lastCP < n ||
						(n !== 10 && team2.betFlag == false) ||
						team1.betFlag == false
					"
					:class="team1.decision == 1 && team1.betCP == n ? 'active' : ''"
				>
					下注({{ n }})
				</button>
				<button
					@click="teamOpr.useIP"
					:disabled="!(match.step == 21) || team1.lastIP <= 0 || team1.betFlag == false"
				>
					调查
				</button>
				<button
					@click="teamOpr.rest"
					:disabled="!(match.step == 21) || team2.betFlag == false || team1.betFlag == false"
					:class="team1.decision == 2 ? 'active' : ''"
				>
					休息
				</button>
				<button
					@click="teamOpr.quit"
					:disabled="!(match.step == 21) || team1.betFlag == false"
					:class="team1.decision == 3 ? 'active' : ''"
				>
					结束!
				</button>
			</div>
		</div>
	</div>
</template>
<style scoped>
.control-panel {
	top: 75vh;
	left: 50vw;
	width: 38vw;
	transform: translateX(-19vw) translateY(-10vh);
	position: absolute;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: #14191ee6;
	border: 1px solid #444;
	border-bottom: 4px solid #666;
	box-shadow: 0 20px 50px #00000080;
}
.control-info {
	width: 95%;
	font-size: 0.5em;
	color: #666;
	padding-top: 1em;
	border-bottom: 1px solid #333;
	margin-bottom: 1em;
	padding-bottom: 0.3em;
	text-align: right;
	letter-spacing: 1px;
}
.control-btn-group {
	display: grid;
	grid-template-columns: repeat(3, 1fr); /* 显式 3 列 */
	padding-bottom: 1em;
	gap: 12px;
	max-height: 40vh;
	overflow-y: auto;
}
.control-btn-group button {
	clip-path: polygon(
		10px 0,
		100% 0,
		100% calc(100% - 10px),
		calc(100% - 10px) 100%,
		0 100%,
		0 10px
	);
	height: 3em;
	padding: 0 1.5em;
	cursor: pointer;
	font-size: 1.1em;
	font-weight: 600;
}
.control-btn-group button.active {
	background: yellow;
}
</style>
