import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  Box,
  Typography,
  IconButton,
  Paper
} from '@mui/material';
import { Close, ArrowRight } from '@mui/icons-material';

interface User {
  id: string
  name: string
}

interface Vehicle {
  id: string
  plate: string
  model: string
}

interface VehicleKey {
  id: string
  userId: string
  vehicleId: string
  createdAt: string
  updatedAt: string
  parentId: string | null
  user: User
  vehicle: Vehicle
}

interface HistoryModalProps {
  open: boolean
  onClose: () => void
  vehicleKeys: VehicleKey | null
}

const HistoryModal = ({ open, onClose, vehicleKeys }: HistoryModalProps) => {
  if (!vehicleKeys) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Histórico do Veículo</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">
            {vehicleKeys.vehicle.model} - {vehicleKeys.vehicle.plate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Primeira Transferência: {new Date(vehicleKeys.createdAt).toLocaleString()}
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1">Detalhes da Chave</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Typography variant="body2">
                <strong>ID:</strong> {vehicleKeys.id}
              </Typography>
              <Typography variant="body2">
                <strong>Usuário:</strong> {vehicleKeys.user.name}
              </Typography>
              <Typography variant="body2">
                <strong>Criado em:</strong> {new Date(vehicleKeys.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Atualizado em:</strong> {new Date(vehicleKeys.updatedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Parent ID:</strong> {vehicleKeys.parentId || 'Nenhum'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;