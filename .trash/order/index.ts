// types/order.ts
import { user, vehicle, MaintenanceType, MaintenanceCenter } from '@prisma/client';

export type OrderWithRelations = {
  id: number;
  osNumber: number;
  automaticValuation: boolean;
  userId: string;
  vehicleId: string;
  mileage: number;
  destination: string;
  entryDate: Date;
  maintenanceTypeId: number;
  maintenanceCenterId: number;
  isCompleted: boolean;
  completionDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: user;
  vehicle: vehicle;
  maintenanceType: MaintenanceType;
  maintenanceCenter: MaintenanceCenter;
  serviceDescriptions: String;
};