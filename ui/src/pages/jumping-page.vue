<template>
    <RouterView></RouterView>
</template>
<script setup>
    
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchStore } from '@/stores/match'
const route = useRoute()
const router = useRouter()
const { userInfo, serverOpr } = useMatchStore()
const shareId = route.query.shareId
const ws = ref()        // WebSocket 实例
const heartbeat = ref()
const retryTimes = ref(5);
onMounted(() => {
    userInfo.userId = randomId()
    if (!shareId) {
        return
    }
    createWebSocket()
    // 30秒心跳
    if(!heartbeat.value){
      heartbeat.value = setInterval(()=>{
        ws.value?.send(JSON.stringify({"heartbeat": new Date().getTime()}))
      }, 10000)
    }
})

onUnmounted(() => {
    ws.value?.close()
})
const createWebSocket = ()=>{
    if(retryTimes.value <= 0){
      alert('与服务器断开连接, 尝试重连失败...')
    }
    // 1. 连接
    ws.value = new WebSocket(`/ws?userId=${userInfo.userId}&shareId=${shareId}`)

    // 2. 监听事件
    ws.value.onopen = () => console.debug('ws opened')
    ws.value.onmessage = (e) => {
        retryTimes.value = 5; //成功收到消息时,重置尝试次数
        let data = JSON.parse(e.data)
        if(data.type){
            switch(data.type){
                case 'owner': userInfo.owner=true; break; 
                case 'team1': userInfo.team1=true; break; 
                case 'team2': userInfo.team2=true; break; 
                case 'viewer': userInfo.viewer=true; break; 
            }
        }
        if(data.data){
          serverOpr.render(JSON.parse(data.data))
        }
        router.push('/match');
    }
    ws.value.onerror = (ws, event) =>{
      console.log('ws error', ws, event)
    }
    ws.value.onclose = () => {
      console.debug('ws closed')
      setTimeout(()=>{
        retryTimes.value = retryTimes.value - 1
        createWebSocket()
      }, 1000)
    }
}
const randomId = ()=>{
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
</script>