import React, { useState } from 'react';
import axios from 'axios';
import { IconButton, Badge, Dialog, DialogContent, Card, CardContent, Typography, Button, Box, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Notifications, Check, Close } from '@mui/icons-material';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';

interface Transfer {
  id: string;
  vehicle: {
    model: string;
    plate: string;
  };
  createdAt: string;
}

const NotificationModal = () => {
  const { data: pendingTransfers, isLoading, mutate } = useSWR<Transfer[]>('/api/keys/pending', fetcher,{ refreshInterval: 5000 });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleConfirm = async (transferId: string) => {
    try {
      await axios.post(`/api/keys/confirm/${transferId}`);
      setSuccess('Transfer confirmed successfully');
      mutate();
    } catch (err) {
      setError('Failed to confirm transfer');
    }
  };

  const handleReject = async (transferId: string) => {
    try {
      await axios.post(`/api/keys/reject/${transferId}`);
      setSuccess('Transfer rejected successfully');
      mutate();
    } catch (err) {
      setError('Failed to reject transfer');
    }
  };

  const handleClose = () => setOpen(false);
  
  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)} style={{ position: 'relative' }}>
        <Badge badgeContent={pendingTransfers?.length ?? 0} color="error" max={99}>
          <Notifications />
        </Badge>
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Notificações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transferências - chave pendentes que exigem sua atenção
          </Typography>
        </Box>

        <DialogContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
          ) : pendingTransfers?.length === 0 ? (
            <Box textAlign="center" p={3}>
              <Typography color="text.secondary">
                Sem notificações pendentes
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {pendingTransfers?.map((transfer) => (
                <Card key={transfer.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" component="div" gutterBottom>
                      {transfer.vehicle.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Placa: {transfer.vehicle.plate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Data: {new Date(transfer.createdAt).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="contained" color="success" startIcon={<Check />} onClick={() => handleConfirm(transfer.id)}>
                        Confirmar
                      </Button>
                      <Button variant="contained" color="error" startIcon={<Close />} onClick={() => handleReject(transfer.id)}>
                        Rejeitar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationModal;