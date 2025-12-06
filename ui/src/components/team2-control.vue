<script setup>

import { useMatchStore } from '@/stores/match'
const { userInfo, match, team2, team1, teamOpr } = useMatchStore()


</script>

<template>
  <div v-if="userInfo.team2">
    <button @click="teamOpr.useCP(1)" :disabled="!match.duling || team2.lastCP < 1 || team1.betFlag == false || team2.betFlag == false">下注(1)</button>
    <button @click="teamOpr.useCP(2)" :disabled="!match.duling || team2.lastCP < 2 || team1.betFlag == false || team2.betFlag == false">下注(2)</button>
    <button @click="teamOpr.useCP(3)" :disabled="!match.duling || team2.lastCP < 3 || team1.betFlag == false || team2.betFlag == false">下注(3)</button>
    <button @click="teamOpr.useCP(4)" :disabled="!match.duling || team2.lastCP < 4 || team1.betFlag == false || team2.betFlag == false">下注(4)</button>
    <button @click="teamOpr.useCP(5)" :disabled="!match.duling || team2.lastCP < 5 || team1.betFlag == false || team2.betFlag == false">下注(5)</button>
    <button @click="teamOpr.useCP(10)" :disabled="!match.duling || team2.lastCP < 10 || team2.betFlag == false">下注(10)</button>
    <button @click="teamOpr.useCP(15)" :disabled="!match.duling || team2.lastCP < 15 || team1.betFlag == false || team2.betFlag == false">下注(15)</button>
    <button @click="teamOpr.useCP(20)" :disabled="!match.duling || team2.lastCP < 20 || team1.betFlag == false || team2.betFlag == false">下注(20)</button>
    <button @click="teamOpr.useIP" :disabled="!match.duling || team2.lastIP<=0 || team2.betFlag == false">调查(1IP)</button>
    <button @click="teamOpr.rest" :disabled="!match.duling || team1.betFlag == false || team2.betFlag == false">休息</button>
    <button @click="teamOpr.quit" :disabled="!match.duling || team2.betFlag == false">结束!</button>
  </div>
</template>