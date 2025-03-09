const Comment = require('../models/comment');
const { validationResult } = require('express-validator');

class CommentController {
  static async getPostComments(req, res) {
    try {
      const comments = await Comment.findByPostId(req.params.postId);
      res.json({
        status: 'success',
        data: comments
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        status: 'error',
        message: '获取评论列表失败'
      });
    }
  }

  static async createComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = await Comment.create({
        ...req.body,
        authorId: req.user.id
      });

      res.status(201).json({
        status: 'success',
        data: comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        status: 'error',
        message: '创建评论失败'
      });
    }
  }

  static async updateComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({
          status: 'error',
          message: '评论不存在'
        });
      }

      if (comment.authorId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: '无权修改该评论'
        });
      }

      const updatedComment = await Comment.update(req.params.id, req.body);
      res.json({
        status: 'success',
        data: updatedComment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        status: 'error',
        message: '更新评论失败'
      });
    }
  }

  static async deleteComment(req, res) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({
          status: 'error',
          message: '评论不存在'
        });
      }

      if (comment.authorId !== req.user.id && req.user.role.name !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: '无权删除该评论'
        });
      }

      await Comment.delete(req.params.id);
      res.json({
        status: 'success',
        message: '评论删除成功'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        status: 'error',
        message: '删除评论失败'
      });
    }
  }
}

module.exports = CommentController;