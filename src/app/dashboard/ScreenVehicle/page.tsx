"use client"
import React from 'react';
import {
  DataGrid, GridColDef, GridToolbar, GridActionsCellItem,
  GridRowParams, GridToolbarQuickFilter, GridToolbarContainer,
  GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport
} from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, useMediaQuery, useTheme } from '@mui/material';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import axios from 'axios';
import VehicleModal, { vehicleFormData } from './Forms';

// Menu Popup State
export function MenuPopupState({ isMobile, params, handleEdit, handleDelete }:
  { isMobile: boolean, params: GridRowParams, handleEdit: (id: string) => void, handleDelete: (id: string) => void }) {

  const Filds = [
    <GridActionsCellItem key={1} icon={<EditIcon />} label="Edit" onClick={() => handleEdit(params.id as string)} />,
    <GridActionsCellItem key={3} icon={<DeleteIcon />} label="Delete" onClick={() => handleDelete(params.id as string)} color="error" />
  ]

  if (!isMobile) return (<>{Filds}</>)
  return (
    <PopupState variant="popover" popupId="popup-menu">
      {(popupState) => (
        <React.Fragment>
          <IconButton {...bindTrigger(popupState)} aria-haspopup="true" aria-label="more"><MoreVertIcon /></IconButton>
          <Menu {...bindMenu(popupState)}>{Filds.map((item) => <MenuItem key={item.key} onClick={popupState.close}>{item}</MenuItem>)}</Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
}


// Vechicle interface definition

const VechicleDataGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: vehicles, isLoading, mutate } = useSWR<vehicleFormData[]>('/api/vehicles', fetcher);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedVechicle, setSelectedVechicle] = React.useState(null);
  const [paginationModel, setPaginationModel] = React.useState({ pageSize: 10, page: 0 });

  const handleDelete = (id: string) => {
    if (vehicles) {
      if (confirm(`Temcerteza que deseja deletar o veiculo: ${vehicles.find(Vechicle => Vechicle.id === id)?.plate}`)) {
        axios.delete(`/api/vehicles/${id}`)
          .then(function (response) {
            console.log({ response });
            mutate();
          })
          .catch(function (error) {
            alert(error.response.data);
          });
      }
    }
  };

  const handleView = (id: string) => {
    if (vehicles) {
      console.log(vehicles.find(Vechicle => Vechicle.id === id));
    }
  };


  // Column definitions
  const columns: GridColDef[] = [
    { field: 'make', headerName: 'Fabricante', flex: isMobile ? 1 : 0.5, minWidth: 80 },
    { field: 'plate', headerName: 'Placa', flex: isMobile ? 1 : 2, minWidth: 80 },
    { field: 'model', headerName: 'Modelo', flex: isMobile ? 1 : 0.8, minWidth: 80 },
    { field: 'year', headerName: 'Ano', flex: isMobile ? 1 : 0.8, minWidth: 80 },

    { field: 'eixo', headerName: 'Eixos', flex: isMobile ? 1 : 0.8, minWidth: 80, valueFormatter: (v) => isMobile ? v : ['DIANTEIRA', 'TRAÇÃO', 'TRUCK', 'Quarto Eixo'][--v] },
    {
      field: 'actions', type: 'actions', headerName: 'Ações', flex: 1, minWidth: 70,
      getActions: ({ row }: GridRowParams) => [
        <MenuPopupState
          key={row.id as string}
          isMobile={isMobile}
          params={row}
          handleEdit={() => {
            setSelectedVechicle(row);
            setIsModalOpen(true);
          }}
          handleDelete={handleDelete}
        />
      ]
    }
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport slotProps={{ tooltip: { sx: { width: 100 } }, button: { sx: { width: 50 } } }} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2} alignItems={'center'}>
          <GridToolbarQuickFilter variant="outlined" size="small" />
          <Button onClick={() => setIsModalOpen(true)} variant="contained" size='large' color="primary">Novo</Button>
        </Stack>
      </GridToolbarContainer>
    );
  }
  
  const xs = isMobile?{year: false, eixo: false, model: false }:null
  return (
    <Box sx={{ height: 'auto', width: '100%' }}>
      <DataGrid
        rows={vehicles}
        columns={columns}
        loading={isLoading}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        disableRowSelectionOnClick
        slots={{ toolbar: CustomToolbar || GridToolbar }}
        localeText={{
          toolbarColumns: "",
          toolbarFilters: "",
          toolbarExport: "",
          toolbarDensity: "",
        }}
        density="standard"
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {...xs},
          },
        }}
      />

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVechicle(null);
        }}
        data={selectedVechicle}
        onSubmit={async (data) => { await mutate() }}
      />

    </Box>
  );
};

export default VechicleDataGrid;