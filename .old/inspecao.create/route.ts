// app/api/inspections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createInspectionWithPhotos } from "./inspections";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { photos, ...fields } = data;

    // Validate incoming data
    if (!data.userId || !data.vehicleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createInspectionWithPhotos(fields,photos);
    console.log(result);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}