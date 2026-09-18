#!/usr/bin/env node
/**
 * 打包「肉鸽随机干员选取器」为解压即用的离线包。
 *
 * 用法: node tools/pack-rogue.js
 * 产出:
 *   release/肉鸽随机干员选取器/        解压后可直接双击 index.html
 *   release/肉鸽随机干员选取器.zip     用于分享的压缩包
 *
 * 设计要点:
 * - 页面已改为相对路径, 因此同一份 rogue.html 在 dev / 生产 / 本地文件三种场景下都成立。
 * - 干员数据内联为 window.__ROGUE_OPS__: 浏览器禁止 file:// 下的 fetch, 不内联则双击打开必然白屏。
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
const RELEASE = path.join(ROOT, 'release');
const OUT_DIR = path.join(RELEASE, PKG_NAME);
const ZIP_PATH = path.join(RELEASE, PKG_NAME + '.zip');
const CLASSES = ['先锋', '近卫', '重装', '狙击', '术师', '医疗', '辅助', '特种'];

const problems = [];
const must = (cond, msg) => { if (!cond) problems.push(msg); };

// ---------------------------------------------------------------- 准备
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT_DIR, 'vendor'), { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, 'data'), { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, 'icon'), { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, 'images'), { recursive: true });

// ---------------------------------------------------------------- 页面
let html = fs.readFileSync(SRC_HTML, 'utf8');

// 1) 注入离线数据脚本（必须在页面主脚本之前执行）
const ANCHOR = '<script>\nconst { createApp';
must(html.indexOf(ANCHOR) >= 0, '未找到页面主脚本锚点, rogue.html 结构可能已变');
html = html.replace(ANCHOR, '<script src="./data/operators.js"></script>\n<script>\nconst { createApp');

// 2) 离线包内不允许存在绝对路径, 否则双击打开时资源全部 404
const abs = html.match(/(?:src|href)="\/[^"]*"|['"]\/(?:icon|images|data|vendor)\//g);
must(!abs, '页面中仍存在绝对资源路径: ' + (abs || []).join(', '));

fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html, 'utf8');

// ---------------------------------------------------------------- 数据
const ops = JSON.parse(fs.readFileSync(SRC_DATA, 'utf8'));
must(Array.isArray(ops) && ops.length > 0, 'operators.json 解析失败或为空');
fs.writeFileSync(
	path.join(OUT_DIR, 'data', 'operators.js'),
	'window.__ROGUE_OPS__ = ' + JSON.stringify(ops) + ';\n',
	'utf8'
);

// ---------------------------------------------------------------- 资源
fs.copyFileSync(SRC_VENDOR, path.join(OUT_DIR, 'vendor', 'vue.global.prod.js'));

let iconCount = 0;
const missingIcons = [];
for (const op of ops) {
	const name = '头像_' + op.干员 + '.png';
	const src = path.join(SRC_ICON, name);
	if (!fs.existsSync(src)) { missingIcons.push(op.干员); continue; }
	fs.copyFileSync(src, path.join(OUT_DIR, 'icon', name));
	iconCount++;
}
must(!missingIcons.length, '缺少头像: ' + missingIcons.slice(0, 10).join(', '));

const usedClasses = [...new Set(ops.map((o) => o.职业))];
const missingClass = usedClasses.filter((c) => !CLASSES.includes(c));
must(!missingClass.length, '出现了未登记的职业: ' + missingClass.join(', '));
for (const c of usedClasses) {
	const src = path.join(SRC_IMAGES, c + '.png');
	if (!fs.existsSync(src)) { problems.push('缺少职业图标: ' + c); continue; }
	fs.copyFileSync(src, path.join(OUT_DIR, 'images', c + '.png'));
}

// ---------------------------------------------------------------- 说明
fs.writeFileSync(
	path.join(OUT_DIR, '使用说明.txt'),
	[
		'肉鸽随机干员选取器 · 离线版',
		'================================================',
		'',
		'【怎么用】',
		'  1. 解压本压缩包',
		'  2. 双击 index.html（推荐 Chrome / Edge / 火狐）',
		'  3. 全程不需要联网，也不需要安装任何东西',
		'',
		'【怎么玩】',
		'  · 开局：选 3 个职业 → 点「开始招募」→ 从 9 名六星里选 1 名',
		'  · 之后：点下方招募券继续抽，点击干员头像即完成招募',
		'  · 按 Esc：从当前候选中随机选 1 名（招募券会优先随到五星）',
		'  · 「新的一局」会清空当前进度，点击时会二次确认',
		'',
		'【文件说明】',
		'  index.html              页面本体',
		'  data/operators.js       干员数据（内联，供双击打开时读取）',
		'  vendor/                 Vue 运行时',
		'  icon/                   干员头像 ' + iconCount + ' 张',
		'  images/                 职业图标 ' + usedClasses.length + ' 个',
		'',
		'【注意】',
		'  · 本包是打包时的干员数据快照；仓库新增干员后需重新打包。',
		'  · 进度只保存在页面内，刷新或关闭会清空。',
		'  · 请保持目录结构不变，移动 index.html 会导致头像和职业图标加载不出来。',
		'',
	].join('\r\n'),
	'utf8'
);

if (problems.length) {
	console.error('[pack-rogue] 打包前检查未通过:');
	for (const p of problems) console.error('  - ' + p);
	process.exit(1);
}

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
console.log('  干员 : ' + ops.length + ' 名, 头像 ' + iconCount + ' 张, 职业图标 ' + usedClasses.length + ' 个');
console.log('  解压后: ' + (bytes(OUT_DIR) / 1048576).toFixed(1) + ' MB, 文件 ' + files.length + ' 个');
