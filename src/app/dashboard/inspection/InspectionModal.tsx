// components/InspectionModal.tsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider, TextField, Input } from "@mui/material";
import ButtonLabel from "@/components/ButtonLabel";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import FileUploader from "@/components/FileUploader";
import { InspectionFormData, InspectionSchema } from '@/lib/InspectionSchema';
import { z } from "zod";
import { DataType } from "@/lib/formDataTypes";

interface InspectionModalProps {
    open: boolean;
    onClose: () => void;
    data: DataType;
    formData: Partial<InspectionFormData>;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onToggle?: (event: Partial<InspectionFormData>) => void;
    callback?: (event: Response) => void;
}

export const InspectionModal = ({
    open, onClose, data, formData, onChange, onToggle, callback
}: InspectionModalProps) => {

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const validatedData = InspectionSchema.parse(formData);
            setErrors({});
            const mode = !!validatedData.id;
            const url = '/api/inspections';
            const method = mode ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...validatedData }),
            });
            const res = await response.json();
            console.log(res);
            onClose();
            if (callback) callback(response);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.errors.reduce((acc, curr) => ({
                    ...acc,
                    [curr.path[0]]: curr.message
                }), {});
                setErrors(formattedErrors);
            }
        }
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
                        <Grid item xs={12} md={12}>
                            <ButtonLabel
                                label={"Viagem"}
                                name={"status"}
                                value={formData?.status}
                                onChange={onChange}
                                options={["INICIO", "FINAL"]}
                                error={!!errors.status}
                                helperText={errors.status}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <CustomAutocomplete
                                keyExtractor="name"
                                label={"Usuário"}
                                options={data?.user}
                                name={"userId"}
                                onChange={onChange}
                                defaultValue={formData.userId}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <CustomAutocomplete
                                keyExtractor="licensePlate"
                                label={"Veiculo"}
                                options={data?.vehicle}
                                name={"vehicleId"}
                                onChange={onChange}
                                defaultValue={formData.vehicleId}
                            />
                        </Grid>

                        <Grid item xs={12} mb={-3}><Divider>Documentos</Divider></Grid>

                        <Grid item xs={12} md={6}>
                            <ButtonLabel
                                label={"CRLV em dia?"}
                                name={"crlvEmDia"}
                                value={formData.crlvEmDia}
                                options={["SIM", "NÃO"]}
                                onChange={onChange}
                                error={!!errors.crlvEmDia}
                                helperText={errors.crlvEmDia}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ButtonLabel
                                label={"Cert. Tacografo em Dia?"}
                                name={"certificadoTacografoEmDia"}
                                value={formData.certificadoTacografoEmDia}
                                options={["SIM", "NÃO"]}
                                onChange={onChange}
                                error={!!errors.certificadoTacografoEmDia}
                                helperText={errors.certificadoTacografoEmDia}
                            />
                        </Grid>

                        <Grid item xs={12} mb={-3}><Divider>Niveis</Divider></Grid>

                        <Grid item xs={12} md={6}>
                            <ButtonLabel
                                label={"Nivel Agua"}
                                name={"nivelAgua"}
                                value={formData.nivelAgua}
                                options={["NORMAL", "BAIXO", "CRITICO"]}
                                onChange={onChange}

                                error={!!errors.nivelAgua}
                                helperText={errors.nivelAgua}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ButtonLabel
                                label={"Nivel Oleo"}
                                name={"nivelOleo"}
                                value={formData.nivelOleo}
                                options={["NORMAL", "BAIXO", "CRITICO"]}
                                onChange={onChange}

                                error={!!errors.nivelOleo}
                                helperText={errors.nivelOleo}
                            />
                        </Grid>

                        <Grid item xs={12} mb={-3}><Divider>Situação dos Pneus</Divider></Grid>

                        <Grid item xs={12} md={6}>
                            <ButtonLabel
                                label={"DIANTEIRA"}
                                name={"dianteira"}
                                options={["BOM", "RUIM"]}
                                onChange={onChange}
                                value={formData.dianteira}

                                error={!!errors.dianteira}
                                helperText={errors.dianteira}
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

                                    error={!!errors.descricaoDianteira}
                                    helperText={errors.descricaoDianteira}
                                />)}
                        </Grid>

                        {Number(formData.eixo) > 1 && (
                            <Grid item xs={12} md={6}>
                                <ButtonLabel
                                    label={"TRAÇÃO"}
                                    name={"tracao"}
                                    value={formData.tracao}
                                    options={["BOM", "RUIM"]}
                                    onChange={onChange}

                                    error={!!errors.tracao}
                                    helperText={errors.tracao}
                                />
                                {formData.tracao === "RUIM" && (
                                    <TextField
                                        label={"Qual Defeito?"}
                                        name="descricaoTracao"
                                        value={formData.descricaoTracao}
                                        multiline
                                        fullWidth
                                        rows={2}
                                        onChange={onChange}

                                        error={!!errors.descricaoTracao}
                                        helperText={errors.descricaoTracao}
                                    />
                                )}
                            </Grid>
                        )}

                        {Number(formData.eixo) > 2 && (
                            <Grid item xs={12} md={6}>
                                <ButtonLabel
                                    label={"TRUCK"}
                                    name={"truck"}
                                    value={formData.truck}
                                    options={["BOM", "RUIM"]}
                                    onChange={onChange}

                                    error={!!errors.truck}
                                    helperText={errors.truck}
                                />
                                {formData.truck === "RUIM" && (
                                    <TextField
                                        label={"Qual Defeito"}
                                        name="descricaoTruck"
                                        value={formData.descricaoTruck}
                                        multiline
                                        fullWidth
                                        rows={2}
                                        onChange={onChange}

                                        error={!!errors.descricaoTruck}
                                        helperText={errors.descricaoTruck}
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

                                    error={!!errors.quartoEixo}
                                    helperText={errors.quartoEixo}
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

                                        error={!!errors.descricaoQuartoEixo}
                                        helperText={errors.descricaoQuartoEixo}
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

                                error={!!errors.avariasCabine}
                                helperText={errors.avariasCabine}
                            />
                            {formData.avariasCabine === "SIM" && (
                                <TextField
                                    label={"Qual avaria?"}
                                    name={'descricaoAvariasCabine'}
                                    onChange={onChange}
                                    value={formData.descricaoAvariasCabine}
                                    error={!!errors.descricaoAvariasCabine}
                                    helperText={errors.descricaoAvariasCabine}
                                    multiline fullWidth rows={2}
                                />
                            )}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <ButtonLabel
                                label={"Avarias no Baú"}
                                name={"bauPossuiAvarias"}
                                options={["NÃO", "SIM"]}
                                value={formData.bauPossuiAvarias}
                                onChange={onChange}

                                error={!!errors.bauPossuiAvarias}
                                helperText={errors.bauPossuiAvarias}
                            />
                            {formData.bauPossuiAvarias === "SIM" && (
                                <TextField
                                    label={"Qual defeito?"}
                                    name={'descricaoAvariasBau'}
                                    onChange={onChange}
                                    value={formData.descricaoAvariasBau}
                                    error={!!errors.descricaoAvariasBau}
                                    helperText={errors.descricaoAvariasBau}
                                    multiline fullWidth rows={2} />
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
                                error={!!errors.funcionamentoParteEletrica}
                                helperText={errors.funcionamentoParteEletrica}
                            />
                            {formData.funcionamentoParteEletrica === "RUIM" && (
                                <TextField
                                    label={"Qual defeito?"}
                                    name="descricaoParteEletrica"
                                    onChange={onChange}
                                    value={formData.descricaoParteEletrica}
                                    error={!!errors.descricaoParteEletrica}
                                    helperText={errors.descricaoParteEletrica}
                                    multiline fullWidth rows={2} />
                            )}
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <Divider>Foto do veiculo</Divider>
                            <FileUploader
                                label={"Foto Veiculo"}
                                name={"fotoVeiculo"}
                                value={formData.fotoVeiculo}
                                onChange={onChange}
                                error={!!errors.fotoVeiculo}
                                helperText={errors.fotoVeiculo}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained">
                        {!!formData.id ? "Atualizar" : "Criar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};