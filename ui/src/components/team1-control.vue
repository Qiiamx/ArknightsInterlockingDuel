<script setup>

import { useMatchStore } from '@/stores/match'
const { userInfo, match, team1, team2, teamOpr } = useMatchStore()


</script>

<template>
  <div v-if="userInfo.team1">
    <button @click="teamOpr.useCP(1)" :disabled="!match.duling || team1.lastCP < 1 || team2.betFlag == false || team1.betFlag == false ">下注(1)</button>
    <button @click="teamOpr.useCP(2)" :disabled="!match.duling || team1.lastCP < 2 || team2.betFlag == false || team1.betFlag == false">下注(2)</button>
    <button @click="teamOpr.useCP(3)" :disabled="!match.duling || team1.lastCP < 3 || team2.betFlag == false || team1.betFlag == false">下注(3)</button>
    <button @click="teamOpr.useCP(4)" :disabled="!match.duling || team1.lastCP < 4 || team2.betFlag == false || team1.betFlag == false">下注(4)</button>
    <button @click="teamOpr.useCP(5)" :disabled="!match.duling || team1.lastCP < 5 || team2.betFlag == false || team1.betFlag == false">下注(5)</button>
    <button @click="teamOpr.useCP(10)" :disabled="!match.duling || team1.lastCP < 10  || team1.betFlag == false">下注(10)</button>
    <button @click="teamOpr.useCP(15)" :disabled="!match.duling || team1.lastCP < 15 || team2.betFlag == false || team1.betFlag == false">下注(15)</button>
    <button @click="teamOpr.useCP(20)" :disabled="!match.duling || team1.lastCP < 20 || team2.betFlag == false || team1.betFlag == false">下注(20)</button>
    <button @click="teamOpr.useIP" :disabled="!match.duling || team1.lastIP<=0 || team1.betFlag == false">调查(1IP)</button>
    <button @click="teamOpr.rest" :disabled="!match.duling || team2.betFlag == false || team1.betFlag == false">休息</button>
    <button @click="teamOpr.quit" :disabled="!match.duling || team1.betFlag == false">结束!</button>
  </div>
</template>