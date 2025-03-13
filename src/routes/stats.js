const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getStats } = require('../controllers/stats.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: 系统统计数据相关接口
 */

/**
 * @swagger
 * /api/stats:
 *   get:
 *     tags: [Stats]
 *     summary: 获取系统统计数据（需要管理员权限）
 *     security:
 *       - bearerAuth: []
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
 *                   type: object
 *                   properties:
 *                     counts:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: integer
 *                         posts:
 *                           type: integer
 *                         comments:
 *                           type: integer
 *                         categories:
 *                           type: integer
 *                     recentUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           email:
 *                             type: string
 *                           name:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     recentPosts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           published:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           author:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       500:
 *         description: 服务器错误
 */
router.get('/', authenticateToken, authorizeRoles('admin'), getStats);

module.exports = router;