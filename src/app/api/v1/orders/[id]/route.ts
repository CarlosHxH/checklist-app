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
                vehicle: true,
                oficina: true,
                maintenanceCenter: true
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

        // Updated schema to match the form data structure
        const EventSchema = z.object({
            userId: z.string().min(3),
            vehicleId: z.string().min(1),
            kilometer: z.number().min(2),
            oficina: z.string().min(3),
            finishedData: z.string().optional().nullable(),
            maintenanceType: z.string().min(3),
            maintenanceCenter: z.string().min(3),
            serviceDescriptions: z.string().min(3),
        })

        const validatedData = EventSchema.parse(formData);

        const { maintenanceCenter, oficina, finishedData, ...data } = validatedData;

        // Convert finishedData to Date if provided
        const finishedDate = finishedData ? new Date(finishedData) : null;

        // Upsert oficina
        const oficinaRecord = await prisma.oficina.upsert({
            where: { name: oficina },
            create: { name: oficina },
            update: {}
        });

        // Upsert maintenance center
        const maintenanceCenterRecord = await prisma.maintenanceCenter.upsert({
            where: { name: maintenanceCenter },
            create: { name: maintenanceCenter },
            update: {}
        });

        // Update the order using numeric ID instead of osNumber
        const orders = await prisma.order.update({
            where: { osNumber: id },
            data: {
                ...data,
                oficinaId: oficinaRecord.id,
                maintenanceCenterId: maintenanceCenterRecord.id,
                finishedData: finishedDate,
                isCompleted: !!finishedDate
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('PUT Error:', error);
        return NextResponse.json(
            {
                error: "Failed to update order",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        // Check if order exists first
        const existingOrder = await prisma.order.findUnique({
            where: { osNumber: id }
        });
        
        if (!existingOrder) {
            return NextResponse.json(
                { error: "Order not found" }, 
                { status: 404 }
            );
        }
        
        // Delete the order
        const deletedOrder = await prisma.order.delete({ 
            where: { id: parseInt(id) }
        });
        
        return NextResponse.json({
            message: "Order deleted successfully",
            deletedOrder
        }, { status: 200 });
        
    } catch (error) {
        console.error('DELETE Error:', error);
        
        // Handle Prisma-specific errors
        if (error instanceof Error) {
            if (error.message.includes('Record to delete does not exist')) {
                return NextResponse.json(
                    { error: "Order not found" }, 
                    { status: 404 }
                );
            }
        }
        
        return NextResponse.json(
            { 
                error: "Failed to delete order",
                details: error instanceof Error ? error.message : "Unknown error"
            }, 
            { status: 500 }
        );
    }
}