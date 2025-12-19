<script setup>

import { useMatchStore } from '@/stores/match'
import { storeToRefs } from 'pinia';
import { nextTick, ref } from 'vue';
import { useRoomStore } from '@/stores/room';
const store = useMatchStore()
const { links } = storeToRefs(useRoomStore())
const { submit, matchOpr } = store
const { userInfo, match, team1, team2 } = storeToRefs(store)
const intervalId = ref(null)
const tick = 1000; //刷新频率(同时也是时间减少的频率)
const showTarget = ref()
const shareVisible = ref(false)
// 结算计时
const showTick = () => {
  if (match.value.timeStep24 < tick) {
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
    matchOpr.changeShowTime(showTarget.value - new Date().getTime())
  }
}

// 启动结算定时器
const startSettlementTimer = () => {
  if (intervalId.value !== null) return        // 防止重复启动
  showTarget.value = new Date().getTime() + match.value.timeStep24
  intervalId.value = window.setInterval(showTick, tick)
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
  if (match.value.timeStep21 < tick) {
    // 到 0 了，清掉定时器并结束
    stopMindTimer()
    // 开始结算
    matchOpr.step24()
    startSettlementTimer()
    return
  }else{
    matchOpr.changeMindTime(showTarget.value - new Date().getTime())
  }
}


// 启动博弈定时器
const startMindTimer = () => {
  if (intervalId.value !== null) return        // 防止重复启动
  showTarget.value = new Date().getTime() + match.value.timeStep21
  intervalId.value = window.setInterval(mindTick, tick)
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
  if (match.value.timeStep1 < tick) {
    // 到 0 了，清掉定时器并结束
    stopStartTimer()
    // 开始博弈阶段
    matchOpr.nextStep()
    mindLoop()
    return
  }else{
    matchOpr.changeSettlementTime(showTarget.value - new Date().getTime())
  }
}


// 启动开局定时器
const startStartTimer = () => {
  if (intervalId.value !== null) return        // 防止重复启动
  showTarget.value = new Date().getTime() + match.value.timeStep1
  intervalId.value = window.setInterval(settlementTick, tick)
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
const copy = async (text) => {
  try{
    await navigator.clipboard.writeText(text)
    alert('复制成功')
  }catch(e){
    alert('复制失败，请手动复制')
  }
}
</script>

<template>
  <div v-if="userInfo.owner">
    <div v-if="shareVisible" class="share-mask">
      <div class="share-content">
        <div class="share-header">
          <div>邀请链接 / INVITE</div>
          <button @click="shareVisible = false">✕</button>
        </div>
        <div>
          <div>
            <div class="share-link-label" style="color: rgb(255, 205, 0);">主持人 / OWNER</div>
            <div class="share-link-item">
              <div>{{ links.owner }}</div>
              <button @click="()=>copy(links.owner)">复制</button>
            </div>
          </div>
          <div>
            <div class="share-link-label" style="color: rgb(0, 200, 255);">队伍A / TEAM A</div>
            <div class="share-link-item">
              <div>{{ links.team1 }}</div>
              <button @click="()=>copy(links.team1)">复制</button>
            </div>
          </div>
          <div>
            <div class="share-link-label" style="color: rgb(255, 51, 51);">队伍B / TEAM B</div>
            <div class="share-link-item">
              <div>{{ links.team2 }}</div>
              <button @click="()=>copy(links.team2)">复制</button>
            </div>
          </div>
          <div>
            <div class="share-link-label" style="color: rgb(50, 255, 100);">观众 / VIEWER</div>
            <div class="share-link-item">
              <div>{{ links.viewer }}</div>
              <button @click="()=>copy(links.viewer)">复制</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="control-panel">
      <div class="control-info">管理员指令 / ADMIN CONSOLE</div>
      <div class="control-btn-group">
        <button @click="getData">👇 快照 / SNAP </button>
        <button @click="setData">👆 复原 / REC </button>
        <button @click="()=>shareVisible=true">👉 分享 / SHARE </button>
        <button v-if="match.round == 0" @click="startMatch">▶ 开局 / INITIATE</button>
        <!-- <textarea v-model="data">
        </textarea> -->
        <!-- 开局 -->
        <button v-if="match.settling"  @click="stopStartTimer">⏹ 暂停 / PAUSE</button>
        <button v-if="match.settling" @click="startStartTimer">▶ 恢复 / CONTINUE</button>
        <!-- 博弈 -->
        <button v-if="match.duling" @click="stopMindTimer">⏹ 暂停 / PAUSE</button>
        <button v-if="match.duling" @click="startMindTimer">▶ 恢复 / CONTINUE</button>
        <!-- 结算 -->
        <button v-if="match.showing" @click="stopSettlementTimer">⏹ 暂停 / PAUSE</button>
        <button v-if="match.showing" @click="startSettlementTimer">▶ 恢复 / CONTINUE</button>
        <!-- <button v-if="match.step == 3" @click="matchOpr.step3">博弈终止</button> -->
        <button v-if="match.step == 4" @click="startMatch">下一轮比赛(会直接开始)</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.control-panel{
  top: 75vh;
  left: 50vw;
  width: 38vw;
  transform: translateX(-19vw) translateY(-10vh);
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #14191ee6;
  backdrop-filter: blur(5px);
  border: 1px solid #444;
  border-bottom: 4px solid #666;
  box-shadow: 0 20px 50px #00000080;
}
.control-info{
  width: 95%;
  font-size: 0.5em;
  color: #666;
  padding-top: 1em;
  border-bottom: 1px solid #333;
  margin-bottom: 1em;
  padding-bottom: 0.3em;
  text-align: right;
  letter-spacing: 1px;
}
.control-btn-group{
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 显式 3 列 */
  padding-bottom: 1em;
  gap: 12px;
  max-height: 40vh;
  overflow-y: auto;
}
.control-btn-group button{
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  height: 3em;
  padding: 0 1.5em;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
}
.btn-group{
  top: 75vh;
  left: 50vw;
  width: 20em;
  transform: translateX(-10em);
  display: flex;
  justify-content: center;
  align-items: center;
  background: #14191ee6;
  backdrop-filter: blur(5px);
  border: 1px solid #444;
  border-bottom: 4px solid #666;
  box-shadow: 0 20px 50px #00000080;
  position: absolute;
}
.btn-group .btn{
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}
.share-mask{
  z-index: 10;
  width: 100vw;
  height: 100vh;
  background-color: #00000098;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
}
.share-content{
  width: 30%;
  display: flex;
  flex-direction: column;
  padding: 2em;
  background: #1a1a1a;
  border: 1px solid rgba(0, 200, 255, .3);
}
.share-header{
  font-size: 1em;
  color: #fff;
  letter-spacing: 2px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2em;
  padding-bottom: 1em;
  border-bottom: 1px solid rgba(255, 255, 255, .1);
}
.share-header button{
  outline: none; 
  border: none;   
  background: transparent;
  color: #fff;
  font-size: 1.2em;
  font-weight: 600;
  cursor: pointer;
}
.share-link-label{
  font-weight: 600;
  padding: 0.5em 0;
}
.share-link-item{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #00000080;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, .1);
  font-size: 0.3em;
  color: #ffffffb3;
  font-family: Consolas, monospace;
  word-break: break-all;
}
.share-link-item div{
  user-select: all;
}
.share-link-item button{
  padding: 6px 12px;
  background: #00c8ff1a;
  border: 1px solid rgba(0, 200, 255, .3);
  color: #00c8ff;
  font-size: 11px;
  cursor: pointer;
  transition: all .3s ease;
  white-space: nowrap;
}
</style>