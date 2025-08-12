"use server";
import { prisma } from '@/lib/prisma';
import { Order } from '@prisma/client';

export const getOrders = async (): Promise<Order[]> => {
    return await prisma.order.findMany();
};