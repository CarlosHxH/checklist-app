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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import FreeSoloCreateOption from '@/components/FreeSoloCreateOption';
import Loading from '@/components/Loading';
import { formattedDate } from '@/lib/formatDate';
import axios from 'axios';
import GroupRadio from '@/components/_ui/GroupRadio';
import { OrderWithRelations } from './actions';
import useSWR from 'swr';
import { getOrdersById } from './actions';

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
}

interface OrderEditModalProps {
  open: boolean;
  onClose: () => void;
  orderData: OrderWithRelations | null;
  onSuccess?: () => void;
}

export default function OrderEditModal({ open, onClose, orderData, onSuccess }: OrderEditModalProps) {
  const { data: session } = useSession();
  
  // Buscar dados completos da ordem quando o modal abrir
  const { data, isLoading, error } = useSWR(
    orderData && open ? orderData.osNumber : null, 
    getOrdersById,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const { control, setValue, handleSubmit, register, reset, formState: { isSubmitting } } = useForm<FormData>();

  const centers = data?.centers || [];
  const order = data?.orders || orderData;

  useEffect(() => {
    if (order && open) {
      reset({
        userId: order.userId,
        vehicleId: order.vehicleId,
        kilometer: order.kilometer,
        destination: order.destination,
        entryDate: order.entryDate,
        completionDate: order.completionDate || formattedDate,
        maintenanceType: order.maintenanceType || '',
        maintenanceCenter: order.maintenanceCenter?.name || '',
        serviceDescriptions: order.serviceDescriptions || ''
      });
    }
  }, [order, open, reset]);

  const onSubmit = (formData: FormData) => {
    if (!order?.id) return;
    
    axios.put(`/api/v1/orders/${order.osNumber}`, formData)
      .then(response => {
        console.log(response.data);
        onSuccess?.();
        onClose();
        reset();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const maintenanceOptions = [
    { value: 'PREVENTIVA', label: 'PREVENTIVA' },
    { value: 'CORRETIVA', label: 'CORRETIVA' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
          margin: 1
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography>
          Editar Ordem de Serviço
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
        {isLoading && <Loading />}
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Falha ao carregar dados da ordem
          </Typography>
        )}
        
        {!isLoading && !error && !order && (
          <Typography sx={{ mb: 2 }}>Ordem não encontrada</Typography>
        )}

        {!isLoading && !error && order && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box component="main">
              <Card elevation={0} sx={{ p: 1 }}>
                
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid item xs={12}>
                    <Box display={"flex"} alignItems={"center"}>
                      <Typography variant='inherit' fontSize={18}>Ordem de Serviço </Typography>
                      <Typography ml={1} fontSize={22} variant='h6' fontWeight={600}>
                        #{String(order.id).padStart(5, '0')}
                        {" - "+order.user.name}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField 
                      disabled 
                      fullWidth 
                      label="Veículos" 
                      value={`${order?.vehicle?.plate} - ${order?.vehicle?.model || 'N/A'}`} 
                    />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      {...register('kilometer', {
                        valueAsNumber: true,
                        required: 'Quilometragem é obrigatória',
                        min: { value: 0, message: 'Deve ser um valor positivo' }
                      })}
                      fullWidth
                      type='number'
                      label="KM"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type='datetime-local'
                      {...register('entryDate', { required: 'Data de finalização é obrigatória' })}
                      label="INICIO"
                      slotProps={{
                        inputLabel:{ shrink: true }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type='datetime-local'
                      {...register('completionDate', { required: 'Data de finalização é obrigatória' })}
                      label="FINALIZAÇÃO"
                      slotProps={{
                        inputLabel:{ shrink: true }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                    sx={{mt:4}}
                      fullWidth 
                      {...register('destination', { required: 'Destino é obrigatório' })} 
                      label="ESTABELECIMENTO" 
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <GroupRadio
                      control={control}
                      name="maintenanceType"
                      label="Tipo de Manutenção"
                      options={maintenanceOptions}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FreeSoloCreateOption
                      label="CENTRO DE MANUTENÇÃO"
                      options={centers}
                      defaultValue={order?.maintenanceCenter?.name || ''}
                      onChange={(item) => {
                        const value = typeof item === 'string' ? item : item?.name || '';
                        setValue('maintenanceCenter', value.toUpperCase());
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      {...register('serviceDescriptions', { required: 'Descrição do serviço é obrigatória' })}
                      label="DESCRIÇÃO DO SERVIÇO:"
                      multiline
                      rows={5}
                      fullWidth
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
                    color='success'
                    disabled={isSubmitting || isLoading}
                    sx={{ minWidth: 200 }}
                  >
                    {isSubmitting ? 'Salvando...' : 'FINALIZAR ORDEM DE SERVIÇO'}
                  </Button>
                </Box>
              </Card>
            </Box>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}