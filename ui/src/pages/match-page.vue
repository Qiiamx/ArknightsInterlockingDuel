<script setup>
import MatchControl from '@/components/match-control.vue';
import MatchView from '@/components/match-view.vue';
import Team1Control from '@/components/team1-control.vue';
import Team1View from '@/components/team1-view.vue';
import Team2Control from '@/components/team2-control.vue';
import Team2View from '@/components/team2-view.vue';
import { useMatchStore } from '@/stores/match'
const { userInfo } = useMatchStore()

</script>
<template>
    <div class="room">
        <div class="room-info">
            <h2 v-if="userInfo.owner">主持人</h2>
            <h2 v-else-if="userInfo.viewer">观众</h2>
            <h2 v-else-if="userInfo.team1">TEAM1</h2>
            <h2 v-else-if="userInfo.team2">TEAM2</h2>
            <h2 v-else>异常用户</h2>
            <h2 v-if="userInfo.userId">CLIENT_ID: {{ userInfo.userId }}</h2>
        </div>
        <div class="room-view">
            <Team1View class="team1-view"></Team1View>
            <MatchView class="match-view"></MatchView>
            <Team2View class="team2-view"></Team2View>
        </div>
        <div class="room-control">
            <MatchControl class="match-control"></MatchControl>
            <Team1Control class="team1-control"></Team1Control>
            <Team2Control class="team2-control"></Team2Control>
        </div>
    </div>
</template>
<style lang="css" scoped>
.room {
  display: flex;
  flex-direction: column;
  height: 100vh;          
  overflow: hidden;
}

.room-info {
  flex: 0 0 auto;
  text-align: center;
  padding: 8px 0;
}

.room-view {
  display: flex;
}

.team1-view,
.team2-view {
  flex: 0 0 25%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.match-view {
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.room-control {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

</style>