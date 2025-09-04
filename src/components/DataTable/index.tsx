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

// Interface para configuração de filtros baseados em render
export interface RenderFilterConfig<T> {
    enabled: boolean;
    type?: 'select' | 'text' | 'multiSelect';
    getFilterValue?: (row: T, renderedValue: ReactNode) => string;
    getOptionsFromData?: boolean;
    options?: { value: string; label: string }[];
}

// Interface para configuração de colunas
export interface ColumnConfig<T> {
    key: keyof T | string;
    label: string;
    align?: 'left' | 'center' | 'right';
    render?: (row: T, onRefresh: () => void, value: string) => ReactNode;
    sortable?: boolean;
    width?: number;
    flex?: number | string;
    // Configuração para filtros baseados em render
    renderFilter?: RenderFilterConfig<T>;
}

// Interface para configuração de filtros customizados
export interface CustomFilterConfig<T> {
    key: string;
    label: string;
    component: (props: {
        value: any;
        onChange: (value: any) => void;
        data: T[];
        filteredData: T[];
    }) => ReactNode;
    applyFilter: (row: T, filterValue: any) => boolean;
    initialValue?: any;
}

// Interface para configuração de filtros padrão
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

    // Configuração de filtros padrão
    filtersConfig?: FilterConfig[];

    // Configuração de filtros customizados
    customFiltersConfig?: CustomFilterConfig<T>[];

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
                        {column.render ? column.render(row, onRefresh, getNestedValue(row, column.key as string)) : getNestedValue(row, column.key as string)}
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
    customFiltersConfig,
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
    const [customFilters, setCustomFilters] = useState<Record<string, any>>({});
    const [renderFilters, setRenderFilters] = useState<Record<string, any>>({});
    const [filteredData, setFilteredData] = useState<T[]>([]);
    const [rowsPerPages, setRowsPerPage] = useState<number>(rowsPerPage);

    // Inicializar valores dos filtros customizados
    useEffect(() => {
        if (customFiltersConfig) {
            const initialCustomFilters: Record<string, any> = {};
            customFiltersConfig.forEach(config => {
                initialCustomFilters[config.key] = config.initialValue ?? null;
            });
            setCustomFilters(initialCustomFilters);
        }
    }, [customFiltersConfig]);

    // Função para obter valor de filtro renderizado
    const getRenderFilterValue = (row: T, column: ColumnConfig<T>): string => {
        if (column.renderFilter?.getFilterValue) {
            const renderedValue = column.render ? 
                column.render(row, onRefresh || (() => {}), getNestedValue(row, column.key as string)) : 
                getNestedValue(row, column.key as string);
            return column.renderFilter.getFilterValue(row, renderedValue);
        }
        
        // Fallback: tentar extrair texto do ReactNode renderizado
        if (column.render) {
            const renderedValue = column.render(row, onRefresh || (() => {}), getNestedValue(row, column.key as string));
            if (typeof renderedValue === 'string' || typeof renderedValue === 'number') {
                return String(renderedValue);
            }
            // Para elementos React mais complexos, use o valor original
            return String(getNestedValue(row, column.key as string) || '');
        }
        
        return String(getNestedValue(row, column.key as string) || '');
    };

    // Função para obter opções únicas para filtros de render
    const getRenderFilterOptions = (column: ColumnConfig<T>): string[] => {
        return Array.from(new Set(
            data.map(row => getRenderFilterValue(row, column))
        )).filter(Boolean).sort();
    };

    // Função para obter opções únicas para filtros padrão
    const getUniqueOptions = (filterKey: string): string[] => {
        return Array.from(new Set(
            data.map(row => String(getNestedValue(row, filterKey)))
        )).filter(Boolean);
    };

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

            // Aplicar filtros padrão
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

            // Aplicar filtros customizados
            if (customFiltersConfig) {
                customFiltersConfig.forEach(customFilter => {
                    const filterValue = customFilters[customFilter.key];
                    if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
                        result = result.filter(row => 
                            customFilter.applyFilter(row, filterValue)
                        );
                    }
                });
            }

            // Aplicar filtros de render
            Object.entries(renderFilters).forEach(([columnKey, filterValue]) => {
                if (filterValue && filterValue !== '') {
                    const column = columns.find(col => (col.key as string) === columnKey);
                    if (column && column.renderFilter?.enabled) {
                        if (column.renderFilter.type === 'multiSelect') {
                            // Para múltipla seleção
                            if (Array.isArray(filterValue) && filterValue.length > 0) {
                                result = result.filter(row => {
                                    const rowValue = getRenderFilterValue(row, column);
                                    return filterValue.includes(rowValue);
                                });
                            }
                        } else {
                            // Para seleção simples ou texto
                            result = result.filter(row => {
                                const rowValue = getRenderFilterValue(row, column);
                                if (column.renderFilter?.type === 'text') {
                                    return rowValue.toLowerCase().includes(filterValue.toLowerCase());
                                }
                                return rowValue === filterValue;
                            });
                        }
                    }
                }
            });
            
            setFilteredData(result);
        } else {
            setFilteredData([]);
        }
    }, [searchTerm, filters, customFilters, renderFilters, data, searchConfig, filtersConfig, customFiltersConfig, columns, onRefresh]);

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

    const handleCustomFilterChange = (filterKey: string, value: any) => {
        setCustomFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
        setPage(1);
    };

    const handleRenderFilterChange = (columnKey: string, value: any) => {
        setRenderFilters(prev => ({
            ...prev,
            [columnKey]: value === '' ? undefined : value
        }));
        setPage(1);
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
                                {/* Filtros dinâmicos padrão */}
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

                                {/* Filtros customizados */}
                                {customFiltersConfig?.map((customFilterConfig) => (
                                    <Box key={customFilterConfig.key} sx={{ minWidth: 120 }}>
                                        {customFilterConfig.component({
                                            value: customFilters[customFilterConfig.key],
                                            onChange: (value) => handleCustomFilterChange(customFilterConfig.key, value),
                                            data: data,
                                            filteredData: filteredData
                                        })}
                                    </Box>
                                ))}

                                {/* Filtros de render das colunas */}
                                {columns
                                    .filter(column => column.renderFilter?.enabled)
                                    .map((column) => {
                                        const columnKey = column.key as string;
                                        const filterConfig = column.renderFilter!;
                                        
                                        if (filterConfig.type === 'text') {
                                            return (
                                                <TextField
                                                    key={columnKey}
                                                    size="small"
                                                    label={`${column.label}`}
                                                    value={renderFilters[columnKey] || ''}
                                                    onChange={(e) => handleRenderFilterChange(columnKey, e.target.value)}
                                                    sx={{ minWidth: 120 }}
                                                />
                                            );
                                        }
                                        
                                        if (filterConfig.type === 'multiSelect') {
                                            const options = filterConfig.getOptionsFromData ? 
                                                getRenderFilterOptions(column) : 
                                                (filterConfig.options?.map(opt => opt.value) || []);
                                                
                                            return (
                                                <FormControl key={columnKey} size="small" sx={{ minWidth: 150 }}>
                                                    <InputLabel>{column.label}</InputLabel>
                                                    <Select
                                                        multiple
                                                        value={renderFilters[columnKey] || []}
                                                        onChange={(e) => handleRenderFilterChange(columnKey, e.target.value)}
                                                        label={column.label}
                                                        renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : ''}
                                                    >
                                                        {options.map((option) => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            );
                                        }
                                        
                                        // Default: select simples
                                        const options = filterConfig.getOptionsFromData ? 
                                            getRenderFilterOptions(column) : 
                                            (filterConfig.options || []);
                                            
                                        return (
                                            <FormControl key={columnKey} size="small" sx={{ minWidth: 120 }}>
                                                <InputLabel>{column.label}</InputLabel>
                                                <Select
                                                    value={renderFilters[columnKey] || ""}
                                                    label={column.label}
                                                    onChange={(e) => handleRenderFilterChange(columnKey, e.target.value)}
                                                >
                                                    <MenuItem value="">Todos</MenuItem>
                                                    {options.map(option => {
                                                        const value = typeof option === 'string' ? option : option.value;
                                                        const label = typeof option === 'string' ? option : option.label;
                                                        return (
                                                            <MenuItem key={value} value={value}>
                                                                {label}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        );
                                    })
                                }

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Mostrando {paginatedData.length} de {filteredData.length} registros
                        {(searchTerm || 
                          Object.values(filters).some(v => v) || 
                          Object.values(customFilters).some(v => v !== null && v !== undefined && v !== '') ||
                          Object.values(renderFilters).some(v => v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
                        ) ? ' (filtrados)' : ''}
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
            </Box>
        </Paper>
    );
}

/*
// ==========================================
// EXEMPLOS DE USO COM FILTROS DE RENDER
// ==========================================

// Exemplo 1: Status com Chips coloridos
const statusColumn: ColumnConfig<VehicleInspection> = {
    key: 'status',
    label: 'Status',
    render: (row) => (
        <Chip 
            label={row.status.toUpperCase()} 
            color={row.status === 'approved' ? 'success' : 'warning'} 
        />
    ),
    renderFilter: {
        enabled: true,
        type: 'select',
        getOptionsFromData: true,
        getFilterValue: (row) => row.status
    }
};

// Exemplo 2: Data formatada com período
const inspectionDateColumn: ColumnConfig<VehicleInspection> = {
    key: 'inspectionDate',
    label: 'Data da Inspeção',
    render: (row) => new Date(row.inspectionDate).toLocaleDateString('pt-BR'),
    renderFilter: {
        enabled: true,
        type: 'select',
        options: [
            { value: 'today', label: 'Hoje' },
            { value: 'week', label: 'Esta semana' },
            { value: 'month', label: 'Este mês' },
            { value: 'older', label: 'Mais antigo' }
        ],
        getFilterValue: (row) => {
            const date = new Date(row.inspectionDate);
            const now = new Date();
            const diffDays = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
            
            if (diffDays <= 1) return 'today';
            if (diffDays <= 7) return 'week';
            if (diffDays <= 30) return 'month';
            return 'older';
        }
    }
};

// Exemplo 3: Valor com formatação monetária
const priceColumn: ColumnConfig<VehicleInspection> = {
    key: 'price',
    label: 'Preço',
    render: (row) => `R$ ${row.price.toFixed(2).replace('.', ',')}`,
    renderFilter: {
        enabled: true,
        type: 'select',
        options: [
            { value: 'low', label: 'Até R$ 100' },
            { value: 'medium', label: 'R$ 100 - R$ 500' },
            { value: 'high', label: 'Acima R$ 500' }
        ],
        getFilterValue: (row) => {
            if (row.price <= 100) return 'low';
            if (row.price <= 500) return 'medium';
            return 'high';
        }
    }
};

// Exemplo 4: Busca em texto customizado
const vehicleColumn: ColumnConfig<VehicleInspection> = {
    key: 'vehicle',
    label: 'Veículo',
    render: (row) => (
        <Box>
            <Typography variant="body2" fontWeight="bold">
                {row.vehicle.make} {row.vehicle.model}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {row.vehicle.plate}
            </Typography>
        </Box>
    ),
    renderFilter: {
        enabled: true,
        type: 'text',
        getFilterValue: (row) => `${row.vehicle.make} ${row.vehicle.model} ${row.vehicle.plate}`
    }
};

// Exemplo 5: Múltiplas tags/problemas encontrados
const issuesColumn: ColumnConfig<VehicleInspection> = {
    key: 'issues',
    label: 'Problemas',
    render: (row) => (
        <Stack direction="row" spacing={1} flexWrap="wrap">
            {row.issues.map((issue, index) => (
                <Chip 
                    key={index} 
                    label={issue} 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                />
            ))}
        </Stack>
    ),
    renderFilter: {
        enabled: true,
        type: 'multiSelect',
        getOptionsFromData: true,
        getFilterValue: (row) => row.issues.join(',')
    }
};

// Exemplo 6: Inspector com avatar e informações
const inspectorColumn: ColumnConfig<VehicleInspection> = {
    key: 'inspector',
    label: 'Inspetor',
    render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32 }}>
                {row.inspector.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Avatar>
            <Box>
                <Typography variant="body2" fontWeight="medium">
                    {row.inspector.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    ID: {row.inspector.id}
                </Typography>
            </Box>
        </Box>
    ),
    renderFilter: {
        enabled: true,
        type: 'select',
        getOptionsFromData: true,
        getFilterValue: (row) => row.inspector.name
    }
};

// Exemplo 7: Score/Nota com indicador visual
const scoreColumn: ColumnConfig<VehicleInspection> = {
    key: 'score',
    label: 'Pontuação',
    render: (row) => (
        <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress 
                variant="determinate" 
                value={row.score} 
                sx={{ 
                    width: 80, 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'grey.300',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: row.score >= 80 ? 'success.main' : 
                                       row.score >= 60 ? 'warning.main' : 'error.main'
                    }
                }} 
            />
            <Typography variant="body2" fontWeight="medium">
                {row.score}%
            </Typography>
        </Box>
    ),
    renderFilter: {
        enabled: true,
        type: 'select',
        options: [
            { value: 'excellent', label: 'Excelente (80-100%)' },
            { value: 'good', label: 'Bom (60-79%)' },
            { value: 'poor', label: 'Ruim (0-59%)' }
        ],
        getFilterValue: (row) => {
            if (row.score >= 80) return 'excellent';
            if (row.score >= 60) return 'good';
            return 'poor';
        }
    }
};

// Exemplo 8: Coluna com ações condicionais
const actionsColumn: ColumnConfig<VehicleInspection> = {
    key: 'actions',
    label: 'Ações Disponíveis',
    render: (row) => (
        <Stack direction="row" spacing={1}>
            {row.status === 'pending' && (
                <Chip label="Aprovar" color="success" size="small" />
            )}
            {row.status === 'approved' && (
                <Chip label="Certificado" color="info" size="small" />
            )}
            {row.issues.length > 0 && (
                <Chip label="Corrigir" color="warning" size="small" />
            )}
        </Stack>
    ),
    renderFilter: {
        enabled: true,
        type: 'multiSelect',
        options: [
            { value: 'can_approve', label: 'Pode Aprovar' },
            { value: 'has_certificate', label: 'Tem Certificado' },
            { value: 'needs_correction', label: 'Precisa Correção' }
        ],
        getFilterValue: (row) => {
            const actions = [];
            if (row.status === 'pending') actions.push('can_approve');
            if (row.status === 'approved') actions.push('has_certificate');
            if (row.issues.length > 0) actions.push('needs_correction');
            return actions.join(',');
        }
    }
};

// ==========================================
// COMO USAR NO COMPONENTE
// ==========================================

const columns: ColumnConfig<VehicleInspection>[] = [
    statusColumn,
    inspectionDateColumn,
    vehicleColumn,
    inspectorColumn,
    scoreColumn,
    issuesColumn,
    priceColumn,
    actionsColumn
];

// Uso no componente:
<ReusableTable
    data={vehicleInspections}
    loading={loading}
    columns={columns}
    keyField="id"
    title="Inspeções Veiculares"
    searchConfig={{
        searchFields: ['vehicle.plate', 'vehicle.make', 'vehicle.model', 'inspector.name'],
        placeholder: "Buscar por placa, modelo ou inspetor..."
    }}
    exportConfig={{
        enabled: true,
        filename: "inspecoes_veiculares.csv",
        mapData: (row) => ({
            id: row.id,
            status: row.status,
            data: new Date(row.inspectionDate).toLocaleDateString('pt-BR'),
            veiculo: `${row.vehicle.make} ${row.vehicle.model}`,
            placa: row.vehicle.plate,
            inspetor: row.inspector.name,
            pontuacao: row.score,
            problemas: row.issues.join('; '),
            preco: row.price
        })
    }}
    createConfig={{
        enabled: true,
        onCreateClick: () => setOpenCreateDialog(true),
        buttonLabel: "Nova Inspeção"
    }}
    onRefresh={refreshData}
/>

// ==========================================
// INTERFACES DE EXEMPLO
// ==========================================

interface VehicleInspection {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    inspectionDate: string;
    vehicle: {
        make: string;
        model: string;
        plate: string;
        year: number;
    };
    inspector: {
        id: string;
        name: string;
        certification: string;
    };
    score: number;
    issues: string[];
    price: number;
    createdAt: string;
    updatedAt: string;
}
*/