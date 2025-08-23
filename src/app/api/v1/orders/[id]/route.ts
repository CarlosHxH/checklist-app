import { prisma } from "@/lib/prisma";
import { Order } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const orders = await prisma.order.findUnique({
            where: { osNumber: id },
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
                maintenanceCenter: {
                    select: { name: true }
                }
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error, message: 'Erro interno no servidor' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await request.json();

        const EventSchema = z.object({
            userId: z.string().min(3),
            vehicleId: z.string().min(1),
            kilometer: z.number().min(2),
            destination: z.string().min(3),
            completionDate: z.string().min(3),
            maintenanceType: z.string().min(3),
            maintenanceCenter: z.string().min(3),
            serviceDescriptions: z.string().min(3),
        })
        const validatedData = EventSchema.parse(formData);
        if(!validatedData) {
            return NextResponse.json({ validatedData, message: 'Erro interno no servidor' }, { status: 500 });
        }
        
        const { maintenanceCenter, ...data } = validatedData;

        const centers = await prisma.maintenanceCenter.upsert({
            where: { name: maintenanceCenter },
            create: { name: formData.maintenanceCenter },update: {}
        })

        const orders = await prisma.order.update({
            where: { osNumber: id },
            data: {
                ...data,
                maintenanceCenterId: centers.id,
                isCompleted: true
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error, message: 'Erro interno no servidor' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const orders = await prisma.order.delete({ where: { osNumber: id } });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error, message: 'Erro interno no servidor' }, { status: 500 });
    }
}