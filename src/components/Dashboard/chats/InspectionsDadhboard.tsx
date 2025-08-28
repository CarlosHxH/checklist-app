import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';

export type DashboardCardData = {
  value: number | string;
  title: string;
  subtitle?: string;
  percentage?: boolean;
  unit?: string;
  pluralLabel?: string;
  singularLabel?: string;
};

export type DashboardProps = {
  data: DashboardCardData[];
  isLoading?: boolean;
  error?: string | null;
  cardHoverEffect?: boolean;
  cardHeight?: number | string;
  loadingHeight?: number | string;
};

export default function Dashboard({
  data,
  isLoading = false,
  error = null,
  cardHoverEffect = true,
  cardHeight = 180,
  loadingHeight = '300px'
}: DashboardProps) {
  const getCardSx = () => ({
    height: '100%',
    flexGrow: 1,
    transition: 'background-color 0.5s ease',
    ...(cardHoverEffect && {
      '&:hover': {
        background: '#1976d2',
        color: '#fff',
        transition: 'background-color 0.5s ease'
      }
    })
  });

  const formatValue = (item: DashboardCardData) => {
    if (item.percentage) {
      return `${item.value}%`;
    }
    return item.value;
  };

  const getLabel = (item: DashboardCardData) => {
    const count = typeof item.value === 'number' ? item.value : 0;
    const label = count === 1 ? item.singularLabel : item.pluralLabel;
    return label || '';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={loadingHeight}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={loadingHeight}>
        <Typography color="error">Erro ao carregar dados: {error}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={loadingHeight}>
        <Typography>Nenhum dado disponível</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card style={{ height: cardHeight }} sx={getCardSx()}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="h3">{formatValue(item)}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontSize={14} color="textSecondary">
                  {item.subtitle /*|| `${item.value} ${getLabel(item)}`*/}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
