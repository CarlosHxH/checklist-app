// VehicleKeyModal.tsx
import React from 'react';
import {Dialog,DialogTitle,DialogContent,DialogActions,Button,Stack} from '@mui/material';
import { User, Vehicle, VehicleKey, VehicleKeyFormData } from './Types';
import Loading from '@/components/Loading';
import { Form, useForm } from 'react-hook-form';
import ComboBox from '@/components/ComboBox';

interface VehicleKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: VehicleKeyFormData) => void;
  vehicleKey?: VehicleKey;
  users: User[];
  vehicles: Vehicle[];
  availableParents: VehicleKey[];
}

export const VehicleKeyModal: React.FC<VehicleKeyModalProps> = ({ open, onClose, onSave, vehicleKey, users, vehicles, availableParents }) => {
  const { reset, watch, setValue, control, formState: { isSubmitting } } = useForm<VehicleKeyFormData>({defaultValues: {}});
  React.useMemo(() => {
      reset()
      vehicleKey && Object.entries(vehicleKey).forEach(([key, value]) => {
        if (["user", "vehicle"].includes(key)) return;
        setValue(key as keyof VehicleKeyFormData, value)
      })
  },[vehicleKey])

  if(isSubmitting) return <Loading/>

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Form
        method={!!vehicleKey?.id?"post":"put"}
        action={"/api/admin/keys"}
        encType={'application/json'}
        onSuccess={async ({ response }) => {
          const res = await response.json()
          reset();
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
            <ComboBox name="userId" label="Usuario" options={users.map((v) => ({label: `${v.name}`,value: v.id}))} control={control} rules={{ required: true }}/>
            
            <ComboBox name="vehicleId" label="Veículo" options={vehicles.map((v) => ({label: `${v.plate} - ${v.model}`,value: v.id}))} control={control} rules={{ required: true }}/>

            <ComboBox name="parentId" label="Parent Key" options={availableParents.map((v) => ({label: `${v.vehicle.plate} - ${v.user.name}`,value: v.id}))} control={control} rules={{}}/>
{/*
            <TextField name="userId" label="User" select value={formData.userId} onChange={handleChange} required fullWidth>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField name="vehicleId" label="Vehicle" select value={formData.vehicleId} onChange={handleChange} required fullWidth>
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.model}
                </MenuItem>
              ))}
            </TextField>

            <TextField name="parentId" label="Parent Key" select value={formData.parentId || ''} onChange={handleChange} fullWidth>
              <MenuItem value="">No Parent</MenuItem>
              {availableParents.map((key) => (
                <MenuItem key={key.id} value={key.id}>
                  {key.vehicle.plate} - {key.user.name}
                </MenuItem>
              ))}
            </TextField>
            */}
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