"use client"
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Container, Typography, Grid, Paper } from '@mui/material';
import ComboBox from '@/components/ComboBox';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Vehicle } from '@/components/EixoSection';
import { fetcher } from '@/lib/ultils';
import Loading from '@/components/Loading';
import PhotoUploader from '@/components/_ui/PhotoUploader';
import CustomAppBar from '@/components/_ui/CustomAppBar';

// Tipo para os dados do formulário
interface VehicleInspectionData {
  userId: string;
  vehicleId: string;
  kilometer: number;
  photos: File[];
  observations: string;
}

const VehicleInspectionForm: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: vehicles } = useSWR<Vehicle[], { [key: string]: any }>(`/api/v1/vehicles`, fetcher);

  const [photos, setPhotos] = useState<File[]>([]);
  const { control, handleSubmit, formState: { errors }, reset } = useForm<VehicleInspectionData>({
    defaultValues: {
      userId: session?.user.id,
      vehicleId: '',
      kilometer: 0,
      observations: ''
    }
  });

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const onSubmit = (data: VehicleInspectionData) => {
    // Adicionar as fotos aos dados do formulário
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = data[key as keyof VehicleInspectionData];
      formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
    });

    photos.forEach(photo => {
      formData.append('photos', photo);
    });

    // Lógica para enviar os dados (você pode substituir por sua própria implementação)
    console.log('Dados do formulário:', Object.fromEntries(formData));

    fetch('/api/inspecao', {
      method: "POST",
      body: formData,
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));

    // Limpar o formulário após o envio
    reset();
    setPhotos([]);
  };


  if (!vehicles) return <Loading />

  return (
    <Container maxWidth="md">
      <CustomAppBar showBackButton/>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Inspeção de Veículo
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>

            <Grid item xs={12} md={6}>
              <ComboBox name="vehicleId" label="Selecione um veículo" options={vehicles.map((v) => ({ label: `${v.plate} - ${v.model}`, value: v.id }))} control={control} rules={{ required: 'Veículo é obrigatório' }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="kilometer"
                control={control}
                rules={{
                  required: 'Quilometragem é obrigatória',
                  min: { value: 0, message: 'Quilometragem inválida' }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    type="number"
                    label="Quilometragem"
                    error={!!errors.kilometer}
                    helperText={errors.kilometer?.message}
                  />
                )}
              />
            </Grid>


            <Grid item xs={12}>
              <PhotoUploader name={'veiculo'} label={'Foto da Frente do veiculo'} onChange={(files) => setPhotos(prevPhotos => [...prevPhotos, ...files])} />
            </Grid>

            <Grid item xs={12}>
              <PhotoUploader name={'pneus'} label={'Foto de todos os pneus'} onChange={(files) => setPhotos(prevPhotos => [...prevPhotos, ...files])} />
            </Grid>

            <Grid item xs={12}>
              <PhotoUploader name={'veiculo'} label={'Foto do Baú'} onChange={(files) => setPhotos(prevPhotos => [...prevPhotos, ...files])} />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="observations"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Observações"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Enviar Inspeção
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default VehicleInspectionForm;