<script setup>
import MatchPhase from './match/match-phase.vue';
import MatchPublicOperator from './match/match-public-operator.vue';
import MatchBetOperator from './match/match-bet-operator.vue';
import MatchCountdown from './match/match-countdown.vue';
import MatchDrawing from './animation/match-drawing.vue';
import MatchBanOperator from './match/match-ban-operator.vue';
</script>
<template>
	<div>
		<MatchPhase></MatchPhase>
		<MatchCountdown></MatchCountdown>
		<MatchPublicOperator></MatchPublicOperator>

		<MatchDrawing></MatchDrawing>

		<MatchBetOperator></MatchBetOperator>
		<MatchBanOperator></MatchBanOperator>
	</div>
</template>
