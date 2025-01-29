import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const inspect = await prisma.inspect.findMany({
            include: {
                user: true,
                start: true,
                end: true
              }
        });
        return NextResponse.json(inspect)
    } catch (error) {
        return NextResponse.json(error)
    }
}

export async function HEAD(request: Request) { }

export async function POST(request: Request) {}

export async function PUT(request: Request) { }

export async function DELETE(request: Request) { }

export async function PATCH(request: Request) { }
