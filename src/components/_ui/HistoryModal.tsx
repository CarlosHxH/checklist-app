import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Close, 
  CarRental,
  Person,
  AccessTime
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
  status: "CONFIRMED" | "REJECTED" | "PENDING";
}

interface HistoryModalProps {
  open: boolean
  onClose: () => void
  vehicleKeys: {
    vehicle: Vehicle
    keys: VehicleKey[]
    latestKey: VehicleKey
  } | null
}

const HistoryModal = ({ 
  open, 
  onClose, 
  vehicleKeys 
}: HistoryModalProps) => {
  if (!vehicleKeys) return null;

  // Sort keys from most recent to oldest
  const sortedKeys = [...vehicleKeys.keys].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Histórico do Veículo:
            <Typography>
              <strong> {vehicleKeys.vehicle.model} - {vehicleKeys.vehicle.plate}</strong>
            </Typography>
          </Typography>
          <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <List sx={{ position: 'relative', left: -30 }}>
          {sortedKeys.map((key, index) => (
            <React.Fragment key={key.id}>
              <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                <Box display="flex" alignItems="center" width="100%">
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: index === 0 ? 'primary.main' : 'grey.300',
                        color: index === 0 ? 'white' : 'text.secondary'
                      }}
                    >
                      {index === 0 ? <CarRental /> : <Person />}
                    </Box>
                  </ListItemIcon>
                  
                  <Box sx={{ flexGrow: 1, ml: 2 }}>
                    <Paper 
                      elevation={index === 0 ? 3 : 1}
                      sx={{ 
                        p: 2, 
                        borderLeft: `4px solid ${index === 0 ? 'primary.main' : 'grey.500'}` 
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography 
                          variant="subtitle1" 
                          color={index === 0 ? 'primary.main' : 'text.secondary'}
                        >
                          {index === 0 ? 'Transferência Atual' : `Transferência ${index + 1}`}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTime fontSize="small" />
                          <Typography variant="body2">
                            {new Date(key.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Responsável: {key.user.name}
                      </Typography>
                      
                      <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>Placa:</strong> {key.vehicle.plate}...
                        </Typography>
                        {key.status && (
                          <Typography variant="body2">
                            <strong>Status:</strong> {key.status}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </ListItem>
              {index < sortedKeys.length - 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                  <Box
                    sx={{
                      width: 2,
                      height: 20,
                      bgcolor: 'grey.300'
                    }}
                  />
                </Box>
              )}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;