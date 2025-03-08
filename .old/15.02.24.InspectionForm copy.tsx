"use client";
import useSWR from "swr";
import React from "react";
import { fetcher } from "@/lib/ultils";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import ButtonLabel from "@/components/ButtonLabel";
import { TextField, Button, Grid, Typography, Paper, Divider } from "@mui/material";
import { useForm, Form } from "react-hook-form";
import { useRouter } from "next/navigation";
import { InspectionFormData } from "@/types/InspectionSchema";
import { EixoSection, Vehicle } from "@/components/EixoSection";
import ComboBox from "@/components/ComboBox";
import Link from "next/link";
import { getBase64 } from "@/utils";
import PhotoUploader from "@/components/_ui/PhotoUploader";

const InspectionForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: vehicles, error } = useSWR<Vehicle[], { [key: string]: any }>(`/api/vehicles`, fetcher);

  const { register, watch, control, setValue, formState: { errors, isSubmitting } } = useForm<InspectionFormData>({
    defaultValues: { userId: session?.user?.id, status: 'INSPECAO', vehicleId: "", eixo: "0", isFinished: true }
  });

  const avariasCabine = watch("avariasCabine");
  const bauPossuiAvarias = watch("bauPossuiAvarias");
  const funcionamentoParteEletrica = watch("funcionamentoParteEletrica");
  React.useEffect(() => {
    // Redefinir campos de descrição com base nos valores principais do campo
    if (avariasCabine === "NÃO") setValue("descricaoAvariasCabine", undefined);
    if (bauPossuiAvarias === "NÃO") setValue("descricaoAvariasBau", undefined);
    if (funcionamentoParteEletrica === "BOM") setValue("descricaoParteEletrica", undefined);
  }, [avariasCabine, bauPossuiAvarias, funcionamentoParteEletrica, setValue]);

  if (!vehicles) return <Loading />;
  if (error) return <div>Erro de carregamento dos veículos <Link href={'/'}>Voltar</Link></div>;

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      {isSubmitting && <Loading />}
      <Form
        method="post"
        action={"/api/inspecao"}
        encType={'application/json'}
        onSuccess={async ({response}) => {
          const res = await response.json();
          router.push(`/`)
        }}
        onError={async (error) => {
          alert("Erro ao enviar os dados!");
          if (error.response) {
            const res = await error.response.json();
            console.log(res);
            alert("Error ao criar a inspeção!")
          } else {
            console.log(error);
          }
        }}
        control={control}
      >

        <Typography variant="h4" gutterBottom>CRIAR INSPEÇÃO</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}><Divider>Dados do usuário</Divider></Grid>

          <Grid item xs={12}>
            <ButtonLabel disabled label="Viagem" name="status" options={["INSPECAO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <ComboBox name="vehicleId" label="Selecione um veículo" options={vehicles.map((v) => ({ label: `${v.plate} - ${v.model}`, value: v.id }))} control={control} rules={{ required: 'Veículo é obrigatório' }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField type="number" {...register("kilometer", { required: "Este campo é obrigatório" })} fullWidth size="small" label="Quilometragem:" />
          </Grid>

          <Grid item xs={12}><Divider>Documentos</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="CRLV em dia?" name="crlvEmDia" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
            <PhotoUploader name={'veiculo'} label={'FOTO DO DOCUMENTO'} onChange={async (photos: File[]) => {
              const [file] = photos;
              if (!file) return;
              try {
                const base64 = await getBase64(file);
              } catch (error) {
                console.error('Erro ao converter imagem:', error);
                alert('Erro ao processar a imagem, tente novamente.')
              }
            }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Cert. Tacografo em Dia?" name="certificadoTacografoEmDia" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
            <PhotoUploader name={'veiculo'} label={'FOTO DO TACOGRAFO'} onChange={async (photos: File[]) => {
              const [file] = photos;
              if (!file) return;
              try {
                const base64 = await getBase64(file);
                setValue('fotoTacografo', base64 as string);
              } catch (error) {
                console.error('Erro ao converter imagem:', error);
                alert('Erro ao processar a imagem, tente novamente.')
              }
            }} />
          </Grid>

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
              <EixoSection eixoNumber={1} label="DIANTEIRA" fieldName="dianteira" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSection eixoNumber={2} label="TRAÇÃO" fieldName="tracao" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSection eixoNumber={3} label="TRUCK" fieldName="truck" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSection eixoNumber={4} label="QUARTO EIXO" fieldName="quartoEixo" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue} />
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
            <Divider>EXTINTOR</Divider>
            <ButtonLabel label="EXTINTOR EM DIAS?" name="extintor" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }} />
            <PhotoUploader name={'veiculo'} label={'Foto do EXTINTOR'} onChange={async (photos: File[]) => {
              const [file] = photos;
              if (!file) return;
              try {
                const base64 = await getBase64(file);
                setValue('fotoExtintor', base64 as string);
              } catch (error) {
                console.error('Erro ao converter imagem:', error);
                alert('Erro ao processar a imagem, tente novamente.')
              }
            }} />
          </Grid>

          <Grid item xs={12} md={12}>
            <Divider>FOTO DAS AVARIAS</Divider>
            <Typography color="error">Minimo 4 fotos</Typography>
            <PhotoUploader name={'veiculo'} multiple label={'Foto das avarias'} isRemoved onChange={async (photos: File[]) => {
                const photosBase64 = await Promise.all(photos.map(async (file) => {
                  const base64 = await getBase64(file);
                  return { photo: base64 as string };
                }));
                setValue('photos', photosBase64);
            }}/>
          </Grid>

          <Grid item xs={12} md={12}>
            {Object.keys(errors).length > 0 && (
              <Typography color="error" align="center" gutterBottom>
                {errors.root?.message || "Existem campos obrigatórios não preenchidos!"}
              </Typography>
            )}
            <Button fullWidth type="submit" variant="contained" color="primary">Salvar</Button>
          </Grid>
        </Grid>
      </Form>
    </Paper>
  );
};

export default InspectionForm;