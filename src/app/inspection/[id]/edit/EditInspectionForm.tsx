"use client";
import React, { useState } from "react";
import {TextField,Button,FormControlLabel,Checkbox,Grid,Typography,Paper,Switch} from "@mui/material";
import { fetcher } from "@/lib/ultils";
import useSWR from "swr";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import FileUploader from "@/components/FileUploader";
import BottonLabel from "@/components/ButtonLabel";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { InspectionFormData } from "./type";

const EditInspectionForm: React.FC = () => {
  const { id } = useParams<{ id: string; tag: string; item: string }>();
  const { data } = useSWR(`/api/inspections/${id}`, fetcher)
  const [formData, setFormData] = useState<InspectionFormData>(data);
  React.useEffect(() => setFormData(data), [data]);
  const router = useRouter();
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = event.target;
    setFormData({...formData,[name]: type === "checkbox" ? checked : value });
  };

  const handleToggle = (event: { [key: string]: any }) => 
    setFormData((prev) => ({ ...prev, ...event }));
    
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`/api/inspections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to create inspection");
      }
      const result = await response.json();
      router.push(`/inspection/${result.id}`)
    } catch (error) {
      console.error('Failed to update data: ', error);
    }
  };

  console.log(formData);
  
  if(!formData) return <Loading/>

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Criar inspeção
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomAutocomplete label={"Placa"} defaultValue={true} options={[formData.vehicle]} name={"vehicleId"}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Modelo"
              disabled={true}
              sx={{ mb: 2 }}
              value={formData?.vehicle?.model}
            />
          </Grid>

          {/* CRLV */}
          <Grid item xs={12} md={6}>
            <FormControlLabel control={<Switch checked={formData?.crlvEmDia || false} onChange={handleChange} name="crlvEmDia"/>} label="CRLV em dia"/>
            <FileUploader label="Foto do CRLV em dia" name={"fotoCRLV"} onChange={handleToggle}/>
          </Grid>

          {/* CRLV */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch checked={formData?.certificadoTacografoEmDia || false} onChange={handleChange} name="certificadoTacografoEmDia"/>
              }
              label="Certificado Tacógrafo em Dia"
            />
            <FileUploader
              label="Foto Tacógrafo" name={"fotoTacografo"} onChange={handleToggle}/>
          </Grid>

          <Grid item xs={12} md={6}>
            <BottonLabel label={"Nível de Água"} name={"nivelAgua"} options={["Normal", "Baixo", "Critico"]} value={formData.nivelAgua} onChange={handleToggle}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <BottonLabel label={"Nível de Óleo"} name={"nivelOleo"} options={["Normal", "Baixo", "Critico"]} value={formData.nivelOleo} onChange={handleToggle}/>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Situação dos Pneus" name="situacaoPneus" value={formData.situacaoPneus} onChange={handleChange} fullWidth/>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.pneuFurado} onChange={handleChange} name="pneuFurado"/>}
              label="Pneu Furado"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox checked={formData.avariasCabine} onChange={handleChange} name="avariasCabine"/>
              }
              label="Avarias na Cabine"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.bauPossuiAvarias}
                  onChange={handleChange}
                  name="bauPossuiAvarias"
                />
              }
              label="Avarias no Baú"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox checked={formData.funcionamentoParteEletrica} onChange={handleChange} name="funcionamentoParteEletrica"/>
              }
              label="Funcionamento da Parte Elétrica"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Sugestão" name="sugestao" value={formData.sugestao} onChange={handleChange} fullWidth multiline rows={3}/>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth type="submit" variant="contained" color="primary">Salvar</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EditInspectionForm;
