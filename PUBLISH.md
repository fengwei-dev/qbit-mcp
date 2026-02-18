# npm 发布指南

本项目已准备好发布到 npm。请按照以下步骤操作。

## 前置条件

1. 有一个 [npm 账户](https://www.npmjs.com/signup)（如果还没有的话）
2. 本地已登录 npm: `npm login`（如果是第一次发布）
3. 项目已使用 `npm run build` 编译

## 发布前检查

确保以下条件都满足：

```bash
# 1. 验证项目编译成功
npm run build

# 2. 检查 dist 目录是否存在且包含文件
ls dist/

# 3. 检查 git 状态（应该没有未提交的更改）
git status
```

## 发布步骤

### 1. 首次发布前的检查

如果这是首次发布到 npm，运行：

```bash
npm login

# 输入用户名、密码和验证码
```

验证登录状态：

```bash
npm whoami
```

### 2. 发布到 npm

```bash
# 方式 1：简单发布
npm publish --access=public

# 方式 2：使用 OTP (如果启用了两因素认证)
npm publish --access=public --otp=123456

# 说明: 作用域包 (@nas-mcps/qbit-mcp) 发布时需要 --access=public
```

### 3. 验证发布成功

```bash
# 检查 npm 包的最新版本
npm view @nas-mcps/qbit-mcp

# 或者访问在线页面
# https://www.npmjs.com/package/@nas-mcps/qbit-mcp
```

## 版本管理

### 更新版本号

编辑 `package.json` 中的 `version` 字段，然后：

```bash
# 自动更新版本（推荐）
npm version patch    # v0.1.0 -> v0.1.1 (修复)
npm version minor    # v0.1.0 -> v0.2.0 (新功能)
npm version major    # v0.1.0 -> v1.0.0 (破坏性变更)

# 这会自动：
# 1. 更新 package.json 版本
# 2. 创建 git 标签
# 3. 提交更改
```

### 手动更新版本

```bash
# 编辑 package.json
# 然后提交和创建标签
git add package.json
git commit -m "Bump version to 0.2.0"
git tag -a v0.2.0 -m "Release version 0.2.0"
git push origin main --tags
```

## 发布约定

### Semantic Versioning (SemVer)

遵循 [SemVer 2.0.0](https://semver.org/):

- **MAJOR** (X.0.0): 破坏性API变更
- **MINOR** (0.X.0): 向后兼容的新功能
- **PATCH** (0.0.X): 向后兼容的修复

### 提交信息约定

使用 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码风格 (不影响功能)
refactor: 代码重构
test: 测试相关
chore: 其他更改
```

## 包内容验证

发布前检查包的内容：

```bash
# 查看将要发布的文件
npm pack --dry-run

# 或者
tar -tzf qbit-mcp-0.1.0.tgz
```

## 常见问题

### Q: 发布时出现 "You must be logged in" 错误

A: 运行 `npm login` 重新登录

### Q: 出现 "403 Forbidden" 错误

A: 检查包名是否已被使用，或者登录的用户是否有权限发布

### Q: 需要发布新的主版本时怎么办？

A: 运行 `npm version major`，然后 `npm publish`

## 发布后的步骤

1. 创建 GitHub Release（可选）
   - 访问 https://github.com/fengwei-dev/qbit-mcp/releases
   - 点击 "New Release"
   - 选择标签 (e.g., v0.1.0)
   - 添加发布说明

2. 更新 README（可选）
   - 更新"安装"部分的版本号

3. 宣传（可选）
   - 分享到社区、Twitter 等

## 取消发布 (如果需要)

```bash
# 删除最新版本的具体版本（需要小心）
npm unpublish qbit-mcp@0.1.0 --force

# 或者弃用一个版本（推荐）
npm deprecate qbit-mcp@0.1.0 "This version is deprecated"
```

## 安装发布的包

发布后，用户可以通过以下方式安装：

```bash
npm install @nas-mcps/qbit-mcp

# 或使用全局安装
npm install -g @nas-mcps/qbit-mcp

# 或在项目中使用
npm install --save @nas-mcps/qbit-mcp
```

## 更多资源

- [npm 官方发布指南](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
- [npm CLI 命令](https://docs.npmjs.com/cli/v8/commands)
- [npm 安全最佳实践](https://docs.npmjs.com/about-npm/security)
