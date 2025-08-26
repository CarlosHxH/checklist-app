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
  Skeleton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { useEffect, memo, useCallback, useMemo } from 'react';
import FreeSoloCreateOption from '@/components/FreeSoloCreateOption';
import axios from 'axios';
import GroupRadio from '@/components/_ui/GroupRadio';
import { OrderWithRelations } from './actions';
import useSWR from 'swr';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import { fetcher } from '@/lib/ultils';



interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

interface MaintenanceCenter {
  id: number;
  name: string;
}

interface Oficina {
  id: number;
  name: string;
}

interface OrderData {
  id: number;
  userId: string;
  vehicleId: string;
  kilometer: number;
  oficinaId: number;
  finishedData: string | null;
  maintenanceType: string;
  maintenanceCenterId: number;
  serviceDescriptions: string;
  vehicle: Vehicle;
  oficina: Oficina;
  maintenanceCenter: MaintenanceCenter;
}

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
});

type FormData = z.infer<typeof formSchema>;

interface OrderEditModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
  orderData: OrderWithRelations | null;
  onSuccess?: () => void;
}

// Helper function otimizada para formato de data
const formatDateForInput = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

// Componente de loading do modal
const ModalSkeleton = memo(() => (
  <DialogContent dividers>
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid item xs={12} sm={index < 2 ? 6 : 12} key={index}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
      ))}
    </Grid>
  </DialogContent>
));

ModalSkeleton.displayName = 'ModalSkeleton';

function OrderEditModal({ open, onClose, orderData, onSuccess, id }: OrderEditModalProps) {

  const { data, isLoading, mutate, error } = useSWR<OrderData>(`/api/v1/orders/${id}`, fetcher);
  console.log(data);
  
/*
  // SWR com configurações otimizadas
  const { data, isLoading, error, mutate } = useSWR(
    orderData && open ? orderData.osNumber : null, 
    getOrdersById,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minuto
      errorRetryCount: 1,
    }
  );*/

  // Form com resolver otimizado
  const { 
    control, 
    setValue, 
    handleSubmit, 
    register, 
    reset, 
    formState: { isSubmitting, errors: formErrors } 
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  // Dados memoizados
  const { centers, order, oficinas } = useMemo(() => ({
    centers: data?.centers || [],
    order: data?.orders || orderData,
    oficinas: data?.oficinas || []
  }), [data, orderData]);

  const maintenanceOptions = useMemo(() => [
    { value: 'PREVENTIVA', label: 'PREVENTIVA' },
    { value: 'CORRETIVA', label: 'CORRETIVA' }
  ], []);

  // Efeito otimizado para reset do form
  useEffect(() => {
    if (!order || !open) return;

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
    };
    
    reset(formData);
  }, [order, open, reset]);

  // Callback otimizado para submit
  const onSubmit = useCallback(async (formData: FormData) => {
    if (!order?.osNumber) return;
    
    try {
      const submitData = {
        ...formData,
        finishedData: formData.finishedData || null
      };
      
      await axios.put(`/api/v1/orders/${order.osNumber}`, submitData);
      
      // Revalidar dados
      mutate();
      
      await Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Ordem de serviço atualizada com sucesso!",
        timer: 1500,
        showConfirmButton: false
      });
      
      onSuccess?.();
      onClose();
      reset();
    } catch (error: any) {
      console.error('Erro ao atualizar ordem:', error);
      
      await Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Erro ao atualizar ordem de serviço",
        footer: `<em>${error?.response?.data?.details || error?.message || "Erro interno!"}</em>`
      });
    }
  }, [order?.osNumber, mutate, onSuccess, onClose, reset]);

  // Callback otimizado para fechar
  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Callbacks otimizados para mudanças
  const handleOficinaChange = useCallback((item: any) => {
    const value = typeof item === 'string' ? item : item?.name || '';
    setValue('oficina', value.toUpperCase(), { shouldValidate: true });
  }, [setValue]);

  const handleMaintenanceCenterChange = useCallback((item: any) => {
    const value = typeof item === 'string' ? item : item?.name || '';
    setValue('maintenanceCenter', value.toUpperCase(), { shouldValidate: true });
  }, [setValue]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      keepMounted={false} // Não manter montado quando fechado
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          margin: 1
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Typography variant="h6">
          Editar Ordem de Serviço
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {isLoading && <ModalSkeleton />}
      
      {error && (
        <DialogContent dividers>
          <Typography color="error" sx={{ mb: 2 }}>
            Falha ao carregar dados da ordem: {error?.message || 'Erro desconhecido'}
          </Typography>
        </DialogContent>
      )}
      
      {!isLoading && !error && !order && (
        <DialogContent dividers>
          <Typography sx={{ mb: 2 }}>Ordem não encontrada</Typography>
        </DialogContent>
      )}

      {!isLoading && !error && order && (
        <DialogContent dividers>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card elevation={0} sx={{ p: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="inherit" fontSize={18}>
                      Ordem de Serviço 
                    </Typography>
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
                    {...register('kilometer', { valueAsNumber: true })}
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
                    onChange={handleOficinaChange}
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
                    onChange={handleMaintenanceCenterChange}
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
                    rows={4}
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
                  {isSubmitting ? 'Salvando...' : 'ATUALIZAR ORDEM'}
                </Button>
              </Box>
            </Card>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default memo(OrderEditModal);