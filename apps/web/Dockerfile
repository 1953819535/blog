# Web Dockerfile
# 多阶段构建，Nuxt SSR

# 阶段1: 依赖安装
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/prisma ./packages/prisma
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @my/prisma generate

# 阶段2: 构建
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/prisma/node_modules ./packages/prisma/node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/prisma ./packages/prisma
COPY apps/web ./apps/web

ENV NUXT_PUBLIC_API_BASE_URL=http://api:3010/api

RUN pnpm --filter web build

# 阶段3: 生产镜像
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/apps/web/.output ./.output

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3020

EXPOSE 3020

CMD ["node", ".output/server/index.mjs"]