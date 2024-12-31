"use client";
import React from "react";
import { Stack, Typography } from "@mui/material";
import useSWR from "swr";
import { DataType, InspectionFormData, InspectionType } from "./types";
import { InspectionModal } from "./InspectionModal";
import { InspectionTable } from "./InspectionTable";
import { fetcher, today } from "@/lib/ultils";
import SearchBar from "./SearchBar";
import Loading from "@/components/Loading";

const DEFAULT_FORM_DATA: InspectionFormData = {
  id: "",
  userId: "",
  vehicleId: "",
  status: "",
  dataInspecao: today(),
  crlvEmDia: "",
  certificadoTacografoEmDia: "",
  nivelAgua: "",
  nivelOleo: "",
  eixo: '0',
  dianteira: "",
  descricaoDianteira: "",
  tracao: "",
  descricaoTracao: "",
  truck: "",
  descricaoTruck: "",
  quartoEixo: "",
  descricaoQuartoEixo: "",
  avariasCabine: "",
  descricaoAvariasCabine: "",
  bauPossuiAvarias: "",
  descricaoAvariasBau: "",
  funcionamentoParteEletrica: "",
  descricaoParteEletrica: "",
  fotoVeiculo: "",
};

export default function InspectionManager() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [formData, setFormData] = React.useState<InspectionFormData>(DEFAULT_FORM_DATA);
  const [filter, setFilter] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const { data, error, mutate } = useSWR<DataType>('/api/admin/inspections',fetcher);
  
  if(!data) return <Loading/>;

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    console.log({ name, value });
  };

  const handleToggle = (event: Partial<InspectionFormData>) => {
    setFormData(prev => ({ ...prev, ...event }));
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
  

  return (
    <Stack spacing={2}>
      <InspectionModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        data={data}
        formData={formData}
        onToggle={handleToggle}
        onChange={handleFormChange}
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