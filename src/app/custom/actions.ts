import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import React from 'react';

interface custom {

}
export default async function Custom() {
    const [isLoading, setIsloading] = React.useState(true)
    const session = await getServerSession(authOptions);
    try {
        if (!session?.user) { return 'Not authenticated' }

        const inspections = await prisma.inspect.findMany({
            where: { userId: session.user.id },
            include: {
                user: { select: { name: true } },
                vehicle: true,
                start: true,
                end: true
            },
            orderBy: { createdAt: 'desc' },
            take: 4,
        });
        return {data: inspections, isLoading}
    } catch (error) {
        return error;
    } finally {
        setIsloading(false)
    }
}