"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Container,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { fetcher } from "@/lib/ultils";
import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import CustomFab from "@/components/CustomFab";
import Image from "next/image";
import Loading from "@/components/Loading";

const ViewInspectionPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string; tag: string; item: string }>();
  const [inspectionData, setInspectionData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const fetchInspection = async () => {
        const data = await fetcher(`/api/inspections/${id}`);
        setInspectionData(data);
      };
      fetchInspection();
    }
  }, [id]);

  if (!inspectionData) return <Loading />;

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );

  const getStatusChip = (status: string | boolean) => {
    let config = { label: status, color: "error" } as any;
    if ([true, "BOM", "SIM", "NORMAL"].includes(status)) config = { label: "OK", color: "success" };
    else config = { label: "Pendente", color: "error" }
    return <Chip label={status || config.label} color={config.color} size="small" />;
  };


  return (
    <Box>
      <ResponsiveAppBar
        title={`Inspeção ${inspectionData?.vehicle?.plate || ""}`}
        onBackClick={() => router.push("/")}
        showBackButton
      />

      <CustomFab variant={"Edit"} href={`/inspection/${id}/edit`} />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
          <Typography variant="h4" gutterBottom>
            Detalhes da Inspeção
          </Typography>

          <Section title="Informações do Veículo">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Veículo:</Typography>
                <Typography>
                  {inspectionData.vehicle.plate}{" "}
                  {inspectionData.vehicle.model}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Data da Inspeção:</Typography>
                <Typography>
                  {new Date(inspectionData.dataInspecao).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Section>

          <Section title="Documentação">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">CRLV em Dia:</Typography>
                {getStatusChip(inspectionData.crlvEmDia)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">
                  Certificado Tacógrafo em Dia:
                </Typography>
                {getStatusChip(inspectionData.certificadoTacografoEmDia)}
              </Grid>
            </Grid>
          </Section>

          {/* Níveis */}
          <Section title="Níveis">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Nível de Água:</Typography>
                {getStatusChip(inspectionData.nivelAgua)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Nível de Óleo:</Typography>
                {getStatusChip(inspectionData.nivelOleo)}
              </Grid>
            </Grid>
          </Section>

          {/* Pneus */}
          <Section title="Pneus">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Dianteira:</Typography>
                {getStatusChip(inspectionData.dianteira)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Dianteira:</Typography>
                <Typography>
                  {inspectionData.descricaoDianteira || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Tração:</Typography>
                {getStatusChip(inspectionData.tracao)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Tração:</Typography>
                <Typography>
                  {inspectionData.descricaoTracao || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Truck:</Typography>
                {getStatusChip(inspectionData.truck)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Truck:</Typography>
                <Typography>
                  {inspectionData.descricaoTruck || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Quarto Eixo:</Typography>
                {getStatusChip(inspectionData.quartoEixo)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Quarto Eixo:</Typography>
                <Typography>
                  {inspectionData.descricaoQuartoEixo || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Section>

          {/* Avarias */}
          <Section title="Avarias">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Avarias na Cabine:</Typography>
                {getStatusChip(inspectionData.avariasCabine)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Avarias Cabine:</Typography>
                <Typography>
                  {inspectionData.descricaoAvariasCabine || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Avarias no Baú:</Typography>
                {getStatusChip(inspectionData.bauPossuiAvarias)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Avarias Baú:</Typography>
                <Typography>
                  {inspectionData.descricaoAvariasBau || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Section>

          {/* Parte Elétrica */}
          <Section title="Parte Elétrica">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">
                  Funcionamento Parte Elétrica:
                </Typography>
                {getStatusChip(inspectionData.funcionamentoParteEletrica)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Parte Elétrica:</Typography>
                <Typography>
                  {inspectionData.descricaoParteEletrica || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Section>
          {/* Foto veiculo */}
          <Section title="Foto do Veículo:">
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Image
                  width={100}
                  height={100}
                  src={inspectionData?.fotoVeiculo || "/assets/img/placeholder.png"}
                  alt={""}
                />
              </Grid>
            </Grid>
          </Section>
        </Paper>
      </Container>
    </Box>
  );
};

export default ViewInspectionPage;
