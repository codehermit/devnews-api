const prisma = require('../config/database');

class Category {
  static async findAll() {
    return prisma.category.findMany({
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true
          }
        }
      }
    });
  }

  static async findById(id) {
    return prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
            published: true,
            author: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  static async create(data) {
    const { name, description } = data;
    return prisma.category.create({
      data: {
        name,
        description
      }
    });
  }

  static async update(id, data) {
    const { name, description } = data;
    return prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description
      }
    });
  }

  static async delete(id) {
    return prisma.category.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = Category;