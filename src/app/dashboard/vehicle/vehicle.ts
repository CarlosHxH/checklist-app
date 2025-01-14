import { z } from "zod";

export const VehicleSchema = z.object({
  id: z.string(),
  make: z.string().min(2, "Preencha esse campo!"),
  model: z.string().min(2, "Preencha esse campo.!"),
  year: z.any(),
  eixo: z.any(),
  plate: z.string().min(7, "Preencha esse campo!"),
});

export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleCreateInput = Omit<Vehicle, "id">;
export type VehicleUpdateInput = Partial<Omit<Vehicle, "id">> & {
  id: string;
};
