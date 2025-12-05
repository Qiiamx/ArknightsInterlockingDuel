<template>
    <!-- Room Id: <input v-model="roomId" />
    Owner Id: <input v-model="ownerId" />
    Team1 Id: <input v-model="team1Id" />
    Team2 Id: <input v-model="team2Id" />
    Viewer Id: <input v-model="viewerId" /> -->
    <button @click="create">创建</button>

    <div v-if="links">
        <p>主持（Owner）: <a :href="links.owner" target="_blank">{{ links.owner }}</a></p>
        <p>队伍A（Team1）: <a :href="links.team1" target="_blank">{{ links.team1 }}</a></p>
        <p>队伍B（Team2）: <a :href="links.team2" target="_blank">{{ links.team2 }}</a></p>
        <p>观众（Viewer）: <a :href="links.viewer" target="_blank">{{ links.viewer }}</a></p>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const roomId = ref()
const ownerId = ref()
const team1Id = ref()
const team2Id = ref()
const viewerId = ref()
const links = ref(null)
const random = () => {
    let gen = () => {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    roomId.value = gen()
    ownerId.value = gen()
    team1Id.value = gen()
    team2Id.value = gen()
    viewerId.value = gen()
}

const create = () => {
    random()
    const base = `${location.protocol}//${location.host}/jumping`
    links.value = {
        owner: `${base}?shareId=${ownerId.value}`,
        team1: `${base}?shareId=${team1Id.value}`,
        team2: `${base}?shareId=${team2Id.value}`,
        viewer: `${base}?shareId=${viewerId.value}`
    }

    fetch(`/api/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            roomId: roomId.value,
            ownerId: ownerId.value,
            team1Id: team1Id.value,
            team2Id: team2Id.value,
            viewerId: viewerId.value
        })
    })
}

</script>