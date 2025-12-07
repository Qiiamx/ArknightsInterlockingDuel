<script setup>

import { useMatchStore } from '@/stores/match'
import OperatorBox from './operator-box.vue';
import BranchBox from './branch-box.vue';
const { match } = useMatchStore()
</script>
<!-- todo  主持人Log  观众也看不到公共干员3 -->
<template>
  <div>
    <div v-if="match.round>0">轮次 {{ match.round }}</div>
    <div v-if="match.step>0">阶段 {{ ['开局','博弈','终止','攻略'][match.step-1] }}</div>
    <div v-if="match.settling">开局剩余 {{ match.timeStep1 }} 秒</div>
    <div v-if="match.duling">决策剩余 {{ match.timeStep21 }} 秒</div>
    <div v-if="match.showing">公布剩余 {{ match.timeStep24 }} 秒</div>
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