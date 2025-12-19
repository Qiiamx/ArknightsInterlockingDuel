<script setup>
import MatchControl from '@/components/match-control.vue';
import MatchView from '@/components/match-view.vue';
import Team1Control from '@/components/team1-control.vue';
import Team1View from '@/components/team1-view.vue';
import Team2Control from '@/components/team2-control.vue';
import Team2View from '@/components/team2-view.vue';
import { useMatchStore } from '@/stores/match'
import { onMounted } from 'vue';
import { useWebSocket } from '@/composables/websocket';
import { onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
const { userInfo, serverOpr } = useMatchStore()
const { initialize, cleanup, isConnected } = useWebSocket()
onMounted(() => {
  init()
})
onUnmounted(() => {
  cleanup()
})
const init = () => {
  userInfo.userId = randomId()
  let route = useRoute()
  initialize(userInfo.userId, route.query.shareId, (data) => {
    if (data.type) {
      switch (data.type) {
        case 'owner': userInfo.owner = true; break;
        case 'team1': userInfo.team1 = true; break;
        case 'team2': userInfo.team2 = true; break;
        case 'viewer': userInfo.viewer = true; break;
      }
    }
    if (data.data) {
      serverOpr.render(JSON.parse(data.data))
    }
  })
}

const randomId = ()=>{
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
</script>
<template>
  <!-- <div v-if="!isConnected">
    连接中
  </div> -->
  <div class="match-content">
    <!-- <div class="room-info">
      <h2 v-if="userInfo.owner">主持人</h2>
      <h2 v-else-if="userInfo.viewer">观众</h2>
      <h2 v-else-if="userInfo.team1">TEAM1</h2>
      <h2 v-else-if="userInfo.team2">TEAM2</h2>
      <h2 v-else>异常用户</h2>
      <h2 v-if="userInfo.userId">CLIENT_ID: {{ userInfo.userId }}</h2>
    </div> -->
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
.match-content{
  width: 100vw;
  height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
}
</style>