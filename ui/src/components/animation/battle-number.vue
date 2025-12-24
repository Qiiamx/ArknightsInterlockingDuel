<template>
  <div class="clash-layer" >
    <div class="clash-arena">
      
      <div 
        class="clash-number left"
        :class="[stageClass, { 'winner': result === 'A', 'loser': result === 'B', 'draw': result === 'DRAW' }]"
      >
        <span class="num-text">{{ valA }}</span>
        <div class="shockwave"></div>
      </div>

      <div class="impact-flash" :class="{ 'active': stage === 'colliding' }"></div>

      <div 
        class="clash-number right"
        :class="[stageClass, { 'winner': result === 'B', 'loser': result === 'A', 'draw': result === 'DRAW' }]"
      >
        <span class="num-text">{{ valB }}</span>
        <div class="shockwave"></div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
const props = defineProps(['valA', 'valB'])
onMounted(()=>{
  startAnimation()
})
const emit = defineEmits(['complete'])

const stage = ref('idle') // 'flying', 'colliding', 'result', 'idle'
const result = ref('') // 'A', 'B', 'DRAW'


const startAnimation = () => {
  // 1. 判定结果
  if (props.valA > props.valB) result.value = 'A'
  else if (props.valB > props.valA) result.value = 'B'
  else result.value = 'DRAW'

  // 2. 飞入阶段 (0ms)
  stage.value = 'flying'

  // 3. 碰撞阶段 (600ms后)
  setTimeout(() => {
    stage.value = 'colliding'
  }, 500)

  // 4. 结果展示阶段 (碰撞后立即发生)
  setTimeout(() => {
    stage.value = 'result'
  }, 600)

  // 5. 动画结束 (2秒后，留给观众看一眼结果)
  setTimeout(() => {
    emit('complete')
  }, 2000)
}

// 计算类名
const stageClass = ref('')
watch(stage, (val) => {
  stageClass.value = val
})
</script>

<style scoped>
.clash-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000; /* 高于大部分元素，但在弹窗之下 */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  perspective: 1000px;
}

.clash-arena {
  position: relative;
  width: 600px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clash-number {
  position: absolute;
  font-family: 'Impact', 'Oswald', sans-serif;
  font-size: 120px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 20px rgba(0,0,0,0.8);
  transition: all 0.1s linear;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clash-number.left {
  left: -200px; /* 初始在屏幕外 */
  color: #00C8FF;
  text-shadow: 0 0 30px rgba(0, 200, 255, 0.6);
}

.clash-number.right {
  right: -200px; /* 初始在屏幕外 */
  color: #FF3333;
  text-shadow: 0 0 30px rgba(255, 51, 51, 0.6);
}

/* === 阶段动画 === */

/* 1. 飞入阶段 */
.clash-number.flying.left {
  animation: flyInLeft 0.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
}
.clash-number.flying.right {
  animation: flyInRight 0.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
}

@keyframes flyInLeft {
  0% { transform: translateX(0) scale(0.5); opacity: 0; }
  100% { transform: translateX(400px) scale(1.2); opacity: 1; } /* 冲向中心 */
}

@keyframes flyInRight {
  0% { transform: translateX(0) scale(0.5); opacity: 0; }
  100% { transform: translateX(-400px) scale(1.2); opacity: 1; } /* 冲向中心 */
}

/* 2. 碰撞瞬间 (冲击波) */
.impact-flash {
  position: absolute;
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transform: scale(0);
}
.impact-flash.active {
  animation: flashExplode 0.3s ease-out forwards;
}

@keyframes flashExplode {
  0% { transform: scale(0); opacity: 1; }
  50% { transform: scale(5); opacity: 0.8; }
  100% { transform: scale(8); opacity: 0; }
}

/* 3. 结果判定阶段 */

/* 胜利者：稍微放大并定住，然后淡出 */
.clash-number.result.winner {
  transform: scale(1.5); /* 在中心放大 */
  z-index: 10;
  filter: drop-shadow(0 0 20px currentColor);
  animation: winnerPulse 1.4s ease-out forwards;
}

/* 失败者：粉碎消失 */
.clash-number.result.loser {
  animation: shatterFade 0.4s ease-out forwards;
}

/* 平局：两者都粉碎 */
.clash-number.result.draw {
  animation: shatterFade 0.4s ease-out forwards;
}

@keyframes winnerPulse {
  0% { transform: scale(1.2); opacity: 1; }
  20% { transform: scale(1.5); opacity: 1; }
  80% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; } /* 最终淡出 */
}

@keyframes shatterFade {
  0% { 
    transform: scale(1.2); 
    opacity: 1;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  20% {
    transform: scale(1.1) rotate(5deg);
    /* 利用 clip-path 模拟碎裂感 (简化版) */
    clip-path: polygon(0 0, 40% 10%, 100% 0, 90% 50%, 100% 100%, 0 100%);
  }
  100% { 
    transform: scale(0.8) rotate(-10deg); 
    opacity: 0; 
    filter: blur(10px);
  }
}
</style>

