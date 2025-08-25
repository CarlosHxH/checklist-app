"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlotProps,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  GridFilterListIcon,
  ToolbarButton,
  Toolbar,
  GridViewColumnIcon,
  ExportCsv,
  QuickFilter,
  QuickFilterTrigger,
  QuickFilterControl,
  QuickFilterClear
} from '@mui/x-data-grid';
import { getOrders, MaintenanceCenter, OrderWithRelations, typesReturnsOrders } from './actions';
import { user, vehicle } from '@prisma/client';
import { dateDiff } from '@/lib/ultils';
import { InputAdornment, styled, TextField, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
  }
}

// Tipo para uma nova linha temporária
type NewOrderRow = Partial<OrderWithRelations> & {
  id: string | number;
  isNew?: boolean;
};

function EditToolbar(props: GridSlotProps['toolbar']) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    // Gera um ID temporário único para a nova linha
    const id = `new-${Date.now()}`;
    
    // Cria uma nova linha vazia com valores padrão
    const newRow: NewOrderRow = {
      id,
      usuario: '',
      veiculo: '',
      centroManutencao: '',
      entryDate: new Date().toISOString().split('T')[0], // Data atual como padrão
      completionDate: '',
      maintenanceType: 'PREVENTIVA',
      destination: '',
      serviceDescriptions: '',
      isNew: true,
    };

    // Adiciona a nova linha ao topo da lista
    setRows((oldRows) => [newRow as OrderWithRelations, ...oldRows]);
    
    // Define a nova linha em modo de edição
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'usuario' },
    }));
  };

  const StyledQuickFilter = styled(QuickFilter)({
    display: 'grid',
    alignItems: 'center',
  });

  type OwnerState = {
    expanded: boolean;
  };
  
  const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
    ({ theme, ownerState }) => ({
      gridArea: '1 / 1',
      width: 'min-content',
      height: 'min-content',
      zIndex: 1,
      opacity: ownerState.expanded ? 0 : 1,
      pointerEvents: ownerState.expanded ? 'none' : 'auto',
      transition: theme.transitions.create(['opacity']),
    }),
  );
  
  const StyledTextField = styled(TextField)<{
    ownerState: OwnerState;
  }>(({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 260 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
      <Typography fontSize={28} fontWeight={"bold"}>Ordem de Serviços</Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Toolbar>
        <Tooltip title="Adicionar nova ordem de serviço">
          <IconButton onClick={handleClick}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Columns">
          <ColumnsPanelTrigger render={<ToolbarButton />}>
            <GridViewColumnIcon fontSize="small" />
          </ColumnsPanelTrigger>
        </Tooltip>
        <Tooltip title="Filters">
          <FilterPanelTrigger render={<ToolbarButton />}>
            <GridFilterListIcon fontSize="small" />
          </FilterPanelTrigger>
        </Tooltip>
        <Tooltip title="Export">
          <ExportCsv render={<ToolbarButton />}>
            <FileDownloadIcon fontSize="small" />
          </ExportCsv>
        </Tooltip>

        <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Search" enterDelay={0}>
              <StyledToolbarButton
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledToolbarButton>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledTextField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Search"
              placeholder="Search..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Clear search"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>

      </Toolbar>
    </Box>
  );
}

export default function FullFeaturedCrudGrid() {
  const [data, setData] = React.useState<typesReturnsOrders>();
  const [rows, setRows] = React.useState<OrderWithRelations[]>([]);
  const [users, setUsers] = React.useState<user[]>([]);
  const [vehicle, setVehicles] = React.useState<vehicle[]>([]);
  const [maintenanceCenter, setMaintenanceCenter] = React.useState<MaintenanceCenter[]>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [loading, setLoading] = React.useState(false);

  const setup = async () => {
    if (rows.length === 0) {
      setLoading(true);
    }
    try {
      const dataApi = await getOrders();
      if (dataApi) {
        setData(dataApi);
        setRows(dataApi.orders);
        setUsers(dataApi.users);
        setVehicles(dataApi.vehicles);
        setMaintenanceCenter(dataApi.maintenanceCenter);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setup();
  }, []);

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow && 'isNew' in editedRow && editedRow.isNew) {
      // Remove linha nova se cancelar a edição
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow };
    
    // Remove a flag isNew quando salvar
    if ('isNew' in updatedRow) {
      delete updatedRow.isNew;
    }

    // Aqui você pode adicionar a lógica para salvar no banco de dados
    // Por exemplo, fazer uma chamada API para criar/atualizar a ordem
    
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow as OrderWithRelations : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'OS',
      width: 80,
      valueFormatter: (v: string | number) => {
        // Para linhas novas, mostra "NOVO"
        if (typeof v === 'string' && v.startsWith('new-')) {
          return "NOVO";
        }
        return "#" + String(v).padStart(5, '0');
      }
    },
    {
      field: 'usuario',
      headerName: 'Nome',
      width: 120,
      type: 'singleSelect',
      valueOptions: () => {
        if (users.length === 0) return [];
        const userNames = users.map(u => u.name);
        return [...new Set([...userNames])];
      },
      editable: true,
      valueGetter: (value, row) => {
        // Para linhas existentes, pega o nome do usuário relacionado
        if (row.user?.name) {
          return row.user.name;
        }
        // Para linhas novas, usa o valor direto
        return value || '';
      }
    },
    {
      field: 'veiculo',
      headerName: 'Veículo',
      align: 'left',
      width: 90,
      headerAlign: 'left',
      type: 'singleSelect',
      valueOptions: vehicle?.map(e => e.plate) || [],
      editable: true,
      valueGetter: (value, row) => {
        if (row.vehicle?.plate) {
          return row.vehicle.plate;
        }
        return value || '';
      }
    },
    {
      field: 'centroManutencao',
      headerName: 'Centro da manutenção',
      width: 170,
      type: 'singleSelect',
      valueOptions: maintenanceCenter?.map(e => e.name) || [],
      editable: true,
      valueGetter: (value, row) => {
        if (row.maintenanceCenter?.name) {
          return row.maintenanceCenter.name;
        }
        return value || '';
      }
    },
    {
      field: 'entryDate',
      headerName: 'Data de Entrada',
      width: 140,
      type: 'date',
      editable: true,
      valueGetter: (value) => {
        if (!value) return null;
        return new Date(value);
      }
    },
    {
      field: 'completionDate',
      headerName: 'Data de Saida',
      width: 140,
      type: 'date',
      editable: true,
      valueGetter: (value) => {
        if (!value) return null;
        return new Date(value);
      }
    },
    {
      field: 'maintenanceType',
      headerName: 'Tipo manutenção',
      width: 160,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['PREVENTIVA', 'CORRETIVA'],
    },
    {
      field: 'destination',
      headerName: 'Oficina',
      width: 140,
      editable: true,
    },
    {
      field: 'tempoParado',
      headerName: 'Tempo parado',
      valueGetter: (_, row) => {
        if (!row.entryDate || !row.completionDate) return '';
        return dateDiff(row.entryDate, row.completionDate);
      },
      width: 140,
    },
    {
      field: 'serviceDescriptions',
      headerName: 'Descrição',
      flex: 1,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[String(id)]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        showToolbar
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Box>
  );
}