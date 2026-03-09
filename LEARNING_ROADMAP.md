# 学习路线 & 项目待完善清单

> 基于当前项目（Nuxt + NestJS + Prisma + PostgreSQL + Redis）的实践导向学习路线

---

## 项目现状

| 模块 | 完成度 | 说明 |
|------|--------|------|
| API 后端模块 | ✅ 完整 | auth/post/category/tag/user/r2/email/redis 均已实现 |
| 数据库设计 | ✅ 完整 | Prisma schema 设计合理，关系完整 |
| 前端基础页面 | ⚠️ 部分 | 仅有首页、登录、注册、忘记密码、文章详情 |
| 测试 | ❌ 缺失 | 只有空壳 spec 文件，无实际测试逻辑 |
| 管理后台 | ❌ 缺失 | 无文章管理、分类管理、标签管理页面 |
| Docker 部署 | ❌ 缺失 | 无 Dockerfile 和 docker-compose |
| CI/CD | ❌ 缺失 | 无 GitHub Actions 配置 |
| Redis 缓存策略 | ⚠️ 部分 | 仅用于 auth 验证码，未用于内容缓存 |

---

## 阶段一：补全前端功能（最直接的成就感）

**目标：让博客真正可用**

### 1.1 管理后台页面

需要新增的页面：

```
apps/web/pages/
├── admin/
│   ├── index.vue          # 仪表盘（文章数、访问量等统计）
│   ├── posts/
│   │   ├── index.vue      # 文章列表（含草稿）
│   │   ├── create.vue     # 新建文章
│   │   └── [id]/edit.vue  # 编辑文章
│   ├── categories/
│   │   └── index.vue      # 分类管理
│   └── tags/
│       └── index.vue      # 标签管理
└── profile.vue            # 用户个人资料
```

**学习重点：**
- Nuxt 路由守卫（`definePageMeta` + middleware）
- 权限控制（只有管理员能访问 `/admin`）
- Markdown 编辑器集成（推荐 `@vueup/vue-quill` 或 `milkdown`）

### 1.2 补全 Composables

当前只有 `useAuth`，需要补充：

```typescript
// 参考 useAuth 的写法，新增：
composables/usePost.ts      // 文章的 CRUD 操作
composables/useCategory.ts  // 分类操作
composables/useTag.ts       // 标签操作
composables/useUpload.ts    // 文件上传（对接已有的 R2 模块）
```

**学习重点：**
- `useFetch` vs `$fetch` 的区别（SSR 场景下的数据获取）
- Nuxt 的 `useState` 和 composable 的组合使用

---

## 阶段二：测试（最重要的能力提升）

**目标：理解如何测试 NestJS 应用**

### 2.1 单元测试（从简单开始）

优先给这几个 Service 补测试，因为它们逻辑清晰：

```
apps/api/src/modules/
├── crypto/crypto.service.spec.ts   # 测试 hash/compare，最简单
├── category/category.service.spec.ts
├── tag/tag.service.spec.ts
└── post/post.service.spec.ts
```

**核心概念：**

```typescript
// NestJS 测试的基本模式
const module = await Test.createTestingModule({
  providers: [
    CategoryService,
    { provide: PrismaService, useValue: mockPrismaService }, // Mock 依赖
  ],
}).compile();
```

**学习重点：**
- 如何 Mock Prisma（避免测试依赖真实数据库）
- `jest.fn()` 和 `jest.spyOn()` 的使用
- 测试覆盖率报告（`jest --coverage`）

### 2.2 集成测试（E2E）

项目已有 `supertest` 依赖，补充 E2E 测试：

```
apps/api/test/
├── auth.e2e-spec.ts    # 注册、登录、刷新 token 流程
└── post.e2e-spec.ts    # 文章 CRUD 流程
```

**学习重点：**
- 测试数据库隔离（每次测试前清空数据）
- 认证 token 在测试中的传递

---

## 阶段三：部署（让项目真正上线）

**目标：用 Docker 完整部署整个项目**

### 3.1 Docker 化

需要创建的文件：

```
blog/
├── docker-compose.yml          # 编排所有服务
├── apps/
│   ├── api/Dockerfile
│   └── web/Dockerfile
```

**docker-compose.yml 需要包含的服务：**
- `api` - NestJS 后端
- `web` - Nuxt 前端
- `postgres` - 数据库
- `redis` - 缓存

**学习重点：**
- 多阶段构建（减小镜像体积）
- 环境变量管理（`.env` 文件 vs Docker secrets）
- 容器间网络通信（服务名替代 localhost）

### 3.2 GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml 需要做的事：
# 1. 代码 push 时自动跑测试
# 2. main 分支合并时自动构建镜像
# 3. 可选：自动部署到服务器
```

**学习重点：**
- workflow 触发条件（`on: push/pull_request`）
- 缓存 node_modules 加速构建
- 使用 GitHub Secrets 管理敏感配置

---

## 阶段四：性能优化（深入理解系统）

**目标：让 Redis 和数据库发挥真正价值**

### 4.1 完善 Redis 缓存策略

当前 Redis 只用于 auth 验证码，可以扩展：

```typescript
// 在 PostService 中添加缓存
async findPublished() {
  const cached = await this.redis.get('posts:published');
  if (cached) return JSON.parse(cached);

  const posts = await this.prisma.post.findMany(...);
  await this.redis.set('posts:published', JSON.stringify(posts), 300); // 5分钟缓存
  return posts;
}
```

**学习重点：**
- 缓存失效策略（TTL vs 主动清除）
- 缓存穿透、缓存雪崩的概念和防护
- 什么数据适合缓存，什么不适合

### 4.2 数据库查询优化

**需要关注的点：**
- Prisma 的 N+1 问题（用 `include` 时注意）
- 分页查询（`cursor` 分页 vs `offset` 分页）
- 慢查询分析（PostgreSQL 的 `EXPLAIN ANALYZE`）

---

## 阶段五：进阶方向（可选）

完成前四个阶段后，可以根据兴趣选择：

### 方向 A：深入 TypeScript
- 高级类型（条件类型、映射类型、infer）
- 装饰器原理（NestJS 大量使用）
- 类型体操练习（type-challenges）

### 方向 B：系统设计
- 消息队列（Bull/BullMQ，用于异步发邮件）
- WebSocket（实时通知）
- 全文搜索（Elasticsearch 或 PostgreSQL 全文索引）

### 方向 C：新语言（Go）
- 适合时机：完成前四阶段后
- 推荐路径：用 Go 重写博客的某个 API 模块，对比体验

---

## 推荐学习顺序

```
阶段一（前端补全）→ 阶段二（测试）→ 阶段三（部署）→ 阶段四（优化）
     2-3周              2-3周            1-2周            持续进行
```

每个阶段都在当前项目上实践，不要新建项目。

---

## 参考资源

| 主题 | 资源 |
|------|------|
| NestJS 测试 | [NestJS 官方文档 - Testing](https://docs.nestjs.com/fundamentals/testing) |
| Nuxt 数据获取 | [Nuxt 官方文档 - Data Fetching](https://nuxt.com/docs/getting-started/data-fetching) |
| Docker 入门 | [Docker 官方文档 - Get Started](https://docs.docker.com/get-started/) |
| GitHub Actions | [GitHub Actions 官方文档](https://docs.github.com/en/actions) |
| Prisma 性能 | [Prisma 官方文档 - Performance](https://www.prisma.io/docs/guides/performance-and-optimization) |
