import { getAuditLogger } from "@/lib/audit";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// app/api/audit/records/route.ts - API para consultar auditoria
export async function GET(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const audit = getAuditLogger(prisma);
      const { searchParams } = new URL(request.url);
  
      const entityType = searchParams.get('entityType');
      const entityId = searchParams.get('entityId');
      const userId = searchParams.get('userId');
      const operation = searchParams.get('operation');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
  
      let records;
  
      if (entityType && entityId) {
        records = await audit.getRecordsByEntity(entityType, entityId, {
          limit,
          offset,
          operation: operation as any,
          userId: userId || undefined,
        });
      } else if (userId) {
        records = await audit.getRecordsByUser(userId, {
          limit,
          offset,
          entityType: entityType || undefined,
          operation: operation as any,
        });
      } else {
        return NextResponse.json({ error: 'Required parameters missing' }, { status: 400 });
      }
  
      return NextResponse.json(records);
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  