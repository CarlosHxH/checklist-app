// app/api/inspections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createInspectionWithPhotos } from "./inspections";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { fotoDocumento, fotoExtintor, fotoTacografo, photos:fotos, ...fields } = data;
    
    // Validate incoming data
    if (!data.userId || !data.vehicleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Process base64 photos if they exist
    const photos = [];
    if (data.photos && Array.isArray(data.photos)) {
      for (const photo of data.photos) {
        if (!photo.photo || !photo.type) {
          continue;
        }
        photos.push({
          description: photo.description,
          photo: photo.photo, // Base64 string
          type: photo.type,
        });
      }
    }

    const result = await createInspectionWithPhotos(
      {
        userId: data.userId,
        vehicleId: data.vehicleId,
        funcionamentoParteEletrica: data.funcionamentoParteEletrica,
        descricaoParteEletrica: data.descricaoParteEletrica,
        kilometer: data.kilometer,
        extintor: data.extintor,
        ...fields
      },
      photos
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in inspection creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}