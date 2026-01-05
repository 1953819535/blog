# Blog 项目快速指南

> NestJS (后端) + Nuxt 3 (前端) 的博客系统 | Monorepo (pnpm workspace)

## 🏗️ 项目结构

```
blog/
├── apps/api/          # NestJS 后端 API
├── apps/web/          # Nuxt 3 前端
└── packages/prisma/   # Prisma ORM (共享)
```

---

## 🔧 后端 (apps/api)

**技术栈**: NestJS + Prisma + PostgreSQL + Redis + JWT + Passport + Cloudflare R2

### 核心模块

```
src/
├── modules/
│   ├── auth/          # 认证模块 (Passport JWT + Local)
│   │   ├── strategies/       # jwt.strategy.ts, local.strategy.ts
│   │   ├── guards/           # jwt-auth.guard.ts, local-auth.guard.ts
│   │   └── auth.service.ts   # 登录、注册、验证码
│   ├── users/         # 用户模块
│   │   ├── types/user.types.ts  # SafeUser (不含密码)
│   │   └── users.service.ts     # CRUD + 密码验证
│   ├── r2/            # 文件存储 (Cloudflare R2)
│   ├── email/         # 邮件服务 (Resend)
│   ├── redis/         # Redis 缓存
│   └── prisma/        # Prisma 服务
└── common/            # 公共模块
    ├── decorators/    # @CurrentUser(), @Public()
    ├── guards/        # LocalOnlyGuard (开发环境限制)
    ├── filters/       # 全局异常过滤器
    └── interceptors/  # 响应转换 (统一格式)
```

### API 路由

```
POST /api/auth/register                    # 注册
POST /api/auth/send-login-verification     # 发送登录验证码
POST /api/auth/login-with-pwd              # 密码登录 (Passport)
POST /api/auth/login-with-code             # 验证码登录
GET  /api/users/profile                    # 获取当前用户
PATCH /api/users/profile                   # 更新用户信息
POST /api/r2/presigned-url                 # 获取上传 URL
```

### 认证流程

**Passport 实现**:
- `LocalStrategy`: 邮箱密码验证
- `JwtStrategy`: JWT 验证 (每次请求查数据库验证用户状态)
- `JwtAuthGuard`: 全局守卫 (支持 `@Public()` 跳过)

**登录响应**:
```typescript
{
  access_token: "jwt_token",
  user: {  // SafeUser (完整信息，不含密码)
    id, email, nickname, isActive, createdAt, updatedAt,
    profile: { avatar, bio },
    roles: [...]
  }
}
```

---

## 🎨 前端 (apps/web)

**技术栈**: Nuxt 3 + Vue 3 + TypeScript + 自定义 CSS

### 核心文件

```
apps/web/
├── pages/
│   ├── index.vue      # 首页
│   ├── login.vue      # 登录 (密码/验证码)
│   └── register.vue   # 注册
├── composables/
│   └── useAuth.ts     # 认证状态管理 (全局)
├── plugins/
│   └── auth.client.ts # 启动时读取 localStorage
├── api/
│   ├── auth.ts        # 登录、注册 API
│   └── user.ts        # 用户 API
├── types/
│   └── api.ts         # API 类型定义
└── utils/
    └── api.ts         # 请求封装 (自动加 token)
```

### 认证状态

**useAuth.ts**:
```typescript
interface AuthState {
  isLoggedIn: boolean
  userInfo: UserInfo | null  // 完整用户信息
}

// 方法
setAuth(token, userInfo)  // 登录
clearAuth()               // 退出
getToken()                // 获取 token
```

**存储**: `localStorage.token` + `localStorage.userInfo`

### 登录流程

```
1. 输入邮箱密码 → POST /api/auth/login-with-pwd
2. 后端返回 { access_token, user }
3. setAuth(access_token, user)  // 保存到状态 + localStorage
4. navigateTo('/')
```

---

## 🗄️ 数据库 (packages/prisma)

### 数据模型

```
User (用户)
├── id, email, password, nickname, isActive
├── profile (1:1) → Profile
└── roles (1:N) → UserRole

Profile (用户资料)
└── avatar, bio

Role (角色)
└── id, name, description

UserRole (用户角色关联)
└── userId, roleId
```

### 类型使用

```typescript
import { User, Profile, Prisma } from '@my/prisma'

// SafeUser: 不含密码的完整用户信息
type SafeUser = Omit<
  Prisma.UserGetPayload<{ include: { profile: true, roles: true } }>,
  'password'
>
```

---

## 🔑 环境变量

**后端** (.env):
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="secret"
REDIS_HOST="localhost"
RESEND_API_KEY="re_..."
R2_ACCOUNT_ID="..."
```

**前端** (.env):
```env
NUXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
```

---

## 🚀 启动

```bash
pnpm install       # 安装依赖
pnpm db:gen        # 生成 Prisma Client
pnpm db:push       # 同步数据库
pnpm dev           # 启动前后端
```

---

## 💡 关键设计

1. **登录返回完整用户信息** - 避免二次请求 `/users/profile`
2. **JwtStrategy 查数据库** - 实时验证用户状态 (安全优先)
3. **SafeUser 统一类型** - 前后端共享，密码永不泄露
4. **响应统一包装** - 所有接口返回相同格式 (`{ code, message, data }`)
5. **文件上传流程** - 前端获取预签名 URL → 直接传 R2 → 后端确认

---

**项目版本**: 1.0.0 | **最后更新**: 2026-01-05
