// Actions
"use server";
import { prisma } from '@/lib/prisma';
import { Order, user, vehicle } from '@prisma/client';

export interface MaintenanceCenter {
    id: number;
    name: string;
}

interface User {
    id: string;
    username: string;
    name: string;
}

export type OrderWithRelations = Order & {
    user: User;
    vehicle: {
        id: string;
        plate: string;
        model: string | null;
    };
    maintenanceCenter: {
        id: number;
        name: string;
    } | null;
};

export const getOrders = async (): Promise<{
    orders: OrderWithRelations[];
    users: user[];
    vehicles: vehicle[];
    maintenanceCenter: MaintenanceCenter[];
}> => {
    try {
        const maintenanceCenter = await prisma.maintenanceCenter.findMany();
        const users = await prisma.user.findMany();
        const vehicles = await prisma.vehicle.findMany();

        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }
                },
                vehicle: {
                    select: {
                        id: true,
                        plate: true,
                        model: true
                    }
                },
                maintenanceCenter: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { orders, users, vehicles, maintenanceCenter };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], users: [], vehicles: [], maintenanceCenter: [] };
    }
};

export interface EditType {
    orders: OrderWithRelations | null;
    centers: MaintenanceCenter[];
}

export async function deleteOrder(os:string) {
    try {
        const find = await prisma.order.findUnique({ where: { osNumber: os }});
        if (!find) {
            throw new Error("Não encontrado");
        }
        const del = await prisma.order.delete({where:{ id: find.id }});
        return del;
    } catch (error) {
        console.log(error);
        return error
    }
    
}

export const getOrdersById = async (osNumber: string): Promise<EditType> => {
    try {
        const centers = await prisma.maintenanceCenter.findMany({
            select: {
                id: true,
                name: true,
            }
        });

        const orders = await prisma.order.findUnique({
            where: { osNumber: osNumber },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }
                },
                vehicle: {
                    select: {
                        id: true,
                        plate: true,
                        model: true
                    }
                },
                maintenanceCenter: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return { orders, centers };
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        return { orders: null, centers: [] };
    }
};