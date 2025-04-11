import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  IconButton, 
  Badge, 
  Dialog, 
  DialogContent, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Tooltip
} from '@mui/material';
import { Notifications, Check, Close, NotificationsActive } from '@mui/icons-material';
import { useSocket } from '@/provider/SocketProvider';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import { debounce } from 'lodash';

type TransferStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

interface Transfer {
  id: string;
  status: TransferStatus;
  vehicle: {
    id: string;
    model: string;
    plate: string;
  };
  createdAt: string;
  requester?: {
    name: string;
    avatar?: string;
  };
}

interface NotificationModalProps {
  userId: string;
  enableSound?: boolean;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ userId, enableSound = false }) => {
  const [open, setOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newNotifications, setNewNotifications] = useState(0);
  const socket = useSocket();
  
  
  const { 
    data: pendingTransfers, 
    isLoading, 
    mutate 
  } = useSWR<Transfer[]>(`/api/v1/keys/pending/${userId}`, fetcher, { 
    refreshInterval: 10000, // 10 segundos
    revalidateOnFocus: true 
  });

  // Tocar som de notificação
  const playNotificationSound = useCallback(() => {
    if (enableSound) {
      const audio = new Audio('/sounds/notification.wav');
      audio.play().catch(e => console.error('Error playing sound:', e));
    }
  }, [enableSound]);

  // Handler para ações (confirmar/rejeitar)
  const handleTransferAction = useCallback(debounce(async (action: 'confirm' | 'reject', transferId: string) => {
    setLoadingAction(transferId);
    try {
      await axios.post(`/api/v1/keys/${action}/${transferId}`);
      setSuccess(`Transferência ${action === 'confirm' ? 'confirmada' : 'rejeitada'} com sucesso`);
      mutate();
      
      // Emitir evento via socket
      if (socket) {
        socket.emit('transferUpdate', { transferId, action });
      }
    } catch (err) {
      setError(`Erro ao ${action === 'confirm' ? 'confirmar' : 'rejeitar'} transferência`);
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  }, 500), [mutate, socket]);

  // Efeito para socket e notificações
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      mutate();
      setNewNotifications(prev => prev + 1);
      playNotificationSound();
    };

    // Configurar listeners
    socket.emit('joinNotifications', userId);
    socket.on('newTransfer', handleNewNotification);
    socket.on('transferUpdated', handleNewNotification);

    return () => {
      socket.off('newTransfer', handleNewNotification);
      socket.off('transferUpdated', handleNewNotification);
      socket.emit('leaveNotifications', userId);
    };
  }, [socket, userId, mutate, playNotificationSound]);

  // Resetar contador quando modal é aberto
  useEffect(() => {
    if (open) {
      setNewNotifications(0);
    }
  }, [open]);

  const pendingCount = pendingTransfers?.filter(t => t.status === 'PENDING').length || 0;
  const hasNewNotifications = newNotifications > 0;

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton 
          color="inherit" 
          onClick={() => setOpen(true)}
          sx={{ position: 'relative' }}
        >
          <Badge 
            badgeContent={pendingCount + newNotifications} 
            color={hasNewNotifications ? 'secondary' : 'error'}
            max={99}
          >
            {hasNewNotifications ? (
              <NotificationsActive sx={{ color: 'secondary.main' }} />
            ) : (
              <Notifications />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 24
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div" gutterBottom>
            Notificações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transferências de chave pendentes
          </Typography>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : pendingTransfers?.filter(t => t.status === 'PENDING').length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography color="text.secondary">
                Nenhuma notificação pendente
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {pendingTransfers
                ?.filter(transfer => transfer.status === 'PENDING')
                ?.map((transfer) => (
                  <Card 
                    key={transfer.id} 
                    sx={{ 
                      mb: 2, 
                      mx: 2, 
                      mt: 2,
                      boxShadow: 3,
                      borderLeft: 4,
                      borderColor: 'primary.main'
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="medium">
                          {transfer.vehicle.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transfer.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Placa: <strong>{transfer.vehicle.plate}</strong>
                      </Typography>
                      
                      {transfer.requester && (
                        <Typography variant="body2" color="text.secondary">
                          Solicitado por: <strong>{transfer.requester.name}</strong>
                        </Typography>
                      )}

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={() => handleTransferAction('confirm', transfer.id)}
                          disabled={loadingAction === transfer.id}
                        >
                          {loadingAction === transfer.id ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Confirmar'
                          )}
                        </Button>
                        
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => handleTransferAction('reject', transfer.id)}
                          disabled={loadingAction === transfer.id}
                        >
                          {loadingAction === transfer.id ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Rejeitar'
                          )}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              }
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(NotificationModal);