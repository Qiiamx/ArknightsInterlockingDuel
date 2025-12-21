<script setup>
// 禁用 / 获取
// 总结信息公示
//
</script>
<template>
	<Transition name="hologram">
		<div v-if="matchPhase === 'RESULT_SHOW' && !flyDirection" class="result-board-container">
			<div v-if="!resultData" class="loading-data">
				DATA SYNCING... <br />
				<span style="font-size: 10px; opacity: 0.5">{{
					resultData === null ? 'NULL' : 'EMPTY'
				}}</span>
			</div>

			<template v-else>
				<div class="result-header">
					<span class="decor-line"></span>
					<span class="title-text">第{{ currentRound }}博弈回合信息汇总</span>
					<span class="decor-line"></span>
				</div>

				<div class="result-body">
					<div class="team-row team-a">
						<div class="team-tag">队伍A</div>
						<div class="action-text">{{ getTeamActionText('A') }}</div>
					</div>

					<div class="team-row team-b">
						<div class="team-tag">队伍B</div>
						<div class="action-text">{{ getTeamActionText('B') }}</div>
					</div>

					<div class="separator">---------------- 本回合角色获取情况 ----------------</div>

					<div class="outcome-row" :class="getOutcomeClass">
						{{ getOutcomeText() }}
					</div>
				</div>

				<div class="result-footer">
					<div class="loading-spinner-small"></div>
					<span>稍后将自动进行下一回合博弈，请各位做好准备...</span>
				</div>
			</template>
		</div>
	</Transition>
</template>
