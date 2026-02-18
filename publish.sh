#!/bin/bash

# qBittorrent MCP Server - Quick npm Publish Script
# 快速发布到 npm 的脚本

set -e

echo "════════════════════════════════════════════════════════"
echo "   qBittorrent MCP Server - npm 快速发布"
echo "════════════════════════════════════════════════════════"
echo ""

# 检查 npm 登录状态
echo "📋 检查 npm 登录状态..."
if ! npm whoami > /dev/null 2>&1; then
  echo "❌ 未登录 npm，请先登录："
  echo "   npm login"
  exit 1
fi

echo "✅ 已登录 npm 用户: $(npm whoami)"
echo ""

# 检查 git 状态
echo "📋 检查 git 状态..."
if ! git diff-index --quiet HEAD --; then
  echo "❌ 有未提交的更改，请先提交："
  echo "   git add -A && git commit -m 'Your message'"
  exit 1
fi

echo "✅ git 工作区干净"
echo ""

# 构建项目
echo "🔨 构建项目..."
npm run build
echo "✅ 构建成功"
echo ""

# 显示当前版本
current_version=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "📦 当前版本: $current_version"
echo ""

# 发布
echo "🚀 开始发布到 npm..."
echo ""

read -p "确认发布到 npm (y/n)? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # 作用域包需要 --access=public
  npm publish --access=public
  echo ""
  echo "✅ 发布成功！"
  echo ""
  echo "📚 查看包信息:"
  echo "   npm view @nasmcps/qbit-mcp"
  echo ""
  echo "🌐 在线查看:"
  echo "   https://www.npmjs.com/package/@nasmcps/qbit-mcp"
  echo ""
else
  echo "❌ 取消发布"
  exit 1
fi
