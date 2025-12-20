<script setup>

import { useMatchStore } from '@/stores/match'
import OperatorBox from './operator-box.vue';
import BranchBox from './branch-box.vue';
import MatchPhase from './match/match-phase.vue';
import MatchPublicOperator from './match/match-public-operator.vue';
import MatchBetOperator from './match/match-bet-operator.vue';
import MatchCountdown from './match/match-countdown.vue';
const { match} = useMatchStore()
</script>
<template>
  <div>
    <MatchPhase></MatchPhase>
    <MatchCountdown></MatchCountdown>
    <!-- <div v-if="match.settling">开局剩余 {{ (match.countDownLast / 1000.0).toFixed(1) }} 秒</div>
    <div v-if="match.duling">决策剩余 {{ (match.countDownLast / 1000.0).toFixed(1) }} 秒</div>
    <div v-if="match.showing">公布剩余 {{ (match.countDownLast / 1000.0).toFixed(1) }} 秒</div> -->
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
    <MatchPublicOperator></MatchPublicOperator>
    <div>博弈干员</div>
    <div>
      <span v-if="match.selectOpr">
        <MatchBetOperator :opr-idx="match.selectOpr"></MatchBetOperator>
        <!-- <OperatorBox :opr-idx="match.selectOpr"></OperatorBox> -->
      </span>
    </div>
  </div>
</template>