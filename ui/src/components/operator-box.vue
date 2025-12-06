<script setup>
import { useMatchStore } from '@/stores/match';
import { computed } from 'vue';
import operators from '@/assets/operators.json'
const { userInfo, team1, team2 } = useMatchStore()
const props = defineProps(['oprIdx'])
const data = computed(()=>{
    let obj = {...operators[props.oprIdx]}
    if(userInfo.team1){
        if(team1.showNames.indexOf(props.oprIdx) < 0){
            delete obj.干员
        }
        if(team1.showClasses.indexOf(props.oprIdx) < 0){
            delete obj.职业
        }
        if(team1.showBranches.indexOf(props.oprIdx) < 0){
            delete obj.分支
        }
        if(team1.showRares.indexOf(props.oprIdx) < 0){
            delete obj.稀有度
        }
    }
    
    if(userInfo.team2){
        if(team2.showNames.indexOf(props.oprIdx) < 0){
            delete obj.干员
        }
        if(team2.showClasses.indexOf(props.oprIdx) < 0){
            delete obj.职业
        }
        if(team2.showBranches.indexOf(props.oprIdx) < 0){
            delete obj.分支
        }
        if(team2.showRares.indexOf(props.oprIdx) < 0){
            delete obj.稀有度
        }
    }
    return obj;
})
</script>

<template>
    <div class="operator">
        <div>
            <span>干员: {{ data.干员 || '-' }}</span>
            &nbsp;
            <span>稀有度: {{ data.稀有度?data.稀有度+'星' : '-' }}</span>
        </div>
        <div>
            <span>职业: {{ data.职业 || '-' }}</span>
            &nbsp;
            <span>分支: {{ data.分支 || '-'}}</span>
        </div>
    </div>
</template>
<style scoped>
.operator{
    border: 1px solid #000;
}
</style>