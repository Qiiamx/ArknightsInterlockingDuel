import { createRouter, createWebHistory } from 'vue-router';
import HelloPage from '@/pages/hello-page.vue';
import MatchPage from '@/pages/match-page.vue';
import MatchPrepare from '@/pages/match-prepare.vue';
import Test from '@/pages/test.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: '/', component: HelloPage },

		{
			path: '/match',
			component: MatchPage,
			children: [
				{
					path: 'prepare',
					component: MatchPrepare,
				},
			],
		},

		{ path: '/test', component: Test },
	],
});

export default router;
