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
        code: 401,
        message: '未登录或登录已过期'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: '未登录或登录已过期'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!user || !user.active) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: '未登录或登录已过期'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
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
        code: 403,
        message: '无访问权限'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        status: 'error',
        code: 403,
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