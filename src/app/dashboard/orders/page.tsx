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
} from '@mui/x-data-grid';
import { IconButton, Toolbar } from '@mui/material';
import { getOrders, OrderWithRelations, typesReturnsOrders } from './actions';
import { user, vehicle } from '@prisma/client';
import { dateDiff } from '@/lib/ultils';

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
  }
}

function EditToolbar(props: GridSlotProps['toolbar']) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Date.now();
    setRows((oldRows) => [...oldRows]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <Toolbar>
      <Tooltip title="Add record">
        <IconButton onClick={handleClick}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

export default function FullFeaturedCrudGrid() {
  const [data, setData] = React.useState<typesReturnsOrders>();
  const [rows, setRows] = React.useState<OrderWithRelations[]>();
  const [users, setUsers] = React.useState<user[]>();
  const [vehicle, setVehicles] = React.useState<vehicle[]>();
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>();
  const [loading, setLoading] = React.useState(false);

  const setup = async () => {
    if(!rows){
      setLoading(true);
    }
    try {
      const dataApi = await getOrders();
      if (dataApi) {
        setData(dataApi);
        setRows(dataApi.orders);
        setUsers(dataApi.users);
        setVehicles(dataApi.vehicles);
        //setMaintenanceCenter(dataApi.maintenanceCenter);
        //setFilteredRows(dataApi.orders);
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
    if(!rows) return;
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    if (!rows) return;

    const editedRow = rows.find((row) => row.id === id);
    if (!editedRow) return;

    if ('isNew' in editedRow && editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    if (!rows) return newRow;
    
    const updatedRow = { ...newRow, isNew: false };
    //setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80, 
      valueFormatter: (v: number) => "#"+String(v).padStart(5, '0')
    },
    { 
      field: 'usuario',
      headerName: 'Nome', 
      width: 120, 
      type: 'singleSelect',
      valueOptions: (v) => {
        if (!users) return [v.row.user.name]
        const userNames = users.map(u => u.name);
        return [...new Set([...userNames])];
      },
      editable: true
    },
    {
      field: 'veiculo',
      headerName: 'Veículo',
      align: 'left',
      width: 90,
      headerAlign: 'left',
      type: 'singleSelect',
      valueOptions: (v) => {
        if (!vehicle) return [v.row.vehicle.name]
        const userNames = vehicle.map(u => u.plate);
        return [...new Set([...userNames])];
      },
      editable: true,
    },
    {
      field: 'centroManutencao',
      headerName: 'Centro da manutenção',
      width: 170,
      editable: true,
    },
    {
      field: 'entryDate',
      headerName: 'Data de Entrada',
      width: 140,
      editable: true,
    },
    {
      field: 'completionDate',
      headerName: 'Data de Saida',
      width: 140,
      editable: true,
    },
    {
      field: 'maintenanceType',
      headerName: 'Tipo manutenção',
      width: 160,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['PREVENTIVA', 'CORETIVA'],
    },
    {
      field: 'destination',
      headerName: 'Oficina',
      width: 140,
      editable: true,
    },
    {
      field: '',
      headerName: 'Tempo parado',
      valueFormatter: (_,e)=>{
        return dateDiff(e.entryDate, e.completionDate)
      },
      width: 140,
      editable: true,
    },
    {
      field: 'serviceDescriptions',
      headerName: 'Descrição',
      flex:1,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel?.[String(id)]?.mode === GridRowModes.Edit;
        
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
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
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
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
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        /*slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}*/
      />
    </Box>
  );
}
