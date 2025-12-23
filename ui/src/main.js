import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { Tooltip, Tabs } from 'ant-design-vue';
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Tooltip);
app.use(Tabs);
app.mount('#app');
