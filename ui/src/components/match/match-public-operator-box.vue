<script setup>
import { useMatchStore } from '@/stores/match';
import { computed } from 'vue';
import operators from '@/assets/operators.json'
const { userInfo, team1, team2 } = useMatchStore()
const props = defineProps(['oprIdx', 'showCp']) // 干员索引, 是否显示调用点
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
        obj.cp = team1.recordCp[props.oprIdx]
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
        obj.cp = team2.recordCp[props.oprIdx]
    }

    if(userInfo.viewer){
        // 双方选手都不可见时, 观众也不可见
        if(team1.showNames.indexOf(props.oprIdx) < 0 && team2.showNames.indexOf(props.oprIdx) < 0 ){
            delete obj.干员
        }
        if(team1.showClasses.indexOf(props.oprIdx) < 0 && team2.showClasses.indexOf(props.oprIdx) < 0){
            delete obj.职业
        }
        if(team1.showBranches.indexOf(props.oprIdx) < 0 && team2.showBranches.indexOf(props.oprIdx) < 0){
            delete obj.分支
        }
        if(team1.showRares.indexOf(props.oprIdx) < 0 && team2.showRares.indexOf(props.oprIdx) < 0){
            delete obj.稀有度
        }
        obj.cp = team1.recordCp[props.oprIdx] || team2.recordCp[props.oprIdx]
    }
    return obj;
})
</script>

<template>
    <div class="card-inner"><img :src=" data.干员?  '/icon/头像_'+data.干员+'.png' : '/images/'+data.职业+'.png'"
            class="card-avatar" :alt="data.干员">
        <div class="card-info">
            <div class="card-name">{{data.干员 || '???'}}</div>
            <div class="card-stars">{{data.稀有度?data.稀有度+'星' : '?星'}}</div>
            <div class="card-profession">{{data.职业}}</div>
        </div>
    </div>
</template>
<style scoped>
.card-inner {
    width: 100%;
    height: 100%;
    background: #000000b3;
    border: 1px solid rgba(0, 255, 255, .3);
    border-radius: 4px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 8px #00000080;
    transition: all .3s;
}
.card-avatar {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, .1);
}
.card-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 100%;
}
.card-name {
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    line-height: 1.2;
}
.card-stars {
    font-size: 8px;
    color: gold;
    line-height: 1;
}
.card-profession {
    font-size: 8px;
    color: #fff9;
    line-height: 1;
}
</style>