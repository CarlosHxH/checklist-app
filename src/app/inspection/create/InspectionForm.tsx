"use client";
import { z } from "zod";
import useSWR from "swr";
import { fetcher } from "@/lib/ultils";
import React, { useState } from "react";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ButtonLabel from "@/components/ButtonLabel";
import FileUploader from "@/components/FileUploader";
import { InspectionSchema } from "./InspectionSchema";
import { InspectionFormData } from "@/lib/formDataTypes";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import { TextField, Button, Grid, Typography, Paper, Divider } from "@mui/material";
import Swal from 'sweetalert2'

const InspectionForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withErros, setWithErros] = React.useState(false)
  const { data: vehicles } = useSWR(`/api/vehicles`, fetcher);

  const [formData, setFormData] = useState<Partial<InspectionFormData>>({
    userId: session?.user.id,
    vehicleId: "",
    eixo: "0",
  });


  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "vehicleId") {
      const eixo = vehicles.find((e: any) => e.id === value)?.eixo || 0;
      let data = {};
      const eixoNumber = Number(formData.eixo) || 0;
      if (eixoNumber > 3) data = { ...data, quartoEixo: "", descricaoQuartoEixo: "" };
      else { delete formData.quartoEixo; delete formData.descricaoQuartoEixo; }

      if (eixoNumber > 2) data = { ...data, truck: "", descricaoTruck: "" };
      else { delete formData.truck; delete formData.descricaoTruck; }

      if (eixoNumber > 1) data = { ...data, tracao: "", descricaoTracao: "" };
      else { delete formData.tracao; delete formData.descricaoTracao; }

      data = { ...data, eixo };
      setFormData((prev) => ({ ...prev, ...data }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      const validatedData = InspectionSchema.parse(formData);
      setWithErros(false);
      const url = '/api/inspections';
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validatedData }),
      });
      
      if (response.ok) {
        const res = await response.json();
        router.push(`/inspection/${res.id}`);
      } else {
        throw new Error("Verifique os campos!")
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, curr) => ({
          ...acc,
          [curr.path[0]]: curr.message
        }), {});
        setWithErros(true);
        setErrors(formattedErrors);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          html: `<div><p>Algo deu errado!</p><p style="color:red">Preencha todos os campos</p></div>`,
          footer: '<a href="#">Por que eu tenho esse problema?</a>'
        });
      }
    }
  };

  if (!vehicles || isSubmitting) return <Loading />;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>Criar inspeção</Typography>

        <Grid container spacing={3}>

          <Grid item xs={12}><Divider>Dados do usuario</Divider></Grid>

          <Grid item xs={12} md={12}>
            <ButtonLabel
              label={"Viagem"}
              name={"status"}
              value={formData?.status}
              onChange={onChange}
              options={["INICIO", "FINAL"]}
              error={!!errors.status}
              helperText={errors.status}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              label={"Placa"}
              onChange={onChange}
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

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"CRLV em dia?"}
              name={"crlvEmDia"}
              value={formData.crlvEmDia}
              options={["SIM", "NÃO"]}
              onChange={onChange}
              error={!!errors.crlvEmDia}
              helperText={errors.crlvEmDia}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Cert. Tacografo em Dia?"}
              name={"certificadoTacografoEmDia"}
              value={formData.certificadoTacografoEmDia}
              options={["SIM", "NÃO"]}
              onChange={onChange}
              error={!!errors.certificadoTacografoEmDia}
              helperText={errors.certificadoTacografoEmDia}
            />
          </Grid>

          <Grid item xs={12} mb={-3}><Divider>Niveis</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nivel Agua"}
              name={"nivelAgua"}
              value={formData.nivelAgua}
              options={["NORMAL", "BAIXO", "CRITICO"]}
              onChange={onChange}
              error={!!errors.nivelAgua}
              helperText={errors.nivelAgua}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nivel Oleo"}
              name={"nivelOleo"}
              value={formData.nivelOleo}
              options={["NORMAL", "BAIXO", "CRITICO"]}
              onChange={onChange}
              error={!!errors.nivelOleo}
              helperText={errors.nivelOleo}
            />
          </Grid>

          <Grid item xs={12} mb={-3}><Divider>Situação dos Pneus</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"DIANTEIRA"}
              name={"dianteira"}
              options={["BOM", "RUIM"]}
              onChange={onChange}
              value={formData.dianteira}
              error={!!errors.dianteira}
              helperText={errors.dianteira}
            />
            {formData.dianteira === "RUIM" && (
              <TextField
                label={"Qual Defeito?"}
                name="descricaoDianteira"
                value={formData.descricaoDianteira}
                onChange={onChange}
                multiline
                fullWidth
                rows={2}
                error={!!errors.descricaoDianteira}
                helperText={errors.descricaoDianteira}
              />)}
          </Grid>

          {Number(formData.eixo) > 1 && (
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"TRAÇÃO"}
                name={"tracao"}
                value={formData.tracao}
                options={["BOM", "RUIM"]}
                onChange={onChange}
                error={!!errors.tracao}
                helperText={errors.tracao}
              />
              {formData.tracao === "RUIM" && (
                <TextField
                  label={"Qual Defeito?"}
                  name="descricaoTracao"
                  value={formData.descricaoTracao}
                  multiline
                  fullWidth
                  rows={2}
                  onChange={onChange}
                  error={!!errors.descricaoTracao}
                  helperText={errors.descricaoTracao}
                />
              )}
            </Grid>
          )}

          {Number(formData.eixo) > 2 && (
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"TRUCK"}
                name={"truck"}
                value={formData.truck}
                options={["BOM", "RUIM"]}
                onChange={onChange}
                error={!!errors.truck}
                helperText={errors.truck}
              />
              {formData.truck === "RUIM" && (
                <TextField
                  label={"Qual Defeito"}
                  name="descricaoTruck"
                  value={formData.descricaoTruck}
                  multiline
                  fullWidth
                  rows={2}
                  onChange={onChange}
                  error={!!errors.descricaoTruck}
                  helperText={errors.descricaoTruck}
                />
              )}
            </Grid>
          )}
          {Number(formData.eixo) > 3 && (
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"Quarto Eixo"}
                name={"quartoEixo"}
                value={formData.quartoEixo}
                options={["BOM", "RUIM"]}
                onChange={onChange}
                error={!!errors.quartoEixo}
                helperText={errors.quartoEixo}
              />
              {formData.quartoEixo === "RUIM" && (
                <TextField
                  label={"Qual Defeito?"}
                  name="descricaoQuartoEixo"
                  value={formData.descricaoQuartoEixo}
                  onChange={onChange}
                  multiline
                  fullWidth
                  rows={2}

                  error={!!errors.descricaoQuartoEixo}
                  helperText={errors.descricaoQuartoEixo}
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
              onChange={onChange}
              error={!!errors.avariasCabine}
              helperText={errors.avariasCabine}
            />
            {formData.avariasCabine === "SIM" && (
              <TextField
                label={"Qual avaria?"}
                name={'descricaoAvariasCabine'}
                onChange={onChange}
                value={formData.descricaoAvariasCabine}
                error={!!errors.descricaoAvariasCabine}
                helperText={errors.descricaoAvariasCabine}
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
              onChange={onChange}

              error={!!errors.bauPossuiAvarias}
              helperText={errors.bauPossuiAvarias}
            />
            {formData.bauPossuiAvarias === "SIM" && (
              <TextField
                label={"Qual defeito?"}
                name={'descricaoAvariasBau'}
                onChange={onChange}
                value={formData.descricaoAvariasBau}
                error={!!errors.descricaoAvariasBau}
                helperText={errors.descricaoAvariasBau}
                multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider>Eletrica</Divider>
            <ButtonLabel
              label={"Parte Elétrica"}
              name={"funcionamentoParteEletrica"}
              options={["BOM", "RUIM"]}
              value={formData.funcionamentoParteEletrica}
              onChange={onChange}
              error={!!errors.funcionamentoParteEletrica}
              helperText={errors.funcionamentoParteEletrica}
            />
            {formData.funcionamentoParteEletrica === "RUIM" && (
              <TextField
                label={"Qual defeito?"}
                name="descricaoParteEletrica"
                onChange={onChange}
                value={formData.descricaoParteEletrica}
                error={!!errors.descricaoParteEletrica}
                helperText={errors.descricaoParteEletrica}
                multiline fullWidth rows={2} disabled />
            )}
          </Grid>

          {/*<Grid item xs={12} md={12}>
            <Divider>Foto do veiculo</Divider>
            <FileUploader
              label={"Foto do veiculo de frente"}
              name={"fotoVeiculo"}
              value={formData.fotoVeiculo}
              error={!!errors.fotoVeiculo}
              helperText={errors.fotoVeiculo}
              onChange={onChange}
            />
          </Grid>*/}

          <Grid item xs={12} md={12}>
            {withErros && <Typography mx={'auto'} color="error">Campos não preenchidos!</Typography>}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </Grid>

        </Grid>
      </form>
    </Paper>
  );
};

export default InspectionForm;
