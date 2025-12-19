// 保存用户最后进入的房间，避免房主意外完全退出后，再回来就没有链接的问题
// 选手？管他！
import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useRoomStore = defineStore('room', () => {
  const links = ref(JSON.parse(localStorage.getItem("aid-last-room") || null ))
  const update = (linksd)=>{
    links.value = linksd
    localStorage.setItem("aid-last-room", JSON.stringify(linksd))
  }
  return {
    links,
    update
  }
})