<script setup>
import { useMatchStore } from '@/stores/match';
import MatchPublicOperator from './match-public-operator-box.vue';
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
const {SETTLEMENT_TIME} = useMatchStore();
const { match } = storeToRefs(useMatchStore());
console.log(SETTLEMENT_TIME)
const totalTime = (SETTLEMENT_TIME/1000) + 's'
const className = ref('public-pool-container')
watch(()=>match.value.step, (step)=>{
  if(step == 1){
    className.value = 'public-pool-container playing'
  }else{
    className.value = 'public-pool-container'
  }
})
</script>
<template>
	<div v-if="match.step!=0" :class="className">
		<div class="pool-label">公共干员 / PUBLIC POOL</div>
		<div class="pool-cards">
			<div v-for="idx in match.publicOprs" :key="idx" class="mini-card">
				<MatchPublicOperator :opr-idx="idx"></MatchPublicOperator>
			</div>
		</div>
	</div>
</template>
<style scoped lang="css">
.public-pool-container {
  position: absolute;
  top: 5%;
  left: 50%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;

  /* 默认就是缩小状态（动画结束态） */
  transform: translate(-50%, 0) scale(1);
  transform-origin: bottom center;
}

/* 仅当 .playing 存在时才触发动画 */
.public-pool-container.playing {
  animation: drawing v-bind(totalTime) ease-in forwards;
}

@keyframes drawing {
  0% {
    /* 动画一开始先放大展示 */
    transform: translate(-50%, calc(50vh - 50%)) scale(2);
  }
  80% {
    /* 动画一开始先放大展示 */
    transform: translate(-50%, calc(50vh - 50%)) scale(2);
  }
  100% {
    /* 最终缩小回正常 */
    transform: translate(-50%, 0) scale(1);
  }
}
/* .public-pool-container {
	position: absolute;
	top: 5%;
	left: 50%;
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	pointer-events: none;
  animation: drawing 0.5s v-bind(delayTime) ease-in forwards;
  transform: translate(-50%, calc(50vh - 50%)) scale(2);
  transform-origin: bottom center;
}

@keyframes drawing {
	0% {
		transform: translate(-50%, calc(50vh - 50%)) scale(2);
	}
	100% {
		transform: translate(-50%, 0) scale(1);
	}
} */
.pool-label {
	font-family:
		Rajdhani,
		Noto Sans SC,
		sans-serif;
	font-size: 1em;
	font-weight: 700;
	letter-spacing: 2px;
	color: #fff9;
	text-transform: uppercase;
	text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}
.pool-cards {
	display: flex;
	gap: 12px;
	pointer-events: auto;
}
.mini-card {
	width: 8vw;
	position: relative;
	transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
	opacity: 0.85;
}
</style>
