'use client';
import React, { useState, useEffect, ReactNode } from 'react';
import {
  Box, Grid, Collapse, IconButton, Table, TableBody, Paper,
  TableCell, TableContainer, TableHead, TableRow, Typography,
  TextField, MenuItem, FormControl, InputLabel, Toolbar,
  Select, Stack, Pagination, InputAdornment, SelectChangeEvent,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Add, FileDownload } from '@mui/icons-material';

// Interface para configuração de colunas
export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: number;
  flex?: number | string;
}

// Interface para configuração de filtros
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'dateRange' | 'text';
  options?: { value: string; label: string }[];
  getOptionsFromData?: boolean;
}

// Interface para configuração de busca
export interface SearchConfig<T> {
  searchFields: (keyof T | string)[];
  placeholder?: string;
}

// Interface para configuração de ações
export interface ActionConfig<T> {
  render: (row: T, onRefresh: () => void) => ReactNode;
}

// Interface para detalhes expansíveis
export interface ExpandableConfig<T> {
  render: (row: T) => ReactNode;
}

// Interface para configuração de exportação
export interface ExportConfig<T> {
  enabled: boolean;
  filename?: string;
  mapData?: (row: T) => Record<string, any>;
}

// Interface principal para propriedades da tabela
export interface ReusableTableProps<T> {
  // Dados e carregamento
  data: T[];
  loading: boolean;
  onRefresh?: () => void;
  
  // Configuração da tabela
  title?: string;
  columns: ColumnConfig<T>[];
  keyField: keyof T;
  
  // Configuração de busca
  searchConfig?: SearchConfig<T>;
  
  // Configuração de filtros
  filtersConfig?: FilterConfig[];
  
  // Configuração de paginação
  rowsPerPage?: number;
  
  // Configuração de ações
  actionsConfig?: ActionConfig<T>;
  
  // Configuração de detalhes expansíveis
  expandableConfig?: ExpandableConfig<T>;
  
  // Configuração de exportação
  exportConfig?: ExportConfig<T>;
  
  // Configuração de criação
  createConfig?: {
    enabled: boolean;
    onCreateClick: () => void;
    buttonLabel?: string;
  };
  
  // Customização adicional
  customToolbarActions?: ReactNode;
  emptyMessage?: string;
}

// Função auxiliar para extrair valor aninhado de um objeto
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Componente de linha expansível
function CollapsibleRow<T>({ 
  row, 
  columns, 
  keyField, 
  expandableConfig, 
  actionsConfig, 
  onRefresh 
}: {
  row: T;
  columns: ColumnConfig<T>[];
  keyField: keyof T;
  expandableConfig?: ExpandableConfig<T>;
  actionsConfig?: ActionConfig<T>;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: 'inherit' }}>
        {expandableConfig && (
          <TableCell width={10}>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
        )}
        
        {columns.map((column, index) => (
          <TableCell key={index} align={column.align || 'left'} style={{ width: column.width }}>
            {column.render ? column.render(row) : getNestedValue(row, column.key as string)}
          </TableCell>
        ))}
        
        {actionsConfig && (
          <TableCell align="right">
            {actionsConfig.render(row, onRefresh)}
          </TableCell>
        )}
      </TableRow>

      {expandableConfig && (
        <TableRow>
          <TableCell 
            style={{ paddingBottom: 0, paddingTop: 0 }} 
            colSpan={columns.length + (actionsConfig ? 2 : 1)}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                {expandableConfig.render(row)}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

// Componente principal da tabela reutilizável
export default function ReusableTable<T>({
  data,
  loading,
  onRefresh,
  title,
  columns,
  keyField,
  searchConfig,
  filtersConfig,
  rowsPerPage = 10,
  actionsConfig,
  expandableConfig,
  exportConfig,
  createConfig,
  customToolbarActions,
  emptyMessage = "Nenhum registro encontrado"
}: ReusableTableProps<T>) {
  // Estados para paginação, busca e filtros
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [rowsPerPages, setRowsPerPage] = useState<number>(rowsPerPage)

  // Função para aplicar filtros e busca
  useEffect(() => {
    if (data.length > 0) {
      let result = [...data];

      // Aplicar busca
      if (searchTerm && searchConfig) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(row =>
          searchConfig.searchFields.some(field => {
            const value = getNestedValue(row, field as string);
            return String(value || "").toLowerCase().includes(searchLower);
          })
        );
      }

      // Aplicar filtros
      Object.entries(filters).forEach(([filterKey, filterValue]) => {
        if (filterValue && filterValue !== '') {
          const filterConfig = filtersConfig?.find(f => f.key === filterKey);
          
          if (filterConfig?.type === 'select') {
            result = result.filter(row => {
              const rowValue = getNestedValue(row, filterKey);
              return String(rowValue) === String(filterValue);
            });
          }
          
          // Adicione aqui outros tipos de filtros conforme necessário
        }
      });

      setFilteredData(result);
    } else {
      setFilteredData([]);
    }
  }, [searchTerm, filters, data, searchConfig, filtersConfig]);

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredData.length / (rowsPerPages>0?rowsPerPages:1));

  // Obter dados da página atual
  const paginatedData = filteredData.slice((page - 1) * (rowsPerPages>0?rowsPerPages:1), page * (rowsPerPages>0?rowsPerPages:1));
  
  // Manipuladores de eventos
  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
    setPage(1);
  };

  // Função para obter opções únicas para filtros
  const getUniqueOptions = (filterKey: string): string[] => {
    return Array.from(new Set(
      data.map(row => String(getNestedValue(row, filterKey)))
    )).filter(Boolean);
  };

  // Função para exportar dados
  const handleExport = () => {
    if (!exportConfig?.enabled) return;
    
    const dataToExport = exportConfig.mapData 
      ? filteredData.map(exportConfig.mapData)
      : filteredData;
    
    // Aqui você pode implementar a lógica de exportação
    // Por exemplo, usando uma biblioteca como react-json-to-csv
    console.log('Exporting data:', dataToExport);
  };

  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', p: 4 }}>
        <Typography>Carregando...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box boxShadow={'0 0 2px gray'} p={2}>
        {title && (
          <Typography variant='h4' sx={{ mb: 2 }}>
            {title}
          </Typography>
        )}
        
        {/* Barra de busca e filtros */}
        <Toolbar sx={{ p: 1, width: "100%" }}>
          <Grid container spacing={1} justifyContent={"end"}>
            {searchConfig && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Buscar"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={searchConfig.placeholder || "Pesquisar..."}
                  variant="outlined"
                  slotProps={{
                    input:{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={searchConfig ? 8 : 12}>
              <Stack sx={{ width: "100%" }} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Filtros dinâmicos */}
                {filtersConfig?.map((filterConfig) => (
                  <FormControl key={filterConfig.key} fullWidth sx={{ minWidth: 120 }}>
                    <InputLabel>{filterConfig.label}</InputLabel>
                    <Select
                      name={filterConfig.key}
                      value={filters[filterConfig.key] || ""}
                      label={filterConfig.label}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {filterConfig.getOptionsFromData ? 
                        getUniqueOptions(filterConfig.key).map(option => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))
                        :
                        filterConfig.options?.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                ))}

                {/* Botão de exportação */}
                {exportConfig?.enabled && (
                  <Button size='small' variant='outlined' onClick={handleExport}>
                    <FileDownload fontSize="small" />
                  </Button>
                )}

                {/* Botão de criação */}
                {createConfig?.enabled && (
                  <Button size='small' variant='contained' color='primary' onClick={createConfig.onCreateClick} >
                    <Add /> {createConfig.buttonLabel ||""}
                  </Button>
                )}

                {/* Ações customizadas */}
                {customToolbarActions}
              </Stack>
            </Grid>
          </Grid>
        </Toolbar>

        {/* Tabela */}
        <TableContainer>
          <Table aria-label="reusable table">
            <TableHead>
              <TableRow>
                {expandableConfig && <TableCell />}
                {columns.map((column, index) => (
                  <TableCell 
                    key={index} 
                    align={column.align || 'left'}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                {actionsConfig && <TableCell align="right">Ações</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <CollapsibleRow
                    key={String(row[keyField])}
                    row={row}
                    columns={columns}
                    keyField={keyField}
                    expandableConfig={expandableConfig}
                    actionsConfig={actionsConfig}
                    onRefresh={onRefresh || (() => {})}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (expandableConfig ? 1 : 0) + (actionsConfig ? 1 : 0)} 
                    align="center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginação */}
        {(
                
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>

            <Typography variant="body2" color="text.secondary">
                Mostrando {paginatedData.length} de {filteredData.length} registros
                {(searchTerm || Object.values(filters).some(v => v)) ? ' (filtrados)' : ''}
            </Typography>

            <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                showFirstButton
                showLastButton
            />
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="select-small-label">Paginas</InputLabel>
                <Select
                    labelId="select-small-label"
                    id="select-small"
                    value={rowsPerPages}
                    label="rowsPerPage"
                    onChange={e=>setRowsPerPage(Number(e.target.value))}
                >
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={-1}>Todas</MenuItem>
                </Select>
            </FormControl>
          </Box>
        )}

        {/* Indicador de resultados */}
        {/*<Box sx={{ p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {paginatedData.length} de {filteredData.length} registros
            {(searchTerm || Object.values(filters).some(v => v)) ? ' (filtrados)' : ''}
          </Typography>
        </Box>*/}
      </Box>
    </Paper>
  );
}