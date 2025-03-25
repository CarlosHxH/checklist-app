import { NextResponse } from 'next/server';
import { createInspectionWithTransaction } from './inspection.service';
import { fileToBase64 } from '@/utils';
/*
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}*/

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: any = {};
    
    // Process all form fields
    for (const [key, value] of formData.entries()) {
      if (key === 'photos') {
        // Handle multiple photos
        if (!data.photos) data.photos = [];
        if (value instanceof File) {
          const base64 = await fileToBase64(value);
          data.photos.push({
            photo: base64,
            type: 'vehicle',
            description: `Veiculo foto-${data.photos.length + 1}`
          });
        }
      } else {
        // Handle regular form fields
        data[key] = value;
      }
    }


    // Create the inspection record in the database
    const inspection = await createInspectionWithTransaction(data);

    return NextResponse.json({ 
      success: true, 
      message: 'Inspection created successfully',
      data: inspection
    });
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error creating inspection',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}