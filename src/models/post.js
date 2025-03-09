const prisma = require('../config/database');

class Post {
  static async findAllPublished() {
    return prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async findById(id) {
    return prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true
      }
    });
  }

  static async create(data) {
    const { title, content, authorId, categoryId, tags = [] } = data;

    // 创建或获取标签
    const tagObjects = await Promise.all(
      tags.map(async (tagName) => {
        return prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
      })
    );

    return prisma.post.create({
      data: {
        title,
        content,
        authorId,
        categoryId: parseInt(categoryId),
        tags: {
          create: tagObjects.map(tag => ({
            tag: {
              connect: { id: tag.id }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  static async update(id, data) {
    const { title, content, categoryId, tags = [], published } = data;

    // 创建或获取标签
    const tagObjects = await Promise.all(
      tags.map(async (tagName) => {
        return prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
      })
    );

    // 先删除所有现有的标签关联
    await prisma.tagsOnPosts.deleteMany({
      where: { postId: parseInt(id) }
    });

    return prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        published,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        tags: {
          create: tagObjects.map(tag => ({
            tag: {
              connect: { id: tag.id }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  static async delete(id) {
    return prisma.post.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = Post;