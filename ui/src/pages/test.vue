<template>
  <!-- 翻转动画 -->
  <Transition name="flip">
    <div
      v-if="showFront"
      key="front"
      class="card front"
      @click="showFront = false"
    >
      正面
    </div>

    <div
      v-else
      key="back"
      class="card back"
      @click="showFront = true"
    >
      背面
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
const showFront = ref(true)
</script>

<style scoped>
/* 卡片公共样式 */
.card {
  width: 200px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  backface-visibility: hidden;   /* 隐藏背面 */
  position: absolute;            /* 让两张卡片重叠 */
  top: 0;
  left: 0;
}
.front { background: #409eff; }
.back  { background: #67c23a; }

/* 3D 舞台 */
body {
  perspective: 1000px;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
}

/* Vue 过渡钩子 */
.flip-enter-active,
.flip-leave-active {
  transition: transform 0.6s;
}
.flip-enter-from {
  transform: rotateY(-180deg);
}
.flip-leave-to {
  transform: rotateY(180deg);
}
</style>