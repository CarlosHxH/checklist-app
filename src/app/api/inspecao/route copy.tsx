import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('photos');
    
    const fileData = await Promise.all(
      files.map(async (file: any) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data: base64
        };
      })
    );

    console.log(fileData.map(f => ({ name: f.name, size: f.size })));
    
/*
    const savedFiles = await prisma.inspection.createMany({
      data: fileData.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        data: file.base64Data,
        userId: 'someUserId',
        vehicleId: 'someVehicleId'
      }))
    });
*/
    return Response.json({ 
      message: 'Files uploaded successfully',
      count: 'teste'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';