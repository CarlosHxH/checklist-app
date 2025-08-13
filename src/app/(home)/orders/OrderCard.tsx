"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Typography, Collapse, Grid, Box, Stack, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { OrderWithRelations } from './action';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import formatDate from '@/lib/formatDate';
import { CheckCircle } from '@mui/icons-material';

// Expanda o ícone de expansão para girar quando expandido
const ExpandMore = styled((props: { expanded: boolean } & React.ComponentProps<typeof IconButton>) => {
  const { expanded, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expanded }) => ({
  transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  })
}));

const CardList: React.FC<{ order: OrderWithRelations }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => { setExpanded(!expanded) };

  return (
    <Card sx={{ margin: 2 }}>
      <CardHeader
        title={<Box fontSize={18} display={"flex"} alignItems={"center"}>Ordem de Serviço <Typography ml={1} fontSize={22} variant='h6' fontWeight={600}>#{String(order.id).padStart(5, '0')}</Typography></Box>}
        subheader={
          <Stack>
            <Typography variant='h6'>{order.vehicle.plate} - {order.vehicle.model}</Typography>
            <Typography>Local: {order.destination}</Typography>
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
          <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
            <Typography variant="body2">
              {formatDate(order.entryDate)} - {formatDate(order?.completionDate||'')}
            </Typography>

          </Grid>
          <Grid item xs={8} textAlign={'start'}>
            <Chip
                label={order.isCompleted ? 'Concluído' : 'Em Andamento'}
                color={order.isCompleted ? 'success' : 'warning'}
                icon={order.isCompleted ? <CheckCircle /> : undefined}
              />
          </Grid>
          <Grid item xs={4} direction={'column'} textAlign={'end'}>
            {!order.isCompleted && <IconButton href={`/orders/${order.osNumber}/edit`} color='primary'><EditIcon/></IconButton>}
            <IconButton href={`/orders/${order.osNumber}`} color='inherit'><VisibilityIcon/></IconButton>
          </Grid>
        </Grid>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="h6" gutterBottom component="div">
            Detalhes
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }} component="div">
            {order.serviceDescriptions}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

// Componente principal
const OrderCard = ({ data }: { data: OrderWithRelations[] }) => {
  return (
    <Box sx={{ py: 1, marginBottom: 5 }}>
      {data&&data.map((data) => (<CardList key={data.id} order={data} />))}
    </Box>
  );
};


export default OrderCard;