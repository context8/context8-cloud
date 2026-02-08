# Context8 Cloud 前端

## 关键约束
- 必须配置 `VITE_API_BASE` 指向后端 base URL
- 后端不可用时页面仍渲染，但登录/API Key/保存/搜索会失败

## 本地开发
- 安装依赖：`bun install --frozen-lockfile`
- 准备环境：`cp .env.local.example .env.local`
- 启动：`bun run dev`

## 构建与预览
- 构建：`bun run build`
- 本地预览：`bun run start`（等价于 `node .output/server/index.mjs`）

## 部署约束（Vercel）
- Framework 选 `Other`，Build 命令 `bun run build`
- 需要设置 `VITE_API_BASE`
