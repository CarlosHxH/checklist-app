"use client";
import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { Button, Card, Container, Divider, Grid, TextField, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { useEffect } from 'react';
import FreeSoloCreateOption from '../../create/FreeSoloCreateOption';
import { useParams, useRouter } from 'next/navigation';
import { EditType, getOrders } from './action';
import Loading from '@/components/Loading';
import { formattedDate } from '@/lib/formatDate';
import axios from 'axios';
import GroupRadio from '@/components/_ui/GroupRadio';

interface VehicleLabel {
  name: string;
  id: string;
}

interface ApiData {
  vehicles: VehicleLabel[];
  centers: VehicleLabel[];
}

interface FormData {
  userId: string;
  vehicleId: string;
  kilometer: number;
  destination: string;
  completionDate: string;
  maintenanceType: string;
  maintenanceCenter: string;
  serviceDescriptions: string;
}

export default function OrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading: orderLoading, error: errors } = useSWR<EditType>(id, getOrders);
  const { data: session } = useSession();

  const { control, setValue, handleSubmit, register, reset, formState: { isSubmitting } } = useForm<FormData>();

  const centers = data?.centers || [];
  const order = data?.orders || null;

  useEffect(() => {
    if (order) {
      reset({
        userId: order.userId,
        vehicleId: order.vehicleId,
        kilometer: order.kilometer,
        destination: order.destination,
        completionDate: order.completionDate || formattedDate,
        maintenanceType: order.maintenanceType || '',
        maintenanceCenter: order.maintenanceCenter?.name || '',
        serviceDescriptions: order.serviceDescriptions || ''
      });
    }
    if (session?.user?.id) {
      setValue('userId', session.user.id);
    }
  }, [session, data, reset, setValue]);

  const onSubmit = (formData: FormData) => {
    axios.put(`/api/v1/orders/${id}`, formData)
      .then(response => {
        console.log(response.data);
        router.push('/');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  if (orderLoading) return <Loading />;
  if (errors) return <Typography color="error">Failed to load order data</Typography>;
  if (!data || !order || !centers) return <Typography>Order not found</Typography>;
  const maintenanceOptions = [
    { value: 'PREVENTIVA', label: 'PREVENTIVA' },
    { value: 'CORRETIVA', label: 'CORRETIVA' }
  ];
  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CustomAppBar showBackButton />
        <Box component="main" sx={{ flex: 1 }}>
          <Card elevation={3} sx={{ mt: 2, p: 2 }}>
            <Typography sx={{ textAlign: 'center' }} fontSize={'2em'}>
              {session?.user?.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography variant='inherit' fontSize={18}>Ordem de Serviço </Typography>
                  <Typography ml={1} fontSize={22} variant='h6' fontWeight={600}>#{String(order.id).padStart(5, '0')}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField disabled fullWidth label="Veículos" value={`${order.vehicle.plate} - ${order.vehicle.model || 'N/A'}`} />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  {...register('kilometer', {
                    valueAsNumber: true,
                    required: 'Kilometer is required',
                    min: { value: 0, message: 'Must be positive' }
                  })}
                  fullWidth
                  type='number'
                  label="KM"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField fullWidth {...register('destination', { required: 'Destination is required' })} sx={{ width: { xs: '100%', sm: '365px' } }} label="DESTINO" />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  sx={{ width: { xs: '100%', sm: '365px' } }}
                  type='datetime-local'
                  {...register('completionDate', { required: 'Completion date is required' })}
                  label="FINALIZAÇÃO"
                  InputLabelProps={{ shrink: true }}
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
                  defaultValue={order.maintenanceCenter?.name || ''}
                  onChange={(item) => {
                    const value = typeof item === 'string' ? item : item?.name || '';
                    setValue('maintenanceCenter', value.toUpperCase());
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('serviceDescriptions', { required: 'Service description is required' })}
                  label="DESCRIÇÃO DO SERVIÇO:"
                  multiline
                  rows={5}
                  fullWidth
                />
              </Grid>

            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Button
                sx={{ p: 1, width: { xs: '100%', sm: '365px' } }}
                variant='contained'
                type='submit'
                color='success'
                disabled={isSubmitting || orderLoading}
              >
                {isSubmitting ? 'Saving...' : 'FINALIZAR ORDEM DE SERVIÇO'}
              </Button>
            </Box>
          </Card>
        </Box>
      </form>
    </Container>
  );
}