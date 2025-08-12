import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const vehicles = await prisma.vehicle.findMany({
            select: {
                id: true,
                plate: true,
                model: true,
            }
        });

        const data = vehicles.map((v) => ({
            label: `${v.plate} - ${v.model}`,
            value: v.id
        }));
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
