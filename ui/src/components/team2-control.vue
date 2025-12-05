<script setup>

import { useMatchStore } from '@/stores/match'
import { ref } from 'vue';
const { userInfo, teamOpr } = useMatchStore()
const bet = ref(0)


</script>

<template>
  <div v-if="userInfo.team2">
    <button @click="teamOpr.useIP">调查</button>
    <input type="number" v-model="bet" />
    <button @click="teamOpr.useCP(bet)">下注</button>
    <button @click="teamOpr.rest">休息</button>
    <button @click="teamOpr.quit">结束!</button>
  </div>
</template>