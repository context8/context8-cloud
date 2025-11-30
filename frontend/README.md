<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Context8 CLI Frontend

Minimal UI for Context8 cloud：邮箱验证码登录 → 生成 API Key → 保存/搜索 solutions。

## 配置
1) `npm install`
2) `.env.local`：
```
VITE_API_BASE=http://localhost:8000   # 或你的部署地址
```

## 运行
```
npm run dev
```
浏览器打开 `http://localhost:5173`。

## 使用流程
1) 输入邮箱，点击“发送验证码”
2) 输入验证码，点击“校验并登录”（会保存 JWT）
3) 可选：创建 API Key，后续用 `X-API-Key` 访问
4) 在 “保存 Solution” 中填写必填字段，提交后会写入当前用户的 solutions
5) “搜索” 区域按关键字搜索个人 solutions（向量优先，失败回退关键词）
