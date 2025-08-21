import { Grid, TextField } from "@mui/material";
import ButtonLabel from "./ButtonLabel";
import { InspectionFormData } from "@/types/InspectionSchema";
import { useEffect } from "react";
import { vehicle } from "@prisma/client";

export interface Option {
    [key: string]: any;
    setValue: (name: keyof InspectionFormData, value: any) => void;
}

export interface Vehicle extends Option {
    id: string;
    plate: string;
    model: string;
}

export interface EixoSectionProps {
    eixoNumber: number;
    label: string;
    fieldName: keyof InspectionFormData;
    selectedVehicle?: vehicle;
    control: any;
    register: any;
    watch: any;
    setValue: any;
}

export const EixoSection: React.FC<EixoSectionProps> = ({ eixoNumber, label, fieldName, selectedVehicle, control, register, watch, setValue }) => {
  const currentValue = watch(fieldName);
  const field = `descricao${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof InspectionFormData;

  useEffect(() => {
    if (!selectedVehicle || Number(selectedVehicle.eixo) < Number(eixoNumber)) return;
    if (currentValue === "BOM") setValue(field, "");
  }, [currentValue, field, setValue, selectedVehicle, eixoNumber]);

  if (!selectedVehicle || Number(selectedVehicle.eixo) < Number(eixoNumber)) return null;

  return (
    <Grid item xs={12} sm={6}>
      <ButtonLabel label={label} name={fieldName} options={["BOM", "RUIM"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
      {currentValue === "RUIM" && (
        <TextField {...register(field, { required: "Este campo é obrigatório" })} label="Qual Defeito?" multiline fullWidth rows={2} />
      )}
    </Grid>
  );
};