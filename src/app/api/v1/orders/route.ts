import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const centers = await prisma.maintenanceCenter.findMany();
        const vehicle = await prisma.vehicle.findMany({
            select: {
                id: true,
                plate: true,
                model: true,
            }
        });
        const vehicles = vehicle.map((v) => ({
            name: `${v.plate} - ${v.model}`,
            id: v.id
        }));
        return NextResponse.json({ vehicles, centers });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.json()
        const EventSchema = z.object({
            userId: z.string().min(3),
            vehicleId: z.string().min(1),
            kilometer: z.number().min(2),
            destination: z.string().min(3),
            entryDate: z.string().min(3),
            maintenanceType: z.string().min(3),
            maintenanceCenter: z.string().min(3),
            serviceDescriptions: z.string().min(3),
        })
        const validatedData = EventSchema.parse(formData);
        
        const { maintenanceCenter, ...data } = validatedData;

        const centers = await prisma.maintenanceCenter.upsert({
            where: { name: maintenanceCenter },
            create: { name: formData.maintenanceCenter },update: {}
        })
        const datas = await prisma.order.create({
            data:{
                ...data,
                maintenanceCenterId: centers.id
            }
        })
        return NextResponse.json(datas, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to process form",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}