<script setup>
import MatchPhase from './match/match-phase.vue';
import MatchPublicOperator from './match/match-public-operator.vue';
import MatchBetOperator from './match/match-bet-operator.vue';
import MatchCountdown from './match/match-countdown.vue';
import MatchDrawing from './animation/match-drawing.vue';
import MatchBanOperator from './match/match-ban-operator.vue';
import MatchBetShowing from './match/match-bet-showing.vue';
import MatchWinning from './animation/match-winning.vue';
</script>
<template>
	<div>
    <!-- 阶段 -->
		<MatchPhase></MatchPhase>
    <!-- 倒计时 -->
		<MatchCountdown></MatchCountdown>
    <!-- 公共干员 -->
		<MatchPublicOperator></MatchPublicOperator>
    <!-- 抽卡动画 -->
		<MatchDrawing></MatchDrawing>
    <!-- 当前干员 -->
		<MatchBetOperator></MatchBetOperator>
    <!-- 结算动画 -->
    <MatchWinning></MatchWinning>
    <!-- 结算信息 -->
    <MatchBetShowing></MatchBetShowing>
    <!-- 禁用干员 -->
		<MatchBanOperator></MatchBanOperator>
	</div>
</template>
