import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOprIdx, getBranchIdx, getLastOprCount } from '@/utils/operator'
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
const SETTLEMENT_TIME = 10 // 开局时间(秒)
const MIND_TIME = 25 // 思考时间(秒)
const SHOW_TIME = 5 // 结算时间(秒)

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
		publicOprs: [], // 本轮的公共干员
		selectOpr: null, // 当前的博弈干员,
		banOprs: [], // 全局禁用干员
		banBranches: [], // 全局禁用分支
		timeStep1: SETTLEMENT_TIME, // 开局倒计时（由OWNER来更新）
		timeStep21: MIND_TIME, // 博弈倒计时（由OWNER来更新）
		timeStep24: SHOW_TIME, // 结算倒计时（由OWNER来更新）
		duling: false, // 博弈中 true选手可以操作 false不可以
		continueMind: true, // 还能继续博弈
		version: null, // 乐观锁（这个参数很重要，不要修改，不要移除，用于避免两个用户同时操作，其中一方的数据被另一方覆盖）
	});
	const team1 = ref({
		id: '', // 由链接决定的id，用于匹配可见性
		name: '', //队伍名称
		nicknames: [], //选手名称
		avatars: [], //选手QQ-头像
		getOprs: [], //已获得的干员
		showRares: [], //显示稀有度的干员索引
		showBranches: [], //显示分支的干员索引
		showClasses: [], //显示职业的干员索引
		showNames: [], //显示名称的干员索引
		lastCP: INIT_CP, //剩余调用点
		lastIP: INIT_IP, // 剩余情报点
		decision: 2, // 1下注 2休息 3终止， 默认休息
		betCP: 0, // 付出调用（单次结算）
		betIP: 0, // 付出情报（单次结算）
		showBetCP: null, // 拼点展示, null 不展示, 和0做区分
		showBetIP: null, // 拼点展示, null 不展示, 和0做区分
		betFlag: true //参与博弈
	});
	const team2 = ref({
		id: '',
		name: '', //队伍名称
		nicknames: [], //选手名称
		avatars: [], //选手QQ-头像
		getOprs: [], //已获得的干员
		showRares: [], //显示稀有度的干员索引
		showBranches: [], //显示分支的干员索引
		showClasses: [], //显示职业的干员索引
		showNames: [], //显示名称的干员索引
		lastCP: INIT_CP, //剩余调用点
		lastIP: INIT_IP, //剩余情报点
		decision: 2, // 1下注 2休息 3终止， 默认休息
		betCP: 0, // 付出调用（单次结算）
		betIP: 0, // 付出情报（单次结算）
		showBetCP: null, // 拼点展示, null 不展示, 和0做区分
		showBetIP: null, // 拼点展示, null 不展示, 和0做区分
		betFlag: true //参与博弈
	});
	const viewer = ref({
		showRares: [], //显示稀有度的干员索引
		showBranches: [], //显示分支的干员索引
		showClasses: [], //显示职业的干员索引
		showNames: [], //显示名称的干员索引
	})
	// 对 targets 增加 types 的 indexes
	const addVisibleIdx = (targets, types, indexes,) => {
		for (let obj of targets) {
			for (let type of types) {
				for(let idx of indexes){
					if(obj.value[type].indexOf(idx) < 0){
						obj.value[type].push(idx)
					}
				}
			}
		}
	}
	const submit = (func, forceData) => {
		// 提交数据, 成功返回 ok: true
		fetch(`/api/submit-data`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				force: forceData ? true : false,
				userId: userInfo.value.userId,
				data: forceData || {
					match: match.value,
					team1: team1.value,
					team2: team2.value,
					viewer: viewer.value,
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
			if (userInfo.value.team1) {
				team1.value.lastIP = team1.value.lastIP - 1
				addVisibleIdx([team1], ['showBranches', 'showRares'], [match.value.selectOpr])
				team1.value.betIP = 1
			} else {
				team2.value.lastIP = team2.value.lastIP - 1
				addVisibleIdx([team2], ['showBranches', 'showRares'], [match.value.selectOpr])
				team2.value.betIP = 1
			}
			submit(() => { teamOpr.useIP() })
		},
		useCP: (cnt) => {
			// team 压上筹码
			if (userInfo.value.team1) {
				team1.value.betCP = cnt
				team1.value.decision = 1
			} else {
				team2.value.betCP = cnt
				team2.value.decision = 1
			}
			submit(() => { teamOpr.changeCP(cnt) })
		},
		rest: () => {
			// team 开始摸鱼
			if (userInfo.value.team1) {
				team1.value.betCP = 0
				team1.value.decision = 2
			} else {
				team2.value.betCP = 0
				team2.value.decision = 2
			}
			submit(() => { teamOpr.rest() })
		},
		quit: () => {
			// team 开摆
			if (userInfo.value.team1) {
				team1.value.betCP = 0
				team1.value.decision = 3
			} else {
				team2.value.betCP = 0
				team2.value.decision = 3
			}
			submit(() => { teamOpr.rest() })
		}
	}
	// 比赛操作
	const matchOpr = {
		changeSettlementTime: (time) => {
			//主持人更新倒计时
			match.value.timeStep1 = time
			submit()
		},
		changeMindTime: (time) => {
			//主持人更新倒计时
			match.value.timeStep21 = time
			submit()
		},
		changeShowTime: (time) => {
			//主持人更新倒计时
			match.value.timeStep24 = time
			submit()
		},
		end: () => {
			//结束比赛 （？）
			alert('没做')
		},
		nextStep: () => {
			// 阶段+1
			match.value.step = match.value.step + 1
			// 重置所有时间
			match.value.timeStep1 = SETTLEMENT_TIME, // 开局倒计时（由OWNER来更新）
			match.value.timeStep21 = MIND_TIME, // 博弈倒计时（由OWNER来更新）
			match.value.timeStep24 = SHOW_TIME // 结算倒计时（由OWNER来更新）
			// submit(() => { matchOpr.nextStep() }) 重复提交
		},
		step1: () => {
			match.value.publicOprs = getOprIdx(3, [match.value.banOprs], match.value.banBranches, "6")
			// 展示3号公共干员的职业和稀有度
			addVisibleIdx([team1, team2, viewer], ['showClasses', 'showRares'], [match.value.publicOprs[2]])
			// 展示1和2号公共干员的全部信息
			addVisibleIdx([team1, team2, viewer], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.publicOprs[0], match.value.publicOprs[1]])
			submit(() => { matchOpr.step1() })
		},
		step21: () => {
			match.value.duling = true
			// 博弈阶段，抽取干员，由owner开始倒计时
			match.value.timeStep21 = MIND_TIME
			match.value.selectOpr = getOprIdx(1, [match.value.banOprs, match.value.publicOprs, team1.value.getOprs, team2.value.getOprs], match.value.banBranches)[0]
			addVisibleIdx([team1, team2], ['showClasses'], [match.value.selectOpr])
			addVisibleIdx([viewer], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.selectOpr])

			//重置所有队伍的抉择状态
			team1.value.betCP = 0
			team2.value.betCP = 0
			team1.value.betIP = 0
			team2.value.betIP = 0
			if(team1.value.betFlag){
				// team1还在博弈中
				if(team2.value.betFlag){
					//team1和2都在博弈
					team1.value.decision = 2
					team2.value.decision = 2
				}else{
					//team2结束了
					team1.value.decision = 3
				}
			}else{
				// team1不在博弈中, 则team2一定在博弈, 否则进不了step21, 会直接去step3
				team2.value.decision = 3
			}
			team1.value.showBetCP = null // null 不展示, 和0做区分
			team2.value.showBetCP = null
			team1.value.showBetIP = null
			team2.value.showBetIP = null
			submit(() => { matchOpr.step21() })
		},
		step22: () => {
			//选手消耗情报
		},
		step23: () => {
			//选手进行博弈
		},
		step24: () => {
			// owner界面倒计时结束后，调用本功能
			// 揭开本次博弈结果，扣除调用点，分配干员给队伍，调整可见性
			// 倒计时5秒进入下一轮(owner调用)
			match.value.timeStep24 = SHOW_TIME
			match.value.duling = false
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
					team2.value.getOprs.push(match.value.selectOpr)
					addVisibleIdx([team2], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.selectOpr])
					// 向team1展示本轮team2消耗的betCP
					team2.value.showBetCP = team2.value.betCP
				} else if (payTeam > 0) {
					// team1更多
					team1.value.getOprs.push(match.value.selectOpr)
					addVisibleIdx([team1], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.selectOpr])
					// 向team2展示本轮team1消耗的betCP
					team1.value.showBetCP = team1.value.betCP
				} else {
					// 平局
					// ban掉分支即可,干员无需上去, 反正后面不会再有了
					// match.value.banOprs.push(match.value.selectOpr)
					match.value.banBranches.push(getBranchIdx(match.value.selectOpr))
					// 显示被ban掉的干员
					// addVisibleIdx([team1, team2], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.selectOpr])
				}
			} else if (team1.value.decision == 1 && team2.value.decision != 1) {
				// team1下注，team2没有下注
				team1.value.getOprs.push(match.value.selectOpr)
				addVisibleIdx([team1], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.selectOpr])
			} else if (team2.value.decision == 1 && team1.value.decision != 1) {
				// team2下注，team1没有下注
				team2.value.getOprs.push(match.value.selectOpr)
				addVisibleIdx([team2], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.selectOpr])
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
				// ban掉分支即可,干员无需上去, 反正后面不会再有了
				// match.value.banOprs.push(match.value.selectOpr)
				match.value.banBranches.push(getBranchIdx(match.value.selectOpr))
				// 显示被ban掉的干员
				// addVisibleIdx([team1, team2], ['showClasses', 'showBranches', 'showRares', 'showNames'], [match.value.selectOpr])
			}
			if (team1.value.decision == 3) {
				// 结束博弈, 标记false, 禁止所有操作到下一轮
				team1.value.betFlag = false
			}
			if (team2.value.decision == 3) {
				// 结束博弈, 标记false, 禁止所有操作到下一轮
				team2.value.betFlag = false
			}
			// 展示本轮消耗情报点
			team1.value.showBetIP = team1.value.betIP
			team2.value.showBetIP = team2.value.betIP
			// 如果还有剩余干员且TEAM还能博弈, 允许继续博弈, 否则不允许(owner应该调用step3)
			match.value.continueMind = 
			// TEAM还能博弈
			(
				// 双方都还在博弈
				(team1.value.betFlag && team2.value.betFlag) ||
				// 一方博弈且余额大于10
				(team1.value.betFlag && team1.value.lastCP >= 10 ) ||
				// 一方博弈且余额大于10
				(team2.value.betFlag && team2.value.lastCP >= 10)
			)
			// 剩余干员大于0
			&& getLastOprCount([match.value.banOprs, match.value.publicOprs, team1.value.getOprs, team2.value.getOprs], match.value.banBranches) > 0

			// 重置博弈干员
			match.value.selectOpr = null
			submit(() => { matchOpr.step24() })
		},
		step3: () => {
			// 博弈结束，阶段3
			// 展示公共区不可见的1名五星干员
			addVisibleIdx([team1, team2, viewer], ['showBranches', 'showRares', 'showNames'], [match.value.publicOprs[2]])
			match.value.step = 4
			submit(() => { matchOpr.step3() })
		},
		nextRound: () => {
			// 禁用本轮公用干员
			match.value.banOprs.push(...match.value.publicOprs)
			// 禁用TEAM1获得的干员
			match.value.banOprs.push(...team1.value.getOprs)
			// 禁用TEAM2获得的干员
			match.value.banOprs.push(...team2.value.getOprs)
			// 展示TEAM1获得的干员
			addVisibleIdx([team2], ['showBranches', 'showRares', 'showNames'], team1.value.getOprs)
			// 展示TEAM2获得的干员
			addVisibleIdx([team1], ['showBranches', 'showRares', 'showNames'], team2.value.getOprs)
			// 重置公用干员
			match.value.publicOprs = []
			// 新轮次
			match.value.round = match.value.round + 1
			// 重置阶段
			match.value.step = 1
			// 重置时间
			match.value.timeStep1 = SETTLEMENT_TIME
			match.value.timeStep21 = MIND_TIME
			match.value.timeStep24 = SHOW_TIME
			// 重置team资源
			team1.value.betFlag = true
			team1.value.getOprs = []
			team1.value.lastCP = INIT_CP
			team1.value.lastIP = INIT_IP
			team2.value.betFlag = true
			team2.value.getOprs = []
			team2.value.lastCP = INIT_CP
			team2.value.lastIP = INIT_IP
		}
	}

	//服务器下发，专门的ws模块来调用
	const serverOpr = {
		render: (data) => {
			if (data) {
				Object.assign(match.value, data.match)
				Object.assign(team1.value, data.team1)
				Object.assign(team2.value, data.team2)
				Object.assign(viewer.value, data.viewer)
			}
		}
	}

	return { userInfo, match, team1, team2, viewer, teamOpr, matchOpr, serverOpr, submit }
})
