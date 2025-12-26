<script setup>
import { useMatchStore } from '@/stores/match';
import TeamIdentity from './team/team-identity.vue';
import TeamResource from './team/team-resource.vue';
import TeamOperator from './team/team-operator.vue';
import { computed } from 'vue';
const { match, userInfo, team1 } = useMatchStore();
const deg = computed(() => {
	return match.round > 0 ? '10deg' : '180deg';
});
const isShow = () => {
	return userInfo.team1 || userInfo.owner || userInfo.viewer;
};
const cp = computed(() => {
	// if (isShow()) {
	// 	return team1.lastCP;
	// } else {
	// 	return '???';
	// }
	return team1.lastCP;
});
const ip = computed(() => {
	if (isShow()) {
		return team1.lastIP;
	} else {
		return '???';
	}
});
</script>

<template>
	<div class="rotate-bordered-pannel-container">
		<div class="bordered-pannel left">
			<TeamIdentity name="A"></TeamIdentity>
			<TeamResource :cp="cp" :ip="ip"></TeamResource>
			<TeamOperator :oprs="team1.getOprs" side="left"></TeamOperator>
		</div>
	</div>
	<!-- <div>
    <div>获得干员</div>
    <div>
      <span v-for="idx in team1.getOprs" :key="idx">
        <OperatorBox :opr-idx="idx" :show-cp="true"></OperatorBox>
      </span>
    </div>
    <div> 队伍名称 {{ team1.name }}</div>
    <div> 队员名称 {{ team1.nicknames }}</div>
    <div> 队员头像(qq) {{ team1.avatars }}</div>
    <div v-if="userInfo.team1 || userInfo.owner || userInfo.viewer"> 剩余调用点 {{ team1.lastCP }}</div>
    <div v-if="userInfo.team1 || userInfo.owner || userInfo.viewer"> 剩余情报点 {{ team1.lastIP }}</div>
    <div v-if="userInfo.team1 || userInfo.owner || userInfo.viewer"> 当前抉择 {{ team1.decision }}</div>
    <div v-if="userInfo.team1 || userInfo.owner || userInfo.viewer"> 回合使用的调用点 {{ team1.betCP }}</div>
    <div v-if="userInfo.team1 || userInfo.owner || userInfo.viewer"> 回合使用的情报点 {{ team1.betIP }}</div>
    <div> 向对方展示的调用点 {{ team1.showBetCP }}</div>
    <div> 向对方展示的情报点 {{ team1.showBetIP }}</div>
    <div> 允许博弈 {{ team1.betFlag }}</div>
  </div> -->
</template>
<style lang="css" scoped>
/* .rotate-bordered-pannel {
	width: 20vw;
	height: 80vh;
	padding: 15px;
	background: #0f0f14d9;
	display: flex;
	flex-direction: column;
}
.left {
	border-left: 4px solid #00aeef;
	transform: translate(-50vw, -50%) rotateY(v-bind(deg));
	transform-origin: left center;
	transition: transform 1s linear;
	top: 50vh;
	left: 50vw;
	position: absolute;
} */
.rotate-bordered-pannel-container {
	width: 20vw;
	height: 80vh;
	background: #0f0f14d9;
	box-shadow: inset 4px 0 20px #00aeef99, inset 8px 0 40px #00aeef66, inset 12px 0 60px #00aeef33;
	transform: translateY(-50%) rotateY(v-bind(deg));
	transform-origin: left center;
	transition: transform 1s linear;
	top: 50vh;
	left: 0;
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

.left {
	border-left: 4px solid #00AEEF;
	clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);
}
</style>
