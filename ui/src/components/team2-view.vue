<script setup>

import { useMatchStore } from '@/stores/match'
import OperatorBox from './operator-box.vue';
import TeamIdentity from './team/team-identity.vue';
import TeamResource from './team/team-resource.vue';
import { computed } from 'vue';
const { userInfo, team2 } = useMatchStore()
const isShow = ()=>{
  return userInfo.team2 || userInfo.owner || userInfo.viewer;
}
const cp = computed(()=>{
  if(isShow()){
    return team2.lastCP;
  }else{
    return "???"
  }
})
const ip = computed(()=>{
  if(isShow()){
    return team2.lastIP;
  }else{
    return "???"
  }
})
</script>

<template>
  <div class="rotate-bordered-pannel right">
    <TeamIdentity name="B"></TeamIdentity>
    <TeamResource :cp="cp" :ip="ip"></TeamResource>
    <div class="team-operator">
      <div>获得干员</div>
      <span v-for="idx in team2.getOprs" :key="idx">
        <OperatorBox :opr-idx="idx" :show-cp="true"></OperatorBox>
      </span>
    </div>
  </div>
  <!-- <div>
    <div>获得干员</div>
    <div>
      <span v-for="idx in team2.getOprs" :key="idx">
        <OperatorBox :opr-idx="idx" :show-cp="true"></OperatorBox>
      </span>
    </div>
    <div> 队伍名称 {{ team2.name }}</div>
    <div> 队员名称 {{ team2.nicknames }}</div>
    <div> 队员头像(qq) {{ team2.avatars }}</div>
    <div v-if="userInfo.team2 || userInfo.owner || userInfo.viewer"> 剩余调用点 {{ team2.lastCP }}</div>
    <div v-if="userInfo.team2 || userInfo.owner || userInfo.viewer"> 剩余情报点 {{ team2.lastIP }}</div>
    <div v-if="userInfo.team2 || userInfo.owner || userInfo.viewer"> 当前抉择 {{ team2.decision }}</div>
    <div v-if="userInfo.team2 || userInfo.owner || userInfo.viewer"> 回合使用的调用点 {{ team2.betCP }}</div>
    <div v-if="userInfo.team2 || userInfo.owner || userInfo.viewer"> 回合使用的情报点 {{ team2.betIP }}</div>
    <div> 向对方展示的调用点 {{ team2.showBetCP }}</div>
    <div> 向对方展示的情报点 {{ team2.showBetIP }}</div>
    <div> 允许博弈 {{ team2.betFlag }}</div>
  </div> -->
</template>
<style lang="css" scoped>
.rotate-bordered-pannel {
  width: 20vw;
  height: 80vh;
  padding: 15px;
  background: #0f0f14d9;
}

.right {
  border-right: 4px solid #00AEEF;
  transform: translate(50vw, -50%) rotateY(-15deg);
  transform-origin: right center;
  top: 50vh;
  right: 50vw;
  position: absolute;
}
</style>