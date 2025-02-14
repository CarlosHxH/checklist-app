"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Paper, Typography, Grid, Box, Container, Chip, Card, CardContent, Stack } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import CustomAppBar from "@/components/_ui/CustomAppBar";
import CustomFab from "@/components/_ui/CustomFab";
import Loading from "@/components/Loading";

const ViewInspectionPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string; tag: string; item: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const fetchInspection = async () => {
        const res = await fetcher(`/api/inspections/${id}`);
        setData(res);
      };
      fetchInspection();
    }
  }, [id]);

  if (!data) return <Loading />;

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
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

  const EixoView = ({ label, value, descricao }: { label: string, value: string, descricao: string }) => {
    if (!value) return;
    return (
      <>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">{label}:</Typography>
          <Chip label={value} color={value === "BOM" ? "success" : "error"} size="small" />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Descrição {label}:</Typography>
          <Typography>{descricao || "N/A"}</Typography>
        </Grid>
      </>
    )
  }


  return (
    <Box>
      <CustomAppBar
        title={`Inspeção ${data?.vehicle?.plate || ""}`}
        onBackClick={() => router.push("/")}
        showBackButton
      />

      {!data.isFinished && <CustomFab variant={"Edit"} href={`/inspection/${id}/edit`} />}

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
          <Stack direction={"row"} sx={{alignItems:'center'}} justifyContent={'space-between'}>
            <Typography variant="h4" gutterBottom>
              Detalhes da Inspeção
            </Typography>
            <Typography variant="caption">Codigo: {data.id}</Typography>
          </Stack>

          <Section title="Informações do Veículo">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Veículo:</Typography>
                <Typography>
                  {data.vehicle.plate}{" "}
                  {data.vehicle.model}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Data da Inspeção:</Typography>
                <Typography>
                  {new Date(data.dataInspecao).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Status da viagem</Typography>
                <Typography>
                  {data.status}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Quilometragem:</Typography>
                <Typography>
                  {Number(data.kilometer)}
                </Typography>
              </Grid>


            </Grid>
          </Section>

          <Section title="Documentação">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">CRLV em Dia:</Typography>
                {getStatusChip(data.crlvEmDia)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">
                  Certificado Tacógrafo em Dia:
                </Typography>
                {getStatusChip(data.certificadoTacografoEmDia)}
              </Grid>
            </Grid>
          </Section>

          {/* Níveis */}
          <Section title="Níveis">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Nível de Água:</Typography>
                {getStatusChip(data.nivelAgua)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Nível de Óleo:</Typography>
                {getStatusChip(data.nivelOleo)}
              </Grid>
            </Grid>
          </Section>

          {/* Pneus */}
          <Section title="Pneus">
            <Grid container spacing={2}>
              <EixoView label={"Dianteira"} value={data.dianteira} descricao={data.descricaoDianteira} />
              <EixoView label={"Tração"} value={data.tracao} descricao={data.descricaoTracao} />
              <EixoView label={"Quarto Eixo"} value={data.truck} descricao={data.descricaoTruck} />
              <EixoView label={"Quarto Eixo"} value={data.quartoEixo} descricao={data.descricaoQuartoEixo} />
            </Grid>
          </Section>

          {/* Avarias */}
          <Section title="Avarias">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Avarias na Cabine:</Typography>
                <Chip label={data.avariasCabine} color={data.avariasCabine === "NÃO" ? "success" : "error"} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Avarias Cabine:</Typography>
                <Typography>
                  {data.descricaoAvariasCabine || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Avarias no Baú:</Typography>
                <Chip label={data.bauPossuiAvarias} color={data.bauPossuiAvarias === "NÃO" ? "success" : "error"} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Avarias Baú:</Typography>
                <Typography>
                  {data.descricaoAvariasBau || "N/A"}
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
                {getStatusChip(data.funcionamentoParteEletrica)}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Descrição Parte Elétrica:</Typography>
                <Typography>
                  {data.descricaoParteEletrica || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Section>
          {/* Foto veiculo */}
          {/*<Section title="Foto do Veículo:">
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Image
                  width={100}
                  height={100}
                  src={data?.fotoVeiculo || "/assets/img/placeholder.png"}
                  alt={""}
                />
              </Grid>
            </Grid>
          </Section>*/}
        </Paper>
      </Container>
    </Box>
  );
};

export default ViewInspectionPage;
