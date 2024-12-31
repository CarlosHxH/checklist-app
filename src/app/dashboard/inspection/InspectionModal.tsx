// components/InspectionModal.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider, TextField, Input } from "@mui/material";
import { DataType, InspectionFormData } from "./types";
import ButtonLabel from "@/components/ButtonLabel";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import FileUploader from "@/components/FileUploader";

interface InspectionModalProps {
  open: boolean;
  onClose: () => void;
  data: DataType;
  formData: InspectionFormData;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (event: Partial<InspectionFormData>) => void;
}

export const InspectionModal = ({
  open, onClose, data, formData, onChange, onToggle
}: InspectionModalProps) => {
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {formData.id ? "Editar inspeção" : "Adicione nova inspeção"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>

            <Grid item xs={12}><Divider>Dados do usuario</Divider></Grid>

            <Grid item xs={12} md={6} sx={{ mt: 4 }}>
              <Input name="dataInspecao" type="datetime-local" value={formData.dataInspecao||''} onChange={onChange} required fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label={"Viagem"} name={"status"} value={formData?.status} options={["INICIO", "FINAL"]} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomAutocomplete keyExtractor="name" defaultValue={formData.userId} label={"Usuário"} onChange={onChange} options={data?.user} name={"userId"} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomAutocomplete keyExtractor="licensePlate" defaultValue={formData.vehicleId} label={"Veiculo"} onChange={onChange} options={data?.vehicle} name={"vehicleId"} />
            </Grid>

            <Grid item xs={12} mb={-3}><Divider>Documentos</Divider></Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label={"CRLV em dia?"} name={"crlvEmDia"} value={formData.crlvEmDia} options={["SIM", "NÃO"]} onChange={onChange} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label={"Cert. Tacografo em Dia?"} name={"certificadoTacografoEmDia"} value={formData.certificadoTacografoEmDia} options={["SIM", "NÃO"]} onChange={onChange} />
            </Grid>

            <Grid item xs={12} mb={-3}><Divider>Niveis</Divider></Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label={"Nivel Agua"} name={"nivelAgua"} value={formData.nivelAgua} options={["Normal", "BAIXO", "CRITICO"]} onChange={onChange} />
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel label={"Nivel Oleo"} name={"nivelOleo"} value={formData.nivelOleo} options={["Normal", "BAIXO", "CRITICO"]} onChange={onChange} />
            </Grid>

            <Grid item xs={12} mb={-3}><Divider>Situação dos Pneus</Divider></Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"DIANTEIRA"}
                name={"dianteira"}
                options={["BOM", "RUIM"]}
                onChange={onChange}
                value={formData.dianteira}
              />
              {formData.dianteira === "RUIM" && (
                <TextField
                  label={"Qual Defeito?"}
                  name="descricaoDianteira"
                  value={formData.descricaoDianteira}
                  onChange={onChange}
                  multiline
                  fullWidth
                  rows={2}
                />)}
            </Grid>

            {Number(formData.eixo) > 1 && (
              <Grid item xs={12} md={6}>
                <ButtonLabel label={"TRAÇÃO"} name={"tracao"} value={formData.tracao} options={["BOM", "RUIM"]} onChange={onChange} />
                {formData.tracao === "RUIM" && (
                  <TextField
                    label={"Qual Defeito?"}
                    name="descricaoTracao"
                    value={formData.descricaoTracao}
                    multiline
                    fullWidth
                    rows={2}
                    onChange={onChange}
                  />
                )}
              </Grid>
            )}

            {Number(formData.eixo) > 2 && (
              <Grid item xs={12} md={6}>
                <ButtonLabel label={"TRUCK"} name={"truck"} value={formData.truck} options={["BOM", "RUIM"]} onChange={onChange} />
                {formData.truck === "RUIM" && (
                  <TextField
                    label={"Qual Defeito"}
                    name="descricaoTruck"
                    value={formData.descricaoTruck}
                    multiline
                    fullWidth
                    rows={2}
                    onChange={onChange}
                  />
                )}
              </Grid>
            )}
            {Number(formData.eixo) > 3 && (
              <Grid item xs={12} md={6}>
                <ButtonLabel
                  label={"Quarto Eixo"}
                  name={"quartoEixo"}
                  value={formData.quartoEixo}
                  options={["BOM", "RUIM"]}
                  onChange={onChange}
                />
                {formData.quartoEixo === "RUIM" && (
                  <TextField
                    label={"Qual Defeito?"}
                    name="descricaoQuartoEixo"
                    value={formData.descricaoQuartoEixo}
                    onChange={onChange}
                    multiline
                    fullWidth
                    rows={2}
                  />
                )}
              </Grid>
            )}

            <Grid item xs={12} my={-3}><Divider>Avarias</Divider></Grid>
            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"Avarias na Cabine"}
                name={"avariasCabine"}
                options={["NÃO", "SIM"]}
                value={formData.avariasCabine}
                onChange={onChange}
              />
              {formData.avariasCabine === "SIM" && (
                <TextField label={"Qual avaria?"} name={'descricaoAvariasCabine'} onChange={onChange} value={formData.descricaoAvariasCabine} multiline fullWidth rows={2} />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <ButtonLabel
                label={"Avarias no Baú"}
                name={"bauPossuiAvarias"}
                options={["NÃO", "SIM"]}
                value={formData.bauPossuiAvarias}
                onChange={onChange}
              />
              {formData.bauPossuiAvarias === "SIM" && (
                <TextField label={"Qual defeito?"} name={'descricaoAvariasBau'} onChange={onChange} value={formData.descricaoAvariasBau} multiline fullWidth rows={2} />
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider>Eletrica</Divider>
              <ButtonLabel
                label={"Parte Elétrica"}
                name={"funcionamentoParteEletrica"}
                options={["BOM", "RUIM"]}
                value={formData.funcionamentoParteEletrica}
                onChange={onChange}
              />
              {formData.funcionamentoParteEletrica === "RUIM" && (
                <TextField label={"Qual defeito?"} name="descricaoParteEletrica" onChange={onChange} value={formData.descricaoParteEletrica} multiline fullWidth rows={2} />
              )}
            </Grid>

            <Grid item xs={12} md={12}>
              <Divider>Foto do veiculo</Divider>
              <FileUploader label={"Foto Veiculo"} name={"fotoVeiculo"} value={formData.fotoVeiculo} onChange={onChange} />
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
