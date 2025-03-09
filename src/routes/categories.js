const express = require('express');
const { body } = require('express-validator');
const CategoryController = require('../controllers/category.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: 分类管理相关接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 分类ID
 *         name:
 *           type: string
 *           description: 分类名称
 *         description:
 *           type: string
 *           description: 分类描述
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: 获取所有分类
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: 服务器错误
 */
// 获取所有分类
router.get('/', CategoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: 获取单个分类详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: 分类不存在
 *       500:
 *         description: 服务器错误
 */
// 获取单个分类详情
router.get('/:id', CategoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: 创建分类（需要管理员权限）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *               description:
 *                 type: string
 *                 description: 分类描述
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       500:
 *         description: 服务器错误
 */
// 创建分类（需要管理员权限）
router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('name').trim().notEmpty().withMessage('分类名称不能为空'),
    body('description').optional().trim()
  ],
  CategoryController.createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: 更新分类（需要管理员权限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *               description:
 *                 type: string
 *                 description: 分类描述
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 分类不存在
 *       500:
 *         description: 服务器错误
 */
// 更新分类（需要管理员权限）
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('name').trim().notEmpty().withMessage('分类名称不能为空'),
    body('description').optional().trim()
  ],
  CategoryController.updateCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: 删除分类（需要管理员权限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   description: 操作结果信息
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 分类不存在
 *       500:
 *         description: 服务器错误
 */
// 删除分类（需要管理员权限）
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  CategoryController.deleteCategory
);

module.exports = router;