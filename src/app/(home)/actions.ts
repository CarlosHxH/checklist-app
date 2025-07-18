import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export default async function useActions() {
    const session = await getServerSession(authOptions);
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
    return { data: inspections }
}