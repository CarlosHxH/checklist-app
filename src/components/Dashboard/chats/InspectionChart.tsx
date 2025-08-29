import { Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { InspectionChartData } from './inspectionService';

type Props = {
  data: InspectionChartData[];
  label: string;
  color?: string;
};

export default function InspectionChart({ data, label, color }: Props) {
  // Corrigindo o formato dos dados para o MUI X Charts
  const xLabels = data.map(item => new Date(item.date).toLocaleString().slice(0,5))
  const seriesData = data.map(item => item.count);
  return (
    <Box height={300}>
      <LineChart
        xAxis={[
          {
            data: xLabels,
            scaleType: 'band',
            label: 'Data',
          },
        ]}
        series={[
          {
            data: seriesData,
            label: label,
            color: color||'#8884d8',
          }
        ]}
        margin={{ top: 20, right: 30, bottom: 20, left: 40 }}
        slotProps={{ legend: { hidden: true } }}
      />
    </Box>
  );
}