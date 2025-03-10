'use client';
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, CircularProgress, Alert, Divider, Box, Tabs, Tab, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import ButtonLabel from '@/components/_ui/ButtonLabel';
;

interface InspectionData {
  start?: {
    nivelAgua: string;
    nivelOleo: string;
    avariasCabine: string;
    bauPossuiAvarias: string;
    funcionamentoParteEletrica: string | null;
    descricaoAvariasCabine: string | null;
    descricaoAvariasBau?: string | null;
    descricaoParteEletrica: string | null;
    dianteira: string | null;
    descricaoDianteira: string | null;
    tracao: string | null;
    descricaoTracao: string | null;
    truck: string | null;
    descricaoTruck: string | null;
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
  };
  end?: {
    nivelAgua: string;
    nivelOleo: string;
    avariasCabine: string;
    bauPossuiAvarias: string;
    funcionamentoParteEletrica: string | null;
    descricaoAvariasCabine: string | null;
    descricaoAvariasBau?: string | null;
    descricaoParteEletrica: string | null;
    dianteira: string | null;
    descricaoDianteira: string | null;
    tracao: string | null;
    descricaoTracao: string | null;
    truck: string | null;
    descricaoTruck: string | null;
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
  };
  vehicle?: {
    plate: string;
    model: string;
  };
}

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  inspectionData: InspectionData;
  onSave: (data: { section: 'start' | 'end'; data: any }) => Promise<void>;
  loading?: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ open, onClose, inspectionData, onSave, loading = false }) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    start: {
      nivelAgua: inspectionData?.start?.nivelAgua || '',
      nivelOleo: inspectionData?.start?.nivelOleo || '',
      avariasCabine: inspectionData?.start?.avariasCabine || '',
      bauPossuiAvarias: inspectionData?.start?.bauPossuiAvarias || '',
      funcionamentoParteEletrica: inspectionData?.start?.funcionamentoParteEletrica || '',
      descricaoAvariasCabine: inspectionData?.start?.descricaoAvariasCabine || '',
      descricaoAvariasBau: inspectionData?.start?.descricaoAvariasBau || '',
      descricaoParteEletrica: inspectionData?.start?.descricaoParteEletrica || '',
      resolvidoPor: '',
      observacoes: '',

      dianteira: inspectionData?.start?.dianteira || '',
      descricaoDianteira: inspectionData?.start?.descricaoDianteira || '',
      tracao: inspectionData?.start?.tracao || '',
      descricaoTracao: inspectionData?.start?.descricaoTracao || '',
      truck: inspectionData?.start?.truck || '',
      descricaoTruck: inspectionData?.start?.descricaoTruck || '',
      quartoEixo: inspectionData?.start?.quartoEixo || '',
      descricaoQuartoEixo: inspectionData?.start?.descricaoQuartoEixo || '',
    },
    end: {
      nivelAgua: inspectionData?.end?.nivelAgua || '',
      nivelOleo: inspectionData?.end?.nivelOleo || '',
      avariasCabine: inspectionData?.end?.avariasCabine || '',
      bauPossuiAvarias: inspectionData?.end?.bauPossuiAvarias || '',
      funcionamentoParteEletrica: inspectionData?.end?.funcionamentoParteEletrica || '',
      descricaoAvariasCabine: inspectionData?.end?.descricaoAvariasCabine || '',
      descricaoAvariasBau: inspectionData?.end?.descricaoAvariasBau || '',
      descricaoParteEletrica: inspectionData?.end?.descricaoParteEletrica || '',
      resolvidoPor: '',
      observacoes: '',

      dianteira: inspectionData?.end?.dianteira || '',
      descricaoDianteira: inspectionData?.end?.descricaoDianteira || '',
      tracao: inspectionData?.end?.tracao || '',
      descricaoTracao: inspectionData?.end?.descricaoTracao || '',
      truck: inspectionData?.end?.truck || '',
      descricaoTruck: inspectionData?.end?.descricaoTruck || '',
      quartoEixo: inspectionData?.end?.quartoEixo || '',
      descricaoQuartoEixo: inspectionData?.end?.descricaoQuartoEixo || '',
    }
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (section: 'start' | 'end', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      start: {
        nivelAgua: inspectionData?.start?.nivelAgua || '',
        nivelOleo: inspectionData?.start?.nivelOleo || '',
        avariasCabine: inspectionData?.start?.avariasCabine || '',
        bauPossuiAvarias: inspectionData?.start?.bauPossuiAvarias || '',
        funcionamentoParteEletrica: inspectionData?.start?.funcionamentoParteEletrica || '',
        descricaoAvariasCabine: inspectionData?.start?.descricaoAvariasCabine || '',
        descricaoAvariasBau: inspectionData?.start?.descricaoAvariasBau || '',
        descricaoParteEletrica: inspectionData?.start?.descricaoParteEletrica || '',
        resolvidoPor: '',
        observacoes: '',

        dianteira: inspectionData?.start?.dianteira || '',
        descricaoDianteira: inspectionData?.start?.descricaoDianteira || '',
        tracao: inspectionData?.start?.tracao || '',
        descricaoTracao: inspectionData?.start?.descricaoTracao || '',
        truck: inspectionData?.start?.truck || '',
        descricaoTruck: inspectionData?.start?.descricaoTruck || '',
        quartoEixo: inspectionData?.start?.quartoEixo || '',
        descricaoQuartoEixo: inspectionData?.start?.descricaoQuartoEixo || '',
      },
      end: {
        nivelAgua: inspectionData?.end?.nivelAgua || '',
        nivelOleo: inspectionData?.end?.nivelOleo || '',
        avariasCabine: inspectionData?.end?.avariasCabine || '',
        bauPossuiAvarias: inspectionData?.end?.bauPossuiAvarias || '',
        funcionamentoParteEletrica: inspectionData?.end?.funcionamentoParteEletrica || '',
        descricaoAvariasCabine: inspectionData?.end?.descricaoAvariasCabine || '',
        descricaoAvariasBau: inspectionData?.end?.descricaoAvariasBau || '',
        descricaoParteEletrica: inspectionData?.end?.descricaoParteEletrica || '',
        resolvidoPor: '',
        observacoes: '',

        dianteira: inspectionData?.end?.dianteira || '',
        descricaoDianteira: inspectionData?.end?.descricaoDianteira || '',
        tracao: inspectionData?.end?.tracao || '',
        descricaoTracao: inspectionData?.end?.descricaoTracao || '',
        truck: inspectionData?.end?.truck || '',
        descricaoTruck: inspectionData?.end?.descricaoTruck || '',
        quartoEixo: inspectionData?.end?.quartoEixo || '',
        descricaoQuartoEixo: inspectionData?.end?.descricaoQuartoEixo || '',
      }
    });
    setSuccess(false);
    setError('');
  };

  const handleSave = async () => {
    try {
      setSuccess(false);
      setError('');

      const currentSection = tabValue === 0 ? 'start' : 'end';
      if (!formData[currentSection].resolvidoPor) {
        setError('Por favor, preencha quem resolveu o problema.');
        return;
      }

      await onSave({
        section: currentSection,
        data: formData[currentSection]
      });

      setSuccess(true);
      onClose(); // Fechar o modal diretamente após o salvamento bem-sucedido
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar as alterações.');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const hasIssues = (section: 'start' | 'end') => {
    const data = inspectionData?.[section];
    if (!data) return false;

    return (
      data.nivelAgua != 'NORMAL' ||
      data.nivelOleo != 'NORMAL' ||
      data.avariasCabine === 'SIM' ||
      data.bauPossuiAvarias === 'SIM' ||
      data.funcionamentoParteEletrica === 'RUIM' ||

      data?.dianteira === 'RUIM' ||
      data?.tracao === 'RUIM' ||
      data?.truck === 'RUIM' ||
      data?.quartoEixo === 'RUIM'
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
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {(data.nivelAgua != 'NORMAL' || data.nivelOleo != 'NORMAL') && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">Níveis de Fluidos</Typography>
              <Divider sx={{ mb: 1 }} />
            </Grid>
            {data.nivelAgua != 'NORMAL' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Nível de Água</InputLabel>
                  <Select
                    value={formData[section].nivelAgua}
                    onChange={(e) => handleChange(section, 'nivelAgua', e.target.value)}
                    label="Nível de Água"
                  >
                    <MenuItem value="BAIXO">BAIXO</MenuItem>
                    <MenuItem value="CRITICO">CRITICO</MenuItem>
                    <MenuItem value="NORMAL">OK (Corrigido)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {data.nivelOleo != 'NORMAL' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Nível de Óleo</InputLabel>
                  <Select
                    value={formData[section].nivelOleo}
                    onChange={(e) => handleChange(section, 'nivelOleo', e.target.value)}
                    label="Nível de Óleo"
                  >
                    <MenuItem value="BAIXO">BAIXO</MenuItem>
                    <MenuItem value="CRITICO">CRITICO</MenuItem>
                    <MenuItem value="NORMAL">OK (Corrigido)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </>
        )}

        {(data.avariasCabine === 'SIM' || data.bauPossuiAvarias === 'SIM') && (
          <>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Avarias</Typography>
              <Divider sx={{ mb: 1 }} />
            </Grid>
            {data.avariasCabine === 'SIM' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Avarias na Cabine</InputLabel>
                    <Select
                      value={formData[section].avariasCabine}
                      onChange={(e) => handleChange(section, 'avariasCabine', e.target.value)}
                      label="Avarias na Cabine"
                    >
                      <MenuItem value="SIM">Com Avarias</MenuItem>
                      <MenuItem value="NÃO">Corrigido</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Descrição das Avarias na Cabine"
                    value={formData[section].descricaoAvariasCabine || ''}
                    onChange={(e) => handleChange(section, 'descricaoAvariasCabine', e.target.value)}
                    disabled={formData[section].avariasCabine !== 'SIM'}
                    multiline
                    rows={2}
                  />
                </Grid>
              </>
            )}
            {data.bauPossuiAvarias === 'SIM' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Avarias no Baú</InputLabel>
                    <Select
                      value={formData[section].bauPossuiAvarias}
                      onChange={(e) => handleChange(section, 'bauPossuiAvarias', e.target.value)}
                      label="Avarias no Baú"
                    >
                      <MenuItem value="SIM">Com Avarias</MenuItem>
                      <MenuItem value="NÃO">Corrigido</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Descrição das Avarias no Baú"
                    value={formData[section].descricaoAvariasBau || ''}
                    onChange={(e) => handleChange(section, 'descricaoAvariasBau', e.target.value)}
                    disabled={formData[section].bauPossuiAvarias !== 'SIM'}
                    multiline
                    rows={2}
                  />
                </Grid>
              </>
            )}
          </>
        )}

        {data.funcionamentoParteEletrica === "RUIM" && (
          <>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Parte Elétrica</Typography>
              <Divider sx={{ mb: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Funcionamento da Parte Elétrica</InputLabel>
                <Select
                  value={formData[section].funcionamentoParteEletrica}
                  onChange={(e) => handleChange(section, 'funcionamentoParteEletrica', e.target.value)}
                  label="Funcionamento da Parte Elétrica"
                >
                  <MenuItem value="RUIM">PROBLEMAS</MenuItem>
                  <MenuItem value="BOM">OK (Corrigido)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Descrição dos Problemas Elétricos"
                value={formData[section].descricaoParteEletrica || ''}
                onChange={(e) => handleChange(section, 'descricaoParteEletrica', e.target.value)}
                disabled={formData[section].funcionamentoParteEletrica !== 'RUIM'}
                multiline
                rows={2}
              />
            </Grid>
          </>
        )}

        {[data.dianteira, data.tracao, data.truck, data.quartoEixo].includes('RUIM') && (
          <Grid item xs={12}><Divider>Situação dos Pneus</Divider></Grid>
        )}
        {data.dianteira === 'RUIM' && <>
          <Grid item xs={12} md={6}>
            <ButtonLabel name="dianteira" label="Dianteira" options={["BOM", "RUIM"]} value={formData[section].dianteira} onChange={(e) => handleChange(section, 'dianteira', e)} />
            <TextField label="Qual Defeito?" value={formData[section].descricaoDianteira || ''}
              onChange={(e) => handleChange(section, 'descricaoDianteira', e.target.value)}
              disabled={formData[section].dianteira !== 'RUIM'} multiline fullWidth rows={2} />
          </Grid>
        </>}
        {data.tracao === 'RUIM' && <>
          <Grid item xs={12} md={6}>
            <ButtonLabel name="tracao" label="Tração" options={["BOM", "RUIM"]} value={formData[section].tracao} onChange={(e) => handleChange(section, 'tracao', e)} />
            <TextField label="Qual Defeito?" value={formData[section].descricaoTracao || ''}
              onChange={(e) => handleChange(section, 'descricaoTracao', e.target.value)}
              disabled={formData[section].tracao !== 'RUIM'} multiline fullWidth rows={2} />
          </Grid>
        </>}
        {data.truck === 'RUIM' && <>
          <Grid item xs={12} md={6}>
            <ButtonLabel name="truck" label="Truck" options={["BOM", "RUIM"]} value={formData[section].truck} onChange={(e) => handleChange(section, 'truck', e)} />
            <TextField label="Qual Defeito?" value={formData[section].descricaoTruck || ''}
              onChange={(e) => handleChange(section, 'descricaoTruck', e.target.value)}
              disabled={formData[section].truck !== 'RUIM'} multiline fullWidth rows={2} />
          </Grid>
        </>}
        {data.quartoEixo === 'RUIM' && <>
          <Grid item xs={12} md={6}>
            <ButtonLabel name="quartoEixo" label="Tração" options={["BOM", "RUIM"]} value={formData[section].quartoEixo} onChange={(e) => handleChange(section, 'quartoEixo', e)} />
            <TextField label="Qual Defeito?" value={formData[section].descricaoQuartoEixo || ''}
              onChange={(e) => handleChange(section, 'descricaoQuartoEixo', e.target.value)}
              disabled={formData[section].quartoEixo !== 'RUIM'} multiline fullWidth rows={2} />
          </Grid>
        </>}


        {hasIssues(section) && (
          <>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Informações da Correção</Typography>
              <Divider sx={{ mb: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Resolvido por"
                value={formData[section].resolvidoPor}
                onChange={(e) => handleChange(section, 'resolvidoPor', e.target.value)}
                placeholder="Nome do responsável pela correção"
                error={!!error && !formData[section].resolvidoPor}
                helperText={!!error && !formData[section].resolvidoPor ? 'Campo obrigatório' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                value={formData[section].observacoes}
                onChange={(e) => handleChange(section, 'observacoes', e.target.value)}
                multiline
                rows={3}
                placeholder="Detalhes sobre as correções realizadas"
              />
            </Grid>
          </>
        )}
      </Grid>
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
          <Tab label="Início da Viagem" disabled={!inspectionData?.start || !hasIssues('start')} />
          <Tab label="Fim da Viagem" disabled={!inspectionData?.end || !hasIssues('end')} />
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
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading || (tabValue === 0 && !hasIssues('start')) || (tabValue === 1 && !hasIssues('end'))}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateModal;