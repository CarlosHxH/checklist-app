"use client";
import React, { useEffect, useState } from "react";
import { TextField, Button, Grid, Typography, Paper } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/components/Loading";
import ButtonLabel from "@/components/ButtonLabel";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

interface InspectionFormData {
  fotoCRLV: string | undefined;
  fotoTacografo: string | undefined;
  vehicle: Vehicle;
  placa: string;
  modelo: string;
  crlvEmDia: boolean;
  certificadoTacografoEmDia: boolean;
  nivelAgua: "NORMAL" | "BAIXO" | "CRITICO";
  nivelOleo: "NORMAL" | "BAIXO" | "CRITICO";
  dianteira: "BOM" | "RUIM";
  tracao?: "BOM" | "RUIM";
  truck?: "BOM" | "RUIM";
  quartoEixo?: "BOM" | "RUIM";
  descricaoDianteira?: string;
  descricaoTracao?: string;
  descricaoTruck?: string;
  descricaoQuartoEixo?: string;
  avariasCabine: "SIM" | "NÃO";
  descricaoAvariasCabine?: string;
  bauPossuiAvarias: "SIM" | "NÃO";
  descricaoAvariasBau?: string;
  funcionamentoParteEletrica: "BOM" | "RUIM";
  descricaoParteEletrica?: string;
  fotoVeiculo?: string;
  eixo: number;
}

const EditInspectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<InspectionFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        if (!id) return;
        const data = await fetcher(`/api/inspections/${id}`);
        setFormData(data);
      } catch (error) {
        setError("Erro ao carregar dados da inspeção");
        console.error("Error fetching inspection:", error);
      }
    };

    fetchInspection();
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData) throw new Error("Dados do formulário não disponíveis");

      const response = await fetch(`/api/inspections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar inspeção");
      }

      const result = await response.json();
      router.push(`/inspection/${result.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao salvar inspeção");
      console.error("Erro ao atualizar a inspeção:", error);
      setIsSubmitting(false);
    }
  };



  const renderConditionalTextField = ( condition: boolean, name: string, label: string ) => {
    if (!condition || !formData) return null;

    return (
      <TextField
        label={label}
        name={name}
        value={formData[name as keyof InspectionFormData]}
        onChange={handleChange}
        multiline
        fullWidth
        rows={2}
      />
    );
  };

  const renderEixoSection = (
    eixoNumber: number,
    label: string,
    fieldName: string
  ) => {
    if (!formData || formData.eixo < eixoNumber) return null;

    return (
      <Grid item xs={12} md={6}>
        <ButtonLabel
          label={label}
          name={fieldName}
          options={["BOM", "RUIM"]}
          value={String(formData[fieldName as keyof InspectionFormData] || '')}
          onChange={handleChange}
        />
        {renderConditionalTextField(
          formData[fieldName as keyof InspectionFormData] === "RUIM",
          `descricao${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
          "Qual Defeito?"
        )}
      </Grid>
    );
  };

  if (!formData || isSubmitting) return <Loading />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Typography variant="h4" gutterBottom>
          Editar Inspeção
        </Typography>

        <Grid container spacing={3}>
          {/* Vehicle Information */}
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Placa"
              value={formData.vehicle.plate}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Modelo"
              disabled
              value={formData.vehicle.model}
            />
          </Grid>

          {/* Documents Section */}
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="CRLV em dia"
              name="crlvEmDia"
              options={["SIM", "NÃO"]}
              value={formData?.crlvEmDia}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Certificado Tacógrafo em Dia"
              name="certificadoTacografoEmDia"
              options={["SIM", "NÃO"]}
              value={formData.certificadoTacografoEmDia}
              onChange={handleChange}
            />
          </Grid>

          {/* Fluid Levels */}
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Nível de Água"
              name="nivelAgua"
              options={["NORMAL", "BAIXO", "CRITICO"]}
              value={formData.nivelAgua}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Nível de Óleo"
              name="nivelOleo"
              options={["NORMAL", "BAIXO", "CRITICO"]}
              value={formData.nivelOleo}
              onChange={handleChange}
            />
          </Grid>

          {/* Tires Section */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ borderBottom: "1px solid #444" }}>
              Situação dos Pneus
            </Typography>
          </Grid>

          {/* Render tire sections based on number of axles */}
          {renderEixoSection(1, "DIANTEIRA", "dianteira")}
          {renderEixoSection(2, "TRAÇÃO", "tracao")}
          {renderEixoSection(3, "TRUCK", "truck")}
          {renderEixoSection(4, "Quarto Eixo", "quartoEixo")}

          <Grid item xs={12} sx={{ borderBottom: "1px solid #444" }} />

          {/* Damage Sections */}
          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Avarias na Cabine"
              name="avariasCabine"
              options={["NÃO", "SIM"]}
              value={formData.avariasCabine}
              onChange={handleChange}
            />
            {renderConditionalTextField(
              formData.avariasCabine === "SIM",
              "descricaoAvariasCabine",
              "Qual avaria?"
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Avarias no Baú"
              name="bauPossuiAvarias"
              options={["NÃO", "SIM"]}
              value={formData.bauPossuiAvarias}
              onChange={handleChange}
            />
            {renderConditionalTextField(
              formData.bauPossuiAvarias === "SIM",
              "descricaoAvariasBau",
              "Qual avaria?"
            )}
          </Grid>

          {/* Electrical System */}
          <Grid item xs={12}>
            <ButtonLabel
              label="Parte Elétrica"
              name="funcionamentoParteEletrica"
              options={["BOM", "RUIM"]}
              value={formData.funcionamentoParteEletrica}
              onChange={handleChange}
            />
            {renderConditionalTextField(
              formData.funcionamentoParteEletrica === "RUIM",
              "descricaoParteEletrica",
              "Qual defeito?"
            )}
          </Grid>

          {/* Photo Upload */}
          {/*<Grid item xs={12}>
            <Divider>Foto do veículo</Divider>
            <FileUploader
              label="Foto do veículo de frente"
              name="fotoVeiculo"
              value={formData.fotoVeiculo}
              onChange={handleChange}
            />
          </Grid>*/}

          {/* Submit Button */}
          <Grid item xs={12}>
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

export default EditInspectionPage;