"use client";
import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Paper } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import useSWR from "swr";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import ButtonLabel from "@/components/ButtonLabel";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUploader from "@/components/FileUploader";

const InspectionForm: React.FC = () => {
  const { data: session } = useSession();
  const { data: vehicles } = useSWR(`/api/vehicles`, fetcher);

  const [formData, setFormData] = useState({
    userId: session?.user.id,
    vehicleId: "",
    dataInspecao: new Date(),
    
    crlvEmDia: "",
    certificadoTacografoEmDia: "",
    nivelAgua: "",
    nivelOleo: "",
    
    eixo: 0,
    dianteira: "",
    descricaoDianteira: "",
    tracao: "",
    descricaoTracao: "",
    truck: "",
    descricaoTruck: "",
    quartoEixo: "",
    descricaoQuartoEixo: "",
    
    avariasCabine: "",
    descricaoAvariasCabine:"",

    bauPossuiAvarias: "",
    descricaoAvariasBau:"",
    
    funcionamentoParteEletrica: "",
    descricaoParteEletrica: "",
    fotoVeiculo:"",
  });

  const router = useRouter();

  const handleChange =  (event: any) =>{
    const { name, type, checked, value } = event.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleToggle = (event: { [key: string]: any }) => {
    setFormData((prev) => ({ ...prev, ...event }));
    
    if (event?.vehicleId) {
      const eixo = vehicles.find((e: any) => e.id === event?.vehicleId)?.eixo || 0;
      let data = {};
      if (formData.eixo < 4) data = { ...data, quartoEixo: "", descricaoQuartoEixo: "" };
      if (formData.eixo < 3) data = { ...data, truck: "", descricaoTruck: "" };
      if (formData.eixo < 2) data = { ...data, tracao: "", descricaoTracao: "" };
      data = { ...data, eixo };
      setFormData((prev) => ({ ...prev, ...data }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create inspection");
      }

      const result = await response.json();
      console.log(result);
      
      //router.push(`/inspection/${result.id}`);
    } catch (error) {
      console.error("Error creating inspection:", error);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Criar inspeção
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete
              label={"Placa"}
              onSelect={handleToggle}
              options={vehicles}
              name={"vehicleId"}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Modelo"
              disabled
              sx={{ mb: 2 }}
              value={
                (vehicles &&
                  formData.vehicleId &&
                  vehicles.find((e: any) => e.id === formData?.vehicleId)
                    ?.model +
                    ", " +
                    formData.eixo +
                    " Eixos") ||
                ""
              }
            />
          </Grid>

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

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nível de Água"}
              name={"nivelAgua"}
              options={["Normal", "Baixo", "Critico"]}
              value={formData.nivelAgua}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label={"Nível de Óleo"}
              name={"nivelOleo"}
              options={["Normal", "Baixo", "Critico"]}
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

          <Grid item xs={12}>
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

          <Grid item xs={12}>
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
              <TextField label={"Qual defeito?"} name="descricaoParteEletrica" onChange={handleChange} value={formData.descricaoParteEletrica} multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12}>
            <FileUploader name={"fotoVeiculo"} value={formData.fotoVeiculo} onChange={handleToggle} label={"Foto do veiculo de frente"}/>
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
