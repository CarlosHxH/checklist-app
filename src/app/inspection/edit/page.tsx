"use client";
import React, { useState } from "react";
import { Box, Container, Paper, Button, Grid, TextField, FormControlLabel, Switch, Typography, CircularProgress } from "@mui/material";
import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/ultils";
import BottonLabel from "@/components/ButtonLabel";
import Loading from "@/components/Loading";

interface InspectionFormData
{
  licensePlate: string;
  modelo: string;
  crlvEmDia: boolean;
  certificadoTacografoEmDia: boolean;
  nivelAgua: string;
  nivelOleo: string;
  situacaoPneus: string;
  motivoPneuRuim: string;
  pneuFurado: string;
  avariasCabine: boolean;
  descricaoAvariasCabine: string;
  bauPossuiAvarias: boolean;
  descricaoAvariasBau: string;
  funcionamentoParteEletrica: boolean;
  motivoParteEletricaRuim: string;
  sugestao: string;
}

export default function EditInspection()
{
  const { id } = useParams<{ id: string; tag: string; item: string }>();
  const { data, error, isLoading } = useSWR(`/api/inspections/${id}`, fetcher);

  const [formData, setFormData] = useState<InspectionFormData>(data);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  React.useEffect(() => setFormData(data), [data]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleToggle = (event: { [key: string]: any }) => {
    setFormData((prev) => ({ ...prev, ...event }));
  };

  const handleSubmit = async (event: React.FormEvent) =>
  {
    event.preventDefault();
    setSaving(true);

    try
    {
      // Simulating API call to save data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Replace with your actual API call
      router.push(`/inspection/${id}`);
    } catch (error)
    {
      console.error("Error saving inspection:", error);
      // Handle error here
    } finally
    {
      setSaving(false);
    }
  };


  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) =>
  {
    const file = event.target.files?.[0];
    if (file)
    {
      // Handle file upload here
      console.log(`Uploading file for ${fieldName}:`, file);
    }
  };

  if (error) return <div>Failed to load</div>;

  if (isLoading || !formData) <Loading />;


  return (
    <Box>
      <ResponsiveAppBar title={`Editar`} showBackButton />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Informações Básicas */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Informações do Veículo
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Placa"
                  name="placa"
                  value={""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Modelo"
                  name="modelo"
                  value={""}
                  onChange={handleChange}
                />
              </Grid>

              {/* Documentação */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Documentação
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={true}
                      onChange={handleChange}
                      name="crlvEmDia"
                    />
                  }
                  label="CRLV em dia"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "fotoCRLV")}
                  style={{ marginTop: "10px" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={true}
                      onChange={handleChange}
                      name="certificadoTacografoEmDia"
                    />
                  }
                  label="Certificado do Tacógrafo em dia"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "fotoTacografo")}
                  style={{ marginTop: "10px" }}
                />
              </Grid>

              {/* Níveis */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Níveis
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nível de Água"
                  name="nivelAgua"
                  value={formData.nivelAgua}
                  onChange={handleChange}
                />
                <BottonLabel
                  label={"Nível de Água"}
                  name={"nivelAgua"}
                  value="Normal"
                  options={["Normal", "Baixo", "Critico"]}
                  onChange={handleToggle}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "fotoNivelAgua")}
                  style={{ marginTop: "10px" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nível de Óleo"
                  name="nivelOleo"
                  value={""}
                  onChange={handleChange}
                />
              </Grid>

              {/* Pneus */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Pneus
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Situação dos Pneus"
                  name="situacaoPneus"
                  value={formData.situacaoPneus}
                  onChange={handleChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, "fotosPneusBom")}
                  style={{ marginTop: "10px" }}
                />
              </Grid>

              {/* Avarias */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Avarias
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={true}
                      onChange={handleChange}
                      name="avariasCabine"
                    />
                  }
                  label="Avarias na Cabine"
                />
                {formData.avariasCabine && (
                  <>
                    <TextField
                      fullWidth
                      label="Descrição das Avarias na Cabine"
                      name="descricaoAvariasCabine"
                      value={""}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      sx={{ mt: 2 }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleFileUpload(e, "fotosAvariasCabine")
                      }
                      style={{ marginTop: "10px" }}
                    />
                  </>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={true}
                      onChange={handleChange}
                      name="bauPossuiAvarias"
                    />
                  }
                  label="Baú possui avarias"
                />
                {true && (
                  <>
                    <TextField
                      fullWidth
                      label="Descrição das Avarias no Baú"
                      name="descricaoAvariasBau"
                      value={formData.descricaoAvariasBau}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      sx={{ mt: 2 }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(e, "fotosAvariasBau")}
                      style={{ marginTop: "10px" }}
                    />
                  </>
                )}
              </Grid>

              {/* Parte Elétrica */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Parte Elétrica
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={true}
                      onChange={handleChange}
                      name="funcionamentoParteEletrica"
                    />
                  }
                  label="Funcionamento da Parte Elétrica"
                />
                {true && (
                  <>
                    <TextField
                      fullWidth
                      label="Motivo do Problema na Parte Elétrica"
                      name="motivoParteEletricaRuim"
                      value={""}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      sx={{ mt: 2 }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleFileUpload(e, "fotosParteEletricaRuim")
                      }
                      style={{ marginTop: "10px" }}
                    />
                  </>
                )}
              </Grid>

              {/* Sugestões */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Sugestões
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sugestão"
                  name="sugestao"
                  value={""}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={saving}
                >
                  {saving ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
