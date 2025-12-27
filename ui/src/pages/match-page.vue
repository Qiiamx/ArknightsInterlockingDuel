<script setup>
import MatchControl from '@/components/match-control.vue';
import MatchView from '@/components/match-view.vue';
import Team1Control from '@/components/team1-control.vue';
import Team1View from '@/components/team1-view.vue';
import Team2Control from '@/components/team2-control.vue';
import Team2View from '@/components/team2-view.vue';
import { useMatchStore } from '@/stores/match';
import { onMounted, onUnmounted, computed, watch } from 'vue';
import { useWebSocket } from '@/composables/websocket';
import { useRoute, useRouter } from 'vue-router';

const matchStore = useMatchStore();
const { userInfo, serverOpr, match } = matchStore;

const { initialize, cleanup } = useWebSocket();
const route = useRoute();
const router = useRouter();

onMounted(() => {
	init();
});

onUnmounted(() => {
	cleanup();
});

const init = () => {
	// 避免路由切换/热更新时重复生成 userId
	if (!userInfo.userId) userInfo.userId = randomId();

	initialize(userInfo.userId, route.query.shareId, (data) => {
		// 只有在 data.type 存在时才重置身份
		if (data.type) {
			userInfo.owner = false;
			userInfo.team1 = false;
			userInfo.team2 = false;
			userInfo.viewer = false;

			switch (data.type) {
				case 'owner':
					userInfo.owner = true;
					break;
				case 'team1':
					userInfo.team1 = true;
					break;
				case 'team2':
					userInfo.team2 = true;
					break;
				case 'viewer':
					userInfo.viewer = true;
					break;
			}
		}

		if (data.data) {
			serverOpr.render(JSON.parse(data.data));
		}
	});
};

const randomId = () => {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
	);
};

//准备阶段判定
const isPreparePhase = computed(() => {
	return (match?.round ?? match.value?.round ?? 0) === 0 && (match?.step ?? match.value?.step ?? 0) === 0;
});

//自动切换页面：准备 -> /match/prepare；开始 -> /match
watch(
	isPreparePhase,
	(val) => {
		// 保留 shareId query
		const query = route.query;

		if (val) {
			// 准备阶段：如果没在 prepare 子路由就跳过去
			if (route.path !== '/match/prepare') {
				router.replace({ path: '/match/prepare', query });
			}
		} else {
			// 已开始：如果还在 prepare 子路由就回主 match
			if (route.path === '/match/prepare') {
				router.replace({ path: '/match', query });
			}
		}
	},
	{ immediate: true }
);
</script>

<template>
	<div class="match-content">
		<div class="room-view">
			<Team1View class="team1-view"></Team1View>
			<MatchView class="match-view"></MatchView>
			<Team2View class="team2-view"></Team2View>
			<MatchControl class="match-control"></MatchControl>
			<Team1Control class="team1-control"></Team1Control>
			<Team2Control class="team2-control"></Team2Control>
			<router-view />
		</div>
	</div>
</template>

<style lang="css">
.match-content {
	width: 100vw;
	height: 100vh;
	background-color: #000;
	color: #e0e0e0;
}

.room-view {
	position: relative;
	perspective: 1200px;
	width: 100vw;
	height: 100vh;
}
</style>
