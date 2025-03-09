const prisma = require('../config/database');

class Comment {
  static async findByPostId(postId) {
    return prisma.comment.findMany({
      where: { 
        postId: parseInt(postId),
        parentId: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async create(data) {
    const { content, authorId, postId, parentId } = data;
    return prisma.comment.create({
      data: {
        content,
        authorId: parseInt(authorId),
        postId: parseInt(postId),
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async update(id, data) {
    const { content } = data;
    return prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async delete(id) {
    return prisma.comment.delete({
      where: { id: parseInt(id) }
    });
  }

  static async findById(id) {
    return prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        post: true
      }
    });
  }
}

module.exports = Comment;