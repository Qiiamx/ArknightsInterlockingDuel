<script setup>
import { useMatchStore } from '@/stores/match';
import { computed } from 'vue';
import operators from '@/assets/operators.json'
const { userInfo, team1, team2 } = useMatchStore()
const props = defineProps(['oprIdx']) // 干员索引
const data = computed(() => {
    let obj = { ...operators[props.oprIdx] }
    if (userInfo.team1) {
        if (team1.showNames.indexOf(props.oprIdx) < 0) {
            delete obj.干员
        }
        if (team1.showClasses.indexOf(props.oprIdx) < 0) {
            delete obj.职业
        }
        if (team1.showBranches.indexOf(props.oprIdx) < 0) {
            delete obj.分支
        }
        if (team1.showRares.indexOf(props.oprIdx) < 0) {
            delete obj.稀有度
        }
        obj.cp = team1.recordCp[props.oprIdx]
    }

    if (userInfo.team2) {
        if (team2.showNames.indexOf(props.oprIdx) < 0) {
            delete obj.干员
        }
        if (team2.showClasses.indexOf(props.oprIdx) < 0) {
            delete obj.职业
        }
        if (team2.showBranches.indexOf(props.oprIdx) < 0) {
            delete obj.分支
        }
        if (team2.showRares.indexOf(props.oprIdx) < 0) {
            delete obj.稀有度
        }
        obj.cp = team2.recordCp[props.oprIdx]
    }

    if (userInfo.viewer) {
        // 双方选手都不可见时, 观众也不可见
        if (team1.showNames.indexOf(props.oprIdx) < 0 && team2.showNames.indexOf(props.oprIdx) < 0) {
            delete obj.干员
        }
        if (team1.showClasses.indexOf(props.oprIdx) < 0 && team2.showClasses.indexOf(props.oprIdx) < 0) {
            delete obj.职业
        }
        if (team1.showBranches.indexOf(props.oprIdx) < 0 && team2.showBranches.indexOf(props.oprIdx) < 0) {
            delete obj.分支
        }
        if (team1.showRares.indexOf(props.oprIdx) < 0 && team2.showRares.indexOf(props.oprIdx) < 0) {
            delete obj.稀有度
        }
        obj.cp = team1.recordCp[props.oprIdx] || team2.recordCp[props.oprIdx]
    }
    return obj;
})
</script>
<template>
    <div class="bidding-scene">
        <div class="operator-card">
            <div class="mystery-content">
                <img v-if="data.干员" :src="`/icon/头像_${data.干员}.png`" class="portrait" />
                <img v-else :src="`/images/${data.职业}.png`" class="big-class-icon" />
                <div class="info-box">
                    <div class="name">{{ data.干员 || `未知干员` }}</div>
                    <div class="stars" v-if="data.稀有度">[{{ data.稀有度 }}] <template v-for="i in (data.稀有度 - 0)"
                            :key="i">★</template>
                    </div>
                    <div class="sub" v-if="data.分支">{{ data.职业 }}-{{ data.分支 }}</div>
                    <div class="sub" v-else-if="data.职业">{{ data.职业 }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="css" scoped>
.bidding-scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;
}

.operator-card {
    width: 200px;
    height: 280px;
    background: #000c;
    border: 2px solid #444;
    border-radius: 8px;
    position: relative;
    transition: all .3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    animation: cardPop-25a66079 .5s cubic-bezier(.175, .885, .32, 1.275);
}

.mystery-content,
.revealed-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.big-class-icon {
    width: 80px;
    height: 80px;
    object-fit: contain;
}

.portrait {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
}

.info-box {
    text-align: center;
}

.name {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 5px;
}

.stars {
    color: gold;
    font-size: 16px;
    margin-bottom: 5px;
}

.sub {
    font-size: 14px;
    color: #888;
}
</style>