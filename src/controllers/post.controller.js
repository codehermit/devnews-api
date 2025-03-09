const Post = require('../models/post');
const { validationResult } = require('express-validator');

class PostController {
  // 获取所有已发布的文章
  static async getAllPublished(req, res) {
    try {
      const posts = await Post.findAllPublished();
      res.json({
        status: 'success',
        data: { posts }
      });
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({
        status: 'error',
        message: '获取文章列表时发生错误'
      });
    }
  }

  // 获取单篇文章
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: '文章不存在'
        });
      }

      res.json({
        status: 'success',
        data: { post }
      });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({
        status: 'error',
        message: '获取文章详情时发生错误'
      });
    }
  }

  // 创建文章
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, tags = [] } = req.body;
      const post = await Post.create({
        title,
        content,
        authorId: req.user.id,
        tags
      });

      res.status(201).json({
        status: 'success',
        data: { post }
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        status: 'error',
        message: '创建文章时发生错误'
      });
    }
  }

  // 更新文章
  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, content, tags = [], published } = req.body;

      // 检查文章是否存在且属于当前用户
      const existingPost = await Post.findById(id);

      if (!existingPost) {
        return res.status(404).json({
          status: 'error',
          message: '文章不存在'
        });
      }

      if (existingPost.authorId !== req.user.id && req.user.role.name !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: '您没有权限修改此文章'
        });
      }

      const post = await Post.update(id, {
        title,
        content,
        tags,
        published
      });

      res.json({
        status: 'success',
        data: { post }
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({
        status: 'error',
        message: '更新文章时发生错误'
      });
    }
  }

  // 删除文章
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // 检查文章是否存在且属于当前用户
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: '文章不存在'
        });
      }

      if (post.authorId !== req.user.id && req.user.role.name !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: '您没有权限删除此文章'
        });
      }

      await Post.delete(id);

      res.json({
        status: 'success',
        message: '文章已成功删除'
      });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({
        status: 'error',
        message: '删除文章时发生错误'
      });
    }
  }
}

module.exports = PostController;