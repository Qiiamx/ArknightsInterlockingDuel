
<script setup>
    const props = defineProps(['name'])
</script>
<template>
    <div class="team-identity">
        <div class="team-logo-box">
        <span class="placeholder-logo">{{ props.name }}</span>
        </div>
        <div class="team-info">
        <div class="team-label">小队 / SQUAD</div>
        <div class="team-name">TEAM {{ props.name }}</div>
        </div>
    </div>
</template>
<style lang="css" scoped>
.team-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.team-logo-box {
  width: 32px;
  height: 32px;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #555;
  flex-shrink: 0;
}

.placeholder-logo {
  font-weight: 700;
  font-size: 20px;
  color: #666;
}
.team-info{
  flex: 1;
}
.team-label {
    font-size: 10px;
    color: #666;
    letter-spacing: 2px;
    font-family: Rajdhani, sans-serif;
}
.team-name {
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    font-family: Noto Sans SC, sans-serif;
    line-height: 1;
    text-transform: uppercase;
}
</style>