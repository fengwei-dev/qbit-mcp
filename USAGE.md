# qBittorrent MCP Server - Usage Examples

这个文档展示如何使用 qBittorrent MCP Server 的各个工具和资源。

## 前置条件

1. qBittorrent 应用正在运行且可访问
2. MCP 服务器已编译并可用
3. 在 Claude 或其他 MCP 客户端中配置好核心

## 可用工具

### 1. list_torrents - 列出所有 Torrent

列出所有 torrent，支持按状态筛选。

**参数：**
- `filter` (可选): all, downloading, seeding, completed, paused, stopped, stalled, checking, error

**示例：**
```
获取所有下载中的 torrent
获取所有已暂停的 torrent
列出完成的 torrent
```

### 2. get_torrent_details - 获取 Torrent 详情

获取特定 torrent 的详细信息。

**参数：**
- `hash` (必需): Torrent 的哈希值

**示例：**
```
获取 hash 为 abc123 的 torrent 详情
```

### 3. add_torrent - 添加新 Torrent

从 URL 或磁力链接添加新 torrent。

**参数：**
- `urls` (必需): URL 或磁力链接数组
- `category` (可选): 分类名称
- `tags` (可选): 标签数组
- `paused` (可选): 是否暂停启动
- `savepath` (可选): 保存路径

**示例：**
```
添加 magnet:?xt=urn:btih:abc123
添加 torrent，设置分类为 "movies"，标签为 ["4k", "hd"]
添加暂停状态的 torrent
```

### 4. remove_torrent - 删除 Torrent

删除 torrent。

**参数：**
- `hash` (必需): Torrent 的哈希值
- `delete_files` (可选): 是否同时删除文件

**示例：**
```
删除 hash 为 abc123 的 torrent
删除 torrent 并删除文件
```

### 5. pause_torrent - 暂停 Torrent

暂停一个 torrent。

**参数：**
- `hash` (必需): Torrent 的哈希值

**示例：**
```
暂停 hash 为 abc123 的 torrent
```

### 6. resume_torrent - 恢复 Torrent

恢复一个暂停的 torrent。

**参数：**
- `hash` (必需): Torrent 的哈希值

**示例：**
```
恢复 hash 为 abc123 的 torrent
```

### 7. get_app_state - 获取应用状态

获取 qBittorrent 应用的当前状态。

**示例：**
```
获取 qBittorrent 的当前状态
```

### 8. set_torrent_category - 设置 Torrent 分类

为 torrent 设置分类。

**参数：**
- `hash` (必需): Torrent 的哈希值
- `category` (必需): 分类名称

**示例：**
```
将 torrent 分类设置为 "movies"
```

### 9. get_categories - 获取所有分类

获取所有可用的 torrent 分类。

**示例：**
```
列出所有分类
```

### 10. get_tags - 获取所有标签

获取所有可用的 torrent 标签。

**示例：**
```
列出所有标签
```

## 可用资源

### 1. qbittorrent://torrents/all

获取所有 torrent 的完整列表（JSON 格式）。

### 2. qbittorrent://app/state

获取应用当前状态（JSON 格式）。

### 3. qbittorrent://categories

获取所有分类（JSON 格式）。

### 4. qbittorrent://tags

获取所有标签（JSON 格式）。

## 常见用途

### 监控下载进度

1. 使用 `list_torrents` 查看所有下载中的 torrent
2. 使用 `get_torrent_details` 获取特定 torrent 的详细进度

### 批量管理 Torrent

1. 使用 `list_torrents` 按状态筛选
2. 使用 `set_torrent_category` 或 `remove_torrent` 进行管理

### 监控应用状态

使用 `get_app_state` 根据全局速度和其他指标做出决策

### 自动化下载流程

1. 使用 `add_torrent` 添加新下载
2. 使用 `set_torrent_category` 自动分类
3. 使用资源获取完整的统计数据

## 最佳实践

1. **使用分类和标签组织** - 通过分类和标签更好地管理 torrent
2. **定期检查应用状态** - 监控速度和提示潜在问题
3. **使用过滤器** - list_torrents 的过滤器可以减少数据量
4. **检查详情再删除** - 使用 get_torrent_details 确认删除
5. **智能调度** - 根据应用状态决定何时添加新任务

## 错误处理

所有工具都会在错误时返回错误消息。常见错误：

- **连接错误** - 检查 QBIT_URL 和网络连接
- **认证错误** - 检查 QBIT_USERNAME 和 QBIT_PASSWORD
- **不存在的 torrent** - 确认 hash 是否正确
- **API 限制** - 等待一段时间后重试
