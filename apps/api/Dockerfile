# API Dockerfile
# 多阶段构建，减小镜像体积

# 阶段1: 构建
FROM node:22-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制根配置文件
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.json ./

# 复制 prisma 包
COPY packages/prisma ./packages/prisma

# 复制 api 应用
COPY apps/api ./apps/api

# 安装依赖
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client
RUN pnpm --filter @my/prisma generate

# 构建 API
RUN pnpm --filter api build

# 阶段2: 生产镜像
FROM node:22-alpine AS production

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制必要文件
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/prisma ./packages/prisma
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3010

# 暴露端口
EXPOSE 3010

# 启动命令
CMD ["node", "apps/api/dist/main.js"]