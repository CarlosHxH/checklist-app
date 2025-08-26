"use server"
import { prisma } from '@/lib/prisma';
import { Oficina, Order, user, vehicle } from '@prisma/client';

export interface defaultType {
    id: number | string;
    name: string;
}
export interface TypeVehicle {
    id: string;
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
    maintenanceCenter: defaultType;
    oficina: defaultType;
};

export interface TypesCreate {
    vehicles: TypeVehicle[];
    maintenanceCenter: defaultType[];
    oficina: defaultType[];
    users: user[]
}

export const getDetails = async (): Promise<TypesCreate> => {
    try {
        const maintenanceCenter = await prisma.maintenanceCenter.findMany()
        const vehicles = await prisma.vehicle.findMany()
        const oficina = await prisma.oficina.findMany()
        const users = await prisma.user.findMany()
        const newVehicles = vehicles.map(item=>({
            id: item.id,
            name: item.plate
        }))
        return { vehicles: newVehicles, maintenanceCenter, oficina, users };
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
        return { vehicles:[], maintenanceCenter:[], oficina:[], users:[] };
    }
}

export interface typesReturnsOrders {
    orders: OrderWithRelations[];
    users: user[];
    vehicles: vehicle[];
    maintenanceCenter: defaultType[];
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
                user: {select: {id: true,name: true,username: true }},
                vehicle: {select: {id: true,plate: true,model: true }},
                maintenanceCenter: {select: {id: true,name: true }},
                oficina: {select: { id: true, name: true }}
            },
            orderBy: { createdAt: 'desc' }
        });
        const newOrders = orders.map(item=>({
            usuarios: item.user.name,
            veiculos: item.vehicle.plate,
            oficinas: item.oficina.name,
            centro: item.maintenanceCenter.name,
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
    centers: defaultType[];
    oficina: defaultType[];
}
export async function deleteOrder(os:string) {
    try {
        const find = await prisma.order.findUnique({ where: { osNumber: os }});
        if (!find) {
            throw new Error("Não encontrado");
        }
        const del = await prisma.order.delete({where:{ id: find.id }});
        return { success: true, data: del };
    } catch (error) {
        console.log(error);
        return error
    }
}

export const getOrdersById = async (osNumber: string): Promise<EditType> => {
    try {
        const centers = await prisma.maintenanceCenter.findMany({select: {id: true,name: true}});
        const oficina = await prisma.oficina.findMany({select: { id: true, name: true }});
        const orders = await prisma.order.findUnique({
            where: { osNumber: osNumber },
            include: {
                user: {select: {id: true,name: true,username: true }},
                vehicle: {select: {id: true,plate: true,model: true }},
                maintenanceCenter: {select: {id: true,name: true }},
                oficina: {select: { id: true, name: true }},
            }
        });
        if (!orders) {
            throw new Error("Ordem de serviço não encontrada");
        }

        const newOrders = {
            usuarios: orders.user.name,
            veiculos: orders.vehicle.plate,
            oficinas: orders.oficina.name,
            centro: orders.maintenanceCenter.name,
            ...orders
        }

        return { orders: newOrders, centers, oficina };
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        return { orders: null, centers: [], oficina: [] };
    }
};