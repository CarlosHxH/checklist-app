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
    },
    oficina: {
        name: string;
    },
    oficinas: string;
    veiculos: string;
};

export const getOrders = async (id: string): Promise<OrderWithRelations[]> => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: id },
            include: {
                user: {select: {name: true,username: true}},
                vehicle: {select: {plate: true, model: true}},
                oficina: {select: { name: true}},
                maintenanceCenter: {select: { name: true}},
            },
            orderBy: {createdAt: 'desc'}
        });
        const newOrders = orders.map(item=>({
            veiculo: item.vehicle.plate+item.vehicle.plate,
            oficinas: item.vehicle.plate,
            center: item.maintenanceCenter.name,
            veiculos: `${item.vehicle.plate+" - "+item.vehicle.model}`,
            ...item,
        }))
        return newOrders as unknown as OrderWithRelations[];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};