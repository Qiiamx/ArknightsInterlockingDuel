<script setup>

import { useMatchStore } from '@/stores/match'
import OperatorBox from './operator-box.vue';
const { userInfo, team2 } = useMatchStore()
</script>

<template>
  <div>
    <div>获得干员</div>
    <div>
      <span v-for="idx in team2.getOprs" :key="idx">
        <OperatorBox :opr-idx="idx"></OperatorBox>
      </span>
    </div>
    <div> 队伍名称 {{ team2.name }}</div>
    <div> 队员名称 {{ team2.nicknames }}</div>
    <div> 队员头像(qq) {{ team2.avatars }}</div>
    <div v-if="userInfo.team2"> 剩余调用点 {{ team2.lastCP }}</div>
    <div v-if="userInfo.team2"> 剩余情报点 {{ team2.lastIP }}</div>
    <div v-if="userInfo.team2"> 当前抉择 {{ team2.decision }}</div>
    <div v-if="userInfo.team2"> 回合使用的调用点 {{ team2.betCP }}</div>
    <div v-if="userInfo.team2"> 回合使用的情报点 {{ team2.betIP }}</div>
    <div> 向对方展示的调用点 {{ team2.showBetCP }}</div>
    <div> 向对方展示的情报点 {{ team2.showBetIP }}</div>
    <div> 允许博弈 {{ team2.betFlag }}</div>
  </div>
</template>