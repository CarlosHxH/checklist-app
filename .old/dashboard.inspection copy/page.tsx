"use client";
import React from "react";
import { Stack, Typography } from "@mui/material";
import useSWR from "swr";
import { InspectionTable } from "./InspectionTable";
import { fetcher } from "@/lib/ultils";
import SearchBar from "@/components/SearchBar";
import Loading from "@/components/Loading";
import { DataType } from "@/lib/formDataTypes";

export default function InspectionManager() {
  const [filter, setFilter] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data, error, mutate } = useSWR<DataType>('/api/admin/inspections', fetcher);

  if (!data || isSubmitting) return <Loading />;

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir esta inspeção?")) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/inspections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate();
    } catch (error) {
      console.error("Error deleting inspection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (error) return <Typography color="error">Failed to load inspections</Typography>;

  const filteredInspections = data?.inspections?.filter(ins => 
    ins.id.includes(filter.toLowerCase()) ||
    ins.user?.name.toLowerCase().includes(filter.toLowerCase()) ||
    ins.vehicle?.model.toLowerCase().includes(filter.toLowerCase()) ||
    ins.vehicle?.plate.toLowerCase().includes(filter.toLowerCase())
  ) ?? [];

  return (
    <Stack spacing={2}>

      <SearchBar
        value={filter}
        onChange={(e: { target: { value: string } }) => setFilter(e.target.value)}
      />

      <InspectionTable
        inspections={filteredInspections}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onDelete={handleDelete}
      />
    </Stack>
  );
}