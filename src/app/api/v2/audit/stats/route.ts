import { getAuditLogger } from "@/lib/audit";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

  // app/api/audit/stats/route.ts - API para estatísticas
  export async function GET(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const audit = getAuditLogger(prisma);
      const { searchParams } = new URL(request.url);
  
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const entityType = searchParams.get('entityType');
      const userId = searchParams.get('userId');
  
      const stats = await audit.getAuditStats({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        entityType: entityType || undefined,
        userId: userId || undefined,
      });
  
      return NextResponse.json(stats);
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  
  /*
  // components/AuditHistory.tsx - Componente React para mostrar histórico
  import { useEffect, useState } from 'react';
  
  interface AuditRecord {
    id: string;
    operation: string;
    tableName: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    timestamp: string;
    description?: string;
    user: {
      name: string;
      username: string;
    };
  }
  
  interface AuditHistoryProps {
    entityType: string;
    entityId: string;
  }
  
  export function AuditHistory({ entityType, entityId }: AuditHistoryProps) {
    const [records, setRecords] = useState<AuditRecord[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchRecords() {
        try {
          const response = await fetch(
            `/api/audit/records?entityType=${entityType}&entityId=${entityId}`
          );
          const data = await response.json();
          setRecords(data);
        } catch (error) {
          console.error('Erro ao carregar histórico:', error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchRecords();
    }, [entityType, entityId]);
  
    if (loading) {
      return <div>Carregando histórico...</div>;
    }
  
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Alterações</h3>
        {records.length === 0 ? (
          <p className="text-gray-500">Nenhum registro encontrado.</p>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <div key={record.id} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{record.operation}</span>
                    {record.fieldName && (
                      <span className="text-sm text-gray-600 ml-2">
                        - {record.fieldName}
                      </span>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Por: {record.user.name} (@{record.user.username})
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                {record.description && (
                  <p className="text-sm mt-2">{record.description}</p>
                )}
                
                {record.operation === 'UPDATE' && record.oldValue && record.newValue && (
                  <div className="mt-2 text-sm">
                    <span className="text-red-600">Antes: {record.oldValue}</span>
                    <br />
                    <span className="text-green-600">Depois: {record.newValue}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  /*
  // Exemplo de uso em middleware (opcional)
  // middleware.ts
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  
  export function middleware(request: NextRequest) {
    // Adicionar headers para auditoria
    const response = NextResponse.next();
    
    // Capturar informações para auditoria
    response.headers.set('x-audit-path', request.nextUrl.pathname);
    response.headers.set('x-audit-method', request.method);
    
    return response;
  }
  */