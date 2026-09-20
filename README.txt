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

该独立工具由 x2048x 制作、维护并对外分享，责任与反馈均指向 x2048x
（反馈渠道：B 站私信或评论区）。
随包分发的《免责声明与版权说明.txt》为对外版本：其中只写制作者与反馈渠道，
不含任何仓库地址（暂不公开）。

推送到远端（注意：本机代理不常开）
git 全局配置里写着代理 127.0.0.1:7890，但该代理平时是关的，请不要把它当作默认路径。
需要推送时用：
  pwsh tools/git-sync.ps1
它会自动择路：直连 github.com:443 能通就走直连；直连不通、且代理恰好开着才回退走代理；
两者都不行就停下并提示先启动代理，不会反复重试干等。
  pwsh tools/git-sync.ps1 -DryRun          # 只探测会走哪条路，不推送
  pwsh tools/git-sync.ps1 -Route direct    # 强制直连
  pwsh tools/git-sync.ps1 -Route proxy     # 强制代理
  pwsh tools/git-sync.ps1 -Tag v1.1 -ForceTag   # 同时推送（并移动）标签
