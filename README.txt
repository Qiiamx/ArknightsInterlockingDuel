项目分为前后端
均需要node 20 +
前端启动方式
npm i
npm run dev

后端启动方式
npm i
node service.js

无需修改其它代码(理论上)

主要逻辑均由前端控制, 后端就是一个广播器

剩余主要工作内容
1. 5个用户页面 /src/pages
2. 数据控制逻辑 /src/stores/match.js

实践思路:
1 用户确认身份后, 把身份存在 本地(match.js) 
2 结合身份和操作,变更数据,并把最终快照(全局数据)提交给后端
3 后端自动广播数据给room中所有的客户端(owner, viewer, team1, team2)
4 页面自行渲染,并按照客户端身份隐藏部分信息