"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
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
  GridToolbar,
} from '@mui/x-data-grid';
import { Typography, Alert, Snackbar, Button } from '@mui/material';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';

// Tipos
interface Oficina {
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
    <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h5'>Oficinas</Typography>
        <Tooltip title="Adicionar nova oficina">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClick}
            size="small"
          >
            Adicionar
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function OficinasCrudGrid() {
  const { data, isLoading, mutate, error } = useSWR<Oficina[]>('/api/v1/oficinas', fetcher);
  
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

  // Deletar oficina
  const handleDeleteClick = (id: GridRowId) => () => {
    const row = rows.find((r) => r.id === id);
    
    if (!row) return;

    // Se for uma linha nova, apenas remove localmente
    if (row.isNew) {
      setRows(rows.filter((row) => row.id !== id));
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar a oficina "${row.name}"?`)) {
      deleteOficina(id as number);
    }
  };

  // Função para deletar oficina via API
  const deleteOficina = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/oficinas/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao deletar oficina');
      }

      setRows(rows.filter((row) => row.id !== id));
      showMessage('Oficina deletada com sucesso');
      mutate(); // Revalidar dados do SWR
    } catch (error) {
      console.error('Erro ao deletar oficina:', error);
      showMessage(
        error instanceof Error ? error.message : 'Erro ao deletar oficina',
        'error'
      );
    }
  };

  // Processar atualizações de linha
  const processRowUpdate = async (newRow: GridRowModel): Promise<GridRowModel> => {
    try {
      // Validação básica
      if (!newRow.name || newRow.name.trim() === '') {
        throw new Error('Nome da oficina é obrigatório');
      }

      let updatedRow: Oficina;

      if (newRow.isNew) {
        // Criar nova oficina
        const response = await fetch('/api/v1/oficinas', {
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
          throw new Error(result.error || 'Erro ao criar oficina');
        }

        updatedRow = { ...result, isNew: false };
        showMessage('Oficina criada com sucesso');
      } else {
        // Atualizar oficina existente
        const response = await fetch(`/api/v1/oficinas/${newRow.id}`, {
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
          throw new Error(result.error || 'Erro ao atualizar oficina');
        }

        updatedRow = { ...result, isNew: false };
        showMessage('Oficina atualizada com sucesso');
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
          return <em>Novo</em>;
        }
        return params.value;
      },
    },
    {
      field: 'name',
      headerName: 'Nome da Oficina',
      flex: 1,
      editable: true,
      renderCell: (params) => {
        return <strong>{params.value}</strong>;
      },
    },
    {
      field: '_count.orders',
      headerName: 'Pedidos',
      width: 100,
      editable: false,
      valueGetter: (_,row) => row._count?.orders || 0,
      renderCell: (params) => {
        const count = params.value as number;
        return (
          <Box>
            {count}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      width: 150,
      editable: false,
      valueGetter: (_,row) => {
        if (!row.createdAt) return '';
        return new Date(row.createdAt).toLocaleDateString('pt-BR');
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Salvar"
              color='primary'
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancelar"
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
            label="Editar"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Deletar"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%', p:4 }}>
      {/* Toolbar personalizada */}
      <EditToolbar setRows={setRows} setRowModesModel={setRowModesModel} />

      {/* Mensagem de erro do SWR */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar oficinas: {error.message}
        </Alert>
      )}

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        sx={{
          '& .actions': {
            color: 'text.secondary',
          },
          '& .textPrimary': {
            color: 'text.primary',
          },
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
      />

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}