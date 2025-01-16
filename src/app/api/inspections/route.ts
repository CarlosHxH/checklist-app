import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { InspectionSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const inspections = await prisma.inspection.findMany({
      include: { vehicle: true },
      orderBy: { dataInspecao: "desc" },
    });
    return NextResponse.json(inspections, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Content-Type:", req.headers.get("content-type"));

    if (!req.body) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }
    const formData = await req.formData();
    // Handle file upload
    const file = formData.get("fotoVeiculo");
    let fileUrl = "";

    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = crypto.randomUUID() + "." + file.type.split("/")[1];
      const filePath = path.join(process.cwd(), "public/assets", filename);

      try {
        await fs.writeFile(filePath, buffer);
        fileUrl = `/assets/${filename}`;
      } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json(
          { message: "Failed to upload file" },
          { status: 500 }
        );
      }
    }

    // Convert FormData to object
    const formDataObject: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "fotoVeiculo") {
        // Skip the file field
        formDataObject[key] = value;
      }
    }

    // Add the file URL to the data if a file was uploaded
    if (fileUrl) {
      formDataObject.fotoVeiculo = fileUrl;
    }

    // Remove fields that shouldn't be in the database
    delete formDataObject.id;
    delete formDataObject.dataInspecao;

    // Validate the data
    const validatedData = InspectionSchema.parse(formDataObject);

    // Create the inspection record
    const inspection = await prisma.inspection.create({
      data: validatedData,
    });

    return NextResponse.json(
      {
        message: "Inspection created successfully",
        data: inspection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing request:", error);

    return NextResponse.json(
      {
        error: "Failed to create inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 403 }
    );
  } finally {
    await prisma.$disconnect();
  }
}




export async function PUT(request: NextRequest) {
  try {
    
    const formData = await request.formData();
    const id = formData.get("id");

    // Handle file upload if present
    const file = formData.get("fotoVeiculo");
    let fileUrl = "";

    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = crypto.randomUUID() + "." + file.type.split("/")[1];
      const filePath = path.join(process.cwd(), "public/assets", filename);

      try {
        await fs.writeFile(filePath, buffer);
        fileUrl = `/assets/${filename}`;
      } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json(
          { message: "Failed to upload file" },
          { status: 500 }
        );
      }
    }

    // Convert FormData to object
    const updateData: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "fotoVeiculo" && key !== "id") {
        // Skip file and id fields
        updateData[key] = value;
      }
    }

    // Add the file URL to the update data if a new file was uploaded
    if (fileUrl) {
      updateData.fotoVeiculo = fileUrl;
    }

    // Validate the data
    const validatedData = InspectionSchema.parse(updateData);

    // Update the inspection record
    const inspection = await prisma.inspection.update({
      where: { id: String(id) },
      data: validatedData,
    });

    return NextResponse.json({
      message: "Inspection updated successfully",
      data: inspection,
    });
  } catch (error) {
    console.error("Error processing request:", error);

    return NextResponse.json(
      {
        error: "Failed to update inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.inspection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
