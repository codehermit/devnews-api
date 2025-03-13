require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

// Swagger文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 导入路由
const categoriesRouter = require('./src/routes/categories');
const commentsRouter = require('./src/routes/comments');
const authRouter = require('./src/routes/auth');
const postsRouter = require('./src/routes/posts');
const uploadsRouter = require('./src/routes/uploads');
const usersRouter = require('./src/routes/users');
const statsRouter = require('./src/routes/stats');

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DevNews API' });
});

// 注册路由
app.use('/api/categories', categoriesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server...');
  prisma.$disconnect();
  process.exit(0);
});