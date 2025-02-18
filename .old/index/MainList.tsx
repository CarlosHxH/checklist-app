"use client";
import React from "react";
import { Box, Card, CardContent, Typography, Chip, Grid, IconButton, List, ListItem, Divider, Button } from "@mui/material";
import { Edit as EditIcon, Visibility as ViewIcon } from "@mui/icons-material";
import { fetcher, formatDate } from "@/lib/ultils";
import useSWR from "swr";
import Loading from "@/components/Loading";

interface Props {
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  userId: string | null;
}
interface VehicleInspection {
  id: string;
  plate: string;
  model: string;
  crlvEmDia: boolean;
  certificadoTacografoEmDia: boolean;
  avariasCabine: boolean;
  bauPossuiAvarias: boolean;
  funcionamentoParteEletrica: boolean;
  dataInspecao: string;
  vehicle: {
    plate: string;
    model: string;
  };
  isFinished: boolean;
  status: "INICIO" | "FINAL"
}

export default function MainList({ onEdit, onView, userId }: Props) {
  const { data, isLoading } = useSWR<VehicleInspection[]>(`/api/inspections/user/${userId}`, fetcher, { refreshInterval: 5000 });

  const getStatusChip = (status: string | boolean) => {
    let config = { label: status, color: "error" as "error" | "success" };
    if ([true, "BOM", "SIM", "NORMAL"].includes(status)) config = { label: "OK", color: "success" as "error" | "success" };
    else config = { label: "Pendente", color: "error" as "error" | "success" }
    return <Chip label={config.label} color={config?.color} size="small" />;
  };

  if (data?.length === 0) {
    return (
      <Card sx={{ m: 5, p: 5, bgcolor: "#fff", height: 50 }}>
        <Typography color="textPrimary">Nenhuma inspeção encontrada.</Typography>
      </Card>
    );
  }

  return (
    <List sx={{ paddingBottom: 20 }}>
      {isLoading || !data && <Loading />}
      {data &&
        data.map((inspection, index) => (
          <React.Fragment key={inspection.id}>
            <ListItem sx={{ py: 2, px: { xs: 1, sm: 2 }, bgcolor: "background.paper" }}>
              <Card sx={{ width: "100%" }}>
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Main Info */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom>
                        {inspection.vehicle.plate}{" - "}
                        {inspection.vehicle.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data da Inspeção: {formatDate(inspection.dataInspecao)}
                      </Typography>
                      <Typography mt={2}>
                        {inspection.status&&`STATUS: ${inspection.status} DA VIAGEM`}
                      </Typography>
                    </Grid>

                    {/* Status Indicators */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1}}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            CRLV: { }
                          </Typography>
                          {getStatusChip(inspection.crlvEmDia)}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            Tacógrafo:
                          </Typography>
                          {getStatusChip(inspection.certificadoTacografoEmDia)}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 120 }}>
                            Parte Elétrica:
                          </Typography>
                          {getStatusChip(!!inspection.funcionamentoParteEletrica)}
                        </Box>
                      </Box>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1, }}>
                      {onView && (<IconButton onClick={() => onView(inspection.id)} color="primary"><ViewIcon /></IconButton>)}
                      {onEdit && !inspection.isFinished && (<IconButton onClick={() => onEdit(inspection.id)} color="primary"><EditIcon /></IconButton>)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </ListItem>
            {index < data.length - 1 && <Divider />}
          </React.Fragment>
        ))}
    </List>
  );
}
