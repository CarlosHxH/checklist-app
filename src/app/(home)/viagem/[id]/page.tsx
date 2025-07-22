"use client";
import useSWR from "swr";
import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ButtonLabel from "@/components/ButtonLabel";
import Link from "next/link";
import PhotoUploader from "@/components/_ui/PhotoUploader";
import CustomAppBar from "@/components/_ui/CustomAppBar";
import { TextField, Button, Grid, Typography, Paper, Divider, Box, Alert, Snackbar } from "@mui/material";
import { fetcher } from "@/lib/ultils";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { InspectionFormData } from "@/types/InspectionSchema";
import { EixoSection } from "@/components/EixoSection";
import { Inspect, vehicle } from "@prisma/client";
import axios from "axios";


interface InspectWithVehicle extends Inspect {
  vehicle: vehicle;
  vehicles?: vehicle[];
}

const Page: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: inspect, error, isLoading } = useSWR<InspectWithVehicle>(
    id ? `/api/v1/viagens/${id}` : null,
    fetcher
  );

  const {
    register,
    watch,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InspectionFormData>({
    defaultValues: {
      userId: session?.user?.id || "",
      status: "FINAL",
      vehicleId: "",
      id: id as string || "",
    }
  });

  // Watch form values for conditional rendering
  const avariasCabine = watch("avariasCabine");
  const bauPossuiAvarias = watch("bauPossuiAvarias");
  const funcionamentoParteEletrica = watch("funcionamentoParteEletrica");

  // Get selected vehicle from inspect data
  const selectedVehicle = inspect?.vehicle || null;

  // Update form defaults when data loads
  useEffect(() => {
    if (inspect && session?.user?.id) {
      setValue("userId", session.user.id);
      setValue("vehicleId", inspect.vehicle?.id || "");
      setValue("id", id as string);
    }
  }, [inspect, session, id, setValue]);

  // Clear conditional description fields
  useEffect(() => {
    if (avariasCabine === "NÃO") setValue("descricaoAvariasCabine", "");
    if (bauPossuiAvarias === "NÃO") setValue("descricaoAvariasBau", "");
    if (funcionamentoParteEletrica === "BOM") setValue("descricaoParteEletrica", "");
  }, [avariasCabine, bauPossuiAvarias, funcionamentoParteEletrica, setValue]);

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

  useEffect(() => {
    if (inspect?.endId) {
      router.replace("/");
    }
  }, [inspect?.endId, router]);

  // Loading states
  if (isLoading) return <Loading />;

  // Error state
  if (error || !inspect) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: 2
      }}>
        <Typography variant="h6" color="error">
          {error ? 'Erro ao carregar dados da viagem' : 'Viagem não encontrada'}
        </Typography>
        <Button component={Link} href="/" variant="outlined">
          Voltar para início
        </Button>
      </Box>
    );
  }

  // Session check
  if (!session?.user) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Typography variant="h6">
          Você precisa estar logado para acessar esta página
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto", mb: 4 }}>
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

          {/* User Data Section */}
          <Grid item xs={12}>
            <Divider>
              <Typography variant="h6">Dados da Viagem</Typography>
            </Divider>
          </Grid>

          <Grid item xs={12}>
            <ButtonLabel
              disabled
              label="VIAGEN"
              name="status"
              options={["INICIO", "FINAL"]}
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
            />
          </Grid>

          {/* Vehicle Selection */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Veículo Selecionado"
              value={selectedVehicle ? `${selectedVehicle.plate} - ${selectedVehicle.model}` : ''}
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              type="number"
              {...register("kilometer", {
                required: "Quilometragem é obrigatória",
                min: { value: 0, message: "Quilometragem deve ser positiva" }
              })}
              fullWidth
              size="small"
              label="Quilometragem Atual"
              error={!!errors.kilometer}
              helperText={errors.kilometer?.message}
            />
          </Grid>

          {/* Documents Section */}
          <Grid item xs={12}>
            <Divider>
              <Typography variant="h6">Documentos</Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} md={selectedVehicle?.tacografo ? 6 : 12}>
            <ButtonLabel
              label="CRLV em dia?"
              name="crlvEmDia"
              options={["SIM", "NÃO"]}
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
            />
          </Grid>

          {selectedVehicle?.tacografo && (
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label="Certificado Tacógrafo em Dia?"
                name="certificadoTacografoEmDia"
                options={["SIM", "NÃO"]}
                control={control}
                rules={{ required: "Este campo é obrigatório" }}
              />
            </Grid>
          )}

          {/* Levels Section */}
          <Grid item xs={12}>
            <Divider>
              <Typography variant="h6">Níveis</Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Nível de Água"
              name="nivelAgua"
              control={control}
              options={["NORMAL", "BAIXO", "CRITICO"]}
              rules={{ required: "Este campo é obrigatório" }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Nível de Óleo"
              name="nivelOleo"
              options={["NORMAL", "BAIXO", "CRITICO"]}
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
            />
          </Grid>

          {/* Tires Section */}
          {selectedVehicle && (
            <>
              <Grid item xs={12}>
                <Divider>
                  <Typography variant="h6">Situação dos Pneus</Typography>
                </Divider>
              </Grid>

              <EixoSection
                eixoNumber={1}
                selectedVehicle={selectedVehicle}
                label="DIANTEIRA"
                fieldName="dianteira"
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
              />

              <EixoSection
                eixoNumber={2}
                selectedVehicle={selectedVehicle}
                label="TRAÇÃO"
                fieldName="tracao"
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
              />

              <EixoSection
                eixoNumber={3}
                selectedVehicle={selectedVehicle}
                label="TRUCK"
                fieldName="truck"
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
              />

              <EixoSection
                eixoNumber={4}
                selectedVehicle={selectedVehicle}
                label="QUARTO EIXO"
                fieldName="quartoEixo"
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
              />
            </>
          )}

          {/* Damages Section */}
          <Grid item xs={12}>
            <Divider>
              <Typography variant="h6">Avarias</Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Avarias na Cabine"
              name="avariasCabine"
              options={["NÃO", "SIM"]}
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
            />
            {watch("avariasCabine") === "SIM" && (
              <TextField
                {...register("descricaoAvariasCabine", {
                  required: "Descreva as avarias da cabine"
                })}
                label="Descreva as avarias"
                error={!!errors.descricaoAvariasCabine}
                helperText={errors.descricaoAvariasCabine?.message}
                multiline
                fullWidth
                rows={2}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel
              label="Avarias no Baú"
              name="bauPossuiAvarias"
              options={["NÃO", "SIM"]}
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
            />
            {watch("bauPossuiAvarias") === "SIM" && (
              <TextField
                {...register("descricaoAvariasBau", {
                  required: "Descreva as avarias do baú"
                })}
                label="Descreva as avarias"
                error={!!errors.descricaoAvariasBau}
                helperText={errors.descricaoAvariasBau?.message}
                multiline
                fullWidth
                rows={2}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>

          {/* Electrical Section */}
          <Grid item xs={12} md={6}>
            <Divider>
              <Typography variant="subtitle1">Sistema Elétrico</Typography>
            </Divider>
            <ButtonLabel
              label="Funcionamento Parte Elétrica"
              name="funcionamentoParteEletrica"
              options={["BOM", "RUIM"]}
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
            />
            {watch("funcionamentoParteEletrica") === "RUIM" && (
              <TextField
                {...register("descricaoParteEletrica", {
                  required: "Descreva o problema elétrico"
                })}
                label="Descreva o defeito"
                error={!!errors.descricaoParteEletrica}
                helperText={errors.descricaoParteEletrica?.message}
                multiline
                fullWidth
                rows={2}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>

          {/* Fire Extinguisher Section */}
          <Grid item xs={12} md={6}>
            <Divider>
              <Typography variant="subtitle1">Extintor</Typography>
            </Divider>
            <ButtonLabel
              label="Extintor em Dia?"
              name="extintor"
              options={["SIM", "NÃO"]}
              control={control}
              rules={{ required: "Este campo é obrigatório" }}
            />
          </Grid>

          {/* Photos Section */}
          <Grid item xs={12}>
            <Divider>
              <Typography variant="h6">Fotos do Veículo</Typography>
            </Divider>
            <Controller
              name="photos"
              control={control}
              render={({ field }) => (
                <PhotoUploader
                  name="photos"
                  label="Adicione fotos do veículo"
                  isRemoved={true}
                  onChange={async (photos: File[]) => {
                    const processedPhotos = await Promise.all(
                      photos.map(async (file, index) => ({
                        photo: file,
                        type: 'vehicle',
                        description: `Veículo - Foto ${index + 1}`
                      }))
                    );
                    field.onChange(processedPhotos);
                  }}
                />
              )}
            />
          </Grid>

          {/* Submit Section */}
          <Grid item xs={12}>
            {Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Existem campos obrigatórios não preenchidos!
              </Alert>
            )}

            <Button
              disabled={isSubmitting}
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              {isSubmitting ? 'Salvando...' : 'SALVAR VIAGEM'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default Page;