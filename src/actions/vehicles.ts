"use server";

import { prisma } from '@/lib/prisma';
import { vehicle } from '@prisma/client';

export interface VehicleLabel {
    label: string;
    value: string;
}

export const getVehicles = async (): Promise<vehicle[]> => {
    return await prisma.vehicle.findMany();
};

export const vehicleLabels = async (): Promise<VehicleLabel[]> => {
    const vehicles = await prisma.vehicle.findMany({
        select: {
            id: true,
            plate: true,
            model: true,
        }
    });
    
    return vehicles.map((v) => ({
        label: `${v.plate} - ${v.model}`,
        value: v.id
    }));
};