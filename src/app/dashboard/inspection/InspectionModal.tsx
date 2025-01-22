import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider, TextField, Typography, Switch, Stack } from "@mui/material";
import ButtonLabel from "@/components/ButtonLabel";
import { DataType } from "@/lib/formDataTypes";
import Loading from "@/components/Loading";
import { Controller, Form, useForm } from "react-hook-form";
import { InspectionFormData } from "@/types/InspectionSchema";
import { EixoSection } from "@/components/EixoSection";
import SectionDivider from "@/components/SectionDivider";
import ComboBox from "@/components/ComboBox";

interface Props {
  open: boolean;
  onClose: () => void;
  data: DataType;
  formData: InspectionFormData;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  callback?: (event: Response) => void;
}

export const InspectionModal: React.FC<Props> = ({ open, onClose, data, formData, onChange, callback }) => {
  const { register, watch, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<InspectionFormData>({
    defaultValues: {}
  });

  React.useMemo(() => {
    if (!formData.id) reset()
    Object.entries(formData).forEach(([key, value]) => {
      if (["user", "vehicle"].includes(key)) return;
      setValue(key as keyof InspectionFormData, value)
    })
  },[formData])

  if (!data.vehicle) return <Loading />;

  // Watch values for conditional fields
  const avariasCabine = watch("avariasCabine");
  const bauPossuiAvarias = watch("bauPossuiAvarias");
  const funcionamentoParteEletrica = watch("funcionamentoParteEletrica");
  if (avariasCabine === "SIM") setValue("descricaoAvariasCabine", "");
  if (bauPossuiAvarias === "SIM") setValue("descricaoAvariasBau", "");
  if (funcionamentoParteEletrica === "BOM") setValue("descricaoParteEletrica", "");

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = data.vehicle.find((v) => v.id === selectedVehicleId);

  if (isSubmitting) return <Loading />

  return (
    <Dialog open={open}>
      <Form
        method={formData.id ? 'put' : 'post'}
        action={"/api/inspections"}
        encType={'application/json'}
        onSuccess={async ({ response }) => {
          const res = await response.json()
          onClose();
          callback?.(res);
        }}
        onError={async (e) => {
          const data = await e.response?.json();
          console.log(data);

          alert("Erro ao enviar os dados!"); console.log(e);
        }}
        control={control}
      >
        <DialogTitle>
          {formData.id ? "Editar inspeção" : "Adicione nova inspeção"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <SectionDivider title="Dados do usuario" />

            <Grid item xs={12}>
              <ButtonLabel label="Viagem" name="status" options={["INICIO", "FINAL"]} control={control} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ComboBox name="userId" label="Selecione um usuário" options={data.user.map((u) => ({ label: u.name, value: u.id }))} control={control} rules={{ required: 'Usuário é obrigatório' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ComboBox name="vehicleId" label="Selecione um veículo" options={data.vehicle.map((v) => ({ label: `${v.plate} - ${v.model}`, value: v.id }))} control={control} rules={{ required: 'Veículo é obrigatório' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="isFinished"
                control={control}
                render={({ field }) => (
                  <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <Switch sx={{ padding: 1, borderRadius: 1 }} checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                    <div>
                      <Typography variant="body2">Status da inspeção:</Typography>
                      <Typography color={field.value?"success":"error"}>{field.value ? "Finalizada" : "Em aberto"}</Typography>
                    </div>
                  </Stack>
                )}
              />
              <Typography variant="caption">Se finalizada, o usuario não poderá editar.</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography>Quilometragem:</Typography>
              <TextField type="number" {...register("kilometer")} fullWidth size="small" />
            </Grid>

            <SectionDivider title="Documentos" />
            <Grid item xs={12} md={6}>
              <ButtonLabel label="CRLV em dia?" name="crlvEmDia" options={["SIM", "NÃO"]} control={control} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label="Cert. Tacografo em Dia?" name="certificadoTacografoEmDia" options={["SIM", "NÃO"]} control={control} />
            </Grid>

            <SectionDivider title="Niveis" />

            <Grid item xs={12} md={6}>
              <ButtonLabel label="Nível Água" name="nivelAgua" control={control} options={["NORMAL", "BAIXO", "CRITICO"]} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label="Nível Óleo" name="nivelOleo" options={["NORMAL", "BAIXO", "CRITICO"]} control={control} />
            </Grid>

            {selectedVehicle && (
              <>
                <Grid item xs={12}><Divider>Situação dos Pneus</Divider></Grid>
                <EixoSection eixoNumber={1} label="DIANTEIRA" fieldName="dianteira" control={control} register={register} watch={watch} setValue={setValue} />
                <EixoSection eixoNumber={2} label="TRAÇÃO" fieldName="tracao" control={control} register={register} watch={watch} setValue={setValue} />
                <EixoSection eixoNumber={3} label="TRUCK" fieldName="truck" control={control} register={register} watch={watch} setValue={setValue} />
                <EixoSection eixoNumber={4} label="QUARTO EIXO" fieldName="quartoEixo" control={control} register={register} watch={watch} setValue={setValue} />
              </>
            )}

            <SectionDivider title="Avarias" />
            <Grid item xs={12} md={6}>
              <ButtonLabel label="Avarias na Cabine" name="avariasCabine" options={["NÃO", "SIM"]} control={control} />
              {watch("avariasCabine") === "SIM" && (
                <TextField {...register("descricaoAvariasCabine")} label="Qual avaria?" error={!!errors.descricaoAvariasCabine} multiline fullWidth rows={2} />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label="Avarias no Baú" name="bauPossuiAvarias" options={["NÃO", "SIM"]} control={control} />
              {watch("bauPossuiAvarias") === "SIM" && (
                <TextField {...register("descricaoAvariasBau")} label="Qual defeito?" error={!!errors.descricaoAvariasBau} multiline fullWidth rows={2} />
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider>Elétrica</Divider>
              <ButtonLabel label="Parte Elétrica" name="funcionamentoParteEletrica" options={["BOM", "RUIM"]} control={control} />
              {watch("funcionamentoParteEletrica") === "RUIM" && (
                <TextField {...register("descricaoParteEletrica")} label="Qual defeito?" error={!!errors.descricaoParteEletrica} multiline fullWidth rows={2} />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="reset" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : formData.id ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </Form>
    </Dialog >
  );
};