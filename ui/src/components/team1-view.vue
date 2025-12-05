<script setup>

import { useMatchStore } from '@/stores/match'
const { team1 } = useMatchStore() //todo 换一个computed出来的team1, 对team2身份的人隐藏信息
</script>

<template>
  <div>
    <div>获得干员</div>
    <div>
      <span v-for="opr in team1.get_oprs" :key="opr">{{ opr }},</span>
    </div>
    <div> 剩余调查点 {{ team1.lastCP }}</div>
    <div> 剩余情报点 {{ team1.lastIP }}</div>
    <div> 当前抉择 {{ team1.decision }}</div>
    <div> 当前押注 {{ team1.betCP }}</div>
    <div> 允许博弈 {{ team1.betFlag }}</div>
  </div>
</template>