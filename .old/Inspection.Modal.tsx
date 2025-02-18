"use client";
import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/ultils";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import ButtonLabel from "@/components/ButtonLabel";
import {
  TextField, Button, Grid, Typography, Paper, Divider,
  Dialog, DialogContent, DialogTitle, IconButton
} from "@mui/material";
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm, Form } from "react-hook-form";
import { useRouter } from "next/navigation";
import { InspectionFormData } from "@/types/InspectionSchema";
import { EixoSection, Vehicle } from "@/components/EixoSection";
import ComboBox from "@/components/ComboBox";

interface InspectionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (inspectionId: string) => void;
}

const InspectionModal: React.FC<InspectionModalProps> = ({ open, onClose, onSuccess }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: vehicles, isLoading } = useSWR<Vehicle[], { [key: string]: any }>(`/api/vehicles`, fetcher);

  
  const { register, watch, control, reset, setValue, formState: { errors, isSubmitting } } = useForm<InspectionFormData>({
    defaultValues: {
      userId: session?.user?.id,
      vehicleId: "",
      eixo: "0",
      isFinished: true
    }
  });

  if(isLoading){
    reset()
  }

  if (!vehicles || isLoading) return <Loading />;
  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Watch values for conditional fields
  const avariasCabine = watch("avariasCabine");
  const bauPossuiAvarias = watch("bauPossuiAvarias");
  const funcionamentoParteEletrica = watch("funcionamentoParteEletrica");

  if (avariasCabine === "SIM") setValue("descricaoAvariasCabine", "");
  if (bauPossuiAvarias === "SIM") setValue("descricaoAvariasBau", "");
  if (funcionamentoParteEletrica === "BOM") setValue("descricaoParteEletrica", "");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{zIndex:999}}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Criar inspeção
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 3 }}>
          {isSubmitting && <Loading />}
          <Form
            method="post"
            action={"/api/inspections"}
            encType={'application/json'}
            onSuccess={async ({ response }) => {
              const res = await response.json()
              onSuccess ? onSuccess(res.inspection.id) : router.push(`/inspection/${res.inspection.id}`);
              onClose();
            }}
            onError={async (error) => {
              alert("Erro ao enviar os dados!");
              if (error.response) {
                const res = await error.response.json();
                console.log(res);
                alert("Erro ao criar a inspeção!")
              } else {
                console.log(error);
              }
            }}
            control={control}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}><Divider>Dados do usuário</Divider></Grid>

              <Grid item xs={12}>
                <ButtonLabel
                  label="Viagem"
                  name="status"
                  options={["INICIO", "FINAL"]}
                  control={control}
                  rules={{ required: "Este campo é obrigatório" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {<ComboBox
                  name="vehicleId"
                  label="Selecione um veículo"
                  options={vehicles.map((v) => {
                    return ({
                      label: `${v.plate} - ${v.model}`,
                      value: v.id
                    })
                  })}
                  control={control}
                  rules={{ required: 'Veículo é obrigatório' }}
                />}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  {...register("kilometer", { required: "Este campo é obrigatório" })}
                  fullWidth
                  size="small"
                  label="Quilometragem:"
                  error={!!errors.kilometer}
                  helperText={errors.kilometer?.message}
                />
              </Grid>

              <Grid item xs={12}><Divider>Documentos</Divider></Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel
                  label="CRLV em dia?"
                  name="crlvEmDia"
                  options={["SIM", "NÃO"]}
                  control={control}
                  rules={{ required: "Este campo é obrigatório" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel
                  label="Cert. Tacografo em Dia?"
                  name="certificadoTacografoEmDia"
                  options={["SIM", "NÃO"]}
                  control={control}
                  rules={{ required: "Este campo é obrigatório" }}
                />
              </Grid>

              <Grid item xs={12}><Divider>Níveis</Divider></Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel
                  label="Nível Água"
                  name="nivelAgua"
                  control={control}
                  options={["NORMAL", "BAIXO", "CRITICO"]}
                  rules={{ required: "Este campo é obrigatório" }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel
                  label="Nível Óleo"
                  name="nivelOleo"
                  options={["NORMAL", "BAIXO", "CRITICO"]}
                  control={control}
                  rules={{ required: "Este campo é obrigatório" }}
                />
              </Grid>

              {selectedVehicle && (
                <>
                  <Grid item xs={12}><Divider>Situação dos Pneus</Divider></Grid>
                  <EixoSection
                    eixoNumber={1}
                    label="DIANTEIRA"
                    fieldName="dianteira"
                    selectedVehicle={selectedVehicle}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                  <EixoSection
                    eixoNumber={2}
                    label="TRAÇÃO"
                    fieldName="tracao"
                    selectedVehicle={selectedVehicle}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                  <EixoSection
                    eixoNumber={3}
                    label="TRUCK"
                    fieldName="truck"
                    selectedVehicle={selectedVehicle}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                  <EixoSection
                    eixoNumber={4}
                    label="QUARTO EIXO"
                    fieldName="quartoEixo"
                    selectedVehicle={selectedVehicle}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                </>
              )}

              <Grid item xs={12}><Divider>Avarias</Divider></Grid>

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
                    {...register("descricaoAvariasCabine", { required: "Este campo é obrigatório" })}
                    label="Qual avaria?"
                    error={!!errors.descricaoAvariasCabine}
                    helperText={errors.descricaoAvariasCabine?.message}
                    multiline
                    fullWidth
                    rows={2}
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
                    {...register("descricaoAvariasBau", { required: "Este campo é obrigatório" })}
                    label="Qual defeito?"
                    error={!!errors.descricaoAvariasBau}
                    helperText={errors.descricaoAvariasBau?.message}
                    multiline
                    fullWidth
                    rows={2}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider>Elétrica</Divider>
                <ButtonLabel
                  label="Parte Elétrica"
                  name="funcionamentoParteEletrica"
                  options={["BOM", "RUIM"]}
                  control={control}
                  rules={{ required: "Este campo é obrigatório" }}
                />
                {watch("funcionamentoParteEletrica") === "RUIM" && (
                  <TextField
                    {...register("descricaoParteEletrica", { required: "Este campo é obrigatório" })}
                    label="Qual defeito?"
                    error={!!errors.descricaoParteEletrica}
                    helperText={errors.descricaoParteEletrica?.message}
                    multiline
                    fullWidth
                    rows={2}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                {Object.keys(errors).length > 0 && (
                  <Typography color="error" align="center" gutterBottom>
                    {errors.root?.message || "Existem campos obrigatórios não preenchidos!"}
                  </Typography>
                )}
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Salvar
                </Button>
              </Grid>
            </Grid>
          </Form>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default InspectionModal;