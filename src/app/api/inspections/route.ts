import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { InspectionSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

// Utilitários para manipulação de arquivos e respostas
const FILE_EXTENSION = 'png';
const ASSETS_DIR = path.join(process.cwd(), "public/assets");

const handleApiError = (error: unknown, status = 500) => {
  console.error("API Error:", error);
  return NextResponse.json({
    error: "Operation failed",
    details: error instanceof Error ? error.message : "Unknown error",
  }, { status });
};

const handleFileUpload = async (file: File, inspectionId: string) => {
  if (!file || !(file instanceof File)) return "";
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `inspection_${inspectionId}.${FILE_EXTENSION}`;
    const filePath = path.join(ASSETS_DIR, filename);
    
    await fs.writeFile(filePath, buffer);
    return `/assets/${filename}`;
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("Failed to upload file");
  }
};

// Handlers da API
export async function GET() {
  try {
    const inspections = await prisma.inspection.findMany({
      include: { vehicle: true },
      orderBy: { dataInspecao: "desc" },
    });
    return NextResponse.json(inspections);
  } catch (error) {
    return handleApiError(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({ error: "Empty request body" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    
    // Prepara dados da inspeção
    const formDataObject: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== "fotoVeiculo") formDataObject[key] = value;
    });

    delete formDataObject.id;
    delete formDataObject.dataInspecao;

    // Cria registro e processa arquivo
    const validatedData = InspectionSchema.parse(formDataObject);
    const inspection = await prisma.inspection.create({ data: validatedData });
    
    const file = formData.get("fotoVeiculo") as File;
    const fileUrl = await handleFileUpload(file, inspection.id);

    if (fileUrl) {
      await prisma.inspection.update({
        where: { id: inspection.id },
        data: { fotoVeiculo: fileUrl },
      });
    }

    const updatedInspection = await prisma.inspection.findUnique({
      where: { id: inspection.id },
    });

    return NextResponse.json({
      message: "Inspection created successfully",
      data: updatedInspection,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 403);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    
    // Processa arquivo se existir
    const file = formData.get("fotoVeiculo") as File;
    const fileUrl = await handleFileUpload(file, id);

    // Prepara dados para atualização
    const updateData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== "fotoVeiculo" && key !== "id") updateData[key] = value;
    });

    if (fileUrl) updateData.fotoVeiculo = fileUrl;

    const validatedData = InspectionSchema.parse(updateData);
    const inspection = await prisma.inspection.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      message: "Inspection updated successfully",
      data: inspection,
    });
  } catch (error) {
    return handleApiError(error, 400);
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.inspection.delete({ where: { id } });
    
    return NextResponse.json({ 
      message: "Inspection deleted successfully",
      success: true 
    });
  } catch (error) {
    return handleApiError(error);
  } finally {
    await prisma.$disconnect();
  }
}