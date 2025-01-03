"use client";
import React from "react";
import { Stack, Typography } from "@mui/material";
import useSWR from "swr";
import { InspectionModal } from "./InspectionModal";
import { InspectionTable } from "./InspectionTable";
import { fetcher } from "@/lib/ultils";
import SearchBar from "@/components/SearchBar";
import Loading from "@/components/Loading";
import { DataType, InspectionFormData, InspectionType } from "@/lib/formDataTypes";

const DEFAULT_FORM_DATA: Partial<InspectionFormData> = {
  id: "",
  userId: "",
  vehicleId: "",
  status: "INICIO" as "INICIO" | "FINAL",
  dataInspecao: new Date(),
  eixo: "0",
};

export default function InspectionManager() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<InspectionFormData>>(DEFAULT_FORM_DATA);
  const [filter, setFilter] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const { data, error, mutate } = useSWR<DataType>('/api/admin/inspections',fetcher);
  const vehicles = data?.vehicle || [];
  
  if(!data) return <Loading/>;

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "vehicleId") {
      const eixo = vehicles.find((e: any) => e.id === value)?.eixo || 0;
      let data = {};
      const eixoNumber = Number(formData.eixo) || 0;
      if (eixoNumber > 3) data = { ...data, quartoEixo: "", descricaoQuartoEixo: "" };
      if (eixoNumber > 2) data = { ...data, truck: "", descricaoTruck: "" };
      if (eixoNumber > 1) data = { ...data, tracao: "", descricaoTracao: "" };

      data = { ...data, eixo };
      setFormData((prev) => ({ ...prev, ...data }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log(formData);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir esta inspeção?")) return;
    try {
      await fetch("/api/inspections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate();
    } catch (error) {
      console.error("Error deleting inspection:", error);
    }
  };

  const handleOpenDialog = (inspection?: InspectionType) => {
    setFormData(inspection || DEFAULT_FORM_DATA);
    setOpenDialog(true);
  };

  if (error) return <Typography color="error">Failed to load inspections</Typography>;

  const filteredInspections = data?.inspections.filter(ins => 
    ins.user?.name.toLowerCase().includes(filter.toLowerCase()) ||
    ins.vehicle.licensePlate.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const callback = async (e:Response)=>{
    mutate()
  }
  

  return (
    <Stack spacing={2}>
      <InspectionModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        data={data}
        formData={formData}
        onChange={handleFormChange}
        callback={callback}
      />

      <SearchBar
        value={filter}
        onChange={(e:{target:{value:string}}) => setFilter(e.target.value)}
        onAdd={() => handleOpenDialog()}
      />

      <InspectionTable
        inspections={filteredInspections}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
      />
    </Stack>
  );
}