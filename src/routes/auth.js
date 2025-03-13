const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const prisma = require('../config/database');
const { hashPassword, verifyPassword, generateToken, sendEmail } = require('../utils/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户ID
 *         email:
 *           type: string
 *           format: email
 *           description: 用户邮箱
 *         name:
 *           type: string
 *           description: 用户名称
 *         role:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: 角色ID
 *             name:
 *               type: string
 *               description: 角色名称
 */

// 注册验证规则
const registerValidation = [
  body('email').isEmail().withMessage('请提供有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
  body('name').optional().trim().notEmpty().withMessage('名称不能为空')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 用户名或邮箱
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: 用户密码
 *               name:
 *                 type: string
 *                 description: 用户名称
 *     responses:
 *       201:
 *         description: 注册成功
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT认证令牌
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: '该邮箱已被注册'
      });
    }

    // 获取默认角色（普通用户）
    const defaultRole = await prisma.role.findFirst({
      where: { name: 'user' }
    });

    if (!defaultRole) {
      return res.status(500).json({
        status: 'error',
        message: '系统错误：未找到默认用户角色'
      });
    }

    // 创建新用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: defaultRole.id
      },
      include: {
        role: true
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: '注册过程中发生错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 用户名或邮箱
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 用户密码
 *     responses:
 *       200:
 *         description: 登录成功
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT认证令牌
 *       401:
 *         description: 认证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/login', [
  body('email').notEmpty().withMessage('请提供用户名或邮箱'),
  body('password').notEmpty().withMessage('请提供密码')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 支持用户名或邮箱登录
    let user;
    // 检查是否是邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      // 如果是邮箱格式，通过邮箱查找用户
      user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
      });
    } else {
      // 如果不是邮箱格式，通过用户名查找用户
      user = await prisma.user.findFirst({
        where: { name: email },
        include: { role: true }
      });
    }

    if (!user || !user.active) {
      return res.status(401).json({
        status: 'error',
        message: '用户不存在或已被禁用'
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: '用户名/邮箱或密码错误'
      });
    }

    const token = generateToken(user.id);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: '登录过程中发生错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: 请求重置密码
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: 用户名或邮箱
 *     responses:
 *       200:
 *         description: 重置密码邮件发送成功
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
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('请提供有效的邮箱地址')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '未找到该邮箱对应的用户'
      });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1小时后过期

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // 发送重置密码邮件
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const emailContent = `
      <h1>重置密码请求</h1>
      <p>您收到这封邮件是因为您（或其他人）请求重置密码。</p>
      <p>请点击下面的链接重置密码：</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>如果您没有请求重置密码，请忽略这封邮件。</p>
    `;

    await sendEmail(user.email, '密码重置请求', emailContent);

    res.json({
      status: 'success',
      message: '重置密码的邮件已发送到您的邮箱'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: '发送重置密码邮件时发生错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags: [Authentication]
 *     summary: 重置密码
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 重置密码令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: 新密码
 *     responses:
 *       200:
 *         description: 密码重置成功
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
 *       400:
 *         description: 无效的重置令牌或密码格式错误
 *       500:
 *         description: 服务器错误
 */
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('新密码至少需要6个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: '密码重置令牌无效或已过期'
      });
    }

    // 更新密码并清除重置令牌
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({
      status: 'success',
      message: '密码已成功重置'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: '重置密码时发生错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: 用户退出登录
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 退出登录成功
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
 *       500:
 *         description: 服务器错误
 */
router.post('/logout', async (req, res) => {
  try {
    // JWT是无状态的，真正的退出登录逻辑应该在前端清除token
    // 这里只提供一个标准的退出接口，以便前端调用
    
    res.json({
      status: 'success',
      message: '退出登录成功'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: '退出登录过程中发生错误'
    });
  }
});

module.exports = router;