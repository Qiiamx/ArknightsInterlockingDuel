#!/usr/bin/env node
/**
 * 打包「肉鸽随机干员选取器」为解压即用的离线包。
 *
 * 用法: node tools/pack-rogue.js
 * 产出:
 *   release/肉鸽随机干员选取器/        解压后双击「开始游戏.html」即用
 *   release/肉鸽随机干员选取器.zip     用于分享的压缩包
 *
 * 设计要点:
 * - 页面已改为相对路径, 因此同一份 rogue.html 在 dev / 生产 / 本地文件三种场景下都成立。
 * - Vue 运行时与干员数据一律内联进启动文件: 包内只剩「启动文件 + 图片资源」,
 *   没有 vendor/ data/ 这类目录, 分享对象一眼就能找到该双击哪个文件。
 *   干员数据必须内联: 浏览器禁止 file:// 下的 fetch, 不内联则双击打开必然白屏。
 * - zip 由本脚本自行写出, 不依赖 zip 命令/Compress-Archive, 便于在任意平台重复打包。
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'ui', 'public');
const SRC_HTML = path.join(PUB, 'rogue.html');
const SRC_DATA = path.join(PUB, 'data', 'operators.json');
const SRC_VENDOR = path.join(PUB, 'vendor', 'vue.global.prod.js');
const SRC_ICON = path.join(PUB, 'icon');
const SRC_IMAGES = path.join(PUB, 'images');

const PKG_NAME = '肉鸽随机干员选取器';
const LAUNCHER = '开始游戏.html';        // 包内唯一的启动文件, 名字即用法
const RELEASE = path.join(ROOT, 'release');
const OUT_DIR = path.join(RELEASE, PKG_NAME);
const ZIP_PATH = path.join(RELEASE, PKG_NAME + '.zip');
const CLASSES = ['先锋', '近卫', '重装', '狙击', '术师', '医疗', '辅助', '特种'];

// 页面里待内联的两个脚本标签(必须与 rogue.html 完全一致)
const VENDOR_TAG = '<script src="./vendor/vue.global.prod.js"></script>';
const DATA_TAG = '<script src="./data/operators.js"></script>';

const problems = [];
const must = (cond, msg) => { if (!cond) problems.push(msg); };

// ================================================================
// 第一阶段: 只校验, 不落盘
// 必须先校验后写入: 否则缺图时会先把 release/ 删成半个空壳, 又留下上一版的旧 zip
// ================================================================

// ---- 页面 ----
let html = fs.readFileSync(SRC_HTML, 'utf8');

// 注入离线数据脚本（必须在页面主脚本之前执行）
const ANCHOR = '<script>\nconst { createApp';
must(html.indexOf(ANCHOR) >= 0, '未找到页面主脚本锚点, rogue.html 结构可能已变');
html = html.replace(ANCHOR, DATA_TAG + '\n<script>\nconst { createApp');

// 页面里带 src 的脚本一律内联成 <script>, 这样包内只剩"启动文件 + 图片资源", 不再有 vendor/ data/ 目录
must(html.indexOf(VENDOR_TAG) >= 0, '未找到 ' + VENDOR_TAG + ', 无法内联 Vue');
must(html.indexOf(DATA_TAG) >= 0, '未找到 ' + DATA_TAG + ', 无法内联干员数据');

// 离线包内不允许存在绝对路径, 否则双击打开时资源全部 404
const abs = html.match(/(?:src|href)="\/[^"]*"|['"]\/(?:icon|images|data|vendor)\//g);
must(!abs, '页面中仍存在绝对资源路径: ' + (abs || []).join(', '));

// ---- 数据 ----
const ops = JSON.parse(fs.readFileSync(SRC_DATA, 'utf8'));
must(Array.isArray(ops) && ops.length > 0, 'operators.json 解析失败或为空');
must(ops.every((o) => o.干员 && o.职业 && o.分支 && o.稀有度), 'operators.json 存在字段缺失的干员');

// ---- 资源 ----
must(fs.existsSync(SRC_VENDOR), '缺少 vendor/vue.global.prod.js');
const vueSrc = fs.readFileSync(SRC_VENDOR, 'utf8');
// 内联的前提: 脚本内容里不能出现 </script, 否则 HTML 会被提前截断
must(!/<\/script/i.test(vueSrc), 'Vue 源码里含 </script, 不能直接内联');
must(!/<\/script/i.test(JSON.stringify(ops)), '干员数据里含 </script, 不能直接内联');

if (!problems.length) {
	html = html
		.replace(VENDOR_TAG, '<script>\n/* Vue 3.5.41 生产构建（含运行时编译器），已内联以免除外部依赖 */\n' + vueSrc + '\n</script>')
		.replace(DATA_TAG, '<script>\n/* 干员数据快照，已内联：浏览器禁止 file:// 下的 fetch，不内联则双击打开必白屏 */\nwindow.__ROGUE_OPS__ = ' + JSON.stringify(ops) + ';\n</script>');
	// 内联后必须不再有指向已删除目录的资源引用
	// (只查 src/href: 页面里还有一句 fetch('./data/operators.json') 的兜底分支,
	//  离线包内因 window.__ROGUE_OPS__ 存在而永不执行, 属正常保留)
	const leftover = html.match(/(?:src|href)="[^"]*\.\/(?:vendor|data)\//g);
	must(!leftover, '内联后仍有指向 vendor/data 的资源引用: ' + (leftover || []).join(', '));
}

const iconFiles = [];
const missingIcons = [];
for (const op of ops) {
	const name = '头像_' + op.干员 + '.png';
	if (fs.existsSync(path.join(SRC_ICON, name))) iconFiles.push(name);
	else missingIcons.push(op.干员);
}
must(!missingIcons.length, '缺少 ' + missingIcons.length + ' 张头像: ' + missingIcons.join(', '));

const usedClasses = [...new Set(ops.map((o) => o.职业))];
const unknownClasses = usedClasses.filter((c) => !CLASSES.includes(c));
must(!unknownClasses.length, '出现了未登记的职业: ' + unknownClasses.join(', '));
const missingClassIcons = usedClasses.filter((c) => !fs.existsSync(path.join(SRC_IMAGES, c + '.png')));
must(!missingClassIcons.length, '缺少职业图标: ' + missingClassIcons.join(', '));

if (problems.length) {
	console.error('[pack-rogue] 打包前检查未通过, 未改动任何产物:');
	for (const p of problems) console.error('  - ' + p);
	process.exit(1);
}

// ================================================================
// 第二阶段: 写入
// ================================================================
fs.rmSync(OUT_DIR, { recursive: true, force: true });
for (const d of ['icon', 'images']) fs.mkdirSync(path.join(OUT_DIR, d), { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, LAUNCHER), html, 'utf8');
for (const name of iconFiles) fs.copyFileSync(path.join(SRC_ICON, name), path.join(OUT_DIR, 'icon', name));
for (const c of usedClasses) fs.copyFileSync(path.join(SRC_IMAGES, c + '.png'), path.join(OUT_DIR, 'images', c + '.png'));
const iconCount = iconFiles.length;

// 不再生成「使用说明.txt」: 用法就是文件名本身, 规则/难度/禁用说明都做进了页面里的「📖 简要说明」

// ---------------------------------------------------------------- zip
const CRC_TABLE = (() => {
	const t = new Int32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[n] = c;
	}
	return t;
})();
const crc32 = (buf) => {
	let c = -1;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	return (c ^ -1) >>> 0;
};

const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

/** 递归收集包内文件（相对路径用 / 分隔） */
const walk = (dir, base = '') => {
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
		const rel = base ? base + '/' + e.name : e.name;
		if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel));
		else out.push(rel);
	}
	return out;
};

const files = walk(OUT_DIR);
const localParts = [];
const centralParts = [];
let offset = 0;

const entry = (name, data) => {
	const nameBuf = Buffer.from(name, 'utf8');
	const crc = crc32(data);
	let method = 0;
	let body = data;
	if (data.length > 0) {
		const deflated = zlib.deflateRawSync(data, { level: 9 });
		if (deflated.length < data.length) { method = 8; body = deflated; }
	}
	const local = Buffer.alloc(30);
	local.writeUInt32LE(0x04034b50, 0);
	local.writeUInt16LE(20, 4);
	local.writeUInt16LE(0x0800, 6);          // UTF-8 文件名
	local.writeUInt16LE(method, 8);
	local.writeUInt16LE(dosTime, 10);
	local.writeUInt16LE(dosDate, 12);
	local.writeUInt32LE(crc, 14);
	local.writeUInt32LE(body.length, 18);
	local.writeUInt32LE(data.length, 22);
	local.writeUInt16LE(nameBuf.length, 26);
	local.writeUInt16LE(0, 28);
	localParts.push(local, nameBuf, body);

	const central = Buffer.alloc(46);
	central.writeUInt32LE(0x02014b50, 0);
	central.writeUInt16LE(20, 4);
	central.writeUInt16LE(20, 6);
	central.writeUInt16LE(0x0800, 8);
	central.writeUInt16LE(method, 10);
	central.writeUInt16LE(dosTime, 12);
	central.writeUInt16LE(dosDate, 14);
	central.writeUInt32LE(crc, 16);
	central.writeUInt32LE(body.length, 20);
	central.writeUInt32LE(data.length, 24);
	central.writeUInt16LE(nameBuf.length, 28);
	central.writeUInt16LE(0, 30);            // extra
	central.writeUInt16LE(0, 32);            // comment
	central.writeUInt16LE(0, 34);            // disk
	central.writeUInt16LE(0, 36);            // internal attrs
	central.writeUInt32LE(0, 38);            // external attrs
	central.writeUInt32LE(offset, 42);
	centralParts.push(central, nameBuf);

	offset += local.length + nameBuf.length + body.length;
};

// 目录条目，便于解压工具直接还原层级
const dirs = [...new Set(files.map((f) => path.posix.dirname(f)).filter((d) => d !== '.'))].sort();
for (const d of dirs) entry(PKG_NAME + '/' + d + '/', Buffer.alloc(0));
for (const f of files) entry(PKG_NAME + '/' + f, fs.readFileSync(path.join(OUT_DIR, f)));

const centralBuf = Buffer.concat(centralParts);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(dirs.length + files.length, 8);
eocd.writeUInt16LE(dirs.length + files.length, 10);
eocd.writeUInt32LE(centralBuf.length, 12);
eocd.writeUInt32LE(offset, 16);
eocd.writeUInt16LE(0, 20);

fs.writeFileSync(ZIP_PATH, Buffer.concat([...localParts, centralBuf, eocd]));

// ---------------------------------------------------------------- 汇总
const bytes = (p) => {
	const st = fs.statSync(p);
	return st.isDirectory() ? walk(p).reduce((s, f) => s + fs.statSync(path.join(p, f)).size, 0) : st.size;
};
console.log('[pack-rogue] 完成');
console.log('  目录 : ' + path.relative(ROOT, OUT_DIR));
console.log('  压缩包: ' + path.relative(ROOT, ZIP_PATH) + '  (' + (fs.statSync(ZIP_PATH).size / 1048576).toFixed(1) + ' MB)');
console.log('  启动 : ' + LAUNCHER + '（' + Math.round(Buffer.byteLength(html, 'utf8') / 1024) + ' KB，已内联 Vue 与干员数据）');
console.log('  顶层 : ' + fs.readdirSync(OUT_DIR).sort().join('  |  '));
console.log('  干员 : ' + ops.length + ' 名, 头像 ' + iconCount + ' 张, 职业图标 ' + usedClasses.length + ' 个');
console.log('  解压后: ' + (bytes(OUT_DIR) / 1048576).toFixed(1) + ' MB, 文件 ' + files.length + ' 个');
