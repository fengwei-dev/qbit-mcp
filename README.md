# qBittorrent MCP Server

一个基于 Model Context Protocol (MCP) 的 qBittorrent 控制服务器。允许通过 MCP 客户端（如 Claude）与 qBittorrent 应用交互。

## 功能特性

### 工具 (Tools)
- **list_torrents** - 列出所有 torrent，支持按状态筛选
- **get_torrent_details** - 获取单个 torrent 的详细信息
- **add_torrent** - 从 URL 或磁力链接添加新 torrent
- **remove_torrent** - 删除 torrent（可选删除文件）
- **pause_torrent** - 暂停 torrent 下载
- **resume_torrent** - 恢复 torrent 下载
- **set_torrent_category** - 设置 torrent 的分类
- **get_categories** - 获取所有可用分类
- **get_tags** - 获取所有可用标签
- **get_app_state** - 获取 qBittorrent 应用状态

### 资源 (Resources)
- **qbittorrent://torrents/all** - 所有 torrent 的完整列表
- **qbittorrent://app/state** - 应用当前状态
- **qbittorrent://categories** - 所有分类
- **qbittorrent://tags** - 所有标签

## 安装

1. 克隆仓库：
```bash
git clone <repo-url>
cd qbit-mcp
```

2. 安装依赖：
```bash
npm install
```

3. 编译 TypeScript：
```bash
npm run build
```

## 配置

通过环境变量配置 qBittorrent 连接：

```bash
# qBittorrent Web UI 地址 (默认值: http://localhost:8080)
export QBIT_URL=http://localhost:8080

# qBittorrent Web UI 用户名 (默认值: admin)
export QBIT_USERNAME=admin

# qBittorrent Web UI 密码 (默认值: adminPassword)
export QBIT_PASSWORD=adminPassword
```

## 使用

### 直接运行

```bash
npm run dev
```

### 在 Claude/Claude.ai 中使用

在 Claude 设置中添加此 MCP 服务器：

```json
{
  "name": "qbit-mcp",
  "command": "node",
  "args": ["/path/to/qbit-mcp/dist/index.js"],
  "env": {
    "QBIT_URL": "http://localhost:8080",
    "QBIT_USERNAME": "admin",
    "QBIT_PASSWORD": "adminPassword"
  }
}
```

## 开发

### 项目结构

```
src/
├── index.ts           # MCP 服务器主入口
├── qbittorrent.ts    # qBittorrent API 客户端
└── __tests__/        # 测试文件
```

### 构建

```bash
npm run build
```

### 运行

```bash
npm start
```

## 依赖

- `@modelcontextprotocol/sdk` - MCP SDK
- `axios` - HTTP 客户端
- `typescript` - TypeScript 编译器

## 许可证

MIT
