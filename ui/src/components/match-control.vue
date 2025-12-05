<script setup>

import { useMatchStore } from '@/stores/match'
import { ref } from 'vue';
const { userInfo, match, matchOpr } = useMatchStore()
const intervalId = ref(null)
const tick = () => {
  if (match.time <= 0) {
    // 到 0 了，清掉定时器并结束
    stopTimer()
    // 你可以在这里调用 matchOpr.step3() 或 emit('done') 等
    matchOpr.step24()
    return
  }
  matchOpr.changeTime(match.time - 1)
}


// 启动定时器
const startTimer = () => {
  if (intervalId.value !== null) return        // 防止重复启动
  intervalId.value = window.setInterval(tick, 1000)
}

// 停止定时器
const stopTimer = () => {
  if (intervalId.value !== null) {
    window.clearInterval(intervalId.value)
    intervalId.value = null
  }
}

const mindLoop = ()=>{
  matchOpr.step21()
  startTimer()
}

</script>

<template>
  <div v-if="userInfo.owner">
    <button v-if="match.round == 0" @click="matchOpr.nextRound">开始比赛</button>
    <button v-if="match.round > 0 && match.step < 4" @click="matchOpr.nextStep">下一阶段</button>
    <button v-if="match.round > 0 && match.step == 1" @click="matchOpr.step1">抽取公共干员</button>
    <template v-if="match.step==2">
      <button @click="stopTimer">暂停计时</button>
      <button @click="startTimer">恢复计时</button>
      <button @click="mindLoop">博弈（可重复）</button>
    </template>
    <button v-if="match.step == 3" @click="matchOpr.step3">博弈终止</button>
    <button v-if="match.step == 4" @click="matchOpr.show">展示博弈结果</button>
    <button v-if="match.step == 4" @click="matchOpr.nextRound">下一轮</button>
  </div>
</template>