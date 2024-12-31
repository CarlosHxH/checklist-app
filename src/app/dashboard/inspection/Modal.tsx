import ButtonLabel from "@/components/ButtonLabel";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import FileUploader from "@/components/FileUploader";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Input, TextField } from "@mui/material";

export default function Modal({data,formData,handleToggle, handleChange, toggle, onClose}:any) {
    return(
        <Dialog open={toggle} onClose={console.log} maxWidth="sm" fullWidth>
        <form onSubmit={console.log}>
          <DialogTitle>
            {1 ? "Editar Inspeção" : "Adicionar nova Inspeção"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>

              <Grid item xs={12} mb={-3}><Divider>Dados do usuario</Divider></Grid>
              
              <Grid item xs={12} md={6} sx={{ mt: 4 }}>
                <Input name="dataInpecao" type="date" value={formData.dataInspecao} onChange={handleChange} required fullWidth />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"Viagem"} name={"status"} options={["INICIO", "FINAL"]} />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomAutocomplete keyExtractor="name" label={"Usuário"} onSelect={handleToggle} options={data.user} name={"userId"} />
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomAutocomplete keyExtractor="licensePlate" label={"Veiculo"} onSelect={handleToggle} options={data.vehicle} name={"vehicleId"} />
              </Grid>

              <Grid item xs={12} mb={-3}><Divider>Documentos</Divider></Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"CRLV em dia?"} name={"crlvEmDia"} options={["SIM", "NÃO"]} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"Cert. Tacografo em Dia?"} name={"certificadoTacografoEmDia"} options={["SIM", "NÃO"]} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} mb={-3}><Divider>Niveis</Divider></Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"Nivel Agua"} name={"nivelAgua"} options={["NORMAL", "BAIXO", "CRITICO"]} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"Nivel Oleo"} name={"certificadoTacografoEmDia"} options={["NORMAL", "BAIXO", "CRITICO"]} onChange={handleChange} />
              </Grid>

              <Grid item xs={12} mb={-3}><Divider>Situação dos Pneus</Divider></Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel
                  label={"DIANTEIRA"}
                  name={"dianteira"}
                  options={["BOM", "RUIM"]}
                  onChange={handleChange}
                />
                {formData.dianteira === "RUIM" && (
                  <TextField
                    label={"Qual Defeito?"}
                    name="descricaoDianteira"
                    value={formData.descricaoDianteira}
                    onChange={handleChange}
                    multiline
                    fullWidth
                    rows={2}
                  />)}
              </Grid>

              {formData.eixo > 1 && (
                <Grid item xs={12} md={6}>
                  <ButtonLabel label={"TRAÇÃO"} name={"tracao"} options={["BOM", "RUIM"]} onChange={handleChange} />
                  {formData.tracao === "RUIM" && (
                    <TextField
                      label={"Qual Defeito?"}
                      name="descricaoTracao"
                      value={formData.descricaoTracao}
                      multiline
                      fullWidth
                      rows={2}
                      onChange={handleChange}
                    />
                  )}
                </Grid>
              )}

              {formData.eixo > 2 && (
                <Grid item xs={12} md={6}>
                  <ButtonLabel label={"TRUCK"} name={"truck"} options={["BOM", "RUIM"]} onChange={handleChange} />
                  {formData.truck === "RUIM" && (
                    <TextField
                      label={"Qual Defeito"}
                      name="descricaoTruck"
                      value={formData.descricaoTruck}
                      multiline
                      fullWidth
                      rows={2}
                      onChange={handleChange}
                    />
                  )}
                </Grid>
              )}
              {formData.eixo > 3 && (
                <Grid item xs={12} md={6}>
                  <ButtonLabel
                    label={"Quarto Eixo"}
                    name={"quartoEixo"}
                    options={["BOM", "RUIM"]}
                    onChange={handleChange}
                  />
                  {formData.quartoEixo === "RUIM" && (
                    <TextField
                      label={"Qual Defeito?"}
                      name="descricaoQuartoEixo"
                      value={formData.descricaoQuartoEixo}
                      onChange={handleChange}
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
                  onChange={handleChange}
                />
                {formData.avariasCabine === "SIM" && (
                  <TextField label={"Qual avaria?"} name={'descricaoAvariasCabine'} onChange={handleChange} value={formData.descricaoAvariasCabine} multiline fullWidth rows={2} />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel
                  label={"Avarias no Baú"}
                  name={"bauPossuiAvarias"}
                  options={["NÃO", "SIM"]}
                  value={formData.bauPossuiAvarias}
                  onChange={handleChange}
                />
                {formData.bauPossuiAvarias === "SIM" && (
                  <TextField label={"Qual defeito?"} name={'descricaoAvariasBau'} onChange={handleChange} value={formData.descricaoAvariasBau} multiline fullWidth rows={2} />
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider>Eletrica</Divider>
                <ButtonLabel
                  label={"Parte Elétrica"}
                  name={"funcionamentoParteEletrica"}
                  options={["BOM", "RUIM"]}
                  value={formData.funcionamentoParteEletrica}
                  onChange={handleChange}
                />
                {formData.funcionamentoParteEletrica === "RUIM" && (
                  <TextField label={"Qual defeito?"} name="descricaoParteEletrica" onChange={handleChange} value={formData.descricaoParteEletrica} multiline fullWidth rows={2} />
                )}
              </Grid>

              <Grid item xs={12} md={12}>
              <Divider>Foto do veiculo</Divider>
                <FileUploader label={"Foto Veiculo"} name={"fotoVeiculo"} onChange={handleToggle} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="contained">{0 ? "Atualizar" : "Criar"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    )
}