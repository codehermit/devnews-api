const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const PostController = require('../controllers/post.controller');

const router = express.Router();

// 文章验证规则
const postValidation = [
  body('title').trim().notEmpty().withMessage('标题不能为空'),
  body('content').trim().notEmpty().withMessage('内容不能为空'),
  body('tags').optional().isArray().withMessage('标签必须是数组格式')
];

// 获取所有已发布的文章
router.get('/', PostController.getAllPublished);

// 获取单篇文章
router.get('/:id', PostController.getById);

// 创建文章
router.post('/', authenticateToken, postValidation, PostController.create);

// 更新文章
router.put('/:id', authenticateToken, postValidation, PostController.update);

// 删除文章
router.delete('/:id', authenticateToken, PostController.delete);

module.exports = router;