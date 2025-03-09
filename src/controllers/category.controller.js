const Category = require('../models/category');
const { validationResult } = require('express-validator');

class CategoryController {
  static async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();
      res.json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        status: 'error',
        message: '获取分类列表失败'
      });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: '分类不存在'
        });
      }
      res.json({
        status: 'success',
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        status: 'error',
        message: '获取分类详情失败'
      });
    }
  }

  static async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await Category.create(req.body);
      res.status(201).json({
        status: 'success',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        status: 'error',
        message: '创建分类失败'
      });
    }
  }

  static async updateCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await Category.update(req.params.id, req.body);
      res.json({
        status: 'success',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        status: 'error',
        message: '更新分类失败'
      });
    }
  }

  static async deleteCategory(req, res) {
    try {
      await Category.delete(req.params.id);
      res.json({
        status: 'success',
        message: '分类删除成功'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        status: 'error',
        message: '删除分类失败'
      });
    }
  }
}

module.exports = CategoryController;