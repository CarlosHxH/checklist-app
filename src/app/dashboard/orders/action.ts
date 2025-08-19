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
    maintenanceCenter: {
        name: string;
    }
};


export const getOrders = async (): Promise<OrderWithRelations[]> => {
    try {
        const orders = await prisma.order.findMany({
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
                maintenanceCenter: true
            },
            orderBy: {createdAt: 'desc'}
        });
        return orders as OrderWithRelations[];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};