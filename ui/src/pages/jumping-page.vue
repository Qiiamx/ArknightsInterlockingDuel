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
const createWebSocket = (time)=>{
    if(time <= 0){
      alert('与服务器断开连接, 尝试重连失败...')
    }
    // 1. 连接
    ws.value = new WebSocket(`/ws?userId=${userInfo.userId}&shareId=${shareId}`)

    // 2. 监听事件
    ws.value.onopen = () => console.debug('ws opened')
    ws.value.onmessage = (e) => {
        // 连接成功时,会分发到指定的页面, 主持去owner, 选手去 player, 观众去 viewer
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
        createWebSocket(time - 1)
      }, 1000)
    }
}
const randomId = ()=>{
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
</script>