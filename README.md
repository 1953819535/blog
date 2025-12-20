# Blog Project

这是一个基于 pnpm 工作区的 monorepo 项目，包含 NestJS API 应用和 Nuxt Web 应用。

## 项目结构

```
.
├── apps/
│   ├── api/         # NestJS 后端 API 服务
│   └── web/         # Nuxt 前端应用
├── packages/
│   └── prisma/      # Prisma 数据库客户端和模型定义
├── package.json     # 根级项目配置和脚本
└── pnpm-workspace.yaml  # pnpm 工作区配置
```

## 环境要求

- Node.js >= 18
- pnpm >= 8
- PostgreSQL 数据库

## 安装依赖

```bash
pnpm install
```

这将自动安装所有工作区包的依赖，并运行 Prisma 客户端生成。

## 数据库设置

1. 确保 PostgreSQL 数据库正在运行
2. 在 [packages/prisma/.env](file:///e:/learn/blog/packages/prisma/.env) 文件中配置数据库连接字符串
3. 推送数据库模式：

```bash
pnpm run db:push
```

## 开发模式

### 同时启动 API 和 Web 应用

```bash
pnpm run dev
```

这将在开发模式下同时启动后端 API 和前端 Web 应用。

### 单独启动应用

仅启动 API 应用：

```bash
pnpm run dev:api
```

仅启动 Web 应用：

```bash
pnpm run dev:web
```

### 访问应用

- Web 应用: http://localhost:3000
- API 应用: http://localhost:3001

## 构建项目

```bash
pnpm run build
```

这将为所有工作区应用执行构建过程。

## 其他命令

生成 Prisma 客户端：

```bash
pnpm run db:gen
```

该命令会根据 Prisma schema 重新生成客户端代码。