
// lib/services/userService.ts - Exemplo em Service Layer
import { prisma } from '@/lib/prisma';
import { getAuditLogger } from '@/lib/audit';

export class UserService {
  private audit = getAuditLogger(prisma);

  async createUser(userData: any, currentUserId: string) {
    const user = await prisma.user.create({
      data: userData,
    });

    await this.audit.logCreate(
      currentUserId,
      'user',
      user.id,
      'user',
      user
    );

    return user;
  }

  async updateUser(userId: string, updateData: any, currentUserId: string) {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await this.audit.logUpdate(
      currentUserId,
      'user',
      userId,
      'user',
      oldUser,
      updatedUser
    );

    return updatedUser;
  }

  async deleteUser(userId: string, currentUserId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    await this.audit.logDelete(
      currentUserId,
      'user',
      userId,
      'user',
      user
    );

    return user;
  }
}
