<script setup>
import { useMatchStore } from '@/stores/match';
import TeamIdentity from './team/team-identity.vue';
import TeamResource from './team/team-resource.vue';
import { computed } from 'vue';
import TeamOperator from './team/team-operator.vue';
import { useSmoothNumber } from '@/utils/numberchange';
const { match, userInfo, team2 } = useMatchStore();
const deg = computed(() => {
	return match.round > 0 ? '-10deg' : '-180deg';
});
const isShow = () => {
	return userInfo.team2 || userInfo.owner || userInfo.viewer;
};
const targetCP = computed(() => {
	return team2.lastCP;
});
const cp = useSmoothNumber(targetCP, { duration: 500, step: 1 })
const ip = computed(() => {
	if (isShow()) {
		return team2.lastIP;
	} else {
		return '???';
	}
});
</script>

<template>
	<div class="rotate-bordered-pannel-container">
		<div class="bordered-pannel right">
			<TeamIdentity name="B"></TeamIdentity>
			<TeamResource :cp="cp" :ip="ip"></TeamResource>
			<TeamOperator :oprs="team2.getOprs" side="right"></TeamOperator>
		</div>
	</div>
</template>
<style lang="css" scoped>
.rotate-bordered-pannel-container {
	width: 20vw;
	height: 80vh;
	background: #0f0f14d9;
	box-shadow: inset -4px 0 20px #d5000099, inset -8px 0 40px #d5000066, inset -12px 0 60px #d5000033;
	transform: translateY(-50%) rotateY(v-bind(deg));
	transform-origin: right center;
	transition: transform 1s linear;
	top: 50vh;
	right: 0vw;
	position: absolute;
}
.bordered-pannel {
    width: 100%;
    height: 100%;
    background: #0f0f14d9;
    border: 1px solid rgba(255, 255, 255, .1);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    transition: all .3s;
    box-sizing: border-box;
}
.right {
	border-right: 4px solid #D50000;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
}
</style>
