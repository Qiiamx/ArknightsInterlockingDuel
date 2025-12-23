#!/usr/bin/env bash
# 一键部署：拉代码 → 装依赖 → 打包 → 重启 pm2
cd "$(dirname "$0")" || exit
set -e          # 任何一步报错就停止
APP_DIR="aid"
NODE_MIN_MAJOR=20          # 最低 Node 大版本
REPO_URL="https://github.com/Qiiamx/ArknightsInterlockingDuel.git"  # 你的仓库地址
# 颜色辅助
RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# 1. 检查 Git node npm pm2
for cmd in git node npm pm2; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "$cmd 未安装或不在 PATH 中，请先安装"
    exit 1
  fi
done

# 2. 检查 Node 版本
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt "$NODE_MIN_MAJOR" ]; then
  log_error "Node 版本过低（当前 $(node -v)，需要 ≥${NODE_MIN_MAJOR}）"; exit 1;
fi

if [[ ! -d "$APP_DIR" ]]; then
  log_info "目录不存在，首次克隆仓库"
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"
log_info "环境检查通过，开始部署…"
if [[ ! -d .git ]]; then
  log_info "目录非仓库，重新克隆"
  cd ..
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
else
  log_info "拉取最新代码"
  git pull
fi
echo "安装/更新前端依赖"
cd ui
npm i

echo "构建前端（输出到 ../dist）"
npm run build

echo "安装/更新后端依赖"
cd ..
npm i

echo "重启 Node 服务"
# 如果第一次启动用 start，以后用 reload 可实现 0 秒中断
if pm2 list | grep -q run; then
  pm2 reload run.js --update-env
else
  pm2 start  run.js --name run
fi

echo "7. 保存 pm2 列表（开机自启）"
pm2 save

echo "✅ 部署完成"
