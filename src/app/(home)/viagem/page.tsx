"use client";
import useSWR from "swr";
import React, { useState } from "react";
import Loading from "@/components/Loading";
import ButtonLabel from "@/components/ButtonLabel";
import ComboBox from "@/components/ComboBox";
import Link from "next/link";
import PhotoUploader from "@/components/_ui/PhotoUploader";
import CustomAppBar from "@/components/_ui/CustomAppBar";
import { TextField, Button, Grid, Typography, Paper, Divider, Box, Alert, Snackbar } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { InspectionFormData } from "@/types/InspectionSchema";
import { EixoSection } from "@/components/EixoSection";
import axios from "axios";
import { vehicle } from "@prisma/client";


const InspectionForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: vehicles, error } = useSWR<vehicle[], Error>(`/api/v1/vehicles`, fetcher);

  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { register, watch, control, setValue, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<InspectionFormData>({
    defaultValues: { 
      userId: session?.user?.id, 
      status: "INICIO", 
      vehicleId: "",
    }
  });

  const avariasCabine = watch("avariasCabine");
  const bauPossuiAvarias = watch("bauPossuiAvarias");
  const funcionamentoParteEletrica = watch("funcionamentoParteEletrica");
  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles && vehicles.find((v) => v.id === selectedVehicleId);

  React.useEffect(() => {
    // Redefinir campos de descrição com base nos valores principais do campo
    if (avariasCabine === "NÃO") setValue("descricaoAvariasCabine", '');
    if (bauPossuiAvarias === "NÃO") setValue("descricaoAvariasBau", '');
    if (funcionamentoParteEletrica === "BOM") setValue("descricaoParteEletrica", '');
  }, [avariasCabine, bauPossuiAvarias, funcionamentoParteEletrica, setValue]);

  if (!vehicles) return <Loading />;
  if (error) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Erro ao carregar os veículos <Link href={'/'}>Voltar</Link></Box>);

  // Handle form submission
  const onSubmit = async (data: InspectionFormData) => {
    try {
      setSubmitError("");
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all form fields except photos
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photos' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append photos if they exist
      if (data.photos && data.photos.length > 0) {
        data.photos.forEach((photoData: any, index: number) => {
          if (photoData.photo instanceof File) {
            formData.append(`photos`, photoData.photo);
            formData.append(`photoTypes`, photoData.type || 'vehicle');
            formData.append(`photoDescriptions`, photoData.description || `Photo ${index + 1}`);
          }
        });
      }

      const response = await axios.post("/api/v1/viagens", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.replace('/');
        }, 300);
      } else {
        throw new Error(response.data.error || 'Erro ao salvar VIAGEM');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error) {
          setSubmitError(error.response.data.error);
        } else if (error.code === 'ECONNABORTED') {
          setSubmitError('Tempo limite excedido. Tente novamente.');
        } else {
          setSubmitError('Erro de conexão. Verifique sua internet.');
        }
      } else {
        setSubmitError('Erro inesperado. Tente novamente.');
      }
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <CustomAppBar showBackButton />
      {/* Loading overlay */}
      {isSubmitting && <Loading />}
      
      {/* Success/Error messages */}
      <Snackbar 
        open={submitSuccess} 
        autoHideDuration={6000} 
        onClose={() => setSubmitSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSubmitSuccess(false)}>
          Viagem salva com sucesso! Redirecionando...
        </Alert>
      </Snackbar>
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError("")}>
          {submitError}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12}><Divider>Dados do usuário</Divider></Grid>

          <Grid item xs={12}>
            <ButtonLabel disabled label="VIAGEM" name="status" options={["INICIO", "FINAL"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <ComboBox name="vehicleId" label="Selecione um veículo" options={vehicles.map((v) => ({ label: `${v.plate} - ${v.model}`, value: v.id }))} control={control} rules={{ required: 'Veículo é obrigatório' }} />
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
            <Button disabled={isSubmitting || Object.keys(errors).length > 0} fullWidth type="submit" variant="contained" color="primary">Salvar</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
export default InspectionForm;