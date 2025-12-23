// server.js
const { v4 } = require('uuid')
const { createServer } = require('http')
const { parse, URL } = require('url')
const { Server, OPEN } = require('ws')
const { Mutex } = require('async-mutex')
const path = require('path')
const fs = require('fs')

/* 内存结构
	shareMap : Map<shareId, {roomId, type}> // type = team1 / team2 / owner / viewer
	userMap : Map<userId, {roomId, client}>
	roomMap : Map<roomId, {lastData, version, uids Set<userId>>   // 仅存 userId，方便清理
*/
const shareMap = new Map();
const userMap = new Map();
const roomMap = new Map();

const server = createServer();          // 纯升级用，无 HTTP 业务
const wss = new Server({ server });
const lock = new Map();
const getLock = (roomId) => {
	if (!lock.has(roomId)) {
		lock.set(roomId, new Mutex());
	}
	return lock.get(roomId);
}
/**
 * 
 * @param {*} userId 发送客户端用户ID
 * @param {*} data 发送的数据（全局快照）
 * @returns 
 */
const broadcast = (roomId, data) => {
	roomMap.get(roomId).lastData = data
	roomMap.get(roomId).uids.forEach(uid => {
		const client = userMap.get(uid).client;
		if (client && client.readyState === OPEN) {
			client.send(JSON.stringify({
				type: null,
				data: data
			}));
		}
	})
}

server.on('request', (req, res) => {
	// 1. CORS 预检 & 简单请求头
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	// 2. 预检直接返回
	if (req.method === 'OPTIONS') {
		res.writeHead(204);
		res.end();
		return;
	}

	const { pathname } = parse(req.url, true);
	if (req.method === 'POST' && pathname === '/api/create-room') {
		let body = '';
		req.on('data', c => body += c);
		req.on('end', () => {
			try {
				const { roomId, ownerId, team1Id, team2Id, viewerId } = JSON.parse(body);
				shareMap.set(ownerId, { roomId, type: 'owner' });
				shareMap.set(team1Id, { roomId, type: 'team1' });
				shareMap.set(team2Id, { roomId, type: 'team2' });
				shareMap.set(viewerId, { roomId, type: 'viewer' });
				roomMap.set(roomId, { lastData: null, version: null, uids: new Set() })
				console.log(`[create-room] ${Date.now()} owner=${ownerId} room=${roomId}`);
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ ok: true }));   // 不需要再返回 
			} catch (e) {
				res.writeHead(400);
				res.end('bad json');
			}
		});
		return;
	}
	if (req.method === 'POST' && pathname === '/api/submit-data') {
		let body = '';
		req.on('data', c => body += c);
		req.on('end', async () => {
			const { userId, data, force } = JSON.parse(body);
			if (!userMap.has(userId)) {
        console.error(`userId ${userId} not exist, 400`)
				res.writeHead(400, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ ok: false }));
				return;
			}
			let roomId = userMap.get(userId).roomId
			const release = await getLock(roomId).acquire();
			try {
				// 校对版本号， 不正确的直接让前端重试， 正确的通过广播更新给所有人
				if (roomMap.has(roomId)) {
					let room = roomMap.get(roomId)
					if (room.version == null || room.version == data.match.version || force) {
						let uuid = v4()
						room.version = uuid
						data.match.version = uuid
						broadcast(roomId, JSON.stringify(data))
						res.writeHead(200, { 'Content-Type': 'application/json' });
						res.end(JSON.stringify({ ok: true }));
					}else{
            console.error(`room version check failed, return false`)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false }));
          }
				} else {
          console.error(`roomId ${roomId} not exist, 400`)
					res.writeHead(400, { 'Content-Type': 'application/json' });
				  res.end(JSON.stringify({ ok: false }));
				}
			} catch (e) {
				console.error(e)
				res.writeHead(400);
				res.end('bad json');
			} finally {
				release()
			}
		});
		return;
	}
	// 静态文件路径映射
	let filePath = pathname === '/' ? '/index.html' : pathname;
	const fullPath = path.join(__dirname, 'dist', decodeURIComponent(filePath));
	console.log(fullPath)
	// 简单的静态文件服务
	fs.readFile(fullPath, (err, content) => {
		if (err) {
      console.log('file not exist')
			// 文件不存在，返回 Vue 的 index.html
			fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, data) => {
				if (err) {
					res.writeHead(404);
					res.end('Not Found');
				} else {
					res.writeHead(200, { 'Content-Type': 'text/html' });
					res.end(data);
				}
			});
		} else {
      console.log('file exist')
			// 返回文件
			const ext = path.extname(fullPath);
			const mimeTypes = {
				'.html': 'text/html',
				'.js': 'text/javascript',
				'.css': 'text/css',
				'.json': 'application/json',
				'.png': 'image/png',
				'.jpg': 'image/jpeg',
				'.ico': 'image/x-icon',
			};
			
			res.writeHead(200, {
				'Content-Type': mimeTypes[ext] || 'application/octet-stream'
			});
			res.end(content);
		}
	});
});


wss.on('connection', (ws, req) => {
	/* ---------- 1. 握手阶段解析 query ---------- */
	const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
	const shareId = params.get('shareId'); // 用这个找到身份和房间号
	const userId = params.get('userId'); // 用这个标识客户端

	if (!shareId) {
		ws.close(1002, 'missing shareId');
		console.log('missing shareId ' + shareId)
		return;
	}
	if (!shareMap.has(shareId)) {
		ws.close(1002, 'invalid shareId');
		console.log('invalid shareId ' + shareId)
		return;
	}

	/* ---------- 2. 存索引 ---------- */
	const roomId = shareMap.get(shareId).roomId
	const type = shareMap.get(shareId).type // 返回给前端, 让他跳转到该去的页面
	if (!roomMap.has(roomId)) {
		ws.close(1002, 'invalid room');
		console.log('invalid room ' + roomId)
		return;
	}
	userMap.set(userId, { roomId: roomId, client: ws });          // 用户->连接
	let room = roomMap.get(roomId);
	room.uids.add(userId); // 房间->用户
	ws.send(JSON.stringify({ type: type, data: room.lastData })) //初始化数据

	/* ---------- 3. 收到任何消息 ---------- */
	ws.on('message', (data) => {
		// 不处理客户端消息
	});
	ws.on('error', (err) => {
		console.error(`[WS-ERROR] userId=${userId} msg=${err.message}`, err.stack);
	})
	/* ---------- 4. 断线清理 ---------- */
	ws.on('close', (code, reason) => {
		const user = userMap.get(userId);
		if (!user) return;
		const set = roomMap.get(user.roomId).uids;
		if (set) {
			set.delete(userId);
		}
		userMap.delete(userId);
		console.log(`[WS-CLOSE] userId=${userId} code=${code} reason=${reason.toString()}`);

		if (set && set.size === 0) {
			// roomMap.delete(user.roomId);
			// lock.delete(user.roomId);
			// console.log(`[-]房间 ${user.roomId} 关闭`);
		}
	});
});

const PORT = process.env.PORT || 81;
server.listen(PORT, () => console.log(`WS server ready on ws://0.0.0.0:${PORT}`));