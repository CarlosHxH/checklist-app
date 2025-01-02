"use client";
import React, { useEffect, useState } from "react";
import { TextField, Button, Grid, Typography, Paper } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/components/Loading";
import ButtonLabel from "@/components/ButtonLabel";
import FileUploader from "@/components/FileUploader";

const EditInspectionPage: React.FC = () => {
  const { id } = useParams<{ id: string; tag: string; item: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const fetchInspection = async () => {
        const data = await fetcher(`/api/inspections/${id}`);
        setFormData(data);
      };
      fetchInspection();
    }
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>|any) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/inspections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update inspection ");
      }
      const result = await response.json();
      router.push(`/inspection/${result.id}`);
    } catch (error) {
      console.error("Error updating inspection:", error);
    }
  };

  if (!formData) return <Loading />;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Editar Inspeção
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Placa"
              name="vehicleId"
              value={formData?.vehicle?.licensePlate}
              onChange={handleChange}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Modelo"
              disabled
              sx={{ mb: 2 }}
              value={formData?.vehicle?.model}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"CRLV em dia"}
              name={"crlvEmDia"}
              options={["SIM", "NÃO"]}
              value={formData.crlvEmDia}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Certificado Tacógrafo em Dia"}
              name={"certificadoTacografoEmDia"}
              options={["SIM", "NÃO"]}
              value={formData.certificadoTacografoEmDia}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nível de Água"}
              name={"nivelAgua"}
              options={["NORMAL", "BAIXO", "CRITICO"]}
              value={formData.nivelAgua}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nível de Óleo"}
              name={"nivelOleo"}
              options={["NORMAL", "BAIXO", "CRITICO"]}
              value={formData.nivelOleo}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={12}>
            <Typography
              style={{ borderBottom: "1px solid #444" }}
              variant={"h5"}
            >
              Situação dos Pneus
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"DIANTEIRA"}
              name={"dianteira"}
              options={["BOM", "RUIM"]}
              value={formData.dianteira}
              onChange={handleChange}
            />
            {formData.dianteira === "RUIM" && (
              <TextField
                label={"Qual Defeito?"}
                name="descricaoDianteira"
                value={formData.descricaoDianteira}
                onChange={handleChange}
                multiline
                fullWidth
                rows={2}
              />
            )}
          </Grid>

          {formData.eixo > 1 && (
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"TRAÇÃO"}
                name={"tracao"}
                options={["BOM", "RUIM"]}
                value={formData.tracao}
                onChange={handleChange}
              />
              {formData.tracao === "RUIM" && (
                <TextField
                  label={"Qual Defeito?"}
                  name="descricaoTracao"
                  value={formData.descricaoTracao}
                  multiline
                  fullWidth
                  rows={2}
                  onChange={handleChange}
                />
              )}
            </Grid>
          )}

          {formData.eixo > 2 && (
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"TRUCK"}
                name={"truck"}
                options={["BOM", "RUIM"]}
                value={formData.truck}
                onChange={handleChange}
              />
              {formData.truck === "RUIM" && (
                <TextField
                  label={"Qual Defeito"}
                  name="descricaoTruck"
                  value={formData.descricaoTruck}
                  multiline
                  fullWidth
                  rows={2}
                  onChange={handleChange}
                />
              )}
            </Grid>
          )}
          {formData.eixo > 3 && (
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"Quarto Eixo"}
                name={"quartoEixo"}
                options={["BOM", "RUIM"]}
                value={formData.quartoEixo}
                onChange={handleChange}
              />
              {formData.quartoEixo === "RUIM" && (
                <TextField
                  label={"Qual Defeito?"}
                  name="descricaoQuartoEixo"
                  value={formData.descricaoQuartoEixo}
                  onChange={handleChange}
                  multiline
                  fullWidth
                  rows={2}
                />
              )}
            </Grid>
          )}

          <Grid item xs={12} style={{ borderBottom: "1px solid #444" }} />

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Avarias na Cabine"}
              name={"avariasCabine"}
              options={["NÃO", "SIM"]}
              value={formData.avariasCabine}
              onChange={handleChange}
            />
            {formData.avariasCabine === "SIM" && (
              <TextField label={"Qual avaria?"} name={'descricaoAvariasCabine'} onChange={handleChange} value={formData.descricaoAvariasCabine} multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Avarias no Baú"}
              name={"bauPossuiAvarias"}
              options={["NÃO", "SIM"]}
              value={formData.bauPossuiAvarias}
              onChange={handleChange}
            />
            {formData.bauPossuiAvarias === "SIM" && (
              <TextField label={"Qual defeito?"} name={'descricaoAvariasBau'} onChange={handleChange} value={formData.descricaoAvariasBau} multiline fullWidth rows={2} />
            )}
          </Grid>
          <Grid item xs={12} md={12}>
            <ButtonLabel
              label={"Parte Elétrica"}
              name={"funcionamentoParteEletrica"}
              options={["BOM", "RUIM"]}
              value={formData.funcionamentoParteEletrica}
              onChange={handleChange}
            />
            {formData.funcionamentoParteEletrica === "RUIM" && (
              <TextField label={"Qual defeito?"} name="descricaoParteEletrica" onChange={handleChange} value={formData.descricaoParteEletrica} multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12}>
            <FileUploader name={"fotoVeiculo"} value={formData.fotoVeiculo} onChange={handleChange} label={"Foto do veiculo de frente"}/>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth type="submit" variant="contained" color="primary">
              Salvar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EditInspectionPage;
