"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import BuildIcon from '@mui/icons-material/Build';
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
} from '@mui/x-data-grid';
import { Typography, Alert, Snackbar, Button, Paper, Chip } from '@mui/material';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';

// Tipos
interface MaintenanceCenter {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
  isNew?: boolean;
}

// Toolbar customizada
function EditToolbar(props: { 
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = `new_${Date.now()}`;
    setRows((oldRows) => [
      { id, name: '', isNew: true, _count: { orders: 0 } },
      ...oldRows,
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        pb: 3, 
        mb: 3,
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BuildIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant='h4' component="h1" fontWeight="bold">
              Centros de Manutenção
            </Typography>
            <Typography variant='body2' color="text.secondary">
              Gerencie os centros de manutenção do sistema
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="Adicionar novo centro de manutenção">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClick}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1
            }}
          >
            Novo Centro
          </Button>
        </Tooltip>
      </Box>
    </Paper>
  );
}

export default function MaintenanceCentersCrudGrid() {
  const { data, isLoading, mutate, error } = useSWR<MaintenanceCenter[]>(
    '/api/v1/maintenance-centers', 
    fetcher
  );
  
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Sincronizar dados do SWR com o estado local
  React.useEffect(() => {
    if (data) {
      setRows(data);
    }
  }, [data]);

  // Função para mostrar mensagens
  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handler para parar edição
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // Iniciar edição
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  // Salvar alterações
  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  // Cancelar edição
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  // Deletar centro de manutenção
  const handleDeleteClick = (id: GridRowId) => () => {
    const row = rows.find((r) => r.id === id);
    
    if (!row) return;

    // Se for uma linha nova, apenas remove localmente
    if (row.isNew) {
      setRows(rows.filter((row) => row.id !== id));
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar o centro de manutenção "${row.name}"?`)) {
      deleteMaintenanceCenter(id as number);
    }
  };

  // Função para deletar centro via API
  const deleteMaintenanceCenter = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/maintenance-centers/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar centro de manutenção');
      }

      setRows(rows.filter((row) => row.id !== id));
      showMessage('Centro de manutenção deletado com sucesso');
      mutate(); // Revalidar dados do SWR
    } catch (error) {
      console.error('Erro ao deletar centro de manutenção:', error);
      showMessage(
        error instanceof Error ? error.message : 'Erro ao deletar centro de manutenção',
        'error'
      );
    }
  };

  // Processar atualizações de linha
  const processRowUpdate = async (newRow: GridRowModel): Promise<GridRowModel> => {
    try {
      // Validação básica
      if (!newRow.name || newRow.name.trim() === '') {
        throw new Error('Nome do centro de manutenção é obrigatório');
      }

      let updatedRow: MaintenanceCenter;

      if (newRow.isNew) {
        // Criar novo centro
        const response = await fetch('/api/v1/maintenance-centers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newRow.name.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao criar centro de manutenção');
        }

        updatedRow = { ...result, isNew: false };
        showMessage('Centro de manutenção criado com sucesso');
      } else {
        // Atualizar centro existente
        const response = await fetch(`/api/v1/maintenance-centers/${newRow.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newRow.name.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao atualizar centro de manutenção');
        }

        updatedRow = { ...result, isNew: false };
        showMessage('Centro de manutenção atualizado com sucesso');
      }

      // Atualizar estado local
      setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      
      // Revalidar dados do SWR
      mutate();
      
      return updatedRow;
    } catch (error) {
      console.error('Erro ao processar atualização:', error);
      showMessage(
        error instanceof Error ? error.message : 'Erro ao salvar alterações',
        'error'
      );
      throw error; // Isso fará com que a linha volte ao estado anterior
    }
  };

  // Handler para mudanças no modelo de edição
  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Definição das colunas
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      editable: false,
      renderCell: (params) => {
        // Se for uma linha nova, mostra "Novo"
        if (typeof params.value === 'string' && params.value.startsWith('new_')) {
          return <Chip label="Novo" color="primary" size="small" />;
        }
        return (
          <Chip 
            label={`#${params.value}`} 
            variant="outlined" 
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        );
      },
    },
    {
      field: 'name',
      headerName: 'Nome do Centro',
      flex: 1,
      editable: true,
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body1" fontWeight="medium">
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: '_count.orders',
      headerName: 'Pedidos Vinculados',
      width: 150,
      editable: false,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_,row) => row._count?.orders || 0,
      renderCell: (params) => {
        const count = params.value as number;
        return (
          <Chip
            label={count}
            color={count > 0 ? 'success' : 'default'}
            variant={count > 0 ? 'filled' : 'outlined'}
            size="small"
            sx={{ 
              minWidth: 60,
              fontWeight: 'bold'
            }}
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Data de Criação',
      width: 150,
      editable: false,
      valueGetter: (_,row) => {
        if (!row.createdAt) return '';
        return new Date(row.createdAt).toLocaleDateString('pt-BR');
      },
      renderCell: (params) => {
        if (!params.row.createdAt) return '';
        const date = new Date(params.row.createdAt);
        return (
          <Box>
            <Typography variant="body2">
              {date.toLocaleDateString('pt-BR')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'updatedAt',
      headerName: 'Última Atualização',
      width: 150,
      editable: false,
      valueGetter: (_,row) => {
        if (!row.updatedAt) return '';
        return new Date(row.updatedAt).toLocaleDateString('pt-BR');
      },
      renderCell: (params) => {
        if (!params.row.updatedAt) return '';
        const date = new Date(params.row.updatedAt);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        return (
          <Box>
            <Typography variant="body2">
              {date.toLocaleDateString('pt-BR')}
            </Typography>
            <Typography 
              variant="caption" 
              color={diffInHours < 24 ? 'primary.main' : 'text.secondary'}
            >
              {diffInHours < 1 
                ? 'Agora mesmo'
                : diffInHours < 24 
                  ? `${Math.floor(diffInHours)}h atrás`
                  : date.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
              }
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Salvar"
              style={{ color: '#2e7d32',}}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancelar"
              style={{ color: '#d32f2f'}}
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Editar"
            style={{ color: '#1976d2'}}
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Deletar"
            style={{ color: '#d32f2f'}}
            onClick={handleDeleteClick(id)}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: '100vh', width: '100%', p: 3, bgcolor: 'background.default' }}>
      {/* Toolbar personalizada */}
      <EditToolbar setRows={setRows} setRowModesModel={setRowModesModel} />

      {/* Mensagem de erro do SWR */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          variant="filled"
        >
          <Typography variant="subtitle2">
            Erro ao carregar centros de manutenção
          </Typography>
          <Typography variant="body2">
            {error.message}
          </Typography>
        </Alert>
      )}

      {/* DataGrid */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-main': {
              borderRadius: 3,
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
              fontSize: '0.875rem',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'grey.100',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'primary.50',
            },
            '& .actions': {
              color: 'text.secondary',
            },
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 15,
              },
            },
          }}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      </Paper>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}