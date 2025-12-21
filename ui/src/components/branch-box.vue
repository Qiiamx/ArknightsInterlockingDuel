<script setup>
import { computed, onMounted, ref } from 'vue';
// import branches from '@/assets/branches.json'
const branches = ref([]);
onMounted(async () => {
	try {
		branches.value = await fetch('/data/branches.json').then((r) => r.json());
	} catch (e) {
		alert('职业信息加载失败');
	}
});
const props = defineProps(['branchIdx']);
const data = computed(() => {
	return { ...branches.value[props.branchIdx] };
});
</script>

<template>
	<div class="branch">
		{{ props.branchIdx }}
		{{ (data.分支 || '-') + '/' + (data.所属职业 || '/') }}
	</div>
</template>
<style scoped>
.branch {
	border: 1px solid #000;
}
</style>
