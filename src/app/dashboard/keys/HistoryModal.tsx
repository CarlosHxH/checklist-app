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
import { ArrowRight } from '@mui/icons-material';

interface VehicleKeyHistory {
  id: string;
  userId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  user: {
    name: string;
  };
  vehicle: {
    model: string;
    plate: string;
  };
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  vehicleKeys: VehicleKeyHistory[];
}

const HistoryModal = ({ open, onClose, vehicleKeys }: HistoryModalProps) => {
  // Find root keys (those without parents)
  const rootKeys = vehicleKeys.filter(key => !key.parentId);
  
  // Find child keys for a given parent ID
  const findChildren = (parentId: string) => {
    return vehicleKeys.filter(key => key.parentId === parentId);
  };

  // Render a single key entry
  const KeyEntry = ({ data, depth = 0 }: { data: VehicleKeyHistory; depth?: number }) => {
    const children = findChildren(data.id);
    
    return (
      <Box sx={{ ml: depth * 3 }}>
        <Paper 
          elevation={1}
          sx={{
            p: 2,
            my: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {depth > 0 && (
              <ArrowRight />
            )}
            <Typography variant="h6" component="div">
              {data.vehicle.model} - {data.vehicle.plate}
            </Typography>
          </Box>
          
          <Box sx={{ pl: depth > 0 ? 3 : 0 }}>
            <Typography variant="body2" color="text.secondary">
              Responsável: {data.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Data: {new Date(data.createdAt).toLocaleDateString()} {new Date(data.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        </Paper>
        
        {children.map(child => (
          <KeyEntry key={child.id} data={child} depth={depth + 1} />
        ))}
      </Box>
    );
  };

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
            &times;
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {rootKeys.map(key => (
            <KeyEntry key={key.id} data={key} />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;