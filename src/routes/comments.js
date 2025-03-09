const express = require('express');
const { body } = require('express-validator');
const CommentController = require('../controllers/comment.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 获取文章的评论列表
router.get('/post/:postId', CommentController.getPostComments);

// 创建评论
router.post('/',
  authenticateToken,
  [
    body('content').trim().notEmpty().withMessage('评论内容不能为空'),
    body('postId').isInt().withMessage('无效的文章ID'),
    body('parentId').optional().isInt().withMessage('无效的父评论ID')
  ],
  CommentController.createComment
);

// 更新评论
router.put('/:id',
  authenticateToken,
  [
    body('content').trim().notEmpty().withMessage('评论内容不能为空')
  ],
  CommentController.updateComment
);

// 删除评论
router.delete('/:id',
  authenticateToken,
  CommentController.deleteComment
);

module.exports = router;