// types.ts
export interface User {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
}
export type DataType = {
  users: { id: string; name: string }[];
  vehicles: { id: string; plate: string; model: string }[];
  vehicleKeys: VehicleKey[];
};


export interface VehicleKey {
  id: string;
  userId: string;
  vehicleId: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string | null;
  user: User;
  vehicle: Vehicle;
}

export interface VehicleKeyFormData {
  userId: string;
  vehicleId: string;
  parentId?: string | null;
}

export interface VehicleKeyHistory {
  id: string;
  userId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  user: {
    name: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
}
