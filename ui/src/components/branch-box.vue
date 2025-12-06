<script setup>
import { computed } from 'vue';
import branches from '@/assets/branches.json'
const props = defineProps(['branchIdx'])
const data = computed(()=>{
    return {...branches[props.branchIdx]}
})
</script>

<template>
    <div class="branch">
        {{ props.branchIdx }}
        {{ (data.分支 || '-') + '/' + (data.所属职业||'/') }}
    </div>
</template>
<style scoped>
.branch{
    border: 1px solid #000;
}
</style>