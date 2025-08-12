"use server";
import { prisma } from '@/lib/prisma';
import { Order } from '@prisma/client';

export type OrderWithRelations = Order & {
    user: {
        username: string;
        name: string;
    };
    vehicle: {
        plate: string;
        model: string | null;
    };
};

export const getOrders = async (id: string): Promise<OrderWithRelations[]> => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: id },
            include: {
                user: {
                    select: {
                        name: true,
                        username: true,
                    }
                },
                vehicle: {
                    select: {
                        plate: true,
                        model: true
                    }
                },
            },
            orderBy: {createdAt: 'desc'}
        });
        return orders as OrderWithRelations[];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};