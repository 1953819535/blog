# 学习路线 & 项目待完善清单

> 基于当前项目（Nuxt + NestJS + Prisma + PostgreSQL + Redis）的实践导向学习路线

---

## 项目现状

| 模块 | 完成度 | 说明 |
|------|--------|------|
| API 后端模块 | ✅ 完整 | auth/post/category/tag/user/r2/email/redis 均已实现 |
| 数据库设计 | ✅ 完整 | Prisma schema 设计合理，关系完整 |
| 前端基础页面 | ✅ 完整 | 首页、登录、注册、忘记密码、文章详情、个人资料 |
| 管理后台 | ✅ 完整 | 仪表盘、文章管理、分类管理、标签管理 |
| 单元测试 | ✅ 完整 | crypto/category/tag/post 服务测试 |
| E2E 测试 | ✅ 完整 | auth/post 接口测试 |
| Docker 部署 | ✅ 完整 | Dockerfile + docker-compose |
| CI/CD | ✅ 完整 | GitHub Actions 配置 |
| Redis 缓存策略 | ⚠️ 部分 | 仅用于 auth 验证码，未用于内容缓存 |

---

## ✅ 阶段一：补全前端功能（已完成）

**完成时间：2026-03-09**

### 1.1 管理后台页面 ✅

已创建的页面：

```
apps/web/pages/
├── admin/
│   ├── index.vue          # 仪表盘（文章数、分类数、标签数、草稿数统计）
│   ├── posts/
│   │   ├── index.vue      # 文章列表（含草稿、筛选、删除）
│   │   ├── create.vue     # 新建文章
│   │   └── [id]/edit.vue  # 编辑文章
│   ├── categories/
│   │   └── index.vue      # 分类管理（CRUD）
│   └── tags/
│       └── index.vue      # 标签管理（CRUD）
└── profile.vue            # 用户个人资料
```

### 1.2 补全 Composables ✅

```
composables/usePost.ts      // 文章的 CRUD 操作
composables/useCategory.ts  // 分类操作
composables/useTag.ts       // 标签操作
composables/useUpload.ts    // 文件上传（对接 R2）
```

### 1.3 补全 API 模块 ✅

```
api/category.ts  // 分类 API
api/tag.ts       // 标签 API
api/upload.ts    // 上传 API
api/post.ts      // 扩展文章 API（增加 CRUD）
```

### 1.4 补全 UI 组件 ✅

```
components/ui/table/     # 表格组件
components/ui/dialog/    # 对话框组件
components/ui/form/      # 表单组件
components/ui/textarea/  # 文本域组件
components/ui/select/    # 下拉选择组件
```

---

## ✅ 阶段二：测试（已完成）

**完成时间：2026-03-09**

### 2.1 单元测试 ✅

```
apps/api/src/modules/
├── crypto/crypto.service.spec.ts     # 密码哈希/比对测试
├── category/category.service.spec.ts  # 分类 CRUD 测试
├── tag/tag.service.spec.ts            # 标签 CRUD 测试
└── post/post.service.spec.ts          # 文章 CRUD 测试
```

### 2.2 E2E 测试 ✅

```
apps/api/test/
├── auth.e2e-spec.ts  # 认证流程测试
└── post.e2e-spec.ts  # 文章 API 测试
```

---

## ✅ 阶段三：部署（已完成）

**完成时间：2026-03-09**

### 3.1 Docker 化 ✅

```
blog/
├── .dockerignore                # Docker 忽略文件
├── apps/
│   ├── api/Dockerfile           # API 后端镜像
│   └── web/Dockerfile           # Web 前端镜像
└── docker/
    ├── docker-compose.yml       # 完整服务编排
    └── .env.example             # 环境变量示例
```

### 3.2 GitHub Actions CI/CD ✅

```
.github/
└── workflows/
    └── ci.yml     # CI/CD 配置
```

---

## 阶段四：性能优化（待完成）

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

### 4.2 数据库查询优化

- Prisma 的 N+1 问题（用 `include` 时注意）
- 分页查询（`cursor` 分页 vs `offset` 分页）
- 慢查询分析（PostgreSQL 的 `EXPLAIN ANALYZE`）

---

## 阶段五：进阶方向（可选）

### 方向 A：深入 TypeScript
- 高级类型（条件类型、映射类型、infer）
- 装饰器原理（NestJS 大量使用）

### 方向 B：系统设计
- 消息队列（Bull/BullMQ，用于异步发邮件）
- WebSocket（实时通知）
- 全文搜索（Elasticsearch 或 PostgreSQL 全文索引）

### 方向 C：新语言（Go）
- 用 Go 重写博客的某个 API 模块，对比体验

---

## 参考资源

| 主题 | 资源 |
|------|------|
| NestJS 测试 | [NestJS 官方文档 - Testing](https://docs.nestjs.com/fundamentals/testing) |
| Nuxt 数据获取 | [Nuxt 官方文档 - Data Fetching](https://nuxt.com/docs/getting-started/data-fetching) |
| Docker 入门 | [Docker 官方文档 - Get Started](https://docs.docker.com/get-started/) |
| GitHub Actions | [GitHub Actions 官方文档](https://docs.github.com/en/actions) |
| Prisma 性能 | [Prisma 官方文档 - Performance](https://www.prisma.io/docs/guides/performance-and-optimization) |