const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const upload = require('../config/upload');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: 文件上传管理相关接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 文件ID
 *         filename:
 *           type: string
 *           description: 存储的文件名
 *         originalName:
 *           type: string
 *           description: 原始文件名
 *         mimeType:
 *           type: string
 *           description: 文件类型
 *         size:
 *           type: integer
 *           description: 文件大小(字节)
 *         url:
 *           type: string
 *           description: 文件访问URL
 *         userId:
 *           type: integer
 *           description: 上传者ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 */

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     tags: [Uploads]
 *     summary: 上传文件
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件
 *     responses:
 *       201:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/File'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
 */
// 上传文件
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: '请选择要上传的文件'
      });
    }

    // 保存文件信息到数据库
    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        userId: req.user.id
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        url: `/uploads/${file.filename}`
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      status: 'error',
      message: '文件上传过程中发生错误'
    });
  }
});

/**
 * @swagger
 * /api/uploads/{id}:
 *   get:
 *     tags: [Uploads]
 *     summary: 获取文件信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
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
 *                   $ref: '#/components/schemas/File'
 *       401:
 *         description: 未认证
 *       404:
 *         description: 文件不存在
 *       500:
 *         description: 服务器错误
 */
// 获取文件信息
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      });
    }

    res.json({
      status: 'success',
      data: {
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        url: `/uploads/${file.filename}`
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      status: 'error',
      message: '获取文件信息时发生错误'
    });
  }
});

/**
 * @swagger
 * /api/uploads/{id}:
 *   delete:
 *     tags: [Uploads]
 *     summary: 删除文件
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
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
 *         description: 文件不存在
 *       500:
 *         description: 服务器错误
 */
// 删除文件
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: '文件不存在'
      });
    }

    // 检查文件所有权
    if (file.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: '无权删除该文件'
      });
    }

    // 删除物理文件
    await fs.unlink(file.path);

    // 从数据库中删除文件记录
    await prisma.file.delete({
      where: { id: file.id }
    });

    res.json({
      status: 'success',
      message: '文件已成功删除'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      status: 'error',
      message: '删除文件时发生错误'
    });
  }
});

module.exports = router;