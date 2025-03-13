const prisma = require('../config/database');

const getStats = async (req, res) => {
  try {
    // 并行获取各项统计数据
    const [userCount, postCount, commentCount, categoryCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.category.count()
    ]);

    // 获取最近注册的用户
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // 获取最近发布的文章
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: {
        counts: {
          users: userCount,
          posts: postCount,
          comments: commentCount,
          categories: categoryCount
        },
        recentUsers,
        recentPosts
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: '获取统计数据时发生错误'
    });
  }
};

module.exports = {
  getStats
};