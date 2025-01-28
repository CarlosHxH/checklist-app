"use client"
import React from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';

// User schema for validation
const vehicleSchema = z.object({
  id: z.string().optional(),
  make: z.string().min(1, { message: 'Required' }),
  model: z.string().min(1, { message: 'Required' }),
  year: z.string().min(4, { message: "Formato invalido!" }),
  eixo: z.string().min(1, { message: 'Required' }),
  plate: z.string().min(7, { message: 'Placa Invalida!' }).max(7, { message: 'Placa Invalida!' })
});

export type vehicleFormData = z.infer<typeof vehicleSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: vehicleFormData | null;
  onSubmit: (data?: vehicleFormData) => Promise<void>;
}

export default function VehicleModal({
  isOpen,
  onClose,
  data,
  onSubmit
}: UserModalProps) {
  const { control, handleSubmit, reset, formState: { errors }
  } = useForm<vehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: data || {
      plate: '',
      model: '',
      make: '',
      year: '',
      eixo: ''
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({ ...data });
      } else {
        reset({
          plate: '',
          model: '',
          make: '',
          year: '',
          eixo: ''
        });
      }
    }
  }, [isOpen, data, reset]);

  const close = () => {
    reset();
    onClose();
  }

  const handleFormSubmit = async (data: vehicleFormData) => {
    try {
      let response;
      if (!data.id) {
        response = await axios.post('/api/vehicles', { ...data });
      } else {
        response = await axios.put('/api/vehicles', { ...data });
      }
      await onSubmit(response.data);
      close();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.response?.data?.message || 'Erro ao salvar'
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth keepMounted={false} disablePortal={false} aria-labelledby={`vehicle`}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {data ? "Editar" : "Adicione"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="plate"
              control={control}
              render={({ field }) => (<TextField variant='outlined' label="Placa" {...field} placeholder="Placa" fullWidth />)}
            />
            {errors.plate && (<Typography color="error">{errors.plate.message}</Typography>)}

            <Controller
              name="make"
              control={control}
              render={({ field }) => (<TextField variant='outlined' label="Fabricante" {...field} placeholder="Fabricante" fullWidth />)}
            />
            {errors.make && (<Typography color="error">{errors.make.message}</Typography>)}

            <Controller
              name="model"
              control={control}
              render={({ field }) => (<TextField variant='outlined' label="Modelo" {...field} placeholder="Modelo" fullWidth />)}
            />
            {errors.model && (<Typography color="error">{errors.model.message}</Typography>)}

            <Controller
              name="year"
              control={control}
              render={({ field }) => (<TextField variant='outlined' label="Ano" {...field} placeholder="Ano de fabricação" fullWidth />)}
            />
            {errors.year && (<Typography color="error">{errors.year.message}</Typography>)}

            <Controller
              name="eixo"
              control={control}
              render={({ field }) => (
                <>
                  <Typography variant='body2'>Eixos</Typography>
                  <Select {...field} fullWidth>
                    <MenuItem value="1">Dianteira</MenuItem>
                    <MenuItem value="2">Tração</MenuItem>
                    <MenuItem value="3">Truck</MenuItem>
                    <MenuItem value="4">4 Eixo</MenuItem>
                  </Select>
                  {errors.eixo && (<Typography color="error">{errors.eixo.message}</Typography>)}
                </>
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button id="cancel-button" onClick={close}>Cancelar</Button>
          <Button type="submit" variant="contained">{data ? "Atualizar" : "Criar"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}