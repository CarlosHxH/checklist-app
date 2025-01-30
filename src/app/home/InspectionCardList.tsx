// components/InspectionCardList.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  IconButton,
  Collapse,
  Stack,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  DirectionsCar as CarIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { InspectionData, InspectionDetail } from './inspection';
import { formatDate } from '@/utils';
import { useRouter } from 'next/navigation';

interface InspectionCardProps {
  inspection: InspectionData;
}

const InspectionCard = ({ inspection }: InspectionCardProps) => {
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);

  const getStatusColor = (status: string | undefined) => {
    if (status === 'INICIO') return 'primary';
    if (status === 'FINAL') return 'success';
    return 'default';
  };

  const format = (date: string) => {
    return formatDate(new Date(date), 'dd/MM/yyyy HH:mm');
  };

  const handleView = (id: string) => router.push(`/inspection/${id}`);
  const handleEdit = (id: string) => router.push(`/inspection/${id}/edit`);

  console.log(inspection);
  
  const renderInspectionDetails = (detail: InspectionDetail | null, type: 'start' | 'end') => {
    if (!detail) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          {type === 'start' ? 'Inspeção Inicial' : 'Inspeção Final'}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Quilometragem:</strong> {detail.kilometer}
            </Typography>
            <Typography variant="body2">
              <strong>CRLV em dia:</strong> {detail.crlvEmDia}
            </Typography>
            <Typography variant="body2">
              <strong>Nível de Água:</strong> {detail.nivelAgua}
            </Typography>
            <Typography variant="body2">
              <strong>Nível de Óleo:</strong> {detail.nivelOleo}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Estado dos Pneus:</strong>
            </Typography>
            <Typography variant="body2">
              - Dianteira: {detail.dianteira}
            </Typography>
            <Typography variant="body2">
              - Tração: {detail.tracao}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CarIcon />
            <Typography variant="h6">
              Inspeção {format(inspection.createdAt)}
            </Typography>
          </Box>
          <Stack>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1, }}>
              <IconButton onClick={() => handleView(inspection.id)} color="primary"><ViewIcon /></IconButton>
              {!inspection.isFinished && (<IconButton onClick={() => handleEdit(inspection.id)} color="primary"><EditIcon /></IconButton>)}
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, mt:2 }}>
              {inspection.start && (
                <Chip label="Início" color={getStatusColor('INICIO')} size="small" icon={<CheckCircleIcon />}
                />
              )}
              {inspection.end && (
                <Chip
                  label="Final"
                  color={getStatusColor('FINAL')}
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              )}
              <IconButton onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label="mostrar mais">
                {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
          </Stack>
        </Box>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Veiculo: {inspection.start?.vehicleId||inspection.end?.vehicleId}
        </Typography>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {renderInspectionDetails(inspection.start, 'start')}
          {renderInspectionDetails(inspection.end, 'end')}
        </Collapse>
      </CardContent>
    </Card>
  );
};

// Main component
const InspectionCardList = ({ inspections }: { inspections: InspectionData[] }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Lista de Inspeções</Typography>
      {inspections.map((inspection) => (
        <InspectionCard key={inspection.id} inspection={inspection} />
      ))}
    </Box>
  );
};

export default InspectionCardList;