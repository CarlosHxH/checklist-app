'use client';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
  useTheme,
  TablePagination,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import useSWR from 'swr';
import Loading from '@/components/Loading';
import { fetcher } from '@/lib/ultils';
import { VehicleSchema } from './vehicle';
import { z } from 'zod';

type Vehicle = {
  make: string;
  model: string;
  year: number;
  eixo: number;
  plate: string;
  id: string;
};

const DefaultUser = {
  make: '',
  model: '',
  plate: '',
}
const DefaultForm = {
  make: '',
  model: '',
  year: 0,
  eixo: 0,
  plate: '',
  id: ''
}

export default function VehiclesTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: vehicles, error, mutate } = useSWR<Vehicle[]>('/api/vehicles', fetcher);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [withErros, setWithErros] = React.useState(false)

  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);

  // Filtros
  const [filters, setFilters] = React.useState(DefaultUser);

  // Paginação
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [formData, setFormData] = React.useState<Vehicle>(DefaultForm);

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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (vehicle: Vehicle | null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setSelectedVehicle(null);
      setFormData(DefaultForm);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVehicle(null);
    setFormData(DefaultForm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isValid = VehicleSchema.parse(formData);
      if (selectedVehicle) {
        const response = await fetch('/api/vehicles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: selectedVehicle.id }),
        });
        if (!response.ok) throw new Error('Failed to update vehicle');
        setErrors({});
      } else {
        const response = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to create vehicle');
      }
      setErrors({});
      mutate();
      handleCloseDialog();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, curr) => ({
          ...acc,
          [curr.path[0]]: curr.message
        }), {});
        setErrors(formattedErrors);
        console.log({ formattedErrors });
      }
    }
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

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5"></Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null)}
        >
          Adicionar veículo
        </Button>
      </Stack>

      {/* Filtros */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            name="make"
            label="Filtrar por fabricante"
            value={filters.make}
            onChange={handleFilterChange}
            size="small"
            fullWidth
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
                {!isMobile && <TableCell>{vehicle.eixo}</TableCell>}
                <TableCell>{vehicle.plate}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(vehicle)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(vehicle.id)}
                  >
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedVehicle ? 'Editar veículo' : 'Adicione um veículo novo'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                name="make"
                label="Fabricante"
                value={formData.make}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!errors.make}
                helperText={errors.make}
              />
              <TextField
                name="model"
                label="Modelo"
                value={formData.model}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!errors.model}
                helperText={errors.model}
              />
              <TextField
                name="year"
                label="Ano"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!errors.year}
                helperText={errors.year}
              />
              <TextField
                name="eixo"
                label="Eixo"
                type="number"
                value={formData.eixo}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!errors.eixo}
                helperText={errors.eixo}
              />
              <TextField
                name="plate"
                label="Placa"
                value={formData.plate}
                onChange={handleInputChange}
                required
                fullWidth
                error={!!errors.plate}
                helperText={errors.plate}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedVehicle ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}