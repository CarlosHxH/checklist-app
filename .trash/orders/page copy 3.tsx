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
import { Visibility } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getOrders, OrderWithRelations } from './action';
import formatDate from '@/lib/formatDate';
import { dateDiff } from '@/lib/ultils';

// Componente de linha da tabela (Row)
function Row(props: { row: OrderWithRelations, mutate: () => void }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: true ? 'inherit' : '#f5f5f5' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
        </TableCell>
        <TableCell component="th" scope="row">#{String(row.id).padStart(5, '0')}</TableCell>
        <TableCell component="th" scope="row">{row.user.name}</TableCell>
        <TableCell component="th" scope="row">{row.vehicle.plate} - {row.vehicle.model}</TableCell>
        <TableCell align="right">{formatDate(row.entryDate)}</TableCell>
        <TableCell align="right">{row?.completionDate ? formatDate(row?.completionDate) : "N/A"}</TableCell>
        <TableCell align="right">{dateDiff(row.entryDate, row.completionDate)}</TableCell>
        <TableCell align="right">{row.isCompleted ? "FINALIZADO" : "EM MANUTENÇÃO"}</TableCell>
        <TableCell align="right">
          <Tooltip title="Visualizar">
            <IconButton size="small" onClick={() =>{}}>
              <Visibility />
            </IconButton>
          </Tooltip>
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
                        <TableCell>Tipo de manuteçao</TableCell>
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
                        <TableCell>{row.isCompleted}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={8}>
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
  const [allRows, setRows] = useState<OrderWithRelations[]>();
  const [isLoading, setLoading] = useState(true);
  // Estados para paginação, busca e filtros
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<OrderWithRelations>();
  // Estado para linhas filtradas
  const [filteredRows, setFilteredRows] = useState<OrderWithRelations[]>(allRows || []);

  const mutate = () => { }

  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      try {
        const orders = await getOrders();
        if (orders) {
          setRows(orders);
          setFilteredRows(orders)
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
      if (allRows) {
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
        if (filters?.vehicle.plate) {
          result = result.filter(row => row.vehicle.plate === filters.vehicle.plate);
        }
        // Aplicar filtros
        if (filters?.user.name) {
          result = result.filter(row => row.user.name === filters.user.name);
        }
  
        if (filters?.entryDate) {
          const today = new Date();
          const filterDate = new Date();
  
          switch (filters.entryDate) {
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
  
        if (filters?.isCompleted !== undefined) {
          result = result.filter(row => {
            if (filters.isCompleted === true) {
              return row.isCompleted === true;
            } else if (filters.isCompleted === false) {
              return row.isCompleted === false;
            }
            return true;
          });
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

  const handleFilterChange = (event: SelectChangeEvent<string|boolean|number>) => {
    const { name, value } = event.target;
    setFilters(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
    setPage(1);
  };

  // Obter lista de responsáveis únicos para o filtro
  const responsaveis = Array.from(new Set(allRows && allRows.map(row => row.user.name)));
  const placas = Array.from(new Set(allRows && allRows.map(row => row.vehicle.plate)));

  if (isLoading || !allRows) return <Loading />;
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Barra de busca e filtros */}
      <Toolbar sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Pesquisar por responsável, Veiculo..."
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
          <Grid size={{ xs: 12, sm: 8 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel id="responsavel-filter-label">Responsável</InputLabel>
                <Select
                  labelId="responsavel-filter-label"
                  name="responsavel"
                  value={filters?.user.name||""}
                  label="Responsável"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {responsaveis.map(resp => (
                    <MenuItem key={resp} value={resp}>{resp}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="responsavel-filter-label">Placa</InputLabel>
                <Select
                  labelId="responsavel-filter-label"
                  name="placa"
                  value={filters?.vehicle.plate||""}
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
                  value={filters?.entryDate}
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
                  value={filters?.isCompleted}
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
              <Button fullWidth sx={{ minWidth: 90 }} variant='contained' color='primary' onClick={() => console.log(filteredRows)/*CSVExporter.export(filteredRows)*/}>
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
              <TableCell>Veiculo</TableCell>
              <TableCell align="right">Data INICIO</TableCell>
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
          {searchTerm || filters?.user.name || filters?.vehicle.plate || filters?.isCompleted ? ' (filtrados)' : ''}
        </Typography>
      </Box>
    </Paper>
  );
}
