// lib/audit.ts

import { PrismaClient, Operation, Prisma } from '@prisma/client';
import { headers } from 'next/headers';

// Tipos auxiliares
export interface AuditOptions {
  userId: string;
  entityType: string;
  entityId: string;
  tableName: string;
  operation: Operation;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
}

export interface BulkAuditOptions {
  userId: string;
  entityType: string;
  tableName: string;
  operation: Operation;
  records: Array<{
    entityId: string;
    fieldName?: string;
    oldValue?: any;
    newValue?: any;
    description?: string;
  }>;
}

class AuditLogger {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Registra uma única operação de auditoria
   */
  async log(options: AuditOptions): Promise<void> {
    try {
      const headersList = await headers();
      const ipAddress = this.getClientIP(headersList);
      const userAgent = headersList.get('user-agent') || 'Unknown';

      await this.prisma.record.create({
        data: {
          userId: options.userId,
          entityType: options.entityType,
          entityId: options.entityId,
          operation: options.operation,
          tableName: options.tableName,
          fieldName: options.fieldName,
          oldValue: options.oldValue ? this.serialize(options.oldValue) : null,
          newValue: options.newValue ? this.serialize(options.newValue) : null,
          ipAddress,
          userAgent,
          description: options.description,
        },
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
      // Não relança o erro para não quebrar a operação principal
    }
  }

  /**
   * Registra múltiplas operações de auditoria em uma transação
   */
  async logBulk(options: BulkAuditOptions): Promise<void> {
    try {
      const headersList = await headers();
      const ipAddress = this.getClientIP(headersList);
      const userAgent = headersList.get('user-agent') || 'Unknown';

      const records = options.records.map(record => ({
        userId: options.userId,
        entityType: options.entityType,
        entityId: record.entityId,
        operation: options.operation,
        tableName: options.tableName,
        fieldName: record.fieldName,
        oldValue: record.oldValue ? this.serialize(record.oldValue) : null,
        newValue: record.newValue ? this.serialize(record.newValue) : null,
        ipAddress,
        userAgent,
        description: record.description,
      }));

      await this.prisma.record.createMany({
        data: records,
      });
    } catch (error) {
      console.error('Erro ao registrar auditoria em lote:', error);
    }
  }

  /**
   * Registra criação de entidade
   */
  async logCreate(
    userId: string,
    entityType: string,
    entityId: string,
    tableName: string,
    newData: any,
    description?: string
  ): Promise<void> {
    await this.log({
      userId,
      entityType,
      entityId,
      tableName,
      operation: Operation.CREATE,
      newValue: newData,
      description: description || `${entityType} criado`,
    });
  }

  /**
   * Registra atualização de entidade
   */
  async logUpdate(
    userId: string,
    entityType: string,
    entityId: string,
    tableName: string,
    oldData: any,
    newData: any,
    fieldName?: string,
    description?: string
  ): Promise<void> {
    await this.log({
      userId,
      entityType,
      entityId,
      tableName,
      operation: Operation.UPDATE,
      fieldName,
      oldValue: oldData,
      newValue: newData,
      description: description || `${entityType} atualizado`,
    });
  }

  /**
   * Registra exclusão de entidade
   */
  async logDelete(
    userId: string,
    entityType: string,
    entityId: string,
    tableName: string,
    deletedData: any,
    description?: string
  ): Promise<void> {
    await this.log({
      userId,
      entityType,
      entityId,
      tableName,
      operation: Operation.DELETE,
      oldValue: deletedData,
      description: description || `${entityType} excluído`,
    });
  }

  /**
   * Busca registros de auditoria por entidade
   */
  async getRecordsByEntity(
    entityType: string,
    entityId: string,
    options?: {
      limit?: number;
      offset?: number;
      operation?: Operation;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: Prisma.RecordWhereInput = {
      entityType,
      entityId,
      ...(options?.operation && { operation: options.operation }),
      ...(options?.userId && { userId: options.userId }),
      ...(options?.startDate || options?.endDate ? {
        timestamp: {
          ...(options.startDate && { gte: options.startDate }),
          ...(options.endDate && { lte: options.endDate }),
        }
      } : {}),
    };

    return await this.prisma.record.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  /**
   * Busca registros de auditoria por usuário
   */
  async getRecordsByUser(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      entityType?: string;
      operation?: Operation;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: Prisma.RecordWhereInput = {
      userId,
      ...(options?.entityType && { entityType: options.entityType }),
      ...(options?.operation && { operation: options.operation }),
      ...(options?.startDate || options?.endDate ? {
        timestamp: {
          ...(options.startDate && { gte: options.startDate }),
          ...(options.endDate && { lte: options.endDate }),
        }
      } : {}),
    };

    return await this.prisma.record.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  /**
   * Obtém estatísticas de auditoria
   */
  async getAuditStats(options?: {
    userId?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Prisma.RecordWhereInput = {
      ...(options?.userId && { userId: options.userId }),
      ...(options?.entityType && { entityType: options.entityType }),
      ...(options?.startDate || options?.endDate ? {
        timestamp: {
          ...(options.startDate && { gte: options.startDate }),
          ...(options.endDate && { lte: options.endDate }),
        }
      } : {}),
    };

    const [
      totalRecords,
      createCount,
      updateCount,
      deleteCount,
      byEntityType,
      byUser
    ] = await Promise.all([
      this.prisma.record.count({ where }),
      this.prisma.record.count({ where: { ...where, operation: Operation.CREATE } }),
      this.prisma.record.count({ where: { ...where, operation: Operation.UPDATE } }),
      this.prisma.record.count({ where: { ...where, operation: Operation.DELETE } }),
      this.prisma.record.groupBy({
        by: ['entityType'],
        where,
        _count: { id: true },
      }),
      this.prisma.record.groupBy({
        by: ['userId'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalRecords,
      operationCounts: {
        create: createCount,
        update: updateCount,
        delete: deleteCount,
      },
      byEntityType: byEntityType.map(item => ({
        entityType: item.entityType,
        count: item._count.id,
      })),
      topUsers: byUser.map(item => ({
        userId: item.userId,
        count: item._count.id,
      })),
    };
  }

  /**
   * Limpa registros antigos
   */
  async cleanupOldRecords(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.record.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Serializa dados para armazenamento
   */
  private serialize(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  }

  /**
   * Obtém o IP do cliente
   */
  private getClientIP(headersList: Headers): string {
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = headersList.get('x-client-ip');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (clientIP) {
      return clientIP;
    }

    return 'Unknown';
  }
}

// Instância singleton
let auditLogger: AuditLogger | null = null;

export function getAuditLogger(prisma: PrismaClient): AuditLogger {
  if (!auditLogger) {
    auditLogger = new AuditLogger(prisma);
  }
  return auditLogger;
}

// Hook para usar em components
export function useAudit(prisma: PrismaClient) {
  return getAuditLogger(prisma);
}

// Decorator para auditoria automática (opcional)
export function withAudit(
  entityType: string,
  tableName: string,
  getUserId: () => string
) {
  return function <T extends Record<string, any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = async function (this: { prisma: PrismaClient }, ...args: any[]) {
      const userId = getUserId();
      const audit = getAuditLogger(this.prisma);

      try {
        const result = await method.apply(this, args);
        // Lógica de auditoria baseada no nome do método
        if (propertyName.includes('create') || propertyName.includes('Create')) {
          await audit.logCreate(userId, entityType, result.id, tableName, result);
        } else if (propertyName.includes('update') || propertyName.includes('Update')) {
          await audit.logUpdate(userId, entityType, args[0].id, tableName, args[0], result);
        } else if (propertyName.includes('delete') || propertyName.includes('Delete')) {
          await audit.logDelete(userId, entityType, args[0].id, tableName, args[0]);
        }

        return result;
      } catch (error) {
        throw error;
      }
    } as any;

    return descriptor;
  };
}