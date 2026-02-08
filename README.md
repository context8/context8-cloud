# Context8 Cloud 前端（TanStack Start）

本仓库是 Context8 Cloud 的 TanStack Start + React 前端代码。

注意：后端服务 **不在** 本仓库中。你必须提供一个兼容的 API 服务，并通过 `VITE_API_BASE` 告诉前端后端的 base URL。

## 快速开始（本地开发）
```bash
bun install --frozen-lockfile
cp .env.local.example .env.local
bun run dev
```

默认打开 `http://localhost:3000`（如果端口被占用，以终端输出为准）。

## 构建与本地预览
```bash
bun run build
bun run start
```

说明：`bun run start` 等价于运行 `node .output/server/index.mjs`（见 `package.json` 脚本配置）。

## 配置
将 `VITE_API_BASE` 设置为你的后端 base URL（例如 `http://localhost:8000`）。

如果后端没启动（或 URL 配错了），页面仍会渲染，但登录 / API Key 管理 / 保存 / 搜索等功能会失败。

## 部署（Vercel）

### 1）导入仓库
- 在 Vercel 新建 Project → Import Git Repository → 选择本仓库
- Root Directory：选择仓库根目录（重点：不是 `frontend/`，旧目录已移除）

### 2）配置环境变量
- Project Settings → Environment Variables
- 添加 `VITE_API_BASE`
  - Production / Preview / Development 是否都加：按你的环境需求决定（不确定就全加）

### 3）Build & Development Settings（推荐）
- Framework Preset：`Other`
- Install Command：`bun install --frozen-lockfile`（如果 Vercel 没自动识别 bun）
- Build Command：`bun run build`
- Output Directory：留空
  - 说明：TanStack Start 通过 Nitro 产出 Vercel 需要的 `.vercel/output`，不需要手动填写 `dist`

### 4）部署验证
- 部署完成后访问 `/`、`/learn`，确认页面不白屏
- `/login`、`/dashboard/*` 依赖后端可用；如果看到 `fetch failed` / 401 等，优先检查后端地址与鉴权（这不是前端构建问题）

### 常见坑位（先看这个能省很多时间）
- `VITE_API_BASE` 缺失或写错：前端会报 `fetch failed` / `ERR_CONNECTION_REFUSED`
- 后端未配置 CORS：浏览器请求会被拦截（需要后端放行 Vercel 域名）
- 想在本地模拟 Vercel 打包：可用 `VERCEL=1 bun run build`（用于触发 Nitro 的 `preset: vercel`）

## 部署（Cloudflare Workers）

本项目使用 Nitro 产出可部署到 Cloudflare Workers 的产物。

### 1）配置环境变量
- 在 Cloudflare Worker 的 Variables/Secrets 里添加：
  - `VITE_API_BASE`：你的后端 base URL
  - `NITRO_PRESET=cloudflare-module`：让构建产出 Workers 需要的 server 产物

说明：`VITE_API_BASE` 属于 `VITE_` 前缀变量，会在构建期注入到前端 bundle；因此要确保它在 Cloudflare 的 build 环境中可见。

### 2）Build / Deploy 命令（对应你截图的页面）
- 构建命令：`bun run build`
- 部署命令：`npx wrangler deploy`

仓库根目录已提供 `wrangler.toml`（入口 `.output/server/index.mjs`，静态资源 `.output/public`）。

### 3）本地验证（可选）
```bash
NITRO_PRESET=cloudflare-module bun run build
npx wrangler deploy --dry-run
```

## 后端依赖（高层 API 合约）
前端至少依赖后端提供以下路由：

**Auth**
- `POST /auth/email/send-code`
- `POST /auth/email/verify-code`

**API keys**
- `GET /apikeys`
- `POST /apikeys`
- `PATCH /apikeys/{id}`
- `DELETE /apikeys/{id}`
- `GET /apikeys/stats`

**Solutions & search**
- `GET /solutions`
- `POST /solutions`
- `GET /solutions/{id}`
- `PATCH /solutions/{id}`
- `DELETE /solutions/{id}`
- `GET /solutions/{id}/es` (optional)
- `GET /solutions/count`
- `POST /search`
- `POST /solutions/{id}/vote`
- `DELETE /solutions/{id}/vote`

**Stats**
- `GET /stats/solutions`

请求根据功能会携带 `Authorization: Bearer <jwt>` 或 `X-API-Key: <key>`（多 Key 搜索会用 `X-API-Keys: k1,k2,...`）。
