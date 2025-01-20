"use client";
import useSWR from "swr";
import React from "react";
import { fetcher } from "@/lib/ultils";
import Loading from "@/components/Loading";
import ButtonLabel from "@/components/ButtonLabel";
import { TextField,Button,Grid,Typography,Paper,Divider} from "@mui/material";
import { useForm, Form } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { InspectionFormData } from "@/types/InspectionSchema";

interface Option {
  [key: string]: any;
  setValue: (name: keyof InspectionFormData, value: any) => void;
}

interface Vehicle extends Option {
  id: string;
  plate: string;
  model: string;
}

interface EixoSectionProps {
  eixoNumber: number;
  label: string;
  fieldName: keyof InspectionFormData;
  selectedVehicle?: Vehicle;
  control: any;
  register: any;
  watch: any;
  setValue: any;
}

const EixoSection: React.FC<EixoSectionProps> = ({eixoNumber,label,fieldName,selectedVehicle,control,register,watch,setValue}) => {
  if (!selectedVehicle || selectedVehicle.eixo < eixoNumber) return null;
  setValue("eixo",String(eixoNumber));
  const currentValue = watch(fieldName);
  const field = `descricao${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` as keyof InspectionFormData;
  if (currentValue === "BOM") setValue(field, "");
  return (
    <Grid item xs={12} md={6}>
      <ButtonLabel label={label} name={fieldName} options={["BOM", "RUIM"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
      {currentValue === "RUIM" && (
        <TextField {...register(field, { required: true })} label="Qual Defeito?" multiline fullWidth rows={2}/>
      )}
    </Grid>
  );
};

const InspectionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vehicles, error } = useSWR<Vehicle[], { [key: string]: any }>(`/api/vehicles`, fetcher);
  const { register, watch, control, setValue, formState: { errors, isSubmitting }} = useForm<InspectionFormData>({
    defaultValues: async () => {
      const response = await fetch(`/api/inspections/${id}`);
      const data = await response.json();
      return data;
    }
  });
  
  if (!vehicles) return <Loading />;
  if (error) return <div>Error loading vehicles</div>;

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
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      {isSubmitting &&<Loading/>}
      <Form
        method="put"
        action={"/api/inspections"}
        encType={'application/json'}
        onSuccess={async({response}) => {
          const res = await response.json()
          router.push(`/inspection/${res.id}`);
        }}
        onError={(e) => {alert("Erro ao enviar os dados!")}}
        control={control}
      >
        <Typography variant="h4" gutterBottom>Criar inspeção</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Divider>Dados do usuário</Divider>
          </Grid>

          <Grid item xs={12}>
            <ButtonLabel label="Viagem" name="status" options={["INICIO", "FINAL"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
          </Grid>

          <Grid item xs={12} md={12}>
            <Typography>Quilometragem:</Typography>
            <TextField type="number" {...register("kilometer",{required: "Este campo é obrigatório"})} fullWidth size="small"/>
          </Grid>

          <Grid item xs={12}><Divider>Documentos</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="CRLV em dia?" name="crlvEmDia" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Cert. Tacografo em Dia?" name="certificadoTacografoEmDia" options={["SIM", "NÃO"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
          </Grid>

          <Grid item xs={12}><Divider>Níveis</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Nível Água" name="nivelAgua" control={control} options={["NORMAL", "BAIXO", "CRITICO"]} rules={{ required: "Este campo é obrigatório" }}/>
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Nível Óleo" name="nivelOleo" options={["NORMAL", "BAIXO", "CRITICO"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
          </Grid>

          {selectedVehicle && (
            <>
              <Grid item xs={12}><Divider>Situação dos Pneus</Divider></Grid>
              <EixoSection eixoNumber={1} label="DIANTEIRA" fieldName="dianteira" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue}/>
              <EixoSection eixoNumber={2} label="TRAÇÃO" fieldName="tracao" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue} />
              <EixoSection eixoNumber={3} label="TRUCK" fieldName="truck" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue}/>
              <EixoSection eixoNumber={4} label="QUARTO EIXO" fieldName="quartoEixo" selectedVehicle={selectedVehicle} control={control} register={register} watch={watch} setValue={setValue}/>
            </>
          )}

          <Grid item xs={12}><Divider>Avarias</Divider></Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Avarias na Cabine" name="avariasCabine" options={["NÃO", "SIM"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
            {watch("avariasCabine") === "SIM" && (
              <TextField {...register("descricaoAvariasCabine")} label="Qual avaria?" error={!!errors.descricaoAvariasCabine} multiline fullWidth rows={2}/>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <ButtonLabel label="Avarias no Baú" name="bauPossuiAvarias" options={["NÃO", "SIM"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
            {watch("bauPossuiAvarias") === "SIM" && (
              <TextField {...register("descricaoAvariasBau")} label="Qual defeito?" error={!!errors.descricaoAvariasBau} multiline fullWidth rows={2} />
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider>Elétrica</Divider>
            <ButtonLabel label="Parte Elétrica" name="funcionamentoParteEletrica" options={["BOM", "RUIM"]} control={control} rules={{ required: "Este campo é obrigatório" }}/>
            {watch("funcionamentoParteEletrica") === "RUIM" && (
              <TextField {...register("descricaoParteEletrica")} label="Qual defeito?" error={!!errors.descricaoParteEletrica} multiline fullWidth rows={2}/>
            )}
          </Grid>

          <Grid item xs={12}>
            {Object.keys(errors).length > 0 && (
              <Typography color="error" align="center" gutterBottom>
                {errors.root?.message||"Existem campos obrigatórios não preenchidos!"}
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