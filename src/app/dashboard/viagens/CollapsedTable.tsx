'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Collapse, IconButton, Table, TableBody, Paper,
  TableCell, TableContainer, TableHead, TableRow, Typography,
  Chip, TextField, MenuItem, FormControl, InputLabel, Toolbar,
  Select, Stack, Pagination, InputAdornment, Grid, SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import Loading from '@/components/Loading';
import { Visibility } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Definição do tipo para os dados
interface VehicleInspection {
  id: string;
  userId: string;
  startId: string;
  endId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
  start: {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleKey: string | null;
    dataInspecao: string;
    status: string;
    crlvEmDia: string;
    certificadoTacografoEmDia: string;
    nivelAgua: string;
    nivelOleo: string;
    eixo: string;
    dianteira: string;
    descricaoDianteira: string;
    tracao: string;
    descricaoTracao: string;
    truck: string;
    descricaoTruck: string;
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
    avariasCabine: string;
    descricaoAvariasCabine: string | null;
    bauPossuiAvarias: string;
    descricaoAvariasBau: string | null;
    funcionamentoParteEletrica: string;
    descricaoParteEletrica: string | null;
    createdAt: string;
    updatedAt: string | null;
    kilometer: string;
    isFinished: boolean;
    extintor: string;
  };
  end: {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleKey: string | null;
    dataInspecao: string;
    status: string;
    crlvEmDia: string;
    certificadoTacografoEmDia: string;
    nivelAgua: string;
    nivelOleo: string;
    eixo: string;
    dianteira: string;
    descricaoDianteira: string;
    tracao: string;
    descricaoTracao: string;
    truck: string;
    descricaoTruck: string;
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
    avariasCabine: string;
    descricaoAvariasCabine: string | null;
    bauPossuiAvarias: string;
    descricaoAvariasBau: string | null;
    funcionamentoParteEletrica: string;
    descricaoParteEletrica: string | null;
    createdAt: string;
    updatedAt: string | null;
    kilometer: string;
    isFinished: boolean;
    extintor: string;
  };
  vehicle: {
    make: string;
    plate: string;
    model: string;
  }
}

// Tipos para os filtros
interface FilterOptions {
  status: string;
  responsavel: string;
  periodo: string;
}


// Componente de linha da tabela (Row)
function Row(props: { row: VehicleInspection }) {
  const router = useRouter();
  const { row } = props;
  const [open, setOpen] = useState(false);

  // Formatar a data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Diferença de quilometragem
  const kmDiff = row.end ? parseInt(row.end.kilometer) - parseInt(row.start.kilometer) : 0;

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.user.name}
        </TableCell>
        <TableCell component="th" scope="row">
          {row.vehicle.plate} - {row.vehicle.model}
        </TableCell>
        <TableCell align="right">
          <Typography sx={{ display: 'block' }} variant='caption'>
            {row?.start?.createdAt && 'Inicial: ' + formatDate(row.start.createdAt)}
          </Typography>
          <Typography color={row?.end ? 'textPrimary' : 'warning'} sx={{ display: 'block' }} variant='caption'>
            {row?.end?.createdAt ? 'Final: ' + formatDate(row.end.createdAt) : 'Em andamento'}
          </Typography>
        </TableCell>
        <TableCell align="right">{row?.start?.kilometer || 0} km</TableCell>
        <TableCell align="right">{row?.end?.kilometer || 0} km</TableCell>
        <TableCell align="right">
          <Chip
            label={kmDiff ? `+${kmDiff} km` : 'Em andamento'}
            color={kmDiff > 0 ? "success" : "warning"} size="small" />
        </TableCell>

        <TableCell align="right">
        <Box>
            <Tooltip title="Visualizar">
              <IconButton size="small" onClick={() => router.push(`/dashboard/viagens/${row.id}`)}>
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>

      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalhes da Viagem
              </Typography>

              <Box sx={{ display: 'flex', gap: 4, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Inicio da Viagem ({formatDate(row.start.dataInspecao)})
                  </Typography>
                  <Table size="small" aria-label="inspection-start">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CRLV</TableCell>
                        <TableCell>{row.start.crlvEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Certificado Tacógrafo</TableCell>
                        <TableCell>{row.start.certificadoTacografoEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Água</TableCell>
                        <TableCell>{row.start.nivelAgua}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Óleo</TableCell>
                        <TableCell>{row.start.nivelOleo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Dianteiros</TableCell>
                        <TableCell>{row.start.dianteira}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Tração</TableCell>
                        <TableCell>{row.start.tracao}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Truck</TableCell>
                        <TableCell>{row.start.truck}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Cabine</TableCell>
                        <TableCell>{row.start.avariasCabine}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Baú</TableCell>
                        <TableCell>{row.start.bauPossuiAvarias}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Parte Elétrica</TableCell>
                        <TableCell>{row.start.funcionamentoParteEletrica}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Extintor</TableCell>
                        <TableCell>{row.start.extintor}</TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </Box>

                {row?.end && <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Final da Viagem ({formatDate(row.end.dataInspecao)})
                  </Typography>
                  <Table size="small" aria-label="inspection-end">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CRLV</TableCell>
                        <TableCell>{row.end.crlvEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Certificado Tacógrafo</TableCell>
                        <TableCell>{row.end.certificadoTacografoEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Água</TableCell>
                        <TableCell>{row.end.nivelAgua}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Óleo</TableCell>
                        <TableCell>{row.end.nivelOleo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Dianteiros</TableCell>
                        <TableCell>{row.end.dianteira}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Tração</TableCell>
                        <TableCell>{row.end.tracao}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Truck</TableCell>
                        <TableCell>{row.end.truck}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Cabine</TableCell>
                        <TableCell>{row.end.avariasCabine}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Baú</TableCell>
                        <TableCell>{row.end.bauPossuiAvarias}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Parte Elétrica</TableCell>
                        <TableCell>{row.end.funcionamentoParteEletrica}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Extintor</TableCell>
                        <TableCell>{row.end.extintor}</TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </Box>}
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
  const { data: allRows, isLoading } = useSWR<VehicleInspection[]>('/api/dashboard/viagens', fetcher);
  // Estados para paginação, busca e filtros
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ status: '', responsavel: '', periodo: '' });

  // Estado para linhas filtradas
  const [filteredRows, setFilteredRows] = useState<VehicleInspection[]>(allRows || []);

  // Função para aplicar filtros e busca
  useEffect(() => {
    if (allRows) {
      let result = [...allRows];

      // Aplicar busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(row =>
          row.user.name.toLowerCase().includes(searchLower) ||
          row?.start?.kilometer.includes(searchTerm) ||
          row?.end?.kilometer.includes(searchTerm)
        );
      }

      // Aplicar filtros
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
        switch (filters.status) {
          case 'avarias':
            result = result.filter(row =>
              row?.start?.avariasCabine === 'SIM' ||
              row?.start?.bauPossuiAvarias === 'SIM' ||
              row?.end?.avariasCabine === 'SIM' ||
              row?.end?.bauPossuiAvarias === 'SIM'
            );
            break;
          case 'problemas':
            result = result.filter(row =>
              row?.start?.nivelAgua === 'BAIXO' ||
              row?.start?.nivelOleo === 'BAIXO' ||
              row?.end?.nivelAgua === 'BAIXO' ||
              row?.end?.nivelOleo === 'BAIXO'
            );
            break;
          default: break;
        }
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
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Resetar para primeira página após filtro
  };

  // Obter lista de responsáveis únicos para o filtro
  const responsaveis = Array.from(new Set(allRows && allRows.map(row => row.user.name)));

  if (isLoading || !allRows) return <Loading />;
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Barra de busca e filtros */}
      <Toolbar sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Pesquisar por responsável, KM..."
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

          <Grid item xs={12} md={8}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="responsavel-filter-label">Responsável</InputLabel>
                <Select
                  labelId="responsavel-filter-label"
                  name="responsavel"
                  value={filters.responsavel}
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
                <InputLabel id="periodo-filter-label">Período</InputLabel>
                <Select
                  labelId="periodo-filter-label"
                  name="periodo"
                  value={filters.periodo}
                  label="Período"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana">Últimos 7 dias</MenuItem>
                  <MenuItem value="mes">Último mês</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="avarias">Com avarias</MenuItem>
                  <MenuItem value="problemas">Com problemas</MenuItem>
                </Select>
              </FormControl>
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
              <TableCell>Responsável</TableCell>
              <TableCell>Veiculo</TableCell>
              <TableCell align="right">Data</TableCell>
              <TableCell align="right">KM Inicial</TableCell>
              <TableCell align="right">KM Final</TableCell>
              <TableCell align="right">Diferença</TableCell>
              <TableCell align="right">Opções</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <Row key={row.id} row={row} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
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
          {searchTerm || filters.responsavel || filters.periodo || filters.status ? ' (filtrados)' : ''}
        </Typography>
      </Box>
    </Paper>
  );
}
