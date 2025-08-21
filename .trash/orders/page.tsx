'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Collapse, IconButton, Table, TableBody, Paper,
  TableCell, TableContainer, TableHead, TableRow, Typography,
  TextField, MenuItem, FormControl, InputLabel, Toolbar,
  Select, Stack, Pagination, InputAdornment, SelectChangeEvent,
  Tooltip,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Loading from '@/components/Loading';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { getOrders, OrderWithRelations } from './action';
import formatDate from '@/lib/formatDate';
import { dateDiff } from '@/lib/ultils';

// Define proper filter interface
interface Filters {
  responsavel?: string;
  placa?: string;
  periodo?: string;
  status?: string;
}

// Componente de linha da tabela (Row)
function Row(props: { row: OrderWithRelations, mutate: () => void }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: 'inherit' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">#{String(row.id).padStart(5, '0')}</TableCell>
        <TableCell component="th" scope="row">{row.user.name}</TableCell>
        <TableCell component="th" scope="row">{row.vehicle.plate} - {row.vehicle.model}</TableCell>
        <TableCell align="right">{formatDate(row.entryDate)}</TableCell>
        <TableCell align="right">{row?.completionDate ? formatDate(row?.completionDate) : "N/A"}</TableCell>
        <TableCell align="right">{dateDiff(row.entryDate, row.completionDate)}</TableCell>
        <TableCell align="right">{row.isCompleted ? "FINALIZADO" : "EM MANUTENÇÃO"}</TableCell>
        <TableCell align="right">
          <IconButton size="small" onClick={() => { }}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={() => { }}>
            <Visibility />
          </IconButton>
          <IconButton size="small" color='error' onClick={() => { }}>
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell variant='footer' style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box sx={{ display: 'flex', gap: 4, mb: 2, flexDirection: 'column' }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Detalhes da ordem de serviço
                  </Typography>
                  <Table size="small" aria-label="inspection-start">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo de manutenção</TableCell>
                        <TableCell>Centro de manutenção</TableCell>
                        <TableCell>Oficina</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{row.maintenanceType}</TableCell>
                        <TableCell>{row.maintenanceCenter.name}</TableCell>
                        <TableCell>{row.destination}</TableCell>
                        <TableCell>{row.isCompleted ? 'Finalizado' : 'Em andamento'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography>Descrição do serviço:</Typography>
                          <Typography variant='subtitle1'>{row.serviceDescriptions}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Componente principal da tabela
export default function CollapsibleTable() {
  const [allRows, setRows] = useState<OrderWithRelations[]>([]);
  const [isLoading, setLoading] = useState(true);
  // Estados para paginação, busca e filtros
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  // Estado para linhas filtradas
  const [filteredRows, setFilteredRows] = useState<OrderWithRelations[]>([]);

  const mutate = () => { }

  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      try {
        const orders = await getOrders();
        if (orders) {
          setRows(orders);
          setFilteredRows(orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, []);

  // Função para aplicar filtros e busca
  useEffect(() => {
    if (allRows.length > 0) {
      let result = [...allRows];

      // Aplicar busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(row =>
          (row.user?.name?.toLowerCase() || "").includes(searchLower) ||
          (row?.vehicle?.model?.toLowerCase() || "").includes(searchLower) ||
          (row?.vehicle?.plate?.toLowerCase() || "").includes(searchLower)
        );
      }

      // Aplicar filtros
      if (filters.placa) {
        result = result.filter(row => row.vehicle.plate === filters.placa);
      }

      if (filters.responsavel) {
        result = result.filter(row => row.user.name === filters.responsavel);
      }

      if (filters.periodo) {
        const today = new Date();
        const filterDate = new Date();

        switch (filters.periodo) {
          case 'hoje':
            result = result.filter(row => new Date(row.createdAt).toDateString() === today.toDateString());
            break;
          case 'semana':
            filterDate.setDate(today.getDate() - 7);
            result = result.filter(row => new Date(row.createdAt) >= filterDate);
            break;
          case 'mes':
            filterDate.setMonth(today.getMonth() - 1);
            result = result.filter(row => new Date(row.createdAt) >= filterDate);
            break;
          default:
            break;
        }
      }

      if (filters.status) {
        const isCompleted = filters.status === 'true';
        result = result.filter(row => row.isCompleted === isCompleted);
      }

      setFilteredRows(result);
    }
  }, [searchTerm, filters, allRows]);

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  // Obter linhas da página atual
  const paginatedRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Manipuladores de eventos
  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Resetar para primeira página após busca
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
    setPage(1);
  };

  // Obter lista de responsáveis únicos para o filtro
  const responsaveis = Array.from(new Set(allRows.map(row => row.user.name))).filter(Boolean);
  const placas = Array.from(new Set(allRows.map(row => row.vehicle.plate))).filter(Boolean);

  if (isLoading) return <Loading />;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Barra de busca e filtros */}
      <Toolbar sx={{ p: 2, width: "100%" }}>
        <Grid container spacing={2} justifyContent={"end"}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Pesquisar por responsável, Veículo..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack sx={{ width: "100%" }} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth sx={{ minWidth: 140 }}>
                <InputLabel id="responsavel-filter-label">Responsável</InputLabel>
                <Select fullWidth
                  labelId="responsavel-filter-label"
                  name="responsavel"
                  value={filters.responsavel || ""}
                  label="Responsável"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {responsaveis.map(resp => (
                    <MenuItem key={resp} value={resp}>{resp}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ minWidth: 120 }}>
                <InputLabel id="placa-filter-label">Placa</InputLabel>
                <Select
                  labelId="placa-filter-label"
                  name="placa"
                  value={filters.placa || ""}
                  label="Placa"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {placas.map(placa => (
                    <MenuItem key={placa} value={placa}>{placa}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="periodo-filter-label">Período</InputLabel>
                <Select
                  labelId="periodo-filter-label"
                  name="periodo"
                  value={filters.periodo || ""}
                  label="Período"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Últimos 7 dias</MenuItem>
                  <MenuItem value="mes">Último mês</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  name="status"
                  value={filters.status || ""}
                  label="Status"
                  onChange={handleFilterChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">FINALIZADO</MenuItem>
                  <MenuItem value="false">EM MANUTENÇÃO</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                sx={{ minWidth: 90 }}
                size='small'
                variant='contained'
                color='primary'
                onClick={() => console.log(filteredRows)}
              >
                Exportar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Toolbar>

      {/* Tabela */}
      <TableContainer>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>OS</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell align="right">Data INÍCIO</TableCell>
              <TableCell align="right">Data FINAL</TableCell>
              <TableCell align="right">Tempo Parado</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Opções</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <Row key={row.id} row={row} mutate={mutate} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Indicador de resultados */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {paginatedRows.length} de {filteredRows.length} registros
          {searchTerm || filters.responsavel || filters.placa || filters.status ? ' (filtrados)' : ''}
        </Typography>
      </Box>
    </Paper>
  );
}