import { ref } from 'vue'
export function useWebSocket() {
  const ws = ref(null)
  const isConnected = ref(false)
  const retryTimes = ref(5)
  const heartbeatInterval = ref(null)
  
  const initialize = (userId, shareId, onMessageCallback) => {    
    connectWebSocket(userId, shareId, onMessageCallback)
  }
  
  const connectWebSocket = (userId, shareId, onMessageCallback) => {
    if (retryTimes.value <= 0) {
      console.error('重连次数用尽')
      return
    }
    
    ws.value = new WebSocket(`/ws?userId=${userId}&shareId=${shareId}`)
    
    ws.value.onopen = () => {
      isConnected.value = true
      retryTimes.value = 5
      startHeartbeat()
    }
    
    ws.value.onmessage = (e) => {
      retryTimes.value = 5; //成功收到消息时,重置尝试次数
      const data = JSON.parse(e.data)
      onMessageCallback?.(data)
    }
    
    ws.value.onclose = () => {
      isConnected.value = false
      stopHeartbeat()
      
      if (retryTimes.value > 0) {
        retryTimes.value--
        setTimeout(() => connectWebSocket(userId, shareId, onMessageCallback), 1000)
      }
    }
  }
  
  const startHeartbeat = () => {
    heartbeatInterval.value = setInterval(() => {
      if (ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ heartbeat: Date.now() }))
      }
    }, 10000)
  }
  
  const stopHeartbeat = () => {
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
      heartbeatInterval.value = null
    }
  }
  
  const cleanup = () => {
    stopHeartbeat()
    if (ws.value) {
      ws.value.close()
    }
    localStorage.removeItem('match_userId')
  }
  
  return {
    ws,
    isConnected,
    initialize,
    cleanup
  }
}