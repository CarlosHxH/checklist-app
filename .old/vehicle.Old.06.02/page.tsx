'use client';
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, useMediaQuery,
  TableHead, TableRow, Paper, IconButton, Button,
  TextField, Stack, Typography, useTheme, TablePagination
} from '@mui/material';
import {Edit as EditIcon,Delete as DeleteIcon,Add as AddIcon,Search as SearchIcon } from '@mui/icons-material';
import useSWR from 'swr';
import Loading from '@/components/Loading';
import { fetcher } from '@/lib/ultils';
import VehicleModal, { vehicleFormData } from './Forms';
import { CSVExporter } from '@/utils';

const DefaulFilter = {
  make: '',
  model: '',
  plate: '',
}

export default function VehiclesTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: vehicles, error, mutate } = useSWR<vehicleFormData[]>('/api/vehicles', fetcher);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<vehicleFormData | null>(null);

  // Filtros
  const [filters, setFilters] = React.useState(DefaulFilter);
  // Paginação
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  // Função para filtrar veículos
  const filteredVehicles = React.useMemo(() => {
    if (!vehicles) return [];

    return vehicles.filter((vehicle) => {
      const makeMatch = vehicle.make.toLowerCase().includes(filters.make.toLowerCase());
      const modelMatch = vehicle.model.toLowerCase().includes(filters.model.toLowerCase());
      const plateMatch = vehicle.plate.toLowerCase().includes(filters.plate.toLowerCase());
      return makeMatch && modelMatch && plateMatch;
    });
  }, [vehicles, filters]);

  // Veículos paginados
  const paginatedVehicles = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredVehicles, page, rowsPerPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {setPage(newPage);};

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    try {
      const response = await fetch('/api/vehicles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      mutate();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  if (error) return <Typography color="error">Erro de carregamento de veículos</Typography>;
  if (!vehicles) return <Loading />;


  const k = (e: number) => ['DIANTEIRA', 'TRAÇÃO', 'TRUCK', 'Quarto Eixo'][--e]
  const eixoss = (vehicles: vehicleFormData[]) => {
    return vehicles.map(vehicle => ({ ...vehicle, eixo: k(Number(vehicle.eixo)) }))
  }

  const exportPdf = ()=>{
    const data = eixoss(paginatedVehicles)
    const newData = data.map(v => {
      const obj: { [key: string]: string } = {};
      obj['Fabricante'] = v?.make;
      obj['Modelo'] = v?.model;
      obj['Placa'] = v?.plate;
      obj['Eixos'] = v?.eixo;
      obj['ANO'] = v?.year;
      obj['Veiculo de base'] = v?.fixo?"SIM":"NÃO";
      obj['Tacografo'] = v?.tacografo?"SIM":"NÃO";
      return obj;
    })
    CSVExporter.exportToCSV(newData)
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={exportPdf}>Exportar csv</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
          Adicionar veículo
        </Button>
      </Stack>

      {/* Filtros */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField name="make" label="Filtrar por fabricante" value={filters.make} onChange={handleFilterChange} size="small" fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <TextField
            name="model"
            label="Filtrar por modelo"
            value={filters.model}
            onChange={handleFilterChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <TextField
            name="plate"
            label="Filtrar por placa"
            value={filters.plate}
            onChange={handleFilterChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fabricante</TableCell>
              <TableCell>Modelo</TableCell>
              {!isMobile && <TableCell>Ano</TableCell>}
              {!isMobile && <TableCell>eixo</TableCell>}
              <TableCell>Placa</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.make}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                {!isMobile && <TableCell>{vehicle.year}</TableCell>}
                {!isMobile && <TableCell>{k(Number(vehicle.eixo))}</TableCell>}
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => { setIsModalOpen(true); setSelected(vehicle) }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => vehicle.id && handleDelete(vehicle.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredVehicles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <VehicleModal
        isOpen={isModalOpen}
        data={selected}
        onClose={() => {
          setIsModalOpen(false);
          setSelected(null);
        }}
        onSubmit={async () => {mutate()}}
      />
    </Stack>
  );
}