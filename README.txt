ArknightsInterlockingDuel
aka AID

干员资源提交位置: 
-ui
--public
---images 职业图标（名称与JSON文件匹配）
---icon 干员头像（名称与JSON文件匹配）
---data 干员和分支json文件


项目分为前后端
均需要node 20 +

后端启动方式
npm i
node run.js

前端启动方式
cd ui
npm i
npm run dev

部署方式
手动安装 node20, git, pm2
请把 deploy.sh 脚本放在你的文件夹下启动（只需要deploy.sh）
默认8087端口
如果你想增加密码,可以在deploy.sh脚本的同级目录新增"password.txt"文件,内容是  user:password, 例如: admin:123456

联锁对抗
https://github.com/ArknightsInterInterlockingComfrontation

作者
原项目作者: Qiiamx
https://github.com/Qiiamx/ArknightsInterlockingDuel

本分支扩展: x2048x
「肉鸽随机干员选取器」（ui/public/rogue.html，离线包内为「开始游戏.html」）、
「直播展示小窗」（ui/public/直播展示.html），以及配套的难度体系、全局禁用设置
与离线打包工具（tools/pack-rogue.js），均属本分支的扩展内容。
