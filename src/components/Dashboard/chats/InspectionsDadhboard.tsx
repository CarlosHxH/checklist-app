import { useState, useEffect } from 'react';
import InspectionChart from './InspectionChart';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import type { InspectionChartData } from '@/services/inspectionService';

type DashboardData = {
  inspectionsByDate: InspectionChartData[];
  statusSummary: {
    finished: number;
    unfinished: number;
  };
};

export default function InspectionsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        const response = await fetch('/api/v1/dashboard/chart/lastMonth');
        if (!response.ok) {
          throw new Error('Falha ao carregar dados');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao buscar dados de inspeção:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, []);

  // Não precisamos mais deste formato com o componente InspectionChart

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography color="error">Erro ao carregar dados: {error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography>Nenhum dado disponível</Typography>
      </Box>
    );
  }

  // Usamos os dados diretamente
  const totalInspections = data.statusSummary.finished + data.statusSummary.unfinished;
  const finishedPercentage = Math.round((data.statusSummary.finished / totalInspections) * 100) || 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Últimos 30 Dias
            </Typography>
            <InspectionChart data={data.inspectionsByDate} />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Total de Viagens
            </Typography>
            <Typography variant="h3">
              {totalInspections}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              nos últimos 30 dias
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Taxa de Finalização
            </Typography>
            <Typography variant="h3">
              {finishedPercentage}%
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {data.statusSummary.finished} de {totalInspections} inspeções finalizadas
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}