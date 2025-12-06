<script setup>

import { useMatchStore } from '@/stores/match'
import OperatorBox from './operator-box.vue';
const { userInfo, team1 } = useMatchStore()
</script>

<template>
  <div>
    <div>获得干员</div>
    <div>
      <span v-for="idx in team1.getOprs" :key="idx">
        <OperatorBox :opr-idx="idx"></OperatorBox>
      </span>
    </div>
    <div> 队伍名称 {{ team1.name }}</div>
    <div> 队员名称 {{ team1.nicknames }}</div>
    <div> 队员头像(qq) {{ team1.avatars }}</div>
    <div v-if="userInfo.team1"> 剩余调用点 {{ team1.lastCP }}</div>
    <div v-if="userInfo.team1"> 剩余情报点 {{ team1.lastIP }}</div>
    <div v-if="userInfo.team1"> 当前抉择 {{ team1.decision }}</div>
    <div v-if="userInfo.team1"> 回合使用的调用点 {{ team1.betCP }}</div>
    <div v-if="userInfo.team1"> 回合使用的情报点 {{ team1.betIP }}</div>
    <div> 向对方展示的调用点 {{ team1.showBetCP }}</div>
    <div> 向对方展示的情报点 {{ team1.showBetIP }}</div>
    <div> 允许博弈 {{ team1.betFlag }}</div>
  </div>
</template>