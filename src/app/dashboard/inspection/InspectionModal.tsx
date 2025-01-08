import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider, TextField } from "@mui/material";
import ButtonLabel from "@/components/ButtonLabel";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import FileUploader from "@/components/FileUploader";
import { InspectionSchema } from '@/lib/InspectionSchema';
import { z } from "zod";
import { DataType } from "@/lib/formDataTypes";

type Status = "INICIO" | "FINAL";
type Condition = "BOM" | "RUIM";
type YesNo = "SIM" | "NÃO";
type Level = "NORMAL" | "BAIXO" | "CRITICO";

interface FormFields {
  id?: string;
  status: Status;
  userId: string;
  vehicleId: string;
  crlvEmDia: YesNo;
  certificadoTacografoEmDia: YesNo;
  nivelAgua: Level;
  nivelOleo: Level;
  dianteira: Condition;
  descricaoDianteira?: string;
  tracao?: Condition;
  descricaoTracao?: string;
  truck?: Condition;
  descricaoTruck?: string;
  quartoEixo?: Condition;
  descricaoQuartoEixo?: string;
  avariasCabine: YesNo;
  descricaoAvariasCabine?: string;
  bauPossuiAvarias: YesNo;
  descricaoAvariasBau?: string;
  funcionamentoParteEletrica: Condition;
  descricaoParteEletrica?: string;
  fotoVeiculo: string;
  eixo: number;
}

interface InspectionModalProps {
  open: boolean;
  onClose: () => void;
  data: DataType;
  formData: FormFields;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  callback?: (event: Response) => void;
}

const SectionDivider: React.FC<{title: string}> = ({title}) => (
  <Grid item xs={12} mb={-3}><Divider>{title}</Divider></Grid>
);

const DefectTextField: React.FC<{
  label: string;
  name: keyof FormFields;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}> = ({label, name, value, onChange, error}) => (
  <TextField
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={error}
    multiline
    fullWidth
    rows={2}
  />
);

const AxleSection: React.FC<{
  label: string;
  name: keyof FormFields;
  descriptionName: keyof FormFields;
  value: Condition;
  formData: FormFields;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
}> = ({label, name, descriptionName, value, formData, onChange, errors}) => (
  <Grid item xs={12} md={6}>
    <ButtonLabel
      label={label}
      name={name}
      value={value}
      options={["BOM", "RUIM"]}
      onChange={onChange}
      error={!!errors[name]}
      helperText={errors[name]}
    />
    {value === "RUIM" && (
      <DefectTextField
        label="Qual Defeito?"
        name={descriptionName}
        value={formData[descriptionName] as string || ''}
        onChange={onChange}
        error={errors[descriptionName]}
      />
    )}
  </Grid>
);

export const InspectionModal: React.FC<InspectionModalProps> = ({
  open, onClose, data, formData, onChange, callback
}) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = InspectionSchema.parse(formData);
      const response = await fetch('/api/inspections', {
        method: formData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      const res = await response.json();
      if(!response.ok) throw new z.ZodError([res]);
      
      setErrors({});
      onClose();
      callback?.(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, curr) => ({
          ...acc,
          [curr.path[0]]: curr.message
        }), {});
        setErrors(formattedErrors);
        console.log({formattedErrors});
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {formData.id ? "Editar inspeção" : "Adicione nova inspeção"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <SectionDivider title="Dados do usuario" />
            
            <Grid item xs={12} md={12}>
              <ButtonLabel
                label="Viagem"
                name="status"
                value={formData.status}
                onChange={onChange}
                options={["INICIO", "FINAL"]}
                error={!!errors.status}
                helperText={errors.status}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomAutocomplete
                keyExtractor="name"
                label="Usuário"
                options={data?.user as any}
                name="userId"
                onChange={onChange}
                defaultValue={formData.userId}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomAutocomplete
                keyExtractor="plate"
                label="Veiculo"
                options={data?.vehicle as any}
                name="vehicleId"
                onChange={onChange}
                defaultValue={formData.vehicleId}
              />
            </Grid>

            <SectionDivider title="Documentos" />

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label="CRLV em dia?"
                name="crlvEmDia"
                value={formData.crlvEmDia}
                options={["SIM", "NÃO"]}
                onChange={onChange}
                error={!!errors.crlvEmDia}
                helperText={errors.crlvEmDia}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label="Cert. Tacografo em Dia?"
                name="certificadoTacografoEmDia"
                value={formData.certificadoTacografoEmDia}
                options={["SIM", "NÃO"]}
                onChange={onChange}
                error={!!errors.certificadoTacografoEmDia}
                helperText={errors.certificadoTacografoEmDia}
              />
            </Grid>

            <SectionDivider title="Niveis" />

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label="Nivel Agua"
                name="nivelAgua"
                value={formData.nivelAgua}
                options={["NORMAL", "BAIXO", "CRITICO"]}
                onChange={onChange}
                error={!!errors.nivelAgua}
                helperText={errors.nivelAgua}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label="Nivel Oleo"
                name="nivelOleo"
                value={formData.nivelOleo}
                options={["NORMAL", "BAIXO", "CRITICO"]}
                onChange={onChange}
                error={!!errors.nivelOleo}
                helperText={errors.nivelOleo}
              />
            </Grid>

            <SectionDivider title="Situação dos Pneus" />

            <AxleSection
              label="DIANTEIRA"
              name="dianteira"
              descriptionName="descricaoDianteira"
              value={formData.dianteira}
              formData={formData}
              onChange={onChange}
              errors={errors}
            />

            {Number(formData.eixo) > 1 && (
              <AxleSection
                label="TRAÇÃO"
                name="tracao"
                descriptionName="descricaoTracao"
                value={formData.tracao as Condition}
                formData={formData}
                onChange={onChange}
                errors={errors}
              />
            )}

            {Number(formData.eixo) > 2 && (
              <AxleSection
                label="TRUCK"
                name="truck"
                descriptionName="descricaoTruck"
                value={formData.truck as Condition}
                formData={formData}
                onChange={onChange}
                errors={errors}
              />
            )}

            {Number(formData.eixo) > 3 && (
              <AxleSection
                label="Quarto Eixo"
                name="quartoEixo"
                descriptionName="descricaoQuartoEixo"
                value={formData.quartoEixo as Condition}
                formData={formData}
                onChange={onChange}
                errors={errors}
              />
            )}

            <SectionDivider title="Avarias" />

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label="Avarias na Cabine"
                name="avariasCabine"
                options={["NÃO", "SIM"]}
                value={formData.avariasCabine}
                onChange={onChange}
                error={!!errors.avariasCabine}
                helperText={errors.avariasCabine}
              />
              {formData.avariasCabine === "SIM" && (
                <DefectTextField
                  label="Qual avaria?"
                  name="descricaoAvariasCabine"
                  value={formData.descricaoAvariasCabine || ''}
                  onChange={onChange}
                  error={errors.descricaoAvariasCabine}
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label="Avarias no Baú"
                name="bauPossuiAvarias"
                options={["NÃO", "SIM"]}
                value={formData.bauPossuiAvarias}
                onChange={onChange}
                error={!!errors.bauPossuiAvarias}
                helperText={errors.bauPossuiAvarias}
              />
              {formData.bauPossuiAvarias === "SIM" && (
                <DefectTextField
                  label="Qual defeito?"
                  name="descricaoAvariasBau"
                  value={formData.descricaoAvariasBau || ''}
                  onChange={onChange}
                  error={errors.descricaoAvariasBau}
                />
              )}
            </Grid>

            <SectionDivider title="Eletrica" />
            
            <Grid item xs={12}>
              <ButtonLabel
                label="Parte Elétrica"
                name="funcionamentoParteEletrica"
                options={["BOM", "RUIM"]}
                value={formData.funcionamentoParteEletrica}
                onChange={onChange}
                error={!!errors.funcionamentoParteEletrica}
                helperText={errors.funcionamentoParteEletrica}
              />
              {formData.funcionamentoParteEletrica === "RUIM" && (
                <DefectTextField
                  label="Qual defeito?"
                  name="descricaoParteEletrica"
                  value={formData.descricaoParteEletrica || ''}
                  onChange={onChange}
                  error={errors.descricaoParteEletrica}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider>Foto do veiculo</Divider>
              <FileUploader
                label="Foto Veiculo"
                name="fotoVeiculo"
                value={formData.fotoVeiculo}
                onChange={onChange}
                error={!!errors.fotoVeiculo}
                helperText={errors.fotoVeiculo}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {formData.id ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};