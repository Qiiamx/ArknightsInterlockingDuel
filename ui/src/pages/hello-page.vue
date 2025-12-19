
<script setup>
import router from '@/router';
import { useRoomStore } from '@/stores/room';
import { storeToRefs } from 'pinia';
const { links } = storeToRefs(useRoomStore())
const { update } = useRoomStore()
const random = () => {
    let gen = () => {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    return [gen(), gen(), gen(), gen(), gen()]
    
}

const create = () => {
    let [r,o,t1,t2,v]= random()
    const base = `${location.protocol}//${location.host}/match`
    let tmpLinks = {
        owner: `${base}?shareId=${o}`,
        team1: `${base}?shareId=${t1}`,
        team2: `${base}?shareId=${t2}`,
        viewer: `${base}?shareId=${v}`
    }

    fetch(`/api/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            roomId: r,
            ownerId: o,
            team1Id: t1,
            team2Id: t2,
            viewerId: v
        })
    }).then(response => {
			if (!response || !response.ok) {
        alert('创建失败')
			} else {
				return response.json()
			}
		}).then(data => {
      console.debug(data)
      update(tmpLinks)
      router.push(`/match?shareId=${o}`)
		})
}
const join = ()=>{
  // 主持人如闪电般归来
  router.push(`/match?shareId=${links.value.owner.split("shareId=")[1]}`)
}
</script>
<template>
    <div class="entry-content">
      <div class="entry entry-top">
        <span class="entry-text entry-text-logo">联锁博弈</span>
      </div>
      <div class="entry-body">
        <div class="entry-body-btn-group">
          <button class="entry-body-btn" @click="create">{{links&&links!={}?'创建新比赛':'创建比赛'}}</button>
          <button class="entry-body-btn" v-if="links&&links!={}" @click="join">回到比赛</button>
        </div>
      </div>
      <div class="entry entry-bottom">
          <span class="entry-text entry-text-info">COPYRIGHT © RHODES ISLAND</span>
          <span class="entry-text entry-text-info">SYSTEM STATUS: WAITING</span>
      </div>
    </div>
</template>
<style lang="css" scoped>
.entry-content{
  --top-height: 4em;
  --bottom-height: 3em;
  --padding: 2em;
  --background: #000000;
  --text-color: #ffffff;
  --text-size-logo: 1.5em;
  --text-size-logo-spacing: 0.2em;
  --text-size-info: 0.5em;
  --text-size-info-spacing: 0.1em;
  --text-size-btn: 1.2em;
  --text-size-btn-spacing: 0.2em;
  width: 100vw;
  height: 100vh;
  background: var(--background);
}
.entry {
  padding: 0 var(--padding);
  box-sizing: border-box;
}

.entry-top {
  height: var(--top-height);
  border-bottom: 0.1vh solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: start;
}
.entry-body {
  background: radial-gradient(circle at center, #2a2a2a, var(--background));
  height: calc(100vh - var(--top-height) - var(--bottom-height));
  display: flex;
  align-items: center;
  justify-content: center;
}
.entry-bottom {
  height: var(--bottom-height);
  border-top: 0.1vh solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
}

.entry-text {
  color: var(--text-color);
}
.entry-text-logo {
  font-size: var(--text-size-logo);
  font-weight: 700;
  letter-spacing: var(--text-size-logo-spacing);
}
.entry-text-info {
  font-size: var(--text-size-info);
  opacity: 0.6;
  font-family: Arial, Consolas, monospace;
  letter-spacing: var(--text-size-info-spacing);
}

.entry-body-btn-group{
  display: flex;
  flex-direction: column;
}

.entry-body-btn{
  padding: 16px 48px;
  border: 1px solid rgba(255, 255, 255, .2);
  background: #00000080;
  color: #fff;
  font-size: var(--text-size-btn);
  font-weight: 300;
  letter-spacing: var(--text-size-btn-spacing);
  cursor: pointer;
  transition: all .5s ease;
  overflow: hidden;
}
.entry-body-btn:hover{
  border-color: #fff9;
  box-shadow: 0 0 20px #fff3;
}

</style>