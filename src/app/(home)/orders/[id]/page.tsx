'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Paper, Divider, Chip, Stack } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { getOrders, OrderWithRelations } from './action';
import Loading from '@/components/Loading';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import CustomFab from '@/components/_ui/CustomFab';
import formatDate from '@/lib/formatDate';

export default function OrderPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = React.useState<OrderWithRelations | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError('Order ID not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await getOrders(id);
        setOrder(res);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (isLoading) return <Loading />;
  if (error) return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <CustomAppBar title="Erro" showBackButton />
      <Typography color="error">{error}</Typography>
    </Box>
  );
  if (!order) return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <CustomAppBar title="Não encontrado" showBackButton />
      <Typography>Order not found</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <CustomAppBar title={`Ordem de Serviço #${String(order.id).padStart(5, '0')}`} showBackButton />
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações Básicas
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2">Responsável</Typography>
            <Typography>{order.user.name}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Data de Entrada</Typography>
            <Typography>{order?.startedData.toLocaleString()}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Status</Typography>
            <Chip
              label={order.isCompleted ? 'Concluído' : 'Em Andamento'}
              color={order.isCompleted ? 'success' : 'warning'}
              icon={order.isCompleted ? <CheckCircle /> : undefined}
            />
          </Box>

          {order.isCompleted && order.finishedData && (
            <Box>
              <Typography variant="subtitle2">Data de Conclusão</Typography>
              <Typography>{order?.finishedData.toLocaleString()}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Veículo
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2">Placa</Typography>
            <Typography>{order.vehicle.plate}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Modelo</Typography>
            <Typography>{order.vehicle.model || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Quilometragem</Typography>
            <Typography>{order.kilometer.toLocaleString('pt-BR')} km</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">OFICINA</Typography>
            <Typography>{order.oficina.name}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Manutenção
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2">Tipo de Manutenção</Typography>
            <Typography>{order.maintenanceType}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Centro de Manutenção</Typography>
            <Typography>{order.maintenanceCenter.name}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Descrição dos Serviços
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="action" sx={{ mr: 1 }} />
            <Typography>{order.serviceDescriptions}</Typography>
          </Box>
        </Stack>
      </Paper>
      {!order.isCompleted&&<CustomFab href={`/orders/${order.osNumber}/edit`} variant="Edit" />}
    </Box>
  );
}