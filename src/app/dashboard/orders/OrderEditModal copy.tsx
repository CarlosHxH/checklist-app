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
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import FreeSoloCreateOption from '@/components/FreeSoloCreateOption';
import Loading from '@/components/Loading';
import axios from 'axios';
import GroupRadio from '@/components/_ui/GroupRadio';
import { OrderWithRelations } from './actions';
import useSWR from 'swr';
import { getOrdersById } from './actions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';

const formSchema = z.object({
  userId: z.string(),
  vehicleId: z.string().min(1),
  kilometer: z.number().min(2),
  oficina: z.string().min(3),
  startedData: z.string().min(16),
  finishedData: z.string().optional().nullable(),
  maintenanceType: z.string().min(3),
  maintenanceCenter: z.string().min(3),
  serviceDescriptions: z.string().min(3),
})
type FormData = z.infer<typeof formSchema>;

interface OrderEditModalProps {
  open: boolean;
  onClose: () => void;
  orderData: OrderWithRelations | null;
  onSuccess?: () => void;
}

// Helper function to format date for datetime-local input
const formatDateForInput = (date: Date | string | null): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  // Format to YYYY-MM-DDTHH:MM (required for datetime-local)
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function OrderEditModal({ open, onClose, orderData, onSuccess }: OrderEditModalProps) {
  
  // Buscar dados completos da ordem quando o modal abrir
  const { data, isLoading, error } = useSWR(
    orderData && open ? orderData.osNumber : null, 
    getOrdersById,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const { control, setValue, handleSubmit, register, reset, formState: { isSubmitting, errors: formErrors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const centers = data?.centers || [];
  const order = data?.orders || orderData;
  const oficinas = data?.oficinas || [];

  useEffect(() => {
    if (order && open) {
      const formData = {
        userId: order.userId,
        vehicleId: order.vehicleId,
        kilometer: order.kilometer,
        oficina: order.oficina?.name || '',
        startedData: formatDateForInput(order.startedData),
        finishedData: formatDateForInput(order.finishedData),
        maintenanceType: order.maintenanceType || '',
        maintenanceCenter: order.maintenanceCenter?.name || '',
        serviceDescriptions: order.serviceDescriptions || ''
      }
      reset(formData);
    }
  }, [order, open, reset]);

  const onSubmit = (formData: FormData) => {
    if (!order?.osNumber) return;
    
    // Convert finishedData to null if empty string
    const submitData = {
      ...formData,
      finishedData: formData.finishedData || null
    };
    
    axios.put(`/api/v1/orders/${order.osNumber}`, submitData)
      .then(response => {
        console.log('Order updated successfully:', response.data);
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Ordem de serviço atualizada com sucesso!",
          timer: 1500,
          showConfirmButton: false
        });
        onSuccess?.();
        onClose();
        reset();
      })
      .catch(error => {
        console.error('Error updating order:', error);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Erro ao atualizar ordem de serviço",
          footer: `<em>${error?.response?.data?.details || error?.message || "Erro interno!"}</em>`
        });
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
          maxHeight: '90vh',
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
            Falha ao carregar dados da ordem: {error?.message || 'Erro desconhecido'}
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
                    <Box display="flex" alignItems="center">
                      <Typography ml={1} fontSize={22} variant="h6" fontWeight={600}>
                        #{String(order.id).padStart(5, '0')}
                        {order.user?.name && ` - ${order.user.name}`}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField 
                      disabled 
                      fullWidth 
                      label="Veículos" 
                      value={`${order.vehicle?.plate || 'N/A'} - ${order.vehicle?.model || 'N/A'}`} 
                    />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      {...register('kilometer', {
                        valueAsNumber: true,
                      })}
                      fullWidth
                      type="number"
                      label="KM"
                      inputProps={{ min: 0 }}
                      error={!!formErrors.kilometer}
                      helperText={formErrors.kilometer?.message}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      {...register('startedData')}
                      label="INÍCIO"
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors.startedData}
                      helperText={formErrors.startedData?.message}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      {...register('finishedData')}
                      label="FINALIZAÇÃO"
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors.finishedData}
                      helperText={formErrors.finishedData?.message || 'Deixe em branco se não finalizada'}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <FreeSoloCreateOption
                      label="OFICINA"
                      options={oficinas}
                      defaultValue={order.oficina?.name || ''}
                      onChange={(item) => {
                        const value = typeof item === 'string' ? item : item?.name || '';
                        setValue('oficina', value.toUpperCase(), { shouldValidate: true });
                      }}
                    />
                    {formErrors.oficina && (
                      <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                        {formErrors.oficina.message}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <GroupRadio
                      control={control}
                      name="maintenanceType"
                      label="Tipo de Manutenção"
                      options={maintenanceOptions}
                      error={formErrors.maintenanceType}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FreeSoloCreateOption
                      label="CENTRO DE MANUTENÇÃO"
                      options={centers}
                      defaultValue={order.maintenanceCenter?.name || ''}
                      onChange={(item) => {
                        const value = typeof item === 'string' ? item : item?.name || '';
                        setValue('maintenanceCenter', value.toUpperCase(), { shouldValidate: true });
                      }}
                    />
                    {formErrors.maintenanceCenter && (
                      <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                        {formErrors.maintenanceCenter.message}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      {...register('serviceDescriptions')}
                      label="DESCRIÇÃO DO SERVIÇO:"
                      multiline
                      rows={5}
                      fullWidth
                      error={!!formErrors.serviceDescriptions}
                      helperText={formErrors.serviceDescriptions?.message}
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
                    variant="outlined"
                    onClick={handleClose}
                    sx={{ minWidth: 120 }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    color="success"
                    disabled={isSubmitting || isLoading}
                    sx={{ minWidth: 200 }}
                  >
                    {isSubmitting ? 'Salvando...' : 'ATUALIZAR ORDEM DE SERVIÇO'}
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