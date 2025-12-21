// countdown.worker.js
let timer = null;

self.onmessage = function (e) {
	const { cmd, remain } = e.data;
	if (cmd === 'start') {
		// 先清掉旧的
		if (timer) clearTimeout(timer);
		// 到点给主线程发消息
		timer = setTimeout(() => {
			self.postMessage({ cmd: 'fire' });
		}, remain);
	}

	if (cmd === 'clear') {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}
};
