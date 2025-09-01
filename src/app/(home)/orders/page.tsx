"use client";
import React, { useState } from 'react';
import CustomFab from "@/components/_ui/CustomFab";
import Container from '@mui/material/Container';
import useSWR from 'swr';
import { getOrders, OrderWithRelations } from './action';
import Loading from '@/components/Loading';
import { useSession } from 'next-auth/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ExpandMore from '@/components/_ui/ExpandMore';
import CustomAppBar from '@/components/_ui/CustomAppBar';

const CardList: React.FC<{ order: OrderWithRelations }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => { setExpanded(!expanded) };

  return (
    <Card sx={{ margin: 2 }}>
      <CardHeader
        title={<Box fontSize={18} display="flex" textAlign="center">
          Ordem de Serviço
          <Typography ml={1} fontSize={22} variant='h6' fontWeight={600}>
            {"#" + String(order.id).padStart(5, '0')}
          </Typography>
        </Box>}
        subheader={
          <Stack>
            <Typography variant='h6'>{order.veiculos}</Typography>
            <Typography>Oficina: {order.oficinas}</Typography>
          </Stack>
        }
        action={
          <ExpandMore expanded={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label="show more">
            <ExpandMoreIcon />
          </ExpandMore>
        }
      />
      <CardContent>
        <Grid container spacing={2} textAlign={"center"}>
          <Grid size={{ xs: 12 }} display={'flex'} justifyContent={'space-between'}>
            <Typography variant="body2">
              {order.startedData.toLocaleString()} - {order?.finishedData?.toLocaleString()}
            </Typography>

          </Grid>
          <Grid size={{ xs: 8 }} textAlign={'start'}>
            <Chip
              label={order.isCompleted ? 'Concluído' : 'Em Andamento'}
              color={order.isCompleted ? 'success' : 'warning'}
              icon={order.isCompleted ? <CheckCircle /> : undefined}
            />
          </Grid>
          <Grid size={{ xs: 4 }} direction={'column'} textAlign={'end'}>
            {!order.isCompleted && <IconButton href={`/orders/${order.osNumber}/edit`} color='primary'><EditIcon /></IconButton>}
            <IconButton href={`/orders/${order.osNumber}`} color='inherit'><VisibilityIcon /></IconButton>
          </Grid>
        </Grid>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="h6" gutterBottom component="div">Detalhes</Typography>
          <Typography variant="body2" sx={{ mt: 1 }} component="div">
            {order.serviceDescriptions}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};
export default function ServicePage() {
  const { data: session } = useSession();
  const { data: orders, isLoading } = useSWR<OrderWithRelations[]>(session?.user.id || "", getOrders);

  if (isLoading) return <Loading />;

  return (
    <Box>
      <CustomAppBar href='/' />
      <Container maxWidth="lg">
        <Box sx={{ width: "100%", display: 'flex', flexDirection: 'column', mb: 5 }}>
          {orders && orders.map((data) => (<CardList key={data.id} order={data} />))}
        </Box>
      </Container>
      <CustomFab href="/orders/create" variant="Plus" />
    </Box>
  );
}