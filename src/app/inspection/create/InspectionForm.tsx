"use client";
import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Paper, Divider } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import useSWR from "swr";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import ButtonLabel from "@/components/ButtonLabel";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import Loading from "@/components/Loading";
import { InspectionSchema } from "@/lib/InspectionSchema";
import { z } from "zod";

const InspectionForm: React.FC = () => {
  const { data: session } = useSession();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { data: vehicles } = useSWR(`/api/vehicles`, fetcher);

  const [formData, setFormData] = useState({
    userId: session?.user.id,
    vehicleId: "",
    dataInspecao: new Date().toISOString(),
    status: "",

    crlvEmDia: "",
    certificadoTacografoEmDia: "",
    nivelAgua: "",
    nivelOleo: "",

    eixo: 0,
    dianteira: null,
    descricaoDianteira: null,
    tracao: null,
    descricaoTracao: null,
    truck: null,
    descricaoTruck: null,
    quartoEixo: null,
    descricaoQuartoEixo: null,

    avariasCabine: null,
    descricaoAvariasCabine: null,

    bauPossuiAvarias: null,
    descricaoAvariasBau: null,

    funcionamentoParteEletrica: null,
    descricaoParteEletrica: null,
    fotoVeiculo: null,
  });

  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const validatedData = InspectionSchema.parse(formData);

      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });
      if (!response.ok) {
        throw new Error("Failed to create inspection");
      }
      const result = await response.json();
      console.log(result);

      router.push(`/inspection/${result.id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, curr) => ({
          ...acc,
          [curr.path[0]]: curr.message
        }), {});
        console.log({ formattedErrors });
        setErrors(formattedErrors);
      }
    }
  };

  if (!vehicles) return <Loading />;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Criar inspeção
        </Typography>

        <Grid item xs={12}><Divider>Dados do usuario</Divider></Grid>

        <Grid item xs={12} md={12}>
          <ButtonLabel
            label={"Viagem"}
            name={"status"}
            value={formData?.status}
            onChange={handleChange}
            options={["INICIO", "FINAL"]}
            error={!!errors.status}
            helperText={errors.status}
          />
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              label={"Placa"}
              onChange={handleChange}
              options={vehicles}
              name={"vehicleId"}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              size={"small"}
              label="Modelo"
              disabled
              value={
                (vehicles &&
                  formData.vehicleId &&
                  vehicles.find((e: any) => e.id === formData?.vehicleId)?.model + ", " + formData.eixo + " Eixos") || ""
              }
            />
          </Grid>

          <Grid item xs={12} mb={-3}><Divider>Documentos</Divider></Grid>
          {/* CRLV */}
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"CRLV em dia"}
              name={"crlvEmDia"}
              options={["SIM", "NÃO"]}
              value={formData.crlvEmDia}
              onChange={handleChange}
            />
          </Grid>

          {/* CRLV */}
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Certificado Tacógrafo em Dia"}
              name={"certificadoTacografoEmDia"}
              options={["SIM", "NÃO"]}
              value={formData.certificadoTacografoEmDia}
              onChange={handleChange}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={12}
            style={{ borderBottom: "1px solid #444" }}
          />

          <Grid item xs={12} mb={-3}><Divider>Niveis</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nível de Água"}
              name={"nivelAgua"}
              options={["NORMAL", "Baixo", "Critico"]}
              value={formData.nivelAgua}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nível de Óleo"}
              name={"nivelOleo"}
              options={["NORMAL", "Baixo", "Critico"]}
              value={formData.nivelOleo}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} mb={-3}><Divider>Situação dos Pneus</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"DIANTEIRA"}
              name={"dianteira"}
              options={["BOM", "RUIM"]}
              onChange={handleChange}
              value={formData?.dianteira}
            />
            {formData.dianteira === "RUIM" && (
              <TextField
                label={"Qual Defeito?"}
                name="descricaoDianteira"
                value={formData?.descricaoDianteira}
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
                onChange={handleChange}
                value={formData.tracao}
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
                onChange={handleChange}
                value={formData.truck}
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
                onChange={handleChange}
                value={formData.quartoEixo}
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

          <Grid item xs={12} my={-3}><Divider>Avarias</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Avarias na Cabine"}
              name={"avariasCabine"}
              options={["NÃO", "SIM"]}
              value={formData.avariasCabine}
              onChange={handleChange}
            />
            {formData.avariasCabine === "SIM" && (
              <TextField
                label={"Qual avaria?"}
                name={'descricaoAvariasCabine'}
                onChange={handleChange}
                value={formData.descricaoAvariasCabine}
                multiline fullWidth rows={2}
              />
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
          <Grid item xs={12}>
            <ButtonLabel
              label={"Parte Elétrica"}
              name={"funcionamentoParteEletrica"}
              options={["BOM", "RUIM"]}
              value={formData.funcionamentoParteEletrica}
              onChange={handleChange}
            />
            {formData.funcionamentoParteEletrica === "RUIM" && (
              <TextField
                label={"Qual defeito?"}
                name="descricaoParteEletrica"
                onChange={handleChange}
                value={formData.descricaoParteEletrica}
                multiline fullWidth rows={2}
              />
            )}
          </Grid>

          <Divider>Eletrica</Divider>
          <Grid item xs={12}>
            <FileUploader
              name={"fotoVeiculo"}
              value={formData?.fotoVeiculo}
              onChange={handleChange}
              label={"Foto do veiculo de frente"}
            />
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

export default InspectionForm;
