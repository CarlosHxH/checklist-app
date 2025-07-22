import { NextResponse } from "next/server";
import { createInspectionWithTransaction } from "./inspection.service";
import { fileToBase64 } from "@/utils";
import { setupFilePolyfill } from "@/utils/file-polyfill";

// Set up File polyfill before processing
setupFilePolyfill();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: any = {};
    
    // Process all form fields
    for (const [key, value] of formData.entries()) {
      if (key === "photos") {
        // Handle multiple photos
        if (!data.photos) data.photos = [];

        // Check if value is a File or Blob
        if (value instanceof Blob) {
          const base64 = await fileToBase64(value);
          data.photos.push({
            photo: base64,
            type: "vehicle",
            description: `Veiculo foto-${data.photos.length + 1}`,
          });
        }
      } else {
        // Handle regular form fields
        data[key] = value;
      }
    }
    const result = await createInspectionWithTransaction(data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process form",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
