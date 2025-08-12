"use client";
import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { Autocomplete, Button, Card, Chip, Container, Divider, Grid, TextField, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { useEffect } from 'react';
import { fetcher } from '@/lib/ultils';
import GroupRadio from './GroupRadio';
import FreeSoloCreateOption from './FreeSoloCreateOption';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { formattedDate } from '../formatDate';

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
  osNumber: string;
  vehicleId: string;
  kilometer: number;
  destination: string;
  entryDate: string;
  maintenanceType: string;
  maintenanceCenter: string;
  serviceDescriptions: string;
}

export default function OrderPage() {
  const { data, isLoading, error } = useSWR<ApiData>('/api/v1/orders', fetcher);
  const { data: session } = useSession();
  const router = useRouter();

  const { control, setValue, watch, handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      userId: session?.user?.id,
      vehicleId: '',
      kilometer: undefined,
      destination: '',
      entryDate: formattedDate,
      maintenanceType: '',
      maintenanceCenter: '',
      serviceDescriptions: ''
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    axios.post('/api/v1/orders',data)
    .then(response => {
      console.log(response.data);
      router.push('/');
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  if (isLoading) return <Typography>Loading vehicles...</Typography>;
  if (error) return <Typography color="error">Failed to load vehicles</Typography>;
  
  const vehicles = data?.vehicles || [];
  const centers = data?.centers || [];
  
  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CustomAppBar showBackButton />
        <Box component="main" sx={{ flex: 1 }}>
          <Card elevation={3} sx={{ mt: 2, p: 2 }}>
            <Typography sx={{ textAlign: 'center' }} fontSize={'2em'}>{session?.user?.name}</Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>

              <Grid item xs={12}><Typography>OS: automatico</Typography></Grid>

              <Grid item xs={12} sm={4}>
                <Autocomplete<VehicleLabel>
                  fullWidth
                  disablePortal
                  loading={isLoading}
                  options={vehicles}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, item: VehicleLabel | null) => {
                    setValue('vehicleId', item?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Veículos"
                      error={!!error}
                      helperText={error ? "Failed to load vehicles" : undefined}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField 
                  {...register('kilometer', { valueAsNumber: true })} 
                  fullWidth 
                  type='number' 
                  label="KM" 
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={6} sm={12}>
                <TextField 
                  fullWidth 
                  {...register('destination')} 
                  sx={{ width: { xs: '100%', sm: '365px' } }} 
                  label="DESTINO" 
                />
              </Grid>

              <Grid item xs={6} sm={12}>
                <TextField 
                  fullWidth 
                  sx={{ width: { xs: '100%', sm: '365px' } }} 
                  type='datetime-local' 
                  {...register('entryDate')} 
                  label="ENTRADA"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <GroupRadio control={control} name="maintenanceType" label="TIPO DE MANUTENÇÃO"/>
              </Grid>

              <Grid item xs={12}>
                <FreeSoloCreateOption
                  label="CENTRO DE MANUTENÇÃO" 
                  options={centers}
                  onChange={(item) => {
                    const value = typeof item === 'string' ? item : item?.name || '';
                    setValue('maintenanceCenter', value.toUpperCase());
                }}/>
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  {...register('serviceDescriptions')} 
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
                disabled={isLoading}
              >
                GERAR ORDEM DE SERVIÇO
              </Button>
            </Box>
          </Card>
        </Box>
      </form>
    </Container>
  );
}