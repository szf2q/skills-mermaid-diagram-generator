#!/usr/bin/env bash
# Mermaid 渲染入口：转发所有参数给 render-mermaid.mjs
# 用法：bash scripts/render.sh <文件或目录...> [选项]
set -euo pipefail

# 定位脚本所在目录，保证从任意工作目录调用都能找到 Node 脚本
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "错误：未找到 Node.js，请先安装 Node.js 18+" >&2
  exit 1
fi

exec node "${SCRIPT_DIR}/render-mermaid.mjs" "$@"
