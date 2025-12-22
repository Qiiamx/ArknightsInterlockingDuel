<script setup>
import { useMatchStore } from '@/stores/match';
import OperatorBox from '@/components/operator-box.vue';
import BranchBox from '@/components/branch-box.vue';
import { computed, onMounted, ref } from 'vue';
import MatchBanOperatorBox from './match-ban-operator-box.vue';
const operators = ref([]);
const branches = ref([]);
const oprNameIdx = ref({}); // 干员:索引
const branchNameIdx = ref({}); // 分支:索引
const classWeight = {};
const branchWeight = {};
onMounted(async () => {
	try {
		branches.value = await fetch('/data/branches.json').then((r) => r.json());
	} catch (e) {
		alert('职业信息加载失败');
	}

	let profIdx = 0,
		branchIdx = 0;

	branches.value.forEach(({ 所属职业, 分支 }, index) => {
		// 职业首次出现 → 递增序号
		if (classWeight[所属职业] == null) {
			classWeight[所属职业] = ++profIdx;
		}
		// 分支首次出现 → 递增序号
		if (branchWeight[分支] == null) {
			branchWeight[分支] = ++branchIdx;
		}
		branchNameIdx.value[分支] = index;
	});
	try {
		operators.value = await fetch('/data/operators.json').then((r) => r.json());
		operators.value.forEach(({ 干员 }, index) => {
			oprNameIdx.value[干员] = index;
		});
		operators.value.sort((a, b) => {
			let d1 = (classWeight[a.职业] || 999) - (classWeight[b.职业] || 999);
			if (d1 != 0) {
				return d1;
			}
			let d2 = (branchWeight[a.分支] || 999) - (branchWeight[b.分支] || 999);
			if (d2 != 0) {
				return d2;
			}
			return Number(b.稀有度) - Number(a.稀有度);
		});
	} catch (e) {
		alert('干员信息加载失败');
	}
});
const { match } = useMatchStore();
const banOprs = computed(() => {
	let arr = operators.value.filter(
		(item) =>
			match.banOprs.includes(oprNameIdx.value[item.干员]) ||
			match.banBranches.includes(branchNameIdx.value[item.分支])
		// 干员被ban或分支被ban
	);
	let res = [];
	let tmp = {};
	let last = null;
	for (let opr of arr) {
		if (last == null || last != opr.分支) {
			if (last != null) {
				res.push({ ...tmp });
			}
			last = opr.分支;
			tmp = {
				职业: opr.职业,
				分支: opr.分支,
				oprs: [],
			};
		}
		tmp.oprs.push(opr);
	}
  if(last != null){
	  res.push({ ...tmp });
  }
	return res;
});
const showClass = ref(false);
const toggle = () => {
	showClass.value = !showClass.value;
};
</script>
<template>
	<div :class="`ban-pool-container ${showClass ? 'show' : ''}`">
    
		<div class="ban-content">
			<div v-if="banOprs.length > 0" class="ban-grid">
				<template v-for="branch in banOprs" :key="branch.分支">
					<div class="ban-group">
						<div class="group-label">{{ `${branch.职业}-${branch.分支}` }}</div>
						<div class="group-avatars">
							<template v-for="item in branch.oprs" :key="item.干员">
								<div class="banned-avatar" :title="`${item.干员}`">
									<img :src="`/icon/头像_${item.干员}.png`" class="banned-img" />
									<div class="ban-overlay">
										<!-- <span class="cross">✕</span> -->
									</div>
								</div>
							</template>
						</div>
					</div>
				</template>
			</div>
      <div v-else class="empty-msg">
        <div>NO BANNED DATA</div>
        <div class="sub-empty">暂无干员被熔断</div>
      </div>
		</div>
		<div class="ban-header-bar" @click="toggle">
			<div class="stripe-pattern"></div>
			<div class="header-content">
				<span class="icon">⚠</span>
				<span class="label">禁用协议 / BANNED PROTOCOL</span>
				<span class="count">[{{ banOprs.length }} OPERATORS DETECTED]</span>
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
	width: 90%;
	z-index: 200;
	font-family: 'Rajdhani', 'Noto Sans SC', sans-serif;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
	display: flex;
	flex-direction: column;
	transition: height 0.4s ease;
	border: 2px solid #d50000;
}

.ban-pool-container.show {
	height: 90vh;
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
	overflow-y: auto;
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
	justify-content: start;
}

/* 分支组 - 支持换行布局 */
.ban-group {
	background: rgba(255, 0, 0, 0.05);
	border: 1px solid #444;
	padding: 8px 12px;
	border-radius: 4px;
	display: flex;
	flex-direction: column;
	/* 纵向布局：标签在上，头像在下 */
	align-items: start;
	gap: 6px;
	border-left: 2px solid #d50000;
	min-width: 120px;
	max-width: 500px;
	/* 增加最大宽度，容纳更多头像 */
	width: fit-content;
	/* 根据内容自适应宽度 */
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
	/* 黑白高对比 */
	opacity: 0.6;
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
