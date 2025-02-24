import { prisma } from "@/lib/prisma";

interface InspectionData {
  userId: string;
  vehicleId: string;
  funcionamentoParteEletrica?: string;
  descricaoParteEletrica?: string;
  kilometer?: string;
  extintor?: string;
  // Add other inspection fields as needed
}

interface PhotoData {
  description?: string;
  photo: string;
  type: 'documento' | 'tacografo' | 'extintor' | 'vehicle';
}

export async function createInspectionWithPhotos(
  inspectionData: InspectionData,
  photos: PhotoData[]
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the inspection record
      const inspection = await tx.inspection.create({
        data: {
          ...inspectionData,
          createdAt: new Date(),
          isFinished: true,
        },
      });

      // 2. Create photo records and establish relationships
      const photoPromises = photos.map(async (photo) => {
        const inspectionPhoto = await tx.inspectionPhoto.create({
          data: {
            inspectionId: inspection.id,
            description: photo.description,
            photo: photo.photo,
            type: photo.type,
            createdAt: new Date(),
          },
        });

        // 3. Update inspection with photo relationships based on type
        const updateData: any = {};
        switch (photo.type) {
          case 'documento': updateData.fotoDocumento = {connect: { id: inspectionPhoto.id },};
            break;
          case 'tacografo': updateData.fotoTacografo = {connect: { id: inspectionPhoto.id }};
            break;
          case 'extintor': updateData.fotoExtintor = {connect: { id: inspectionPhoto.id }};
            break;
          case 'vehicle': updateData.vehicle = {connect: { id: inspectionPhoto.id }};
            break;
        }

        await tx.inspection.update({
          where: { id: inspection.id },
          data: updateData,
        });
        return inspectionPhoto;
      });

      const createdPhotos = await Promise.all(photoPromises);

      return { inspection, photos: createdPhotos };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}