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

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DevNews API' });
});

// 注册路由
app.use('/api/categories', categoriesRouter);
app.use('/api/comments', commentsRouter);

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