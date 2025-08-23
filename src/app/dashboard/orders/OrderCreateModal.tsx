"use client";
import Box from '@mui/material/Box';
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import FreeSoloCreateOption from '@/components/FreeSoloCreateOption';
import { formattedDate } from '@/lib/formatDate';
import axios from 'axios';
import GroupRadio from '@/components/_ui/GroupRadio';
import { MaintenanceCenter } from './actions';
import { user, vehicle } from '@prisma/client';

interface FormData {
  userId: string;
  vehicleId: string;
  kilometer: number;
  destination: string;
  entryDate: string;
  completionDate: string;
  maintenanceType: string;
  maintenanceCenter: string;
  serviceDescriptions: string;
  osNumber?: string;
}

interface OrderCreateModalProps {
  open: boolean;
  onClose: () => void;
  users: user[];
  vehicles: vehicle[];
  centers: MaintenanceCenter[];
  onSuccess?: () => void;
}

export default function OrderCreateModal({
  open,
  onClose,
  users = [],
  vehicles = [],
  centers = [],
  onSuccess
}: OrderCreateModalProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    setValue,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      userId: session?.user?.id || '',
      entryDate: formattedDate,
      kilometer: 0,
      destination: '',
      maintenanceType: '',
      maintenanceCenter: '',
      serviceDescriptions: '',
      osNumber: ''
    }
  });

  // Watch para atualizar dados quando necessário
  const watchedVehicleId = watch('vehicleId');

  useEffect(() => {
    if (session?.user?.id) {
      setValue('userId', session.user.id);
    }
  }, [session, setValue]);

  useEffect(() => {
    if (open) {
      reset({
        userId: session?.user?.id || '',
        entryDate: formattedDate,
        kilometer: 0,
        destination: '',
        maintenanceType: '',
        maintenanceCenter: '',
        serviceDescriptions: '',
        osNumber: '',
        vehicleId: ''
      });
    }
  }, [open, session, reset]);

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/v1/orders', {
        ...formData,
        isCompleted: !!formData.completionDate
      });

      console.log('Ordem criada:', response.data);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      // Aqui você pode adicionar um toast/snackbar para mostrar o erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const maintenanceOptions = [
    { value: 'PREVENTIVA', label: 'PREVENTIVA' },
    { value: 'CORRETIVA', label: 'CORRETIVA' }
  ];

  // Gerar número da OS automaticamente
  const generateOSNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-4);
    return `OS${year}${month}${day}${time}`;
  };

  useEffect(() => {
    if (open) {
      setValue('osNumber', generateOSNumber());
    }
  }, [open, setValue]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          margin: 1
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography>
          Nova Ordem de Serviço
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box component="main">
            <Card elevation={0} sx={{ p: 4 }}>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type='datetime-local'
                    {...register('entryDate', { required: 'Data de entrada é obrigatória' })}
                    label="DATA DE ENTRADA"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.entryDate}
                    helperText={errors.entryDate?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type='datetime-local'
                    {...register('completionDate')}
                    label="DATA DE SAIDA"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.completionDate}
                    helperText={errors.completionDate?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.userId}>
                    <InputLabel>Responsável</InputLabel>
                    <Controller
                      name="userId"
                      control={control}
                      rules={{ required: 'Responsável é obrigatório' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Responsável"
                        >
                          {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.userId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {errors.userId.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.vehicleId}>
                    <InputLabel>Veículo</InputLabel>
                    <Controller
                      name="vehicleId"
                      control={control}
                      rules={{ required: 'Veículo é obrigatório' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Veículo"
                        >
                          {vehicles.map((vehicle) => (
                            <MenuItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.plate} - {vehicle.model || 'N/A'}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.vehicleId && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {errors.vehicleId.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('kilometer', {
                      valueAsNumber: true,
                      required: 'Quilometragem é obrigatória',
                      min: { value: 0, message: 'Deve ser um valor positivo' }
                    })}
                    fullWidth
                    type='number'
                    label="QUILOMETRAGEM ATUAL"
                    inputProps={{ min: 0 }}
                    error={!!errors.kilometer}
                    helperText={errors.kilometer?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    {...register('destination', { required: 'Destino é obrigatório' })}
                    label="DESTINO/OFICINA"
                    error={!!errors.destination}
                    helperText={errors.destination?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <GroupRadio
                    control={control}
                    name="maintenanceType"
                    label="Tipo de Manutenção"
                    options={maintenanceOptions}
                    error={errors?.maintenanceType}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FreeSoloCreateOption
                    label="CENTRO DE MANUTENÇÃO"
                    options={centers}
                    onChange={(item) => {
                      const value = typeof item === 'string' ? item : item?.name || '';
                      setValue('maintenanceCenter', value.toUpperCase());
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    {...register('serviceDescriptions', { required: 'Descrição do serviço é obrigatória' })}
                    label="DESCRIÇÃO DO SERVIÇO/PROBLEMA:"
                    multiline
                    rows={5}
                    fullWidth
                    placeholder="Descreva detalhadamente o serviço a ser realizado ou o problema identificado..."
                    error={!!errors.serviceDescriptions}
                    helperText={errors.serviceDescriptions?.message}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  variant='outlined'
                  onClick={handleClose}
                  sx={{ minWidth: 120 }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant='contained'
                  type='submit'
                  color='primary'
                  disabled={isSubmitting}
                  sx={{ minWidth: 200 }}
                >
                  {isSubmitting ? 'Criando...' : 'CRIAR ORDEM DE SERVIÇO'}
                </Button>
              </Box>
            </Card>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}