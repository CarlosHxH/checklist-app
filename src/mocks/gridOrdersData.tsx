/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { GridCellParams, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

type SparkLineData = number[];

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('pt-BR', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function renderSparklineCell(params: GridCellParams<SparkLineData, any>) {
  const data = getDaysInMonth(4, 2024);
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        colors={['hsl(210, 98%, 42%)']}
        xAxis={{
          scaleType: 'band',
          data,
        }}
      />
    </div>
  );
}

function renderStatus(status: 'In Stock' | 'Out of Stock' | 'Low Stock') {
  const colors: { [index: string]: 'success' | 'error' | 'warning' } = {
    'In Stock': 'success',
    'Out of Stock': 'error',
    'Low Stock': 'warning',
  };

  return <Chip label={status} color={colors[status]} size="small" />;
}

export function renderAvatar(params: GridCellParams<{ name: string; color: string }, any, any>) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns: GridColDef[] = [
  { field: 'productName', headerName: 'Product Name', flex: 1.5, minWidth: 200 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 1,
    minWidth: 80,
    renderCell: (params) => renderStatus(params.value as any),
  },
  {
    field: 'totalOrders',
    headerName: 'Total Orders',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 80,
  },
  {
    field: 'revenue',
    headerName: 'Revenue',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'avgOrderValue',
    headerName: 'Avg Order Value',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'processingTime',
    headerName: 'Processing Time',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'dailyOrders',
    headerName: 'Daily Orders',
    flex: 1,
    minWidth: 150,
    renderCell: renderSparklineCell,
  },
];

export const rows: GridRowsProp = [
  {
    id: 1,
    productName: 'Premium Wireless Headphones',
    status: 'In Stock',
    totalOrders: 8345,
    revenue: '$212,423',
    avgOrderValue: '$185.50',
    processingTime: '2d 15h',
    dailyOrders: [
      65, 72, 68, 82, 75, 78, 88, 95, 89, 85, 92, 85, 88, 91, 87, 85, 89, 92, 95, 88, 85, 90, 92,
      89, 86, 88, 91, 94, 90, 87,
    ],
  },
  {
    id: 2,
    productName: 'Smart Fitness Watch',
    status: 'Low Stock',
    totalOrders: 12567,
    revenue: '$458,945',
    avgOrderValue: '$149.99',
    processingTime: '1d 8h',
    dailyOrders: [
      120, 115, 125, 118, 130, 128, 135, 142, 138, 145, 150, 148, 155, 160, 158, 165, 170, 168, 175,
      172, 178, 180, 176, 182, 185, 188, 192, 190, 195, 198,
    ],
  },
  {
    id: 3,
    productName: 'Organic Coffee Beans',
    status: 'In Stock',
    totalOrders: 25890,
    revenue: '$129,450',
    avgOrderValue: '$24.99',
    processingTime: '1d 2h',
    dailyOrders: [
      250, 245, 260, 255, 265, 270, 268, 275, 280, 278, 285, 290, 288, 295, 300, 298, 305, 310, 308,
      315, 320, 318, 325, 330, 328, 335, 340, 338, 345, 350,
    ],
  },
  {
    id: 4,
    productName: 'Gaming Laptop Pro',
    status: 'Out of Stock',
    totalOrders: 3456,
    revenue: '$4,147,200',
    avgOrderValue: '$1,199.99',
    processingTime: '3d 12h',
    dailyOrders: [
      35, 32, 38, 36, 40, 42, 39, 45, 43, 48, 46, 50, 48, 52, 50, 55, 53, 58, 56, 60, 58, 62, 60,
      65, 63, 68, 66, 70, 68, 72,
    ],
  },
  {
    id: 5,
    productName: 'Yoga Mat Premium',
    status: 'In Stock',
    totalOrders: 15678,
    revenue: '$548,730',
    avgOrderValue: '$34.99',
    processingTime: '1d 4h',
    dailyOrders: [
      155, 150, 160, 158, 165, 170, 168, 175, 172, 178, 180, 176, 182, 185, 188, 192, 190, 195, 198,
      200, 198, 205, 208, 210, 212, 215, 218, 220, 222, 225,
    ],
  },
];