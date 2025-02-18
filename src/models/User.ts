import { Prisma, PrismaClient } from '@prisma/client'


export class UserRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async create(data: Prisma.userCreateInput) {
    try {
      return await this.prisma.user.create({ data })
    } catch (error) {
        throw new Error(`Error listing users: ${(error as Error).message}`)
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.user.findUnique({ where: { id } })
    } catch (error) {
        throw new Error(`Error listing users: ${(error as Error).message}`);
    }
  }

  async findByUsername(username: string) {
    try {
      return await this.prisma.user.findUnique({ where: { username } })
    } catch (error) {
      throw new Error(`Error finding user: ${(error as Error).message}`)
    }
  }

  async update(id: string, data: Prisma.userUpdateInput) {
    try {
      return await this.prisma.user.update({ 
        where: { id }, 
        data: { ...data, updatedAt: new Date() } 
      })
    } catch (error) {
      throw new Error(`Error updating user: ${(error as Error).message}`)
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } })
    } catch (error) {
      throw new Error(`Error deleting user: ${(error as Error).message}`)
    }
  }

  async listUsers(params?: {
    skip?: number,
    take?: number,
    cursor?: Prisma.userWhereUniqueInput,
    where?: Prisma.userWhereInput,
    orderBy?: Prisma.userOrderByWithRelationInput
  }) {
    try {
      return await this.prisma.user.findMany(params)
    } catch (error) {
      throw new Error(`Error listing users: ${(error as Error).message}`)
    }
  }
}