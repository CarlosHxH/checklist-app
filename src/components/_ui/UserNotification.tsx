import React, { useState } from 'react';
import axios from 'axios';
import { IconButton, Badge, Dialog, DialogContent, Card, CardContent, Typography, Button, Box, Snackbar, Alert, CircularProgress, Grid } from '@mui/material';
import { Notifications, Check, Close } from '@mui/icons-material';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import { useSession } from 'next-auth/react';
import ComboBox from '../ComboBox';
import { useForm, Form } from 'react-hook-form';

interface Users {
  id: string;
  name: string;
}
interface Transfer {
  plate: string;
  model: string;
  id: string;
  status: 'PENDING' | 'CONFIRMED';
  vehicle: {
    id: string;
    model: string;
    plate: string;
  };
  createdAt: string;
}

const NotificationModal = () => {
  const { data: session } = useSession()
  const { data: pendingTransfers, isLoading, mutate } = useSWR<Transfer[]>(`/api/keys/pending/${session?.user.id}`, fetcher, { refreshInterval: 5000 });
  const { data: users } = useSWR<Users[]>(`/api/users`, fetcher);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { control } = useForm();

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

  const options: Partial<Transfer> = pendingTransfers?.filter(v => v.status === 'CONFIRMED')[0] ?? {};
  console.log(options);
  
  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)} style={{ position: 'relative' }}>
        <Badge badgeContent={pendingTransfers?.filter(v=>v.status==='PENDING')?.length ?? 0} color="error" max={99}>
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
          <Form
            method="post"
            encType={'application/json'}
            onSubmit={async(data)=>{
              const formData = {...data.data, parentId:options.id};
              const res = axios.post('/api/admin/keys',formData)
              console.log(res);
            }}
            onSuccess={async (result) => { console.log({result});}}
            onError={async (error) => {
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
            <Typography>Transferir chave</Typography>
            <Grid container>
              <Grid item xs={12} md={4} p={1}>
                <ComboBox name="vehicleId" label="Selecione um veículo" options={[{ label: `${options?.vehicle?.plate ?? ''}`, value: options?.vehicle?.id ?? '' }]} control={control} rules={{ required: 'Veículo é obrigatório' }} />
              </Grid>
              <Grid item xs={12} md={4} p={1}>
                <ComboBox name="userId" label="Selecione um usuario" options={users ? users.map((v) => ({ label: v.name, value: v.id })) : []} control={control} rules={{ required: 'Chaves' }} />
              </Grid>
              <Grid item xs={12} md={4} p={1}><Button type='submit' variant='outlined'>Transferir</Button></Grid>
            </Grid>
          </Form>

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
              {pendingTransfers?.map((transfer) => {
                if (transfer.status != 'PENDING') return;
                return(
                <Card key={transfer.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" component="div" gutterBottom>
                      {transfer.vehicle.model} {}
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
              )})}
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