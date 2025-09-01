'use client';
import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Stack from '@mui/material/Stack';
import { Box, Paper, Typography } from '@mui/material';

interface Props {
  height?: number;
  label: string;
  dataset: {
    iniciadas: string;
    finalizada: string;
    motorista: string;
  }[] | any
}
export default function ChartByUsers({ dataset, height, label }: Props) {
  if (!dataset) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={height || "300px"}>
        <Typography>Nenhum dado disponível</Typography>
      </Box>
    );
  }
  return (
    <Paper elevation={1}>
      <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
        <Typography component="h2" variant="h6" sx={{p:2}}>
          {label}
        </Typography>
        <BarChart
          dataset={dataset || []}
          series={[
            { dataKey: 'iniciada', label: 'INICIADAS', stack: 'stack', },
            { dataKey: 'finalizada', label: 'FINALIZADAS', stack: 'stack' },
          ]}
          height={height || 300}
          xAxis={[{ scaleType: 'band', dataKey: 'motorista', }]}
          borderRadius={5}

        />
      </Stack>
    </Paper>
  );
}