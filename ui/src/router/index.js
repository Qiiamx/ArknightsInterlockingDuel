import { createRouter, createWebHistory } from 'vue-router'
import HelloPage from '@/pages/hello-page.vue';
import MatchPage from '@/pages/match-page.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HelloPage
    },
    {
      path: '/match',
      component: MatchPage
    }
  ],
})

export default router
