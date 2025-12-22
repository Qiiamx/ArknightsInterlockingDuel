<script setup>

// 博弈阶段干员抽取进度条  step20
import { watch, ref } from 'vue';
import { useMatchStore } from '@/stores/match';
const { match } = useMatchStore();
const show = ref(false);
watch(
	() => match.step,
	(step) => {
		if (step == 24) {
      show.value = true
		}else{
      show.value = false
    }
	}
)
</script>
<template>
	<Transition name="fade">
		<div v-if="show" class="ani">
      结算结算结算
		</div>
	</Transition>
</template>
<style lang="css" scoped>
.ani{
  position: absolute;
  width: 100%;
  height: 100%;
  font-size: 10em;
}
</style>
