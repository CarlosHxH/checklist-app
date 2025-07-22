import InspectionChart from './InspectionChart';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { InspectionChartData } from './inspectionService';

type DashboardData = {
    inspectionsByDate: InspectionChartData[];
    statusSummary: {
        finished: number;
        unfinished: number;
        total: number;
        finishedPercentage: number;
        unfinishedPercentage: number;
    };
};

export default function InspectionsDashboard({
    data,
    isLoading,
    error,
}: {
    data: DashboardData | null;
    isLoading: boolean;
    error: string | null;
}) {

    if (isLoading) {
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
    
    return (
        <Grid container spacing={3}>

            <Grid item xs={6} md={3}>
                <Card style={{ height: 180 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Total de Viagens
                        </Typography>
                        <Typography variant="h3">
                            {data?.statusSummary?.finished}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            FINALIZADAS
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={6} md={3}>
                <Card style={{ height: 180 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Total de Viagens
                        </Typography>
                        <Typography variant="h3">
                            {data.statusSummary.unfinished}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            PENDENTE
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card style={{ height: 180 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Taxa de Finalização
                        </Typography>
                        <Typography variant="h3">
                            {data.statusSummary.finishedPercentage || 0}%
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" fontSize={14} color="textSecondary">
                                {data.statusSummary.total || 0} {data.statusSummary.total > 1?"VIAGENS FINALIZADAS":"VIAGEM FINALIZADA"}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card style={{ height: 180 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            NÃO FINALIZADAS
                        </Typography>
                        <Typography variant="h3">
                            {data.statusSummary.unfinishedPercentage || 0}%
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" fontSize={14} color="textSecondary">
                                {data.statusSummary.unfinished || 0} {data.statusSummary.unfinished > 1?"VIAGENS NÃO FINALIZADAS":"VIAGEM NÃO FINALIZADA"}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

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
        </Grid>
    );
}