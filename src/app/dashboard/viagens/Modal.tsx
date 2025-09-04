'use client';
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Grid, 
  CircularProgress, 
  Alert, 
  Divider, 
  Box, 
  Tabs, 
  Tab, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField 
} from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import ButtonLabel from '@/components/_ui/ButtonLabel';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Inspect, inspection, user, vehicle } from '@prisma/client';

interface FormDataType {
  nivelAgua: string;
  nivelOleo: string;
  avariasCabine: string;
  bauPossuiAvarias: string;
  funcionamentoParteEletrica: string;
  descricaoAvariasCabine: string;
  descricaoAvariasBau: string;
  descricaoParteEletrica: string;
  resolvidoPor: string;
  observacoes: string;
  dianteira: string;
  descricaoDianteira: string;
  tracao: string;
  descricaoTracao: string;
  truck: string;
  descricaoTruck: string;
  quartoEixo: string;
  descricaoQuartoEixo: string;
}

type VehicleInspection = Inspect & {
  start: inspection;
  end: inspection;
  vehicle: Partial<vehicle>;
  user: user;
}

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  inspectionData?: VehicleInspection | null;
  onSave: (id: string, data: { section: 'start' | 'end'; data: FormDataType }) => Promise<void>;
  loading?: boolean;
}

const createDefaultValues = (sectionData?: inspection): FormDataType => ({
  nivelAgua: sectionData?.nivelAgua || '',
  nivelOleo: sectionData?.nivelOleo || '',
  avariasCabine: sectionData?.avariasCabine || '',
  bauPossuiAvarias: sectionData?.bauPossuiAvarias || '',
  funcionamentoParteEletrica: sectionData?.funcionamentoParteEletrica || '',
  descricaoAvariasCabine: sectionData?.descricaoAvariasCabine || '',
  descricaoAvariasBau: sectionData?.descricaoAvariasBau || '',
  descricaoParteEletrica: sectionData?.descricaoParteEletrica || '',
  resolvidoPor: '',
  observacoes: '',
  dianteira: sectionData?.dianteira || '',
  descricaoDianteira: sectionData?.descricaoDianteira || '',
  tracao: sectionData?.tracao || '',
  descricaoTracao: sectionData?.descricaoTracao || '',
  truck: sectionData?.truck || '',
  descricaoTruck: sectionData?.descricaoTruck || '',
  quartoEixo: sectionData?.quartoEixo || '',
  descricaoQuartoEixo: sectionData?.descricaoQuartoEixo || '',
});

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ 
  open, 
  onClose, 
  inspectionData, 
  onSave, 
  loading = false 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Always call hooks - never conditionally
  const startForm = useForm<FormDataType>({
    defaultValues: createDefaultValues(inspectionData?.start)
  });

  const endForm = useForm<FormDataType>({
    defaultValues: createDefaultValues(inspectionData?.end)
  });

  // Get the current form based on the active tab
  const currentForm = tabValue === 0 ? startForm : endForm;
  const { control, handleSubmit, watch, reset, formState: { errors } } = currentForm;

  // Watch for values that affect conditional fields
  const avariasCabine = watch('avariasCabine');
  const bauPossuiAvarias = watch('bauPossuiAvarias');
  const funcionamentoParteEletrica = watch('funcionamentoParteEletrica');

  // Reset forms when inspectionData changes
  useEffect(() => {
    if (inspectionData?.start) {
      startForm.reset(createDefaultValues(inspectionData.start));
    }
    if (inspectionData?.end) {
      endForm.reset(createDefaultValues(inspectionData.end));
    }
  }, [inspectionData, startForm, endForm]);

  // Early return AFTER all hooks have been called
  if (!inspectionData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogContent>
          <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
            Nenhum dado de inspeção disponível.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSuccess(false);
    setError('');
  };

  const resetForm = () => {
    startForm.reset(createDefaultValues());
    endForm.reset(createDefaultValues());
    setSuccess(false);
    setError('');
  };

  const onSubmit = async (data: FormDataType) => {
    try {
      setSuccess(false);
      setError('');

      const currentSection = tabValue === 0 ? 'start' : 'end';
      
      if (!data.resolvidoPor?.trim()) {
        setError('Por favor, preencha quem resolveu o problema.');
        return;
      }

      await onSave(inspectionData.id,{
        section: currentSection,
        data: data
      });

      setSuccess(true);
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar as alterações.');
    }
  };

  const handleClose = () => {
    resetForm();
    setSuccess(false);
    setError('');
    onClose();
  };

  const hasIssues = (section: 'start' | 'end'): boolean => {
    const data = inspectionData?.[section];
    if (!data) return false;

    return (
      data.nivelAgua !== 'NORMAL' ||
      data.nivelOleo !== 'NORMAL' ||
      data.avariasCabine === 'SIM' ||
      data.bauPossuiAvarias === 'SIM' ||
      data.funcionamentoParteEletrica === 'RUIM' ||
      data.dianteira === 'RUIM' ||
      data.tracao === 'RUIM' ||
      data.truck === 'RUIM' ||
      data.quartoEixo === 'RUIM'
    );
  };

  // EixoSection component definition
  const EixoSection: React.FC<{
    name: "dianteira" | "tracao" | "truck" | "quartoEixo";
    label: string;
    descricao: "descricaoDianteira" | "descricaoTracao" | "descricaoTruck" | "descricaoQuartoEixo";
    data: inspection;
  }> = ({ name, label, descricao, data }) => {
    if (data[name] !== 'RUIM') return null;
    
    return (
      <>
        <Grid item xs={12} md={6}>
          <Controller 
            name={name} 
            control={control} 
            render={({ field }) => (
              <ButtonLabel 
                name={name} 
                label={label} 
                options={["BOM", "RUIM"]} 
                control={control} 
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller 
            name={descricao} 
            control={control} 
            render={({ field }) => (
              <TextField 
                {...field} 
                label="Qual Defeito?" 
                multiline 
                fullWidth 
                rows={2} 
              />
            )} 
          />
        </Grid>
      </>
    );
  };

  const renderFormFields = (section: 'start' | 'end') => {
    const data = inspectionData?.[section];
    if (!data) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Dados de {section === 'start' ? 'início' : 'fim'} da viagem não disponíveis.
        </Typography>
      );
    }

    if (!hasIssues(section)) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Não há problemas ou avarias para corrigir no {section === 'start' ? 'início' : 'fim'} da viagem.
        </Typography>
      );
    }

    return (
      <FormProvider {...currentForm}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Fluid Levels Section */}
            {(data.nivelAgua !== 'NORMAL' || data.nivelOleo !== 'NORMAL') && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Níveis de Fluidos</Typography>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
                {data.nivelAgua !== 'NORMAL' && (
                  <Grid item xs={12} sm={6}>
                    <Controller 
                      name="nivelAgua" 
                      control={control} 
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Nível de Água</InputLabel>
                          <Select {...field} label="Nível de Água">
                            <MenuItem value="BAIXO">BAIXO</MenuItem>
                            <MenuItem value="CRITICO">CRITICO</MenuItem>
                            <MenuItem value="NORMAL">OK (Corrigido)</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}
                {data.nivelOleo !== 'NORMAL' && (
                  <Grid item xs={12} sm={6}>
                    <Controller 
                      name="nivelOleo" 
                      control={control} 
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Nível de Óleo</InputLabel>
                          <Select {...field} label="Nível de Óleo">
                            <MenuItem value="BAIXO">BAIXO</MenuItem>
                            <MenuItem value="CRITICO">CRITICO</MenuItem>
                            <MenuItem value="NORMAL">OK (Corrigido)</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}
              </>
            )}

            {/* Damages Section */}
            {(data.avariasCabine === 'SIM' || data.bauPossuiAvarias === 'SIM') && (
              <>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Avarias</Typography>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
                {data.avariasCabine === 'SIM' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Controller 
                        name="avariasCabine" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Avarias na Cabine</InputLabel>
                            <Select {...field} label="Avarias na Cabine">
                              <MenuItem value="SIM">Com Avarias</MenuItem>
                              <MenuItem value="NÃO">Corrigido</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller 
                        name="descricaoAvariasCabine" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            label="Descrição das Avarias na Cabine" 
                            disabled={avariasCabine !== 'SIM'} 
                            multiline 
                            rows={2} 
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
                {data.bauPossuiAvarias === 'SIM' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Controller 
                        name="bauPossuiAvarias" 
                        control={control} 
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Avarias no Baú</InputLabel>
                            <Select {...field} label="Avarias no Baú">
                              <MenuItem value="SIM">Com Avarias</MenuItem>
                              <MenuItem value="NÃO">Corrigido</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller 
                        name="descricaoAvariasBau" 
                        control={control} 
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            label="Descrição das Avarias no Baú" 
                            disabled={bauPossuiAvarias !== 'SIM'} 
                            multiline 
                            rows={2} 
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}

            {/* Electrical Section */}
            {data.funcionamentoParteEletrica === "RUIM" && (
              <>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Parte Elétrica</Typography>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller 
                    name="funcionamentoParteEletrica" 
                    control={control} 
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Funcionamento da Parte Elétrica</InputLabel>
                        <Select {...field} label="Funcionamento da Parte Elétrica">
                          <MenuItem value="RUIM">PROBLEMAS</MenuItem>
                          <MenuItem value="BOM">OK (Corrigido)</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller 
                    name="descricaoParteEletrica" 
                    control={control} 
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        fullWidth 
                        label="Descrição dos Problemas Elétricos" 
                        disabled={funcionamentoParteEletrica !== 'RUIM'} 
                        multiline 
                        rows={2} 
                      />
                    )} 
                  />
                </Grid>
              </>
            )}

            {/* Tires Section */}
            {(data.dianteira === 'RUIM' || data.tracao === 'RUIM' || data.truck === 'RUIM' || data.quartoEixo === 'RUIM') && (
              <>
                <Grid item xs={12}>
                  <Divider>Situação dos Pneus</Divider>
                </Grid>
                <EixoSection name="dianteira" descricao="descricaoDianteira" label="Dianteira" data={data} />
                <EixoSection name="tracao" descricao="descricaoTracao" label="Tração" data={data} />
                <EixoSection name="truck" descricao="descricaoTruck" label="Truck" data={data} />
                <EixoSection name="quartoEixo" descricao="descricaoQuartoEixo" label="Quarto Eixo" data={data} />
              </>
            )}

            {/* Resolution Section */}
            {hasIssues(section) && (
              <>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Informações da Correção</Typography>
                  <Divider sx={{ mb: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Controller 
                    name="resolvidoPor" 
                    control={control} 
                    rules={{ required: "Campo obrigatório" }} 
                    render={({ field, fieldState }) => (
                      <TextField 
                        {...field} 
                        required 
                        fullWidth 
                        label="Resolvido por" 
                        placeholder="Nome do responsável pela correção" 
                        error={!!fieldState.error} 
                        helperText={fieldState.error?.message || ''} 
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller 
                    name="observacoes" 
                    control={control} 
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        fullWidth 
                        label="Observações" 
                        multiline 
                        rows={3} 
                        placeholder="Detalhes sobre as correções realizadas" 
                      />
                    )} 
                  />
                </Grid>
              </>
            )}
          </Grid>
        </form>
      </FormProvider>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle component="div">
        <Typography variant="h6" component="div">
          Atualizar Status de Problemas e Avarias
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Veículo: {inspectionData?.vehicle?.plate} - {inspectionData?.vehicle?.model}
        </Typography>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="inspection tabs">
          <Tab 
            label="Início da Viagem" 
            disabled={!inspectionData?.start || !hasIssues('start')} 
          />
          <Tab 
            label="Fim da Viagem" 
            disabled={!inspectionData?.end || !hasIssues('end')} 
          />
        </Tabs>
      </Box>

      <DialogContent>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Alterações salvas com sucesso!
          </Alert>
        )}
        {error && !success && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {tabValue === 0 ? renderFormFields('start') : renderFormFields('end')}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button startIcon={<CloseIcon />} onClick={handleClose} color="inherit">
          Cancelar
        </Button>

        <Button
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit(onSubmit)}
          color="primary"
          variant="contained"
          disabled={
            loading || 
            (tabValue === 0 && !hasIssues('start')) || 
            (tabValue === 1 && !hasIssues('end'))
          }
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateModal;