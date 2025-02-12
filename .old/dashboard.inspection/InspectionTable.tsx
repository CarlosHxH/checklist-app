import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridEventListener, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { formatDate } from '@/utils';
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

// Define the type based on the provided object structure
type VehicleInspection = {
  id: string;
  userId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: string;
    plate: string;
  };
  start: {
    dataInspecao: string;
    status: string;
    kilometer: string;
    isFinished: boolean;
    crlvEmDia: boolean;
    certificadoTacografoEmDia: boolean;
    nivelAgua: string;
    nivelOleo: string;
    dianteira: string;
    tracao: string;
    truck: string;
    avariasCabine: string;
    bauPossuiAvarias: string;
    funcionamentoParteEletrica: string;
  };
  end: {
    dataInspecao: string;
    status: string;
    kilometer: string;
    isFinished: boolean;
  };
};

type InspectionTableProps = {
  data: VehicleInspection[];
};


function ExpandableRow({ row }: { row: VehicleInspection }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell><strong>Start Inspection Details</strong></TableCell>
            <TableCell><strong>End Inspection Details</strong></TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography>CRLV: {row.start.crlvEmDia}</Typography>
              <Typography>Tacógrafo: {row.start.certificadoTacografoEmDia}</Typography>
              <Typography>Água: {row.start.nivelAgua}</Typography>
              <Typography>Óleo: {row.start.nivelOleo}</Typography>
              <Typography>Dianteira: {row.start.dianteira}</Typography>
              <Typography>Tração: {row.start.tracao}</Typography>
              <Typography>Truck: {row.start.truck}</Typography>
              <Typography>Avarias Cabine: {row.start.avariasCabine}</Typography>
              <Typography>Avarias Baú: {row.start.bauPossuiAvarias}</Typography>
              <Typography>Parte Elétrica: {row.start.funcionamentoParteEletrica}</Typography>
            </TableCell>
            <TableCell>
              <Typography>Data Inspeção: {row.end.dataInspecao}</Typography>
              <Typography>Status: {row.end.status}</Typography>
              <Typography>Quilometragem: {row.end.kilometer}</Typography>
              <Typography>Finalizado: {row.end.isFinished ? 'Sim' : 'Não'}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const InspectionTable: React.FC<InspectionTableProps> = ({ data }) => {
  const [expandedRows, setExpandedRows] = React.useState<string[]>([]);

  const handleRowClick: GridEventListener<'rowClick'> = (params) => {
    const rowId = params.row.id;
    const isCurrentlyExpanded = expandedRows.includes(rowId);
    
    setExpandedRows(prevRows => 
      isCurrentlyExpanded 
        ? prevRows.filter(id => id !== rowId)
        : [...prevRows, rowId]
    );
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport slotProps={{ tooltip: { sx: { width: 100 } }, button: { sx: { width: 50 } } }} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2} alignItems={'center'}>
          <GridToolbarQuickFilter variant="outlined" size="small" />
        </Stack>
      </GridToolbarContainer>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'vehicleInfo',
      headerName: 'Vehicle',
      width: 200,
      valueGetter: (value, row) => {
        return `${row.vehicle.make} ${row.vehicle.model} (${row.vehicle.plate})`;
      }
    },
    {
      field: 'userName',
      headerName: 'User',
      width: 150,
      valueGetter: (value, row) => {
        return row.user.name;
      }
    },
    {
      field: 'startInspection',
      headerName: 'Start Inspection',
      width: 170,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row as VehicleInspection;
        if (record.start === null) {
          return <Typography color='error'>Pendente</Typography>
        }
        return (
          <div>
            <div>{formatDate(new Date(record.start.dataInspecao), 'yyyy-MM-dd HH:mm:ss')}</div>
            <div>Km: {record.start.kilometer}</div>
            <div>Status: {record.start.status}</div>
          </div>
        );
      }
    },
    {
      field: 'endInspection',
      headerName: 'End Inspection',
      width: 170,
      renderCell: (params: GridRenderCellParams) => {
        const record = params.row as VehicleInspection;
        if (record.end === null) {
          return <Typography color='error'>Pendente</Typography>
        }
        return (
          <div>
            <div>{formatDate(new Date(record.end.dataInspecao), 'yyyy-MM-dd HH:mm:ss')}</div>
            <div>Km: {record.end.kilometer}</div>
            <div>Status: {record.end.status}</div>
          </div>
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 170,
      valueFormatter: (value, row) => formatDate(new Date(value), 'yyyy-MM-dd HH:mm:ss')
    }
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 }
          }
        }}
        slots={{ toolbar: CustomToolbar }}
        localeText={{
          toolbarColumns: "",
          toolbarFilters: "",
          toolbarExport: "",
          toolbarDensity: ""
        }}
        density="standard"
        pageSizeOptions={[5, 10]}
        rowSelection={false}
        getRowHeight={() => 'auto'}
        rowHeight={52}
        getDetailPanelContent={({ row }) => (
          <Box sx={{ p: 2 }}>
            <ExpandableRow row={row as VehicleInspection} />
          </Box>
        )}
      />
    </div>
  );
};

export default InspectionTable;