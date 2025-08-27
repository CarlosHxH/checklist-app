"use client";
import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { Autocomplete, Button, Card, Container, Divider, Grid, TextField, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import GroupRadio from '@/components/_ui/GroupRadio';
import FreeSoloCreateOption from '@/components/FreeSoloCreateOption';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { formattedDate } from '@/lib/formatDate';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { Oficina } from '@prisma/client';

interface VehicleLabel {
  name: string;
  id: string;
}

interface ApiData {
  vehicles: VehicleLabel[];
  centers: VehicleLabel[];
  oficina: Oficina[];
}

interface FormData {
  userId: string;
  osNumber: string;
  vehicleId: string;
  kilometer: number;
  oficina: string;
  startedData: string;
  maintenanceType: string;
  maintenanceCenter: string;
  serviceDescriptions: string;
}

export default function OrderPage() {
  const { data, isLoading, error: errors } = useSWR<ApiData>('/api/v1/orders', fetcher);
  const { data: session } = useSession();
  const router = useRouter();

  const { control, setValue, handleSubmit, register, watch } = useForm<FormData>({
    defaultValues: {
      userId: session?.user?.id,
      vehicleId: '',
      kilometer: undefined,
      oficina: '',
      startedData: formattedDate,
      maintenanceType: '',
      maintenanceCenter: '',
      serviceDescriptions: ''
    }
  });

  const onSubmit = (data: FormData) => {
    try {
      const EventSchema = z.object({
        userId: z.string().min(3),
        vehicleId: z.string().min(1),
        kilometer: z.number().min(2),
        oficina: z.string().min(3),
        startedData: z.string().min(3),
        maintenanceType: z.string().min(3),
        maintenanceCenter: z.string().min(3),
        serviceDescriptions: z.string().min(3),
      })
      const validatedData = EventSchema.parse(data);
      console.log(validatedData);
      
      axios.post('/api/v1/orders', validatedData)
        .then(res => {
          console.log(res.data);
          router.push('/orders');
        })
        .catch(error => {
          console.error('Error:', error.message);
        });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Existem campos obrigatórios não preenchidos!",
        showClass: {
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `
        }
      });
      return error;
    }
  };

  if (isLoading) return <Typography>Loading vehicles...</Typography>;
  if (errors) return <Typography color="error">Failed to load vehicles</Typography>;

  const vehicles = data?.vehicles || [];
  const centers = data?.centers || [];
  const oficinas = data?.oficina || [];

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
            <Typography fontWeight={600} color='#333' textAlign={'center'} sx={{ textShadow: '0px 0px 2px #777' }} fontSize={'2em'}>Ordem de Serviço</Typography>
            <Typography sx={{ textShadow: '0px 0px 2px #777' }} fontSize={'.8em'}>
              {JSON.stringify(errors)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>

              <Grid item xs={12}><Typography>OS: automatico</Typography></Grid>

              <Grid item xs={8} sm={4}>
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
                      required
                      {...params}
                      label="Veículos"
                      error={!!errors}
                      helperText={errors ? "Failed to load vehicles" : undefined}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={4} sm={8}>
                <TextField
                  {...register('kilometer', { valueAsNumber: true })}
                  fullWidth
                  type='number'
                  label="KM"
                  inputProps={{ min: 0 }}
                  required
                />
              </Grid>

              <Grid item xs={6} sm={6}>
                <FreeSoloCreateOption
                  required
                  label="OFICINA"
                  options={oficinas}
                  onChange={(item) => {
                    const value = typeof item === 'string' ? item : item?.name || '';
                    setValue('oficina', value.toUpperCase());
                  }} />
              </Grid>

              <Grid item xs={6} sm={6}>
                <TextField
                  fullWidth
                  type='datetime-local'
                  {...register('startedData')}
                  label="ENTRADA"
                  required

                  slotProps={{inputLabel:{ shrink: true }}}
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
                  required
                  label="CENTRO DE MANUTENÇÃO"
                  options={centers}
                  onChange={(item) => {
                    const value = typeof item === 'string' ? item : item?.name || '';
                    setValue('maintenanceCenter', value.toUpperCase());
                  }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  {...register('serviceDescriptions')}
                  label="DESCRIÇÃO DO SERVIÇO:"
                  multiline
                  rows={5}
                  fullWidth
                  required
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