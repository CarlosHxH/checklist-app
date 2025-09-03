import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const centers = await prisma.maintenanceCenter.findMany();
        const oficina = await prisma.oficina.findMany();
        const vehicle = await prisma.vehicle.findMany({
            select: { id: true, plate: true, model: true}
        });
        const vehicles = vehicle.map((v) => ({ name: `${v.plate} - ${v.model}`, id: v.id }));
        return NextResponse.json({ vehicles, centers, oficina });
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
            oficina: z.string().min(3),
            startedData: z.string().min(3),
            finishedData: z.string().min(3).optional().nullable(),
            maintenanceType: z.string().min(3),
            maintenanceCenter: z.string().min(3),
            serviceDescriptions: z.string().min(3),
        })
        
        const validatedData = EventSchema.parse(formData);
        
        const { maintenanceCenter, oficina, startedData, finishedData, ...data } = validatedData;
        
        const started = new Date(startedData);
        const finished = finishedData ? new Date(finishedData) : null;
        
        // Fix: Use correct model for oficina upsert
        const oficinaRecord = await prisma.oficina.upsert({
            where: { name: oficina },
            create: { name: oficina },
            update: {}
        });
        
        // Fix: Use MaintenanceCenter model for maintenance center upsert
        const maintenanceCenterRecord = await prisma.maintenanceCenter.upsert({
            where: { name: maintenanceCenter },
            create: { name: maintenanceCenter },
            update: {}
        });
        
        const datas = await prisma.order.create({
            data: {
                ...data,
                oficinaId: oficinaRecord.id,
                maintenanceCenterId: maintenanceCenterRecord.id,
                startedData: started,
                finishedData: finished,
                isCompleted: !!finished
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