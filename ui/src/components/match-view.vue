<script setup>
import MatchPhase from './match/match-phase.vue';
import MatchPublicOperator from './match/match-public-operator.vue';
import MatchBetOperator from './match/match-bet-operator.vue';
import MatchCountdown from './animation/match-countdown.vue';
import MatchDrawing from './animation/match-drawing.vue';
import MatchBanOperator from './match/match-ban-operator.vue';
import MatchBetShowing from './match/match-bet-showing.vue';
import MatchBetStop from './match/match-bet-stop.vue';
import MatchWinning from './animation/match-winning.vue';
import TeamDecision from './team/team-decision.vue';
import MatchPrepare from './match/match-prepare.vue';
</script>
<template>
	<div>
		<!-- 阶段 -->
		<MatchPhase></MatchPhase>
		<!-- 准备页 -->
		<MatchPrepare></MatchPrepare>
		<!-- 倒计时 -->
		<MatchCountdown></MatchCountdown>
		<!-- 公共干员 -->
		<MatchPublicOperator></MatchPublicOperator>
		<!-- 抽卡动画 -->
		<MatchDrawing></MatchDrawing>
		<!-- 当前干员 -->
		<MatchBetOperator></MatchBetOperator>
		<!-- 选择 -->
		<TeamDecision></TeamDecision>
		<!-- 结算动画 -->
		<MatchWinning></MatchWinning>
		<!-- 结算信息 -->
		<MatchBetShowing></MatchBetShowing>
		<!-- 终止博弈 -->
		<MatchBetStop></MatchBetStop>
		<!-- 禁用干员 -->
		<MatchBanOperator></MatchBanOperator>
	</div>
</template>
