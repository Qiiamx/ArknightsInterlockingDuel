<script setup>
    const props = defineProps(['cp', 'ip'])
</script>
<template>
    <div class="team-resource">
      <div class="res-row cp-row">
        <div class="res-icon-box">
          <img src="/images/调用点.png" class="res-img" alt="CP">
        </div>
        <div class="res-data">
          <div class="res-label">调用点</div>
          <div class="res-value cp-value">{{ props.cp }}</div>
          <div class="res-progress-bar">
            <div class="res-progress-fill cp-progress" style="width: 50%;"></div>
          </div>
        </div>
        <div class="floating-container"></div>
      </div>
      <div class="res-row ip-row">
        <div class="res-icon-box">
          <img src="/images/情报点.png" class="res-img" alt="IP">
        </div>
        <div class="res-data">
          <div class="res-label">情报点</div>
          <div class="res-value ip-value">{{ props.ip }}</div>
          <div class="res-progress-bar">
            <div class="res-progress-fill ip-progress" style="width: 10%;">

            </div>
          </div>
        </div>
        <div class="floating-container"></div>
      </div>
    </div>
</template>
<style lang="css" scoped>
    
/* 资源仪表盘（增强版） */
.team-resource {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.res-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  position: relative;
  transition: background 0.2s;
}

.res-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.res-icon-box {
  flex-shrink: 0;
}

.res-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  opacity: 0.8;
}

.res-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.res-label {
  font-size: 10px;
  color: #888;
  font-family: 'Rajdhani', sans-serif;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.res-value {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Rajdhani', sans-serif;
  line-height: 1;
}

.cp-value {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.ip-value {
  color: #00E5FF;
  text-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
}

/* 进度条 */
.res-progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 2px;
  position: relative;
}

.res-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1); /* 更平滑的动画，确保减少时也能动态运动 */
  position: relative;
}

.cp-progress {
  background: linear-gradient(90deg, #FFD700, #FFA500);
  box-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
}

.ip-progress {
  background: linear-gradient(90deg, #00E5FF, #0099CC);
  box-shadow: 0 0 4px rgba(0, 229, 255, 0.5);
}

</style>