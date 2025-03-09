const { verifyToken } = require('../utils/auth');
const prisma = require('../config/database');

// 验证JWT中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '未提供认证令牌'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        status: 'error',
        message: '无效的认证令牌'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!user || !user.active) {
      return res.status(403).json({
        status: 'error',
        message: '用户不存在或已被禁用'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      status: 'error',
      message: '认证过程中发生错误'
    });
  }
};

// 角色验证中间件
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        status: 'error',
        message: '无访问权限'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        status: 'error',
        message: '当前角色无权限执行此操作'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};