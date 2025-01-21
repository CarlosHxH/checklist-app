"use client"
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material';
import { User, Vehicle, VehicleKey, VehicleKeyFormData } from './Types';
import { Form, useForm } from 'react-hook-form';
import ComboBox from '@/components/ComboBox';
import Loading from '@/components/Loading';
import { watch } from 'fs';

interface VehicleKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: VehicleKeyFormData) => void;
  vehicleKey?: VehicleKey;
  users: User[];
  vehicles: Vehicle[];
  availableParents: VehicleKey[];
}


export const VehicleKeyModal: React.FC<VehicleKeyModalProps> = ({
  open, onClose, onSave, vehicleKey, users, vehicles, availableParents,
}) => {
  const { reset, control, formState: { isSubmitting } } = useForm();

  if(isSubmitting) return <Loading/>
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Form
        method="post"
        action={"/api/admin/keys"}
        encType={'application/json'}
        onSuccess={async ({ response }) => {
          const res = await response.json()
          reset();
          onSave(res);
          onClose();
        }}
        onError={async (error) => {
          reset();
          alert("Erro ao enviar os dados!");
          if (error.response) {
            const res = await error.response.json();
            console.log(res);
            alert("Error ao criar a inspeção!")
          } else {
            console.log(error);
          }
        }}
        control={control}
      >
        <DialogTitle>
          {vehicleKey ? 'Edit Vehicle Key' : 'Add New Vehicle Key'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <ComboBox name="userId" label="Selecione um Usuario" options={users.map((v) => ({label: `${v.name}`,value: v.id}))} control={control} rules={{ required: 'Este campo é obrigatório' }}/>
            <ComboBox name="vehicleId" label="Selecione um veículo" options={vehicles.map((v) => ({label: `${v.plate} - ${v.model}`,value: v.id}))} control={control} rules={{ required: 'Veículo é obrigatório' }}/>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
};