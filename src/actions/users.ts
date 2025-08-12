"use server";
import { prisma } from '@/lib/prisma';
import { user } from '@prisma/client';

export const getUsers = async (): Promise<user[]> => {
    return await prisma.user.findMany();
};