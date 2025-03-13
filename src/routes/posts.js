const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const PostController = require('../controllers/post.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: 文章管理相关接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 文章ID
 *         title:
 *           type: string
 *           description: 文章标题
 *         content:
 *           type: string
 *           description: 文章内容
 *         published:
 *           type: boolean
 *           description: 是否已发布
 *         authorId:
 *           type: integer
 *           description: 作者ID
 *         categoryId:
 *           type: integer
 *           description: 分类ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

// 文章验证规则
const postValidation = [
  body('title').trim().notEmpty().withMessage('标题不能为空'),
  body('content').trim().notEmpty().withMessage('内容不能为空'),
  body('tags').optional().isArray().withMessage('标签必须是数组格式')
];

/**
 * @swagger
 * /api/posts:
 *   get:
 *     tags: [Posts]
 *     summary: 获取所有已发布的文章
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
 *                     $ref: '#/components/schemas/Post'
 *       500:
 *         description: 服务器错误
 */
// 获取所有已发布的文章
router.get('/', PostController.getAllPublished);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: 获取单篇文章详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
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
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: 文章不存在
 *       500:
 *         description: 服务器错误
 */
// 获取单篇文章
router.get('/:id', PostController.getById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     tags: [Posts]
 *     summary: 创建文章
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *               content:
 *                 type: string
 *                 description: 文章内容
 *               categoryId:
 *                 type: integer
 *                 description: 分类ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 文章标签
 *               published:
 *                 type: boolean
 *                 description: 是否发布
 *                 default: false
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
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
// 创建文章
router.post('/', authenticateToken, postValidation, PostController.create);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: 更新文章
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *               content:
 *                 type: string
 *                 description: 文章内容
 *               categoryId:
 *                 type: integer
 *                 description: 分类ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 文章标签
 *               published:
 *                 type: boolean
 *                 description: 是否发布
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
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 文章不存在
 *       500:
 *         description: 服务器错误
 */
// 更新文章
router.put('/:id', authenticateToken, postValidation, PostController.update);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: 删除文章
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
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
 *         description: 文章不存在
 *       500:
 *         description: 服务器错误
 */
// 删除文章
router.delete('/:id', authenticateToken, PostController.delete);

module.exports = router;