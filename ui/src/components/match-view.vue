<script setup>

import { useMatchStore } from '@/stores/match'
import OperatorBox from './operator-box.vue';
import BranchBox from './branch-box.vue';
import MatchPhase from './match/match-phase.vue';
const { match } = useMatchStore()
</script>
<template>
  <div>
    <MatchPhase></MatchPhase>
    <div v-if="match.settling">开局剩余 {{ (match.timeStep1 / 1000.0).toFixed(1) }} 秒</div>
    <div v-if="match.duling">决策剩余 {{ (match.timeStep21 / 1000.0).toFixed(1) }} 秒</div>
    <div v-if="match.showing">公布剩余 {{ (match.timeStep24 / 1000.0).toFixed(1) }} 秒</div>
    <div>禁用干员</div>
    <div>
      <span v-for="idx in match.banOprs" :key="idx">
        <OperatorBox :opr-idx="idx"></OperatorBox>
      </span>
    </div>
    <div>禁用分支</div>
    <div>
      <span v-for="idx in match.banBranches" :key="idx">
        <BranchBox :branch-idx="idx"></BranchBox>
      </span>
    </div>
    <div>公共干员</div>
    <div>
      <span v-for="idx in match.publicOprs" :key="idx">
        <OperatorBox :opr-idx="idx"></OperatorBox>
      </span>
    </div>
    <div>博弈干员</div>
    <div>
      <span v-if="match.selectOpr">
        <OperatorBox :opr-idx="match.selectOpr"></OperatorBox>
      </span>
    </div>
  </div>
</template>
<style lang="css" scoped>
.match-content{
  
}
</style>