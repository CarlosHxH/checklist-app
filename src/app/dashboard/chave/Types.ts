export interface User {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

export interface VehicleKey {
  id: string;
  userId: string;
  vehicleId: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string | null;
  user: User;
  vehicle: Vehicle;
  parent?: VehicleKey | null;
  children: VehicleKey[];
}

export interface VehicleKeyFormData {
  userId: string;
  vehicleId: string;
  parentId?: string | null;
}