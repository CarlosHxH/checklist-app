"use client";
import useSWR from "swr";
import React from "react";
import Loading from "@/components/Loading";
import ButtonLabel from "@/components/ButtonLabel";
import ComboBox from "@/components/ComboBox";
import Link from "next/link";
import PhotoUploader from "@/components/_ui/PhotoUploader";
import CustomAppBar from "@/components/_ui/CustomAppBar";
import { TextField, Button, Grid, Typography, Paper, Divider, Box } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { InspectionFormData } from "@/types/InspectionSchema";
import { EixoSection } from "@/components/EixoSection";

export interface Option {
  [key: string]: any;
  setValue: (name: keyof InspectionFormData, value: any) => void;
}

export interface Vehicle extends Option {
  id: string;
  plate: string;
  model: string;
}

const InspectionForm: React.FC<{ type: "INICIO" | "FINAL", id: string }> = ({ type, id }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const { data: vehicles, error } = useSWR<Vehicle[], Error>(`/api/v1/vehicles`, fetcher);
  
  const { register, watch, control, setValue, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<InspectionFormData>({
    defaultValues: { 
      userId: session?.user?.id, 
      status: type, 
      vehicleId: "",
      isFinished: true,
    }
  });

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles && vehicles.find((v) => v.id === id || v.id === selectedVehicleId);

  React.useEffect(() => {
    const defaultValues: Partial<InspectionFormData> = {};
    defaultValues.userId = session?.user?.id;
    defaultValues.vehicleId = id;
    defaultValues.status = type;
    reset({ ...defaultValues });
  }, [id, reset, session?.user?.id, type]);

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
  if (error) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Erro ao carregar os veículos <Link href={'/'}>Voltar</Link></Box>);

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <CustomAppBar showBackButton />
      {isSubmitting && <Loading />}
      <form
        onSubmit={handleSubmit(async (data) => {
          console.log('>',watch('vehicleId'));
          
          if (watch('vehicleId').length < 25) return;
          
          setSubmitting(true);
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
            router.replace('/');
          } catch (error) {
            console.error('Error submitting form:', error);
            alert("Erro ao enviar os dados!");
            setSubmitting(false);
          }
        })}
      >
        <Typography variant="h5" fontWeight={'bold'} color="primary" style={{textShadow: '1px 1px 2px blue'}} gutterBottom>VIAGEM - {type}</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}><Divider>Dados do usuário</Divider></Grid>

          {/*<Grid item xs={12}>
            <ButtonLabel disabled label="Viagem" name="status" options={["INICIO", "FINAL"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>*/}

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
              <EixoSection eixoNumber={1} selectedVehicle={selectedVehicle} label="DIANTEIRA" fieldName="dianteira" control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSection eixoNumber={2} selectedVehicle={selectedVehicle} label="TRAÇÃO" fieldName="tracao" control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSection eixoNumber={3} selectedVehicle={selectedVehicle} label="TRUCK" fieldName="truck" control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSection eixoNumber={4} selectedVehicle={selectedVehicle} label="QUARTO EIXO" fieldName="quartoEixo" control={control} register={register} watch={watch} setValue={setValue} />
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
              render={({ field }) => (
                <PhotoUploader
                  name="photos"
                  label="Foto do veiculo"
                  isRemoved={true}
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
            <Button disabled={submitting || Object.keys(errors).length > 0} fullWidth type="submit" variant="contained" color="primary">Salvar</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
export default InspectionForm;
