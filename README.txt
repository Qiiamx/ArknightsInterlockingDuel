ArknightsInterlockingDuel
aka AID

项目分为前后端
均需要node 20 +
前端单独启动方式
cd ui
npm i
npm run dev

后端启动方式
npm i
node service.js

部署方式
cd ui
npm run build
# 这一步会在根目录(不是ui下)生成一个dist文件夹
cd ..
pm2 start service.js
# service.js会自动把 dist当作根目录开启80端口的访问

无需修改其它代码(理论上)
主要逻辑均由前端的 match.js 控制, 后端就是一个广播器


联锁对抗
https://github.com/ArknightsInterlockingDuel
