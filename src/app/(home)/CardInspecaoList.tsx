"use client"
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Collapse,
  IconButton,
  Grid,
  Chip,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Type definition for the inspection data
interface VehicleInspection {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    plate: string;
    eixo: string;
    cidadeBase: string;
  };
  dataInspecao: string;
  status: string;
  crlvEmDia: string;
  certificadoTacografoEmDia: string;
  nivelAgua: string;
  nivelOleo: string;
  dianteira: string;
  tracao: string;
  truck: string;
  avariasCabine: string;
  bauPossuiAvarias: string;
  funcionamentoParteEletrica: string;
}

// Styled expand icon to rotate when expanded
const ExpandMore = styled((props: { expanded: boolean } & React.ComponentProps<typeof IconButton>) => {
  const { expanded, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expanded }) => ({
  transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const CardList: React.FC<{ inspection: VehicleInspection }> = ({ inspection }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => { setExpanded(!expanded) };

  return (
    <Card sx={{ margin: 2 }}>
      <CardHeader
        title={`${inspection.vehicle.make} ${inspection.vehicle.model}`}
        subheader={`Placa: ${inspection.vehicle.plate} | Ano: ${inspection.vehicle.year}`}
        action={
          <ExpandMore
            expanded={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        }
      />

      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Typography variant="body2" component="div">
              Data Inspeção: {new Date(inspection.dataInspecao).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={4} textAlign={'end'}>
            <Chip label={inspection.status} color={'primary'} size="small" />
          </Grid>
        </Grid>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="h6" gutterBottom component="div">
            Detalhes da Inspeção
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" component="div">CRLV: {inspection.crlvEmDia}</Typography>
              <Typography variant="body2" component="div">Tacógrafo: {inspection.certificadoTacografoEmDia}</Typography>
              <Typography variant="body2" component="div">Nível Água: {inspection.nivelAgua}</Typography>
              <Typography variant="body2" component="div">Nível Óleo: {inspection.nivelOleo}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" component="div">Dianteira: {inspection.dianteira}</Typography>
              <Typography variant="body2" component="div">Tração: {inspection.tracao}</Typography>
              <Typography variant="body2" component="div">Truck: {inspection.truck}</Typography>
              <Typography variant="body2" component="div">Parte Elétrica: {inspection.funcionamentoParteEletrica}</Typography>
            </Grid>
          </Grid>

          <Typography variant="body2" sx={{ mt: 2 }} component="div">
            Cidade Base: {inspection.vehicle.cidadeBase}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

// Componente principal
const VehicleInspectionCard = ({ data }: { data: VehicleInspection[] }) => {
  return (
    <Box sx={{ py: 1 }}>
      {data.map((data) => (
        <CardList key={data.id} inspection={data} />
      ))}
    </Box>
  );
};


export default VehicleInspectionCard;