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
	build: {
		outDir: "../dist",
	},
	server: {
		// 本地
		// proxy: {
		// 	'/api': {
		// 		target: 'http://127.0.0.1:3000',
		// 		changeOrigin: true, // 允许跨域
		// 	},
		// 	'/ws': {
		// 		target: 'http://127.0.0.1:3000',
		// 		changeOrigin: true,
		// 		ws: true
		// 	}
		// },
		// 服务器
		proxy: {
			'/api': {
				target: 'http://121.89.169.157:80',
				changeOrigin: true, // 允许跨域
			},
			'/ws': {
				target: 'http://121.89.169.157:80',
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
