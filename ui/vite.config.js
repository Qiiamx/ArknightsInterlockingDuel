import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueDevTools(),
	],
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:3000', // 目标服务器地址，如果你没有启动，可以用服务器的 121.89.169.157:80
				changeOrigin: true, // 允许跨域
			},
			'/ws': {
				target: 'http://127.0.0.1:3000', // 后端 WebSocket 地址，如果你没有启动，可以用服务器的 121.89.169.157:80
				changeOrigin: true,
				ws: true
			}
		}
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		},
	},
})
