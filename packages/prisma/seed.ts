import { config } from 'dotenv';
import { PrismaClient } from '@my/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

// 加载环境变量
config({ path: '.env' });

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log('🌱 开始初始化数据库基础数据...');

  // 1. 创建基础角色
  console.log('📋 创建基础角色...');
  const adminRole = await prisma.role.upsert({
    where: { id: 'admin' },
    update: {},
    create: {
      id: 'admin',
      description: '系统管理员，拥有所有权限',
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { id: 'user' },
    update: {},
    create: {
      id: 'user',
      description: '普通用户，可以发布和管理自己的文章',
      isSystem: true,
    },
  });

  console.log(`✅ 角色创建完成: admin, user`);

  // 2. 创建管理员用户
  console.log('👤 创建管理员用户...');
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: {
      email: 'admin@blog.com',
      password: hashedPassword,
      nickname: '系统管理员',
      isActive: true,
      profile: {
        create: {
          bio: '博客系统管理员',
        },
      },
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  console.log(`✅ 管理员用户创建完成: ${adminUser.email}`);

  // 创建普通用户示例
  const normalUserPassword = await bcrypt.hash('user123456', 10);
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@blog.com' },
    update: {},
    create: {
      email: 'user@blog.com',
      password: normalUserPassword,
      nickname: '普通用户',
      isActive: true,
      profile: {
        create: {
          bio: '热爱技术的普通用户',
        },
      },
      roles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
  });

  console.log(`✅ 普通用户创建完成: ${normalUser.email}`);

  // 3. 创建默认分类
  console.log('📁 创建默认分类...');
  const categories = [
    { name: '技术分享', slug: 'tech', description: '技术相关的文章分享' },
    { name: '生活随笔', slug: 'life', description: '日常生活和感悟' },
    { name: '项目实战', slug: 'project', description: '项目开发经验和案例' },
    { name: '学习笔记', slug: 'notes', description: '学习过程中的记录和总结' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`✅ 默认分类创建完成: ${categories.map(c => c.name).join(', ')}`);

  // 4. 创建常用标签
  console.log('🏷️  创建常用标签...');
  const tags = [
    // 前端
    { name: 'JS', slug: 'js' },
    { name: 'TS', slug: 'ts' },
    { name: 'Vue', slug: 'vue' },
    { name: 'React', slug: 'react' },
    { name: 'Angular', slug: 'angular' },
    { name: 'Next', slug: 'next' },
    { name: 'Nuxt', slug: 'nuxt' },
    { name: 'Vite', slug: 'vite' },
    { name: 'Webpack', slug: 'webpack' },
    { name: 'CSS', slug: 'css' },
    { name: 'HTML', slug: 'html' },
    { name: 'Sass', slug: 'sass' },
    
    // 后端
    { name: 'Node', slug: 'node' },
    { name: 'Express', slug: 'express' },
    { name: 'Koa', slug: 'koa' },
    { name: 'Nest', slug: 'nest' },
    { name: 'Django', slug: 'django' },
    { name: 'Flask', slug: 'flask' },
    { name: 'Spring', slug: 'spring' },
    { name: 'Laravel', slug: 'laravel' },
    { name: 'PHP', slug: 'php' },
    { name: 'Python', slug: 'python' },
    { name: 'Java', slug: 'java' },
    { name: 'Go', slug: 'go' },
    { name: 'Rust', slug: 'rust' },
    { name: 'C#', slug: 'csharp' },
    { name: 'Ruby', slug: 'ruby' },
    
    // 数据库
    { name: 'PostgreSQL', slug: 'postgres' },
    { name: 'MySQL', slug: 'mysql' },
    { name: 'MongoDB', slug: 'mongodb' },
    { name: 'Redis', slug: 'redis' },
    { name: 'SQLite', slug: 'sqlite' },
    { name: 'Elasticsearch', slug: 'elasticsearch' },
    { name: 'Prisma', slug: 'prisma' },
    { name: 'TypeORM', slug: 'typeorm' },
    { name: 'Sequelize', slug: 'sequelize' },
    
    // DevOps & 云
    { name: 'Docker', slug: 'docker' },
    { name: 'Kubernetes', slug: 'kubernetes' },
    { name: 'CI/CD', slug: 'cicd' },
    { name: 'Jenkins', slug: 'jenkins' },
    { name: 'AWS', slug: 'aws' },
    { name: 'Azure', slug: 'azure' },
    { name: 'Vercel', slug: 'vercel' },
    { name: 'Netlify', slug: 'netlify' },
    { name: 'Nginx', slug: 'nginx' },
    { name: 'Linux', slug: 'linux' },
    { name: 'Git', slug: 'git' },
    { name: 'GitHub', slug: 'github' },
    
    // 开发工具
    { name: 'VSCode', slug: 'vscode' },
    { name: 'Postman', slug: 'postman' },
    { name: 'Figma', slug: 'figma' },
    
    // 移动开发
    { name: 'ReactNative', slug: 'reactnative' },
    { name: 'Flutter', slug: 'flutter' },
    { name: 'iOS', slug: 'ios' },
    { name: 'Android', slug: 'android' },
    { name: 'Swift', slug: 'swift' },
    { name: 'Kotlin', slug: 'kotlin' },
    
    // AI & 机器学习
    { name: 'ChatGPT', slug: 'chatgpt' },
    { name: 'AI', slug: 'ai' },
    { name: '机器学习', slug: 'ml' },
    { name: '深度学习', slug: 'dl' },
    { name: 'TensorFlow', slug: 'tensorflow' },
    { name: 'PyTorch', slug: 'pytorch' },
    
    // 其他技术
    { name: 'GraphQL', slug: 'graphql' },
    { name: 'REST', slug: 'rest' },
    { name: 'WebSocket', slug: 'websocket' },
    { name: '微服务', slug: 'microservices' },
    { name: '设计模式', slug: 'patterns' },
    { name: '算法', slug: 'algorithms' },
    { name: '测试', slug: 'testing' },
    { name: '性能优化', slug: 'performance' },
    { name: '安全', slug: 'security' },
    { name: 'JWT', slug: 'jwt' },
    { name: '区块链', slug: 'blockchain' },
    { name: 'Web3', slug: 'web3' },
    
    // 生活兴趣
    { name: '读书', slug: 'reading' },
    { name: '电影', slug: 'movies' },
    { name: '音乐', slug: 'music' },
    { name: '旅行', slug: 'travel' },
    { name: '摄影', slug: 'photography' },
    { name: '美食', slug: 'food' },
    { name: '健身', slug: 'fitness' },
    { name: '游戏', slug: 'gaming' },
    { name: '生活', slug: 'life' },
    { name: '成长', slug: 'growth' },
    { name: '职场', slug: 'career' },
    { name: '面试', slug: 'interview' },
    { name: '创业', slug: 'startup' },
    { name: '理财', slug: 'finance' },
    { name: '投资', slug: 'investment' },
    { name: '英语', slug: 'english' },
    { name: '写作', slug: 'writing' },
    { name: '时间管理', slug: 'timemanagement' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log(`✅ 常用标签创建完成: ${tags.length}个标签`);

  // 5. 创建示例文章
  console.log('📝 创建示例文章...');
  const techCategory = await prisma.category.findUnique({ where: { slug: 'tech' } });
  const jsTag = await prisma.tag.findUnique({ where: { slug: 'js' } });
  const nestTag = await prisma.tag.findUnique({ where: { slug: 'nest' } });

  if (techCategory && jsTag && nestTag) {
    await prisma.post.upsert({
      where: { slug: 'welcome-to-my-blog' },
      update: {},
      create: {
        title: '欢迎来到我的博客',
        slug: 'welcome-to-my-blog',
        excerpt: '这是我的博客系统的第一篇文章，介绍了系统的基本功能和使用方法。',
        content: `# 欢迎来到我的博客

这是我的博客系统的第一篇文章。本博客使用以下技术栈构建：

## 技术栈
- **前端**: Vue.js 3 + Nuxt 3
- **后端**: Node.js + NestJS
- **数据库**: PostgreSQL + Prisma ORM
- **部署**: Docker + AWS

## 主要功能
- 用户注册、登录和个人资料管理
- 文章的创建、编辑、发布和删除
- 分类和标签管理
- 响应式设计，支持移动端
- JWT 身份验证和授权

## 如何使用
1. 注册账号或使用管理员账号登录
2. 创建你的第一篇文章
3. 选择合适的分类和标签
4. 发布文章与世界分享你的想法

希望你能在这里找到有价值的内容！`,
        published: true,
        publishedAt: new Date(),
        viewCount: 0,
        aiAuthorship: 'HUMAN',
        authorId: adminUser.id,
        categoryId: techCategory.id,
        tags: {
          connect: [
            { id: jsTag.id },
            { id: nestTag.id },
          ],
        },
      },
    });

    console.log('✅ 示例文章创建完成');
  }

  console.log('🎉 数据库初始化完成！');
  console.log('\n📊 初始化数据汇总:');
  console.log('- 管理员账号: admin@blog.com / admin123456');
  console.log('- 普通用户账号: user@blog.com / user123456');
  console.log('- 默认分类: 4个');
  console.log('- 常用标签: 95个');
  console.log('- 示例文章: 1篇');
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });