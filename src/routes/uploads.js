const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const upload = require('../config/upload');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

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