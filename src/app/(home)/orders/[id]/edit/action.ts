"use server";
import { prisma } from '@/lib/prisma';
import { MaintenanceCenter, Order } from '@prisma/client';

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
export interface EditType {
    orders: OrderWithRelations;
    centers: MaintenanceCenter[]
}
export const getOrders = async (os: string ): Promise<EditType> => {
    const centers = await prisma.maintenanceCenter.findMany({
        select:{
            id: true,
            name: true,
        }
    });

    const orders = await prisma.order.findUnique({
        where: { osNumber: os },
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
            maintenanceCenter:{
                select: { name: true }
            }
        }
    });
    return { orders, centers} as EditType;
};