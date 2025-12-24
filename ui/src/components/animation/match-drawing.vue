<script setup>
// 博弈阶段干员抽取进度条  step20
import { watch, ref } from 'vue';
import { useMatchStore } from '@/stores/match';
import CountdownWorker from '@/utils/countdown.js?worker';
const worker = new CountdownWorker();
const { match, DULING_TIME } = useMatchStore();
const TURN_TIME = 500;
const FADE_TIME = 500;
const TURN_TIME_CSS_VAL = (TURN_TIME / 1000) + 's'
const FADE_TIME_CSS_VAL = (FADE_TIME / 1000) + 's'
const randomPercent = ref(0);
const show = ref('');
const jumpCount = ref(0)
worker.onmessage = (e) => {
  console.debug("msg", e.data.cmd)
  if (e.data.cmd === 'fire') {
    startDrawingEffect();
  }
};
// 生成随机数据字符串
const generateRandomDataString = () => {
  return Array(20)
    .fill(0)
    .map(() => Math.random().toString(36).substring(2, 8).toUpperCase())
    .join(' ');
};
watch(
  () => match.step,
  (step) => {
    if (step == 20) {
      // 播放回合
      console.debug("start turn")
      startTurnInfo()
    } else {
      console.debug("clear play")
      worker.postMessage({ cmd: 'clear' });
    }
  }
);
// 展示回合
const startTurnInfo = () => {
  show.value = 'info';
  worker.postMessage({ cmd: 'start', remain: DULING_TIME / 2 });
};
// 抽取中数据流特效, 以 10 次为目标, 每次落在 jumpCount*2 - (jumpCount+1)*5 区间
const startDrawingEffect = () => {
  show.value = 'draw';
  randomPercent.value = Math.min(100, Math.floor(jumpCount.value * 10 + Math.random() * 10));
  if (randomPercent.value < 100) {
    jumpCount.value = jumpCount.value + 1;
    worker.postMessage({ cmd: 'start', remain: (DULING_TIME / 2 - TURN_TIME - TURN_TIME) * 0.1 });
  } else {
    console.debug("show off")
    show.value = '';
    jumpCount.value = 0
  }
};
</script>
<template>
  <template v-if="match.step == 20">
    <Transition name="banner-fold">
      <div v-if="show == 'info'" class="tactical-banner">
        <div class="shine-effect"></div>
        <div class="hazard-stripes"></div>

        <div class="banner-content">
          <div class="banner-sub-top">WARNING // COMBAT PROTOCOL INITIATED</div>
          <div class="banner-main-text">
            <span class="round-num">TURN {{ match.turn }}</span>
            <span class="divider">//</span>
            <span class="action-text">START</span>
          </div>
          <div class="banner-sub-bottom">请双方做好博弈准备</div>
        </div>

        <div class="bracket bracket-left"></div>
        <div class="bracket bracket-right"></div>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="show == 'draw'" class="drawing-layer">
        <div class="data-stream-bg">
          <div
            v-for="i in 10"
            :key="i"
            class="stream-column"
            :style="{ animationDelay: `${Math.random() * -2}s`, left: `${(i - 1) * 10}%` }">
            {{ generateRandomDataString() }}
          </div>
        </div>

        <div class="drawing-content">
          <div class="radar-circle"></div>
          <div class="glitch-text" data-text="正在检索数据库，抽取中...">
            正在检索数据库，抽取中...
          </div>
          <div class="drawing-sub">
            TARGET LOCKING // <span class="percent-counter">{{ randomPercent }}%</span>
          </div>
        </div>
      </div>
    </Transition>
  </template>
</template>
<style lang="css" scoped>
.drawing-layer {
  /* position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh; */
  background: rgba(0, 0, 0, 0.8);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  width: 80vw;
  height: 10vw;
  top: 40vh;
  left: 10vw;
  position: absolute;
}

.data-stream-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.05;
  /* 调整为20%不透明度 */
  z-index: 0;
}

.stream-column {
  position: absolute;
  top: -100%;
  width: 10%;
  /* 10列 */
  font-family: 'Consolas', monospace;
  font-size: 12px;
  color: #fff;
  word-break: break-all;
  text-align: center;
  animation: waterfall 4s linear infinite;
  /* 减缓50%：从2s变为4s */
  text-shadow: 0 0 5px #fff;
}

@keyframes waterfall {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(200vh);
  }
}

.drawing-content {
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
}

.radar-circle {
  width: 120px;
  height: 120px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin-radar 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

@keyframes spin-radar {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 核心故障文字 (50%透明度 + 白色-淡红色强光晕) */
.glitch-text {
  font-size: 48px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.5);
  /* 50% 不透明度 */
  position: relative;
  letter-spacing: 4px;
  /* 白色核心 + 淡红色外发光 */
  text-shadow:
    0 0 5px rgba(255, 255, 255, 1),
    0 0 15px rgba(255, 200, 200, 0.8),
    0 0 30px rgba(255, 50, 50, 0.6);
  animation: glitch-skew 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
  /* 减缓70%：从0.3s变为1s */
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.glitch-text::before {
  color: rgba(255, 0, 234, 0.5);
  /* 调整伪元素透明度 */
  z-index: -1;
  animation: glitch-anim-1 6.67s infinite linear alternate-reverse;
  /* 减缓70%：从2s变为6.67s */
}

.glitch-text::after {
  color: rgba(0, 234, 255, 0.5);
  /* 调整伪元素透明度 */
  z-index: -2;
  animation: glitch-anim-2 6.67s infinite linear alternate-reverse;
  /* 减缓70%：从2s变为6.67s */
}

@keyframes glitch-skew {
  0% {
    transform: skew(0deg);
  }

  20% {
    transform: skew(-10deg);
  }

  40% {
    transform: skew(10deg);
  }

  60% {
    transform: skew(-5deg);
  }

  80% {
    transform: skew(5deg);
  }

  100% {
    transform: skew(0deg);
  }
}

@keyframes glitch-anim-1 {
  0% {
    clip-path: inset(20% 0 80% 0);
    transform: translate(-2px, 2px);
  }

  20% {
    clip-path: inset(60% 0 10% 0);
    transform: translate(2px, -2px);
  }

  40% {
    clip-path: inset(40% 0 50% 0);
    transform: translate(-2px, 2px);
  }

  60% {
    clip-path: inset(80% 0 5% 0);
    transform: translate(2px, -2px);
  }

  80% {
    clip-path: inset(10% 0 70% 0);
    transform: translate(-2px, 2px);
  }

  100% {
    clip-path: inset(30% 0 20% 0);
    transform: translate(2px, -2px);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip-path: inset(10% 0 60% 0);
    transform: translate(2px, -2px);
  }

  20% {
    clip-path: inset(80% 0 5% 0);
    transform: translate(-2px, 2px);
  }

  40% {
    clip-path: inset(30% 0 20% 0);
    transform: translate(2px, -2px);
  }

  60% {
    clip-path: inset(10% 0 80% 0);
    transform: translate(-2px, 2px);
  }

  80% {
    clip-path: inset(50% 0 30% 0);
    transform: translate(2px, -2px);
  }

  100% {
    clip-path: inset(20% 0 70% 0);
    transform: translate(-2px, 2px);
  }
}

.drawing-sub {
  font-family: 'Rajdhani', sans-serif;
  color: #aaa;
  letter-spacing: 2px;
  font-size: 14px;
}

.percent-counter {
  color: #00eaff;
  font-weight: bold;
}

/* 2. 淡入淡出 (Data Stream / Progress) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind(FADE_TIME_CSS_VAL) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 3. 横幅折叠特效 (Banner) - 增加淡入淡出效果 */
.banner-fold-enter-active {
  transform: skewX(0deg) scaleY(1);
  opacity: 1;
  transition: all v-bind(TURN_TIME_CSS_VAL) linear;
}

.banner-fold-leave-active {
  transform: skewX(-20deg) scaleY(0);
  opacity: 0;
  transition: all v-bind(TURN_TIME_CSS_VAL) linear;
  /* animation: banner-out v-bind(TURN_TIME_CSS_VAL) cubic-bezier(0.16, 1, 0.3, 1); */
}

@keyframes banner-in {
  0% {
    transform: skewX(-20deg) scaleY(0);
    opacity: 0;
  }

  100% {
    transform: skewX(0deg) scaleY(1);
    opacity: 1;
  }
}

@keyframes banner-out {
  0% {
    transform: skewX(0deg) scaleY(1);
    opacity: 1;
  }

  100% {
    transform: skewX(-20deg) scaleY(0);
    opacity: 0;
  }
}

.tactical-banner {
  background: rgba(0, 0, 0, 0.9);
  border-top: 4px solid #ffcd00;
  border-bottom: 4px solid #ffcd00;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* 初始收缩 */
  transform-origin: center;
  overflow: hidden;
  z-index: 100;
  width: 80vw;
  height: 10vw;
  top: 40vh;
  left: 10vw;
  position: absolute;
}

.hazard-stripes {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg,
      rgba(255, 205, 0, 0.05),
      rgba(255, 205, 0, 0.05) 10px,
      transparent 10px,
      transparent 20px);
  z-index: 0;
  animation: stripes-move 20s linear infinite;
}

@keyframes stripes-move {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 100px 0;
  }
}

.shine-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: skewX(20deg);
  animation: shine-sweep 2s infinite;
  z-index: 1;
}

@keyframes shine-sweep {
  0% {
    left: -100%;
  }

  100% {
    left: 200%;
  }
}

.banner-content {
  /* 纠正文字 */
  text-align: center;
  z-index: 2;
  color: #fff;
  position: relative;
}

.banner-main-text {
  font-size: 80px;
  font-weight: 900;
  font-family: 'Oswald', 'Microsoft YaHei', sans-serif;
  letter-spacing: 10px;
  line-height: 1;
  text-shadow: 0 0 20px rgba(255, 205, 0, 0.5);
  animation: tracking-contract 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) both 0.2s;
}

@keyframes tracking-contract {
  0% {
    letter-spacing: 50px;
    opacity: 0;
  }

  100% {
    letter-spacing: 10px;
    opacity: 1;
  }
}

.round-num {
  color: #ffcd00;
}

.divider {
  color: #555;
  margin: 0 20px;
}

.banner-main-text .action-text {
  color: #fff;
  font-size: inherit;
  /* 继承父元素的80px字体大小 */
  font-weight: inherit;
  /* 继承父元素的900字重 */
}

.banner-sub-top,
.banner-sub-bottom {
  font-size: 14px;
  letter-spacing: 4px;
  color: #888;
  font-family: 'Rajdhani', sans-serif;
  opacity: 0;
  animation: fade-in-text 0.5s ease forwards 0.6s;
}

.banner-sub-top {
  border-bottom: 1px solid #ffcd00;
  display: inline-block;
  padding: 0 20px 4px 20px;
  margin-bottom: 10px;
  color: #ffcd00;
}

@keyframes fade-in-text {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 装饰括号 */
.bracket {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 80px;
  border: 4px solid #fff;
  transform: translateY(-50%) skewX(20deg);
  opacity: 0;
  animation: bracket-in 0.5s ease forwards 0.8s;
}

.bracket-left {
  left: 10%;
  border-right: none;
}

.bracket-right {
  right: 10%;
  border-left: none;
}

@keyframes bracket-in {
  from {
    opacity: 0;
    transform: translateY(-50%) skewX(20deg) scaleY(2);
  }

  to {
    opacity: 1;
    transform: translateY(-50%) skewX(20deg) scaleY(1);
  }
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
