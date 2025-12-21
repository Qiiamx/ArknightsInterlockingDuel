<script setup>
import { useMatchStore } from '@/stores/match';
import MatchPublicOperator from './match-public-operator-box.vue';
const { match } = useMatchStore();
</script>
<template>
	<div data-v-8f1d4fa9="" class="public-pool-container">
		<div class="pool-label">公共牌区 / PUBLIC POOL</div>
		<div class="pool-cards">
			<div v-for="idx in match.publicOprs" :key="idx" class="mini-card">
				<MatchPublicOperator :opr-idx="idx"></MatchPublicOperator>
			</div>
		</div>
	</div>
</template>
<style scoped lang="css">
.public-pool-container {
	position: absolute;
	top: 80px;
	left: 50%;
	transform: translate(-50%);
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	pointer-events: none;
	max-width: 600px;
}
.pool-label {
	font-family:
		Rajdhani,
		Noto Sans SC,
		sans-serif;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 2px;
	color: #fff9;
	text-transform: uppercase;
	text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}
.pool-cards {
	display: flex;
	gap: 12px;
	pointer-events: auto;
}
.mini-card {
	width: 70px;
	height: 90px;
	position: relative;
	transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	opacity: 0.85;
}
</style>
