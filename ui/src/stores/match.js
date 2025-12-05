import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOprIdx, getBranchIdx } from '@/utils/operator'
// 在这里定义全局状态， 通过ws在所有用户之间传播
// 后端会以room id为单位，对room id下的所有用户发送广播
// room.id, team1.id team2.id vierer.id owner.id 由前端用户发起，后端创建生成
// 即： 
// 第一个用户点击创建， 后端生成并将 4+1个ID记为一组(room.id)，前端获得4个链接， owner/id0  team1/id1   team2/id2 viewer/id3 
// 所有用户进入各自的链接，通过链接向后端建立 ws连接
// 所有用户的操作，均携带ID向后端发送请求（前端不动，等下发刷新）
// 后端每次接到请求，计算新的 match,team1,team2，发给前端
// 前端接到数据，刷新 match, team1, team2
const INIT_CP = 50 // 初始调用点
const INIT_IP = 1 // 初始情报点
const REST_INCREASE_CP = 5 // 休息增加调用点
const REST_INCREASE_IP = 1 // 休息增加情报点
const MIND_TIME = 5 // 思考时间(秒)

export const useMatchStore = defineStore('match', () => {
	//用户信息
	const userInfo = ref({
		userId: null, // 提交数据请求时需要带上
		team1: false, // 用于数据逻辑控制
		team2: false, // 用于数据逻辑控制
		owner: false, // 用于数据逻辑控制
		viewer: false // 用于数据逻辑控制
	})
	//全局状态
	const match = ref({
		round: 0, // 当前轮次
		step: 1, // 当前阶段  1. 开局阶段 2. 博弈阶段(30秒) 3. 博弈终止阶段 4. 攻略阶段
		public_opr: [], // 本轮的公共干员
		select_opr: null, // 当前的博弈干员,
		ban_opr: [], // 全局禁用干员
		ban_branch: [], // 全局禁用分支
		time: MIND_TIME, // 倒计时（由OWNER来更新）
		version: null, // 乐观锁（这个参数很重要，不要修改，不要移除，用于避免两个用户同时操作，其中一方的数据被另一方覆盖）
	});
	const team1 = ref({
		id: '', // 由链接决定的id，用于匹配可见性
		name: '', //队伍名称
		nicknames: [], //选手名称
		avatars: [], //选手QQ-头像
		get_oprs: [], //已获得的干员
		show_starts: [], //显示星级的干员
		show_branches: [], //显示分支的干员
		show_classes: [], //显示职业的干员
		lastCP: INIT_CP, //明面剩余调用点 todo: 考虑到这几个点数有额外的博弈条件，不一定是这几个参数
		lastIP: INIT_IP, // 剩余情报点
		decision: 2, // 1下注 2休息 3终止， 默认休息
		betCP: 0, // 付出筹码（单次结算）
		betFlag: true //参与博弈
	});
	const team2 = ref({
		id: '',
		name: '', //队伍名称
		nicknames: [], //选手名称
		avatars: [], //选手QQ-头像
		get_oprs: [], //已获得的干员
		show_starts: [], //显示星级的干员
		show_branches: [], //显示分支的干员
		show_classes: [], //显示职业的干员
		lastCP: INIT_CP, //剩余调用点
		lastIP: INIT_IP, //剩余情报点
		decision: 2, // 1下注 2休息 3终止， 默认休息
		betCP: 0, // 付出筹码（单次结算）
		betFlag: true //参与博弈
	});
	const submit = (func) => {
		// 提交数据, 成功返回 ok: true
		fetch(`/api/submit-data`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId: userInfo.value.userId,
				data: {
					match: match.value,
					team1: team1.value,
					team2: team2.value
				}
			})
		}).then(response => {
			if (!response || !response.ok) {
				if (func) {
					func()
				}
			} else {
				return response.json()
			}
		}).then(data => {
			if (data && !data.ok) {
				if (func) {
					func()
				}
			}
		})
	}
	// 队伍操作, 在倒计时结束时结算, 中途可以随时变更
	const teamOpr = {
		useIP: () => {
			// team 消耗情报
			userInfo.value.team1?team1.value.lastIP = team1.value.lastIP-1:team2.value.lastIP = team2.value.lastIP-1
			//todo 对 team 变更当前干员的可见性
			submit(()=>{teamOpr.useIP()})
		},
		useCP: (cnt) => {
			// team 压上筹码
			if(userInfo.value.team1){
				team1.value.betCP = cnt
				team1.value.decision = 1
			}else{
				team2.value.betCP = cnt
				team2.value.decision = 1
			}
			submit(()=>{teamOpr.changeCP(cnt)})
		},
		rest: ()=>{
			// team 开始摸鱼
			if(userInfo.value.team1){
				team1.value.betCP = 0
				team1.value.decision = 2
			}else{
				team2.value.betCP = 0
				team2.value.decision = 2
			}
			submit(()=>{teamOpr.rest()})
		},
		quit: ()=>{
			// team 开摆
			if(userInfo.value.team1){
				team1.value.betCP = 0
				team1.value.decision = 3
			}else{
				team2.value.betCP = 0
				team2.value.decision = 3
			}
			submit(()=>{teamOpr.rest()})
		}
	}
	// 比赛操作
	const matchOpr = {
		changeTime: (time) => {
			//主持人更新倒计时
			match.value.time = time
			submit()
		},
		end: () => {
			//结束比赛 （？）
			alert('没做')
		},
		nextStep: () => {
			//阶段+1，但是由调用方决定是否提交（如阶段2、3，除了数量+1，还有其它LOOP）
			match.value.step = match.value.step + 1
			submit(() => { matchOpr.nextStep() })
		},
		step1: () => {
			match.value.public_opr = getOprIdx(3, match.value.ban_opr, match.value.ban_branch)
			match.value.ban_opr.push(...match.value.public_opr)
			submit(() => { matchOpr.step1() })
		},
		step21: () => {
			// 博弈阶段，抽取干员，由owner开始倒计时
			match.value.time = MIND_TIME
			match.value.select_opr = getOprIdx(1, match.value.ban_opr, match.value.ban_branch)[0]
			match.value.ban_opr.push(match.value.select_opr)
			submit(() => { matchOpr.step21() })
		},
		step22: () => {
			//选手消耗情报
		},
		step23: () => {
			//选手进行博弈
		},
		step3: () => {
			// 博弈结束，阶段3
			//展示公共区不可见的1名五星干员
		},
		step24: () => {
			// owner界面倒计时结束后，调用本功能
			// 揭开本次博弈结果，扣除调用点，分配干员给队伍，调整可见性
			if (team1.value.decision == 1) {
				// team1下注，扣除CP
				team1.value.lastCP = team1.value.lastCP - team1.value.betCP
			}
			if (team2.value.decision == 1) {
				// team2下注，扣除CP
				team2.value.lastCP = team2.value.lastCP - team2.value.betCP
			}
			if (team1.value.decision == 1 && team2.value.decision == 1) {
				// 双方下注，进行比较
				let payTeam = team1.value.betCP - team2.value.betCP;
				if (payTeam < 0) {
					// team2更多
					team2.value.get_oprs.push(match.value.select_opr)
					// todo 向team1展示本轮team2消耗的betCp
				} else if (payTeam > 0) {
					// team1更多
					team1.value.get_oprs.push(match.value.select_opr)
					// todo 向team2展示本轮team1消耗的betCp
				} else {
					// 平局
					// ban掉干员和分支
					// match.value.ban_opr.push(match.value.select_opr) // 干员在选取时就自动ban掉了
					match.value.ban_branch.push(getBranchIdx(match.value.select_opr))
				}
			} else if (team1.value.decision == 1 && team2.value.decision != 1) {
				// team1下注，team2没有下注
				team1.value.get_oprs.push(match.value.select_opr)
			} else if (team2.value.decision == 1 && team1.value.decision != 1) {
				// team2下注，team1没有下注
				team2.value.get_oprs.push(match.value.select_opr)
			}
			if (team1.value.decision == 2) {
				// team1休息
				team1.value.lastCP = team1.value.lastCP + REST_INCREASE_CP
				team1.value.lastIP = team1.value.lastIP + REST_INCREASE_IP
			}
			if (team2.value.decision == 2) {
				// team2休息
				team2.value.lastCP = team2.value.lastCP + REST_INCREASE_CP
				team2.value.lastIP = team2.value.lastIP + REST_INCREASE_IP
			}
			if (team1.value.decision == 2 && team2.value.decision == 2) {
				// 平局
				// ban掉干员和分支
				// match.value.ban_opr.push(match.value.select_opr) // 干员在选取时就自动ban掉了
				match.value.ban_branch.push(getBranchIdx(match.value.select_opr))
			}
			if (team1.value.decision == 3){
				// 结束博弈, 标记false, 禁止所有操作到下一轮
				team1.value.betFlag = false
			}
			if (team2.value.decision == 3){
				// 结束博弈, 标记false, 禁止所有操作到下一轮
				team2.value.betFlag = false
			}
			//重置所有队伍的抉择状态
			team1.value.betCP = 0
			team2.value.betCP = 0
			team1.value.decision = 2
			team2.value.decision = 2
			submit(() => { matchOpr.step24() })
		},
		nextRound: () => {
			//新轮次
			match.value.round = match.value.round + 1
			match.value.step = 1
			team1.value.lastCP = INIT_CP
			team1.value.lastIP = INIT_IP
			submit(() => { matchOpr.nextRound() })
		},
	}

	//服务器下发，专门的ws模块来调用
	const serverOpr = {
		render: (data) => {
			if (data) {
				Object.assign(match.value, data.match)
				Object.assign(team1.value, data.team1)
				Object.assign(team2.value, data.team2)
			}
		}
	}

	return { userInfo, match, team1, team2, teamOpr, matchOpr, serverOpr }
})
