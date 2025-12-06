<script setup>

import { useMatchStore } from '@/stores/match'
import { ref } from 'vue';
const { userInfo, match, team2, teamOpr } = useMatchStore()
const bet = ref(0)


</script>

<template>
  <div v-if="userInfo.team2">
    <button @click="teamOpr.useIP" :disabled="!match.duling || team2.lastIP<=0">调查(1IP)</button>
    <input type="number" v-model="bet" />
    <button @click="teamOpr.useCP(bet)" :disabled="!match.duling || bet<=0 || team2.lastCP < bet">下注</button>
    <button @click="teamOpr.rest" :disabled="!match.duling">休息</button>
    <button @click="teamOpr.quit" :disabled="!match.duling">结束!</button>
  </div>
</template>