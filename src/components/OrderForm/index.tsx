// components/OrderForm.tsx
import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { MaintenanceCenter, MaintenanceType, user, vehicle } from '@prisma/client';
import { OrderWithRelations } from '@/types/order';

interface OrderFormProps {
  order: OrderWithRelations;
  users: user[];
  vehicles: vehicle[];
  maintenanceTypes: MaintenanceType[];
  maintenanceCenters: MaintenanceCenter[];
  serviceDescriptions: String;
}

const OrderForm = ({
  order,
  users,
  vehicles,
  maintenanceTypes,
  maintenanceCenters,
  serviceDescriptions,
}: OrderFormProps) => {
  // Form state and handlers would go here
  // This is a simplified version for the structure

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {order.id ? `Editar Ordem #${order.osNumber}` : 'Nova Ordem de Serviço'}
      </Typography>

      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Form fields would go here */}
        {/* Example field: */}
        <FormControl fullWidth>
          <InputLabel id="user-label">Responsável</InputLabel>
          <Select
            labelId="user-label"
            id="user"
            value={order.userId}
            label="Responsável"
            // onChange handler would go here
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Other fields... */}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined">Cancelar</Button>
          <Button variant="contained" type="submit">
            Salvar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderForm;