'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Collapse, IconButton, Table, TableBody, Paper,
  TableCell, TableContainer, TableHead, TableRow, Typography,
  TextField, MenuItem, FormControl, InputLabel, Toolbar,
  Select, Stack, Pagination, InputAdornment, Grid, SelectChangeEvent,
  Tooltip,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import useSWR from 'swr';
import { fetcher, formatDate } from '@/lib/ultils';
import Loading from '@/components/Loading';
import { Delete, FileDownload, Visibility } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import StatusUpdateModal from './Modal';
import { useInspectionUpdate } from '@/hooks/useInspectionUpdate';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { handlerDelete } from './handlerDelete';
import { Inspect, inspection, user, vehicle } from '@prisma/client';

interface inspect {
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
}
// Definição do tipo para os dados
type VehicleInspection = Inspect & {
  start: inspection;
  end: inspection;
  vehicle: Partial<vehicle>;
  user: user;
}
/*{
  id: string;
  userId: string;
  startId: string;
  endId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  user: { name: string; };
  start: inspect;
  end: inspect;
  vehicle: {
    make: string;
    plate: string;
    model: string;
  }
}*/

// Tipos para os filtros
interface FilterOptions {
  status: string;
  responsavel: string;
  periodo: string;
  placa: string;
}

// Componente de linha da tabela (Row)
function Row(props: { row: VehicleInspection, mutate: () => void }) {
  const router = useRouter();
  const { row } = props;
  const [open, setOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  // Use our custom hook
  const { updateStatus, loading } = useInspectionUpdate(row.id, {
    onSuccess: () => {
      alert('Status atualizado com sucesso!');
      setModalOpen(false);
    },
    onError: (error: any) => {
      alert(error.message || 'Erro ao atualizar status');
      setModalOpen(false);
    }
  });


  // Check if there are any issues to fix
  const hasIssues = () => {

    const startIssues = row?.start && (
      row.start.nivelAgua != 'NORMAL' ||
      row.start.nivelOleo != 'NORMAL' ||
      row.start.avariasCabine === 'SIM' ||
      row.start.bauPossuiAvarias === 'SIM' ||
      row.start.funcionamentoParteEletrica === 'RUIM' ||

      row?.start?.dianteira === 'RUIM' ||
      row?.start?.tracao === 'RUIM' ||
      row?.start?.truck === 'RUIM' ||
      row?.start?.quartoEixo === 'RUIM'
    );

    const endIssues = row?.end && (
      row.end.nivelAgua != 'NORMAL' ||
      row.end.nivelOleo != 'NORMAL' ||
      row.end.avariasCabine === 'SIM' ||
      row.end.bauPossuiAvarias === 'SIM' ||
      row.end.funcionamentoParteEletrica === 'RUIM' ||

      row?.end?.dianteira === 'RUIM' ||
      row?.end?.tracao === 'RUIM' ||
      row?.end?.truck === 'RUIM' ||
      row?.end?.quartoEixo === 'RUIM'
    );

    return startIssues || endIssues;
  };

  async function onHandlerDelete(id: string) {
    if (window.confirm('Tem certeza que deseja excluir esta Viagem?')) {
      const result = await handlerDelete(id);
      if (result.success) {
        alert('Viagem deletada com sucesso!');
      } else {
        if (result.error === 'NOT_FOUND') {
          alert('Viagem não encontrada ou já deletada.');
        } else if (result.error === 'CONFLICT') {
          alert('Não é possível deletar esta viagem, pois existem dependências.');
        } else if (result.error === 'NETWORK_ERROR') {
          alert('Erro de conexão. Verifique sua internet e tente novamente.');
        }
        else {
          alert(`Erro ao deletar viagem: ${result.message}`);
        }
      }
      props.mutate();
    }
  }

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: !!row?.endId ? 'inherit' : '#f5f5f5' }}>
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
          <Typography variant='subtitle2'>{row.vehicle.plate}</Typography>
          <Typography variant='subtitle2'>{row.vehicle.model}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography>
            {row?.start?.createdAt && formatDate(row.start.createdAt.toString())}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography color={row?.end ? 'textPrimary' : 'warning'}>
            {row?.end?.createdAt ? formatDate(row?.end?.createdAt.toString()) : 'Em andamento'}
          </Typography>
        </TableCell>
        <TableCell align="right">{row?.start?.kilometer || 0} km</TableCell>
        <TableCell align="right">{row?.end?.kilometer || 0} km</TableCell>
        <TableCell align="right">
          <Box>
            <Tooltip title="Visualizar">
              <IconButton size="small" onClick={() => router.push(`/dashboard/viagens/${row.id}`)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            {hasIssues() && (
              <Tooltip title="Corrigir Problemas/Avarias">
                <IconButton
                  size="small"
                  onClick={() => setModalOpen(true)}
                  color="warning"
                >
                  <ReportProblemIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Atualizar Status">
              <IconButton size="small" color='error' onClick={() => onHandlerDelete(row.id)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>Detalhes da Viagem</Typography>
              <Box sx={{ display: 'flex', gap: 4, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                {[row.start, ...(row?.end ? [row.end] : [])].map((item,index) => (
                  <Box key={index} flex={1}>
                    <Typography variant="subtitle1" fontWeight={"bold"} gutterBottom>
                      {index===0?"Inicio da Viagem:":"Final da Viagem:"} {item?.dataInspecao ? formatDate(item.dataInspecao.toString()) : 'Data não disponível'}
                    </Typography>
                    <Table size="small" aria-label="inspection-start">
                      <TableBody>
                        <TableRow>
                          <TableCell>CRLV</TableCell>
                          <TableCell>{item?.crlvEmDia || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Certificado Tacógrafo</TableCell>
                          <TableCell>{item?.certificadoTacografoEmDia || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nível de Água</TableCell>
                          <TableCell>{item?.nivelAgua || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nível de Óleo</TableCell>
                          <TableCell>{item?.nivelOleo || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Pneus Dianteiros</TableCell>
                          <TableCell>{item?.dianteira || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Pneus Tração</TableCell>
                          <TableCell>{item?.tracao || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Truck</TableCell>
                          <TableCell>{item?.truck || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Avarias Cabine</TableCell>
                          <TableCell>{row?.start?.avariasCabine || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Avarias Baú</TableCell>
                          <TableCell>{item?.bauPossuiAvarias || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Parte Elétrica</TableCell>
                          <TableCell>{item?.funcionamentoParteEletrica || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Extintor</TableCell>
                          <TableCell>{item?.extintor || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>))}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <StatusUpdateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        inspectionData={row}
        onSave={updateStatus}
        loading={loading}
      />
    </React.Fragment>
  );
}

// Componente principal da tabela
export default function CollapsibleTable() {
  const { data: allRows, isLoading, mutate } = useSWR<VehicleInspection[]>('/api/v1/dashboard/viagens', fetcher);
  // Estados para paginação, busca e filtros
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ status: '', responsavel: '', periodo: '', placa: '' });

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
          (row.user?.name?.toLowerCase() || "").includes(searchLower) ||
          (String(row?.start?.kilometer || "")).toLowerCase().includes(searchLower) ||
          (String(row?.end?.kilometer || "")).toLowerCase().includes(searchLower) ||
          (row?.vehicle?.model?.toLowerCase() || "").includes(searchLower) ||
          (row?.vehicle?.plate?.toLowerCase() || "").includes(searchLower)
        );
      }

      // Aplicar filtros
      if (filters.placa) {
        result = result.filter(row => row.vehicle.plate === filters.placa);
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
  const placas = Array.from(new Set(allRows && allRows.map(row => row.vehicle.plate)));

  if (isLoading || !allRows) return <Loading />;
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Barra de busca e filtros */}
      <Toolbar sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size='small'
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
          <Grid item xs={12} md={8}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl size='small' sx={{ flex: 1 }}>
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

              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel id="responsavel-filter-label">Placa</InputLabel>
                <Select
                  labelId="responsavel-filter-label"
                  name="placa"
                  value={filters.placa}
                  label="Placa"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {placas.map(placa => (
                    <MenuItem key={placa} value={placa}>{placa}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size='small' sx={{ minWidth: 120 }}>
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

              <FormControl size='small' sx={{ minWidth: 100 }}>
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
              <Button variant='contained' color='primary' onClick={() => console.log(filteredRows)/*CSVExporter.export(filteredRows)*/}>
                <FileDownload />
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
              <TableCell>Responsável</TableCell>
              <TableCell>Veiculo</TableCell>
              <TableCell align="right">Data INICIO</TableCell>
              <TableCell align="right">Data FINAL</TableCell>
              <TableCell align="right">KM Inicial</TableCell>
              <TableCell align="right">KM Final</TableCell>
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
