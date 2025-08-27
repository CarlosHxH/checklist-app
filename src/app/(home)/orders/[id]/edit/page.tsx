"use client";
import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { Button, Card, Container, Divider, Grid, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { useEffect } from 'react';
import FreeSoloCreateOption from '@/components/FreeSoloCreateOption';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import axios from 'axios';
import GroupRadio from '@/components/_ui/GroupRadio';
import { fetcher } from '@/lib/ultils';
import { formattedDate } from '@/lib/formatDate';

interface FormData {
  userId: string;
  vehicleId: string;
  kilometer: number;
  oficina: string;
  finishedData: string;
  maintenanceType: string;
  maintenanceCenter: string;
  serviceDescriptions: string;
}

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

export default function OrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { data, isLoading, error: errors } = useSWR<OrderData>(`/api/v1/orders/${id}`, fetcher);
  const { control, setValue, handleSubmit, register, reset, formState: { isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    if (data) {
      reset({
        userId: data.userId,
        vehicleId: data.vehicleId,
        kilometer: data.kilometer,
        oficina: data.oficina?.name || '',
        finishedData: data.finishedData || formattedDate,
        maintenanceType: data.maintenanceType || '',
        maintenanceCenter: data.maintenanceCenter?.name || '',
        serviceDescriptions: data.serviceDescriptions || ''
      });
    }
  }, [data, reset, setValue]);

  const onSubmit = (formData: FormData) => {
    axios.put(`/api/v1/orders/${id}`, formData).then(() => router.push('/orders')).catch(error => {
        console.error('Error updating order:', error);
    });
  };

  if (isLoading) return <Loading />;
  if(data?.finishedData){
    router.replace("/orders");
    return <></>
  }

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
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>

              <Grid item xs={12}>
                <Box display={"flex"} alignItems={"center"}>
                  <Typography variant='inherit' fontSize={18}>Ordem de Serviço </Typography>
                  <Typography ml={1} fontSize={22} variant='h6' fontWeight={600}>
                    #{String(data?.id||"0").padStart(5, '0')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField 
                  disabled 
                  fullWidth 
                  label="Veículos" 
                  value={`${data?.vehicle.plate || 'N/A'}`} 
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('kilometer', {
                    valueAsNumber: true,
                    required: 'Kilometer is required',
                    min: { value: 0, message: 'Must be positive' }
                  })}
                  disabled
                  fullWidth
                  type='number'
                  label="KM"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={6}>
                <FreeSoloCreateOption
                  label="OFICINA"
                  options={[]}
                  defaultValue={data?.oficina.name || ''}
                  onChange={(item) => {
                    const value = typeof item === 'string' ? item : item?.name || '';
                    setValue('oficina', value.toUpperCase());
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type='datetime-local'
                  {...register('finishedData')}
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
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FreeSoloCreateOption
                  label="CENTRO DE MANUTENÇÃO"
                  options={[]}
                  defaultValue={data?.maintenanceCenter.name || ''}
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
                disabled={isSubmitting || isLoading}
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