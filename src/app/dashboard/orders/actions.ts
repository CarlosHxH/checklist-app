// Actions
"use server";
import { prisma } from '@/lib/prisma';
import { MaintenanceCenter, Oficina, Order, user, vehicle } from '@prisma/client';

export type OrderWithRelations = Order & {
    user: {
        id: string;
        name: string;
    };
    vehicle: {
        id: string;
        plate: string;
        model: string | null;
    };
    maintenanceCenter: {
        id: number;
        name: string;
    };
    oficina: {
        id: number;
        name: string;
    }
};

export interface typesReturnsOrders {
    orders: OrderWithRelations[];
    users: user[];
    vehicles: vehicle[];
    maintenanceCenter: MaintenanceCenter[];
    oficina: Oficina[];
}
export const getOrders = async (): Promise<typesReturnsOrders> => {
    try {
        const maintenanceCenter = await prisma.maintenanceCenter.findMany();
        const users = await prisma.user.findMany();
        const vehicles = await prisma.vehicle.findMany();
        const oficina = await prisma.oficina.findMany();

        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {id:true,name:true}
                },
                vehicle: {
                    select: {
                        id: true,
                        plate: true,
                        model: true
                    }
                },
                maintenanceCenter: {
                    select: {id:true,name:true},
                },
                oficina: {
                    select: {id:true,name:true}
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const newOrders = orders.map(item=>({
            usuario: item.user.name,
            veiculo: item.vehicle.plate,
            centroManutencao: item.maintenanceCenter.name,
            ...item
        }))
        return { orders: newOrders, users, vehicles, maintenanceCenter, oficina };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], users: [], vehicles: [], maintenanceCenter: [], oficina: [] };
    }
};

export interface EditType {
    orders: OrderWithRelations | null;
    centers: MaintenanceCenter[];
    oficinas: Oficina[];
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
        const centers = await prisma.maintenanceCenter.findMany();
        const oficinas = await prisma.oficina.findMany();
        const orders = await prisma.order.findUnique({
            where: { osNumber: osNumber },
            include: {
                user: {
                    select: {id:true, name:true}
                },
                vehicle: {
                    select: {
                        id: true,
                        plate: true,
                        model: true
                    }
                },
                maintenanceCenter: true,
                oficina: {select: {id:true,name:true}}
            }
        });
        return { orders, centers, oficinas };
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        return { orders: null, centers: [], oficinas: [] };
    }
};