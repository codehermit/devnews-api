const express = require('express');
const { body } = require('express-validator');
const prisma = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用户管理相关接口
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: 获取用户列表（需要管理员权限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       500:
 *         description: 服务器错误
 */
// 获取用户列表（需要管理员权限）
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          role: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count()
    ]);

    // 移除敏感信息
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      status: 'success',
      data: safeUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户列表时发生错误'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: 获取单个用户详情（需要管理员权限或本人）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 */
// 获取单个用户详情（需要管理员权限或本人）
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // 检查权限：只有管理员或用户本人可以查看详情
    if (req.user.role.name !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: '无权查看该用户信息'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 移除敏感信息
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      status: 'success',
      data: safeUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户信息时发生错误'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: 更新用户信息（需要管理员权限或本人）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 用户名称
 *               active:
 *                 type: boolean
 *                 description: 是否激活（仅管理员可设置）
 *               roleId:
 *                 type: integer
 *                 description: 角色ID（仅管理员可设置）
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 */
// 更新用户信息（需要管理员权限或本人）
router.put('/:id', authenticateToken, [
  body('name').optional().trim().notEmpty().withMessage('名称不能为空'),
  body('active').optional().isBoolean().withMessage('激活状态必须是布尔值'),
  body('roleId').optional().isInt().withMessage('角色ID必须是整数')
], async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, active, roleId } = req.body;

    // 检查权限：只有管理员或用户本人可以更新信息
    const isAdmin = req.user.role.name === 'admin';
    const isSelf = req.user.id === userId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        status: 'error',
        message: '无权更新该用户信息'
      });
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 准备更新数据
    const updateData = {};
    
    // 普通用户和管理员都可以更新名称
    if (name !== undefined) {
      updateData.name = name;
    }
    
    // 只有管理员可以更新激活状态和角色
    if (isAdmin) {
      if (active !== undefined) {
        updateData.active = active;
      }
      
      if (roleId !== undefined) {
        // 检查角色是否存在
        const role = await prisma.role.findUnique({
          where: { id: roleId }
        });
        
        if (!role) {
          return res.status(400).json({
            status: 'error',
            message: '指定的角色不存在'
          });
        }
        
        updateData.roleId = roleId;
      }
    } else if ((active !== undefined || roleId !== undefined) && !isAdmin) {
      // 非管理员尝试更新受限字段
      return res.status(403).json({
        status: 'error',
        message: '无权更新用户角色或激活状态'
      });
    }

    // 执行更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true }
    });

    // 移除敏感信息
    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json({
      status: 'success',
      data: safeUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: '更新用户信息时发生错误'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: 删除用户（需要管理员权限）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
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
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 */
// 删除用户（需要管理员权限）
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 不允许删除自己
    if (userId === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: '不能删除当前登录的用户'
      });
    }

    // 执行删除（实际上是软删除，将active设为false）
    await prisma.user.update({
      where: { id: userId },
      data: { active: false }
    });

    res.json({
      status: 'success',
      message: '用户已成功禁用'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: '删除用户时发生错误'
    });
  }
});

module.exports = router;