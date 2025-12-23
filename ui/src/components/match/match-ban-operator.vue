<script setup>
import { useMatchStore } from '@/stores/match';
import { computed, ref } from 'vue';
import { operators } from '@/utils/operator';
import { branches } from '@/utils/operator';
import { storeToRefs } from 'pinia';
const { match } = storeToRefs(useMatchStore());
const classes = [...new Set(branches.map((t) => t.所属职业))];
const showClass = ref(false);
const toggle = () => {
	showClass.value = !showClass.value;
};
const calOprs = computed(() => {
	let data = [];
	let banBrancheNames = [];
	for (let idx of match.value.banBranches) {
		banBrancheNames.push(branches[idx].分支);
	}
	for (let i = 0; i < operators.length; i++) {
		let item = operators[i];
		let ban = banBrancheNames.indexOf(item.分支) >= 0 || match.value.banOprs.indexOf(i) >= 0;
		data.push({ ...item, idx: i, ban: ban });
	}
	return data;
});
const clsLast = (clsName) => {
	return (
		operators.filter((t) => t.职业 == clsName).length -
		calOprs.value.filter((b) => b.职业 == clsName && b.ban).length
	);
};
const branchLast = (branchName) => {
	return (
		operators.filter((t) => t.分支 == branchName).length -
		calOprs.value.filter((b) => b.分支 == branchName && b.ban).length
	);
};
const showDetail = ref({});
</script>
<template>
	<div :class="`ban-pool-container ${showClass ? 'show' : ''}`">
		<div class="ban-content">
			<div class="ban-grid">
				<template v-for="className in classes" :key="className">
					<div class="ban-group">
						<a-tooltip placement="bottom" v-model:open="showDetail[className]" trigger="click">
							<div
								class="group-title"
								style="cursor: pointer"
								@click="() => (showDetail[className] = true)"
							>
								<span>{{ className }} ({{ clsLast(className) }})</span>
							</div>
							<template #title>
								<div class="group-avatars">
									<template
										v-for="item in calOprs.filter((t) => t.职业 == className)"
										:key="item.干员"
									>
										<div class="banned-avatar" :title="`${item.干员}`">
											<img
												:src="`/icon/头像_${item.干员}.png`"
												:class="item.ban ? 'banned-img' : 'not-banned-img'"
											/>
											<div :class="item.ban ? 'ban-overlay' : ''"></div>
										</div>
									</template>
								</div>
							</template>
						</a-tooltip>
						<div
							class="group-label"
							v-for="(branch, bid) in branches.filter((t) => t.所属职业 == className)"
							:key="bid"
						>
							<a-tooltip placement="bottom" v-model:open="showDetail[branch.分支]" trigger="click">
								<span style="cursor: pointer" @click="() => (showDetail[branch.分支] = true)">
									{{ branch.分支 }}
									({{ branchLast(branch.分支) }})
								</span>
								<template #title>
									<div class="group-avatars">
										<template
											v-for="item in calOprs.filter((t) => t.分支 == branch.分支)"
											:key="item.干员"
										>
											<div class="banned-avatar" :title="`${item.干员}`">
												<img
													:src="`/icon/头像_${item.干员}.png`"
													:class="item.ban ? 'banned-img' : 'not-banned-img'"
												/>
												<div :class="item.ban ? 'ban-overlay' : ''"></div>
											</div>
										</template>
									</div>
								</template>
							</a-tooltip>
						</div>
						<!-- <div class="group-avatars">
							<template v-for="item in branch.oprs" :key="item.干员">
								<div class="banned-avatar" :title="`${item.干员}`">
									<img :src="`/icon/头像_${item.干员}.png`" class="banned-img" />
									<div class="ban-overlay"></div>
								</div>
							</template>
						</div> -->
					</div>
				</template>
			</div>
		</div>
		<!-- <div class="ban-content">
			<div class="ban-grid">
				<template v-for="branch in banOprs" :key="branch.分支">
					<div class="ban-group">
						<div class="group-label">{{ `${branch.职业}-${branch.分支}` }}</div>
						<div class="group-avatars">
							<template v-for="item in branch.oprs" :key="item.干员">
								<div class="banned-avatar" :title="`${item.干员}`">
									<img :src="`/icon/头像_${item.干员}.png`" class="banned-img" />
									<div class="ban-overlay"></div>
								</div>
							</template>
						</div>
					</div>
				</template>
			</div>
		</div> -->
		<div class="ban-header-bar" @click="toggle">
			<div class="stripe-pattern"></div>
			<div class="header-content">
				<span class="icon">⚠</span>
				<span class="label">禁用协议 / BANNED PROTOCOL</span>
				<span class="count">[{{ calOprs.filter((t) => t.ban).length }} OPERATORS DETECTED]</span>
			</div>
		</div>
	</div>
</template>
<style scoped lang="css">
.ban-pool-container {
	position: absolute;
	left: 50%;
	bottom: 10px;
	height: 5vh;
	transform: translateX(-50%);
	transform-origin: bottom center;
	width: 80%;
	z-index: 200;
	font-family: 'Rajdhani', 'Noto Sans SC', sans-serif;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
	display: flex;
	flex-direction: column;
	transition: height 0.4s ease;
	border: 2px solid #d50000;
}

.ban-pool-container.show {
	height: 50vh;
}

/* =========================================
   1. 标题栏 (Header Bar) - 常驻显示
   ========================================= */
.ban-header-bar {
	height: 5vh;
	background: rgba(17, 17, 17, 0.95);
	/* border: 2px solid #d50000; */
	/* border-bottom: none; */
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
	user-select: none;
	cursor: pointer;
}

/* 核心：动态斜杠条纹 */
.stripe-pattern {
	position: absolute;
	top: 0;
	left: 0;
	width: 200%;
	/* 宽一点以便动画滚动 */
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 8px,
		rgba(255, 255, 255, 0.1) 8px,
		rgba(255, 255, 255, 0.1) 16px
	);
	pointer-events: none;
	animation: stripe-scroll 57.14s linear infinite;
	/* 减速至35%：20s / 0.35 = 57.14s */
	opacity: 0.6;
	/* 默认状态下稍微降低透明度 */
}

@keyframes stripe-scroll {
	from {
		transform: translateX(0);
	}

	to {
		transform: translateX(-50%);
	}
}

.header-content {
	color: #d50000;
	font-weight: 900;
	font-size: 14px;
	letter-spacing: 2px;
	display: flex;
	gap: 10px;
	align-items: center;
	z-index: 2;
	text-shadow: 0 0 5px rgba(213, 0, 0, 0.5);
	opacity: 1;
	/* 常驻显示 */
}

.icon {
	font-size: 16px;
}

/* =========================================
   2. 内容区 (Content) - 常驻显示
   ========================================= */
.ban-content {
	flex: 1;
	background: rgba(10, 10, 10, 0.95);
	backdrop-filter: blur(10px);
	overflow-x: hidden;
  overflow: hidden;
	/* 支持纵向滚动 */
	border-top: none;
}

/* 纵向滚动条美化 */
.ban-content::-webkit-scrollbar {
	width: 6px;
}

.ban-content::-webkit-scrollbar-thumb {
	background: #d50000;
	border-radius: 3px;
}

.ban-content::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.5);
}

.ban-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	align-items: start;
	justify-content: center;
	padding: 0 15px;
}

/* 分支组 - 支持换行布局 */
.ban-group {
	flex: 1;
	background: rgba(255, 0, 0, 0.05);
	border: 1px solid #444;
	padding: 8px 12px;
	border-radius: 4px;
	display: flex;
	flex-direction: column;
	/* 纵向布局：标签在上，头像在下 */
	align-items: start;
	gap: 6px;
	min-width: 120px;
	max-width: 500px;
	/* 增加最大宽度，容纳更多头像 */
	width: fit-content;
	/* 根据内容自适应宽度 */
}

.group-title {
	font-size: 11px;
	color: #aaa;
	font-weight: 800;
	letter-spacing: 1px;
	text-align: center;
	width: 100%;
	margin-bottom: 4px;
	border-bottom: 1px solid;
}
.group-title:hover {
  color: #ffd700;
}

.group-label {
	font-size: 11px;
	color: #aaa;
	font-weight: bold;
	letter-spacing: 1px;
	text-align: center;
	width: 100%;
	margin-bottom: 4px;
}
.group-label:hover {
  color: #ffd700;
}

.group-avatars {
	display: flex;
	flex-wrap: wrap;
	/* 允许头像换行 */
	gap: 4px;
	align-items: start;
	justify-content: start;
}

/* 被禁用的头像 - 缩小尺寸 */
.banned-avatar {
	width: 40px;
	height: 40px;
	position: relative;
	background: #000;
	border: 1px solid #555;
	transition: all 0.2s;
	flex-shrink: 0;
}

.banned-avatar:hover {
	border-color: #d50000;
	transform: scale(1.1);
	z-index: 10;
}

.banned-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	filter: grayscale(100%) contrast(1.2);
	opacity: 0.6;
}
.not-banned-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.ban-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(50, 0, 0, 0.4);
}

.cross {
	color: #d50000;
	font-size: 24px;
	font-weight: bold;
	text-shadow: 0 0 5px #000;
}

/* 空状态 */
.empty-msg {
	/* position: absolute; */
	/* top: 50%; */
	/* left: 50%; */
	/* transform: translate(-50%, -50%); */
	text-align: center;
	color: #444;
	font-family: 'Rajdhani';
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.empty-msg div:first-child {
	font-size: 24px;
	font-weight: bold;
	letter-spacing: 4px;
}

.sub-empty {
	font-size: 12px;
	margin-top: 5px;
	opacity: 0.5;
}
</style>
