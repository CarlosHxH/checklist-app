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
import { Add, FileDownload } from '@mui/icons-material';

// Interface para configuração de colunas
export interface ColumnConfig<T> {
    key: keyof T | string;
    label: string;
    align?: 'left' | 'center' | 'right';
    render?: (row: T, onRefresh: () => void) => ReactNode;
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
                        {column.render ? column.render(row, onRefresh) : getNestedValue(row, column.key as string)}
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
    const totalPages = (rowsPerPages > 0) ? Math.ceil(filteredData.length / rowsPerPages) : 1;

    // Obter dados da página atual
    const paginatedData = (rowsPerPages > 0) ? filteredData.slice((page - 1) * rowsPerPages, page * rowsPerPages) : filteredData;

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


    function convertJSONToCSV(jsonData: any[]): string {
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            return "";
        }
        
        // Extract headers (keys from the first object)
        const headers = Object.keys(jsonData[0]);
        const csvRows: string[] = [];
        
        // Add header row
        csvRows.push(headers.join(';'));
        
        // Add data rows
        jsonData.forEach(item => {
            const values = headers.map(header => {
                let value = item[header];
                
                // Handle null, undefined, and non-string values
                if (value === null || value === undefined) {
                    return '';
                }
                
                // Convert to string if not already
                value = String(value);
                
                // Remove line breaks and escape values that contain semicolons or quotes
                value = value.replace(/(\r\n|\r|\n)/g, ' ');
                
                if (value.includes(';') || value.includes('"')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                
                return value;
            });
            csvRows.push(values.join(';'));
        });
    
        return csvRows.join('\n');
    }
    
    function downloadCSV(csvString: string, filename: string): void {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Clean up the URL object to prevent memory leaks
            URL.revokeObjectURL(url);
        }
    }

    // Função para exportar dados
    const handleExport = () => {
        if (!exportConfig?.enabled) return;
        const dataToExport = exportConfig.mapData ? filteredData.map(exportConfig.mapData): filteredData;
        const csvData = convertJSONToCSV(dataToExport);
        downloadCSV(csvData, "OS_" + new Date().toISOString().split("T")[0] + ".csv");
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
                <Toolbar sx={{ p: 0, width: "100%" }}>
                    <Grid container spacing={2} justifyContent={"end"}>
                        {searchConfig && (
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Buscar"
                                    size='small'
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder={searchConfig.placeholder || "Pesquisar..."}
                                    variant="outlined"
                                    slotProps={{
                                        input: {
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
                                    <FormControl key={filterConfig.key} size='small' fullWidth sx={{ minWidth: 120 }}>
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
                                        <Add /> {createConfig.buttonLabel || ""}
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
                                    <TableCell key={index} align={column.align || 'left'} style={{ width: column.width, fontWeight: 'bold' }}>
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
                                        onRefresh={onRefresh || (() => { })}
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
                                onChange={e => setRowsPerPage(Number(e.target.value))}
                            >
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={-1}>Todas</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

/*
  // Configuração das ações
  const actionsConfig: ActionConfig<OrderWithRelations> = {
    render: (row, onRefresh) => (
      <>
        <IconButton size="small" onClick={() => setSelectedOrder(row)}><Edit /></IconButton>
        <IconButton size="small" color='error' onClick={()=>onDelete(row.osNumber,onRefresh)}><Delete /></IconButton>
      </>
    )
  };
*/