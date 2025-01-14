"use client"
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';
import { getDaysInMonth } from '@/utils';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function SessionsChart() {
  const [data, setData ] = React.useState([
    {
      id: 'organic',
      label: 'Organic',
      showMark: false,
      curve: 'linear' as const,
      stack: 'total',
      stackOrder: 'ascending' as const,
      data: [
        1000, 1500, 1200, 1700, 1300, 2000, 2400, 2200, 2600, 2800, 2500, 3000, 3400, 3700,
        3200, 3900, 4100, 3500, 4300, 4500, 4000, 4700, 5000, 5200, 4800, 5400, 5600, 5900,
        6100, 6300,
      ],
      area: true,
    },
  ])
  const theme = useTheme();
  const month = getDaysInMonth();

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Sessões
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {0}
            </Typography>
            <Chip size="small" color="success" label="0%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sessões por dia dos últimos 30 dias
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point', data:month, tickInterval: (index, i) => (i + 1) % 5 === 0,
            },
          ]}
          series={data}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-organic': {
              fill: "url('#organic')",
            },
            '& .MuiAreaElement-series-referral': {
              fill: "url('#referral')",
            },
            '& .MuiAreaElement-series-direct': {
              fill: "url('#direct')",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          {[0].map((_q,i)=>(
            <AreaGradient key={i} color={theme.palette.primary.main} id="referral" />
          ))}
        </LineChart>
      </CardContent>
    </Card>
  );
}