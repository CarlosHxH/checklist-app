"use client";
import useSWR from "swr";
import React from "react";
import { fetcher } from "@/lib/ultils";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import ButtonLabel from "@/components/ButtonLabel";
import { TextField, Button, Grid, Typography, Paper, Divider } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { InspectionFormData } from "@/types/InspectionSchema";
import ComboBox from "@/components/ComboBox";
import Link from "next/link";
import PhotoUploader from "@/components/_ui/PhotoUploader";
import CustomAppBar from "@/components/_ui/CustomAppBar";

export interface Option {
  [key: string]: any;
  setValue: (name: keyof InspectionFormData, value: any) => void;
}

export interface Vehicle extends Option {
  id: string;
  plate: string;
  model: string;
}

export interface EixoSectionProps {
  eixoNumber: number;
  label: string;
  fieldName: keyof InspectionFormData;
  selectedVehicle?: Vehicle;
  control: any;
  register: any;
  watch: any;
  setValue: any;
}

export const EixoSections: React.FC<EixoSectionProps> = ({ eixoNumber, label, fieldName, selectedVehicle, control, register, watch, setValue }) => {
  
  if (!selectedVehicle || Number(selectedVehicle.eixo) < Number(eixoNumber)) return null;

  React.useEffect(() => {setValue("eixo", String(eixoNumber))}, [eixoNumber, setValue]);

  const currentValue = watch(fieldName);
  const field = `descricao${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof InspectionFormData;

  React.useEffect(() => {
      if (currentValue === "BOM") setValue(field, "");
  }, [currentValue, field, setValue]);

  return (
      <Grid item xs={12} md={6}>
          <ButtonLabel label={label} name={fieldName} options={["BOM", "RUIM"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          {currentValue === "RUIM" && (
              <TextField {...register(field, { required: "Este campo é obrigatório" })} label="Qual Defeito?" multiline fullWidth rows={2} />
          )}
      </Grid>
  );
};

const InspectionForm: React.FC<{ type: "INICIO" | "FINAL", id: string }> = ({ type, id }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: vehicles, error } = useSWR<Vehicle[], { [key: string]: any }>(`/api/v1/vehicles`, fetcher);
  const { register, watch, control, setValue, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<InspectionFormData>({});

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles && vehicles.find((v) => v.id === id || v.id === selectedVehicleId);

  React.useEffect(() => {
    const defaultValues: Partial<InspectionFormData> = {};
    defaultValues.userId = session?.user?.id;
    defaultValues.vehicleId = id;
    defaultValues.status = type;
    defaultValues.eixo = selectedVehicle?.eixo ?? "0";
    defaultValues.isFinished = true;
    reset({ ...defaultValues });
  }, [id, reset, session?.user?.id]);

  const avariasCabine = watch("avariasCabine");
  const bauPossuiAvarias = watch("bauPossuiAvarias");
  const funcionamentoParteEletrica = watch("funcionamentoParteEletrica");

  React.useEffect(() => {
    // Redefinir campos de descrição com base nos valores principais do campo
    if (avariasCabine === "NÃO") setValue("descricaoAvariasCabine", '');
    if (bauPossuiAvarias === "NÃO") setValue("descricaoAvariasBau", '');
    if (funcionamentoParteEletrica === "BOM") setValue("descricaoParteEletrica", '');
  }, [avariasCabine, bauPossuiAvarias, funcionamentoParteEletrica, setValue]);

  if (!vehicles) return <Loading />;
  if (error) return <div>Erro de carregamento dos veículos <Link href={'/'}>Voltar</Link></div>;

  const EixoSection: React.FC<{
    name: "dianteira" | "tracao" | "truck" | "quartoEixo";
    label: string;
    descricao: "descricaoDianteira" | "descricaoTracao" | "descricaoTruck" | "descricaoQuartoEixo";
  }> =
    ({ name, label, descricao }) => {
      const value = watch(name);
      if (value === 'BOM') setValue(descricao, '');
      return (
        <Grid item xs={12} md={6}>
          <Controller name={name} control={control} render={({ field }) => (
            <ButtonLabel name={name} label={label} options={["BOM", "RUIM"]} control={control} />
          )} />
          {value === 'RUIM' && <Controller name={descricao} control={control} render={({ field }) => (<TextField {...field} label="Qual Defeito?" multiline fullWidth rows={2} />)} />}
        </Grid>
      );
    }

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <CustomAppBar showBackButton />
      {isSubmitting && <Loading />}
      <form
        onSubmit={handleSubmit(async (data) => {
          const formData = new FormData();

          // Append all form fields except photos
          Object.entries(data).forEach(([key, value]) => {
            if (key !== 'photos') {
              formData.append(key, String(value));
            }
          });

          // Append photos
          if (data.photos) {
            data.photos.forEach((photo: any) => {
              formData.append('photos', photo.photo);
            });
          }

          try {
            const response = await fetch('/api/v1/viagens', {
              method: 'POST',
              body: formData,
            });
            if (!response.ok) throw new Error('Failed to submit form');
            const result = await response.json();
            router.push('/');
          } catch (error) {
            console.error('Error submitting form:', error);
            alert("Erro ao enviar os dados!");
          }
        })}
      >
        <Typography variant="h4" gutterBottom>Criar viagem</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}><Divider>Dados do usuário</Divider></Grid>

          <Grid item xs={12}>
            <ButtonLabel disabled label="Viagem" name="status" options={["INICIO", "FINAL"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <ComboBox disabled={!!(vehicles.find((v) => v.id === id))} name="vehicleId" label="Selecione um veículo" options={vehicles.map((v) => ({ label: `${v.plate} - ${v.model}`, value: v.id }))} control={control} rules={{ required: 'Veículo é obrigatório' }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField type="number" {...register("kilometer", { required: "Este campo é obrigatório" })} fullWidth size="small" label="Quilometragem:" />
          </Grid>

          <Grid item xs={12}><Divider>Documentos</Divider></Grid>

          <Grid item xs={12} md={selectedVehicle?.tacografo ? 6 : 12}>
            <ButtonLabel label="CRLV em dia?" name="crlvEmDia" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>

          {selectedVehicle?.tacografo && <Grid item xs={12} md={6}>
            <ButtonLabel label="Cert. Tacografo em Dia?" name="certificadoTacografoEmDia" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>}

          <Grid item xs={12}><Divider>Níveis</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Nível Água" name="nivelAgua" control={control} options={["NORMAL", "BAIXO", "CRITICO"]} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Nível Óleo" name="nivelOleo" options={["NORMAL", "BAIXO", "CRITICO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>

          {selectedVehicle && (
            <>
              <Grid item xs={12}><Divider>Situação dos Pneus</Divider></Grid>
              <EixoSections eixoNumber={1} label="DIANTEIRA" fieldName="descricaoDianteira" control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSections eixoNumber={2} label="TRAÇÃO" fieldName="descricaoTracao" control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSections eixoNumber={3} label="TRUCK" fieldName="descricaoTruck" control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSections eixoNumber={4} label="QUARTO EIXO" fieldName="descricaoQuartoEixo" control={control} register={register} watch={watch} setValue={setValue} />
            </>
          )}

          <Grid item xs={12}><Divider>Avarias</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Avarias na Cabine" name="avariasCabine" options={["NÃO", "SIM"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
            {watch("avariasCabine") === "SIM" && (
              <TextField {...register("descricaoAvariasCabine", { required: "Este campo é obrigatório" })} label="Qual avaria?" error={!!errors.descricaoAvariasCabine} multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Avarias no Baú" name="bauPossuiAvarias" options={["NÃO", "SIM"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
            {watch("bauPossuiAvarias") === "SIM" && (
              <TextField {...register("descricaoAvariasBau", { required: "Este campo é obrigatório" })} label="Qual defeito?" error={!!errors.descricaoAvariasBau} multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Divider>Elétrica</Divider>
            <ButtonLabel label="Parte Elétrica" name="funcionamentoParteEletrica" options={["BOM", "RUIM"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
            {watch("funcionamentoParteEletrica") === "RUIM" && (
              <TextField {...register("descricaoParteEletrica", { required: "Este campo é obrigatório" })} label="Qual defeito?" error={!!errors.descricaoParteEletrica} multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Divider>Extintor</Divider>
            <ButtonLabel label="EXTINTOR EM DIAS?" name="extintor" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>

          <Grid item xs={12} md={12}>
            <Divider>Foto da frente do veiculo</Divider>
            <Controller
              name="photos"
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
              render={({ field }) => (
                <PhotoUploader
                  name="photos"
                  label="Foto do veiculo"
                  multiple
                  isRemoved
                  onChange={async (photos: File[]) => {
                    const processedPhotos = await Promise.all(
                      photos.map(async (f, i) => ({
                        photo: new File([f], f.name, { type: f.type }),
                        type: 'vehicle',
                        description: `Veiculo foto-${++i}`
                      }))
                    );
                    field.onChange(processedPhotos);
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            {Object.keys(errors).length > 0 && (
              <Typography color="error" align="center" gutterBottom>
                {errors.root?.message || "Existem campos obrigatórios não preenchidos!"}
              </Typography>
            )}
            <Button fullWidth type="submit" variant="contained" color="primary">Salvar</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
export default InspectionForm;

/*
<PhotoUploader name={'veiculo'} label={'Foto do veiculo'} onChange={async (photo: File[]) => {
  const photos = await Promise.all(photo.map(async (f, i) => {
    const b64 = await getBase64(f);
    return { photo: b64 as string, type: 'vehicle', description: `Veiculo foto-${++i}` }
  }));
  setValue('photos', photos);
}} />
*/