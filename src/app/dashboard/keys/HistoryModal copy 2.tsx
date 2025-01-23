import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  Box,
  Typography,
  IconButton,
  Paper,
  Collapse
} from '@mui/material';
import { 
  Close, 
  ExpandMore, 
  ExpandLess 
} from '@mui/icons-material';

interface User {
  id: string
  name: string
}

interface Vehicle {
  id: string
  plate: string
  model: string
  vehicleKeys?: VehicleKey[]
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
  const [openKeyIds, setOpenKeyIds] = useState<string[]>([])

  if (!vehicleKeys) return null;
  
  // Sort keys from most recent to oldest
  const sortedKeys = vehicleKeys 
    ? [vehicleKeys, 
       ...Object.values(vehicleKeys.vehicle.vehicleKeys || [])
         .filter(key => key.id !== vehicleKeys.id)
         .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ]
    : []

  const toggleKeyCollapse = (keyId: string) => {
    setOpenKeyIds(prev => 
      prev.includes(keyId) 
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    )
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Histórico do Veículo: {vehicleKeys.vehicle.model} - {vehicleKeys.vehicle.plate}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {sortedKeys.map((key, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Paper 
              elevation={index === 0 ? 3 : 1} 
              sx={{ 
                p: 2, 
                border: index === 0 ? '2px solid primary.main' : undefined 
              }}
            >
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                onClick={() => toggleKeyCollapse(key.id)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="subtitle1" color={index === 0 ? 'primary' : 'text.secondary'}>
                  {index === 0 ? 'Transferência Atual' : `Transferência ${index}`}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {key.user.name} - {new Date(key.createdAt).toLocaleString()}
                  </Typography>
                  {openKeyIds.includes(key.id) ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </Box>

              <Collapse in={openKeyIds.includes(key.id)}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: '4px solid', borderColor: 'divider' }}>
                  <Typography variant="body2">
                    <strong>ID:</strong> {key.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Usuário:</strong> {key.user.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Criado em:</strong> {new Date(key.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Atualizado em:</strong> {new Date(key.updatedAt).toLocaleString()}
                  </Typography>
                  {key.parentId && (
                    <Typography variant="body2">
                      <strong>Parent ID:</strong> {key.parentId}
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Paper>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;