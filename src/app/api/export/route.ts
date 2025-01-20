// app/api/export/route.ts
import { NextResponse } from 'next/server'
import { exportToCsv } from '@/utils/csvExport'

export async function GET() {
  try {
    const filePath = await exportToCsv({
      model: 'user',
      fields: ['id', 'name', 'email']
    })
    
    return NextResponse.json({ success: true, filePath })
  } catch (error) {
    return NextResponse.json({ error: 'Erro na exportação' }, { status: 500 })
  }
}