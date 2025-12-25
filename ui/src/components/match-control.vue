<script setup>
import { useMatchStore } from '@/stores/match';
import { storeToRefs } from 'pinia';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoomStore } from '@/stores/room';
import CountdownWorker from '@/utils/countdown.js?worker';
const store = useMatchStore();
const { links } = storeToRefs(useRoomStore());
const { submit, matchOpr } = store;
const { userInfo, match, team1, team2 } = storeToRefs(store);
const shareVisible = ref(false);
const snapshotVisible = ref(false);
const snapshotData = ref('');
const worker = new CountdownWorker();
watch(
	() => match.value.countDownTarget,
	(val) => {
		if (userInfo.value.owner && match.value.countDownRunning) {
			startTimer();
		}
	}
);
worker.onmessage = (e) => {
	if (e.data.cmd === 'fire') {
		stopTimer();
	}
};
onBeforeUnmount(() => {
	worker.postMessage({ cmd: 'clear' });
	worker.terminate();
});

// 启动定时器
const startTimer = () => {
	if (match.value.countDownTarget > Date.now()) {
		worker.postMessage({ cmd: 'start', remain: match.value.countDownTarget - Date.now() });
	} else {
		stopTimer();
	}
};
//暂停
const pauseTimer = () => {
	worker.postMessage({ cmd: 'clear' });
	matchOpr.pause();
};
//恢复
const resumeTimer = () => {
	matchOpr.resume();
	// startTimer();
};
//结束
const stopTimer = () => {
	if (match.value.countDownType == 'settling') {
		//开局阶段结束, 抽取动画开始
		matchOpr.step20();
		// startTimer();
	} else if (match.value.countDownType == 'dulingAnimation') {
		// 抽取动画结束, 博弈倒计时开始
		matchOpr.step21();
		// startTimer();
	} else if (match.value.countDownType == 'duling') {
		//博弈阶段结束, 获胜动画开始
		matchOpr.step23();
		// startTimer();
	} else if (match.value.countDownType == 'showingAnimation') {
		//获胜动画结束, 公示倒计时开始
		matchOpr.step24();
		// startTimer();
	} else if (match.value.countDownType == 'showing') {
		// 公示阶段结束
		if (match.value.continueMind && (team1.value.betFlag || team2.value.betFlag)) {
			// 下一轮还有干员可以选择, 且 有一方还在进行, 继续 博弈循环
			matchOpr.step20();
			// startTimer();
		} else {
			// 进行步骤3, 展示隐藏公共干员, 转进到step4 开始作战
			matchOpr.step3();
			// intervalId.value = null;
		}
	}
};

//开始比赛
const startRound = () => {
	if (!matchOpr.canNextRound()) {
		alert('池子不够了');
		return;
	}
	matchOpr.step1();
	// startTimer();
};
//开始攻略
const endRound = () => {
	matchOpr.step4();
};

// 复现对局
const setData = async () => {
	submit(() => {
		snapshotVisible.value = false;
	}, JSON.parse(snapshotData.value));
};
const getData = async () => {
	let str = JSON.stringify({
		match: match.value,
		team1: team1.value,
		team2: team2.value,
	});
	snapshotVisible.value = true;
	snapshotData.value = str;
};
</script>

<template>
	<div v-if="userInfo.owner">
		<div v-if="shareVisible" class="share-mask">
			<div class="share-content">
				<div class="share-header">
					<div>邀请链接 / INVITE</div>
					<button @click="shareVisible = false">✕</button>
				</div>
				<div>
					<div>
						<div class="share-link-label" style="color: rgb(255, 205, 0)">主持人 / OWNER</div>
						<div class="share-link-item">
							<div>{{ links.owner }}</div>
							<!-- <button @click="() => copy(links.owner)">复制</button> -->
						</div>
					</div>
					<div>
						<div class="share-link-label" style="color: rgb(0, 200, 255)">队伍A / TEAM A</div>
						<div class="share-link-item">
							<div>{{ links.team1 }}</div>
							<!-- <button @click="() => copy(links.team1)">复制</button> -->
						</div>
					</div>
					<div>
						<div class="share-link-label" style="color: rgb(255, 51, 51)">队伍B / TEAM B</div>
						<div class="share-link-item">
							<div>{{ links.team2 }}</div>
							<!-- <button @click="() => copy(links.team2)">复制</button> -->
						</div>
					</div>
					<div>
						<div class="share-link-label" style="color: rgb(50, 255, 100)">观众 / VIEWER</div>
						<div class="share-link-item">
							<div>{{ links.viewer }}</div>
							<!-- <button @click="() => copy(links.viewer)">复制</button> -->
						</div>
					</div>
				</div>
			</div>
		</div>
		<div v-if="snapshotVisible" class="share-mask">
			<div class="share-content">
				<div class="share-header">
					<div>系统快照 / SNAPSHOT</div>
					<button @click="snapshotVisible = false">✕</button>
				</div>
				<div>
					<textarea v-model="snapshotData" class="snapshot-board"></textarea>
				</div>
				<div>
					<button @click="setData" class="snapshot-btn">复原</button>
				</div>
			</div>
		</div>
		<div class="control-panel">
			<div class="control-info">HOST 指令 / CONSOLE</div>
			<div class="control-btn-group">
				<button @click="getData">👇 快照 / SNAP</button>
				<button @click="() => (shareVisible = true)">👉 分享 / SHARE</button>
				<button v-if="match.round == 0" @click="startRound">▶ 开局 / INITIATE</button>
				<!-- <textarea v-model="data">
        </textarea> -->
				<button v-if="match.countDownType && match.countDownRunning" @click="pauseTimer()">
					⏹ 暂停 / PAUSE
				</button>
				<button v-if="match.countDownType && !match.countDownRunning" @click="resumeTimer()">
					▶ 恢复 / CONTINUE
				</button>
				<!-- <button v-if="match.step == 3" @click="matchOpr.step3">博弈终止</button> -->
				<button v-if="match.step != 23 && match.battle1" @click="() => matchOpr.battleAniChange(2)">
					拼点（当前）
				</button>
				<button v-if="match.step != 23 && match.battle2" @click="() => matchOpr.battleAniChange(1)">
					对波（当前）
				</button>
				<button v-if="match.step == 3" @click="startRound">下一轮比赛(会直接开始)</button>
			</div>
		</div>
	</div>
</template>
<style scoped>
.control-panel {
	top: 80vh;
	left: 50vw;
	width: 38vw;
	transform: translateX(-19vw) translateY(-10vh);
	position: absolute;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: #14191ee6;
	border: 1px solid #444;
	border-bottom: 4px solid #666;
	box-shadow: 0 20px 50px #00000080;
}
.control-info {
	width: 95%;
	font-size: 0.5em;
	color: #666;
	padding-top: 1em;
	border-bottom: 1px solid #333;
	margin-bottom: 1em;
	padding-bottom: 0.3em;
	text-align: right;
	letter-spacing: 1px;
}
.control-btn-group {
	display: grid;
	grid-template-columns: repeat(3, 1fr); /* 显式 3 列 */
	padding: 1vh;
	gap: 12px;
	max-height: 40vh;
	overflow-y: auto;
}
.control-btn-group button {
	clip-path: polygon(
		10px 0,
		100% 0,
		100% calc(100% - 10px),
		calc(100% - 10px) 100%,
		0 100%,
		0 10px
	);
	height: 3em;
	padding: 0 1.5em;
	cursor: pointer;
	font-size: 1.1em;
	font-weight: 600;
}
.share-mask {
	z-index: 10;
	width: 100vw;
	height: 100vh;
	background-color: #00000098;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: 0;
}
.share-content {
	width: 30%;
	display: flex;
	flex-direction: column;
	padding: 2em;
	background: #1a1a1a;
	border: 1px solid rgba(0, 200, 255, 0.3);
}
.share-header {
	font-size: 1em;
	color: #fff;
	letter-spacing: 2px;
	font-weight: 600;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2em;
	padding-bottom: 1em;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.share-header button {
	outline: none;
	border: none;
	background: transparent;
	color: #fff;
	font-size: 1.2em;
	font-weight: 600;
	cursor: pointer;
}
.share-link-label {
	font-weight: 600;
	padding: 0.5em 0;
}
.share-link-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	background: #00000080;
	padding: 10px 12px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	font-size: 0.3em;
	color: #ffffffb3;
	font-family: Consolas, monospace;
	word-break: break-all;
}
.share-link-item div {
	user-select: all;
}
.share-link-item button {
	padding: 6px 12px;
	background: #00c8ff1a;
	border: 1px solid rgba(0, 200, 255, 0.3);
	color: #00c8ff;
	font-size: 0.6em;
	cursor: pointer;
	transition: all 0.3s ease;
	white-space: nowrap;
}
.snapshot-board {
	width: 100%;
	height: 20vh;
	background: transparent;
	color: #f0f0f0;
}
.snapshot-btn {
	padding: 6px 12px;
	background: #00c8ff1a;
	border: 1px solid rgba(0, 200, 255, 0.3);
	color: #00c8ff;
	font-size: 0.6em;
	cursor: pointer;
	transition: all 0.3s ease;
	white-space: nowrap;
	width: 100%;
}
</style>
