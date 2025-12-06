<script setup>

import { useMatchStore } from '@/stores/match'
import { storeToRefs } from 'pinia';
import { nextTick, ref } from 'vue';
const store = useMatchStore()
const { submit, matchOpr } = store
const { userInfo, match, team1, team2 } = storeToRefs(store)
const intervalId = ref(null)

// 结算计时
const showTick = () => {
  if (match.value.timeStep24 <= 0) {
    // 到 0 了，清掉定时器并结束
    stopSettlementTimer()
    if (  match.value.continueMind && (team1.value.betFlag || team2.value.betFlag)  ) {
      // 下一轮还有干员可以选择, 且 有一方还在进行, 继续 博弈循环
      mindLoop()
    } else {
      // 进行步骤3, 展示隐藏公共干员, 转进到step4 开始作战
      matchOpr.step3()
    }
    return
  }else{
    matchOpr.changeShowTime(match.value.timeStep24 - 1)
  }
}

// 启动结算定时器
const startSettlementTimer = () => {
  if (intervalId.value !== null) return        // 防止重复启动
  intervalId.value = window.setInterval(showTick, 1000)
}

// 停止结算定时器
const stopSettlementTimer = () => {
  if (intervalId.value !== null) {
    window.clearInterval(intervalId.value)
    intervalId.value = null
  }
}


// 博弈计时
const mindTick = () => {
  if (match.value.timeStep21 <= 0) {
    // 到 0 了，清掉定时器并结束
    stopMindTimer()
    // 开始结算
    matchOpr.step24()
    startSettlementTimer()
    return
  }else{
    matchOpr.changeMindTime(match.value.timeStep21 - 1)
  }
}


// 启动博弈定时器
const startMindTimer = () => {
  if (intervalId.value !== null) return        // 防止重复启动
  intervalId.value = window.setInterval(mindTick, 1000)
}

// 停止博弈定时器
const stopMindTimer = () => {
  if (intervalId.value !== null) {
    window.clearInterval(intervalId.value)
    intervalId.value = null
  }
}

// 开始博弈
const mindLoop = () => {
  matchOpr.step21()
  startMindTimer()
}

// 开局计时
const settlementTick = () => {
  if (match.value.timeStep1 <= 0) {
    // 到 0 了，清掉定时器并结束
    stopStartTimer()
    // 开始博弈阶段
    matchOpr.nextStep()
    mindLoop()
    return
  }else{
    matchOpr.changeSettlementTime(match.value.timeStep1 - 1)
  }
}


// 启动开局定时器
const startStartTimer = () => {
  if (intervalId.value !== null) return        // 防止重复启动
  intervalId.value = window.setInterval(settlementTick, 1000)
}

// 停止开局定时器
const stopStartTimer = () => {
  if (intervalId.value !== null) {
    window.clearInterval(intervalId.value)
    intervalId.value = null
  }
}
//开始比赛
const startMatch = ()=>{
  matchOpr.nextRound()
  matchOpr.step1()
  startStartTimer()
}


// 复现对局
const data = ref('')
const setData = () => {
  nextTick(() => {
    submit(null, JSON.parse(data.value))
  })
}
const getData = () => {
  data.value = JSON.stringify({
    match: match.value,
    team1: team1.value,
    team2: team2.value,
  })
}
</script>

<template>
  <div v-if="userInfo.owner">
    <textarea v-model="data">

    </textarea>
    <button @click="getData">获取</button>
    <button @click="setData">重现</button>
    <button v-if="match.round == 0" @click="startMatch">开始比赛</button>
    <button v-if="match.round > 0 && match.step < 4" @click="matchOpr.nextStep">下一阶段</button>
    <button v-if="match.round > 0 && match.step == 1" @click="matchOpr.step1">抽取公共干员</button>
    <template v-if="match.step == 2">
      <button @click="stopStartTimer">暂停开局计时</button>
      <button @click="startStartTimer">恢复开局计时</button>
      <button @click="stopMindTimer">暂停博弈计时</button>
      <button @click="startMindTimer">恢复博弈计时</button>
      <button @click="stopSettlementTimer">暂停结算计时</button>
      <button @click="startSettlementTimer">恢复结算计时</button>
      <button @click="mindLoop">博弈（可重复）</button>
    </template>
    <button v-if="match.step == 3" @click="matchOpr.step3">博弈终止</button>
    <button v-if="match.step == 4" @click="startMatch">下一轮比赛(会直接开始)</button>
  </div>
</template>