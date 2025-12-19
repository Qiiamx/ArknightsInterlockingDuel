import { ref } from 'vue'
import { useRoute } from 'vue-router'

export function useWebSocket() {
  const ws = ref(null)
  const isConnected = ref(false)
  const retryTimes = ref(5)
  const heartbeatInterval = ref(null)
  
  const initialize = (onMessageCallback) => {
    const route = useRoute()
    const shareId = route.query.shareId
    
    if (!shareId) return
    
    const userId = localStorage.getItem('match_userId') || generateRandomId()
    localStorage.setItem('match_userId', userId)
    
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

function generateRandomId() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}