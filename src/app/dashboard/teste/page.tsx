"use client"
import React from 'react';
import { DataGrid, GridColDef, GridToolbar, GridActionsCellItem, GridRowParams, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, useMediaQuery, useTheme } from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/ultils';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import UserModal from './Forms';

// Menu Popup State
export function MenuPopupState({ isMobile, params, handleEdit, handleView, handleDelete }:
  { isMobile: boolean, params: GridRowParams, handleEdit: (id: string) => void, handleView: (id: string) => void, handleDelete: (id: string) => void }) {

  const Filds = [
    <GridActionsCellItem key={1} icon={<EditIcon />} label="Edit" onClick={() => handleEdit(params.id as string)} />,
    <GridActionsCellItem key={2} icon={<ViewIcon />} label="View" onClick={() => handleView(params.id as string)} />,
    <GridActionsCellItem key={3} icon={<DeleteIcon />} label="Delete" onClick={() => handleDelete(params.id as string)} color="error" />
  ]

  if (!isMobile) return (<>{Filds}</>)
  return (
    <PopupState variant="popover" popupId="popup-menu">
      {(popupState) => (
        <React.Fragment>
          <IconButton {...bindTrigger(popupState)} aria-haspopup="true" aria-label="more">
            <MoreVertIcon />
          </IconButton>
          <Menu {...bindMenu(popupState)}>
            {Filds.map((item) => <MenuItem key={item.key} onClick={popupState.close}>{item}</MenuItem>)}
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
}


// User interface definition
interface User {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "USER" | "DRIVER";
  isActive: boolean;
  password?: string;
}

const UserDataGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: users, isLoading, mutate } = useSWR<User[]>('/api/users', fetcher);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleDelete = (id: string) => {
    console.log(`Delete user ${id}`);
    if (users) {
      console.log(users.filter(user => user.id !== id));
    }
  };

  const handleView = (id: string) => {
    console.log(`View user ${id}`);
    // Implement view logic
  };


  // Column definitions
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: isMobile ? 2 : 3,
      minWidth: 90,
    },
    {
      field: 'username',
      headerName: 'Login',
      flex: isMobile ? 1 : 0.8,
      minWidth: 80,
    },
    {
      field: 'role',
      headerName: 'Perfil',
      flex: isMobile ? 1 : 0.5,
      minWidth: 80,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: isMobile ? 1 : 2,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
      renderCell: (params) => <>{params.value ? <CheckIcon color='success' /> : <CloseIcon color='error' />}</>,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      flex: 1,
      minWidth: 70,
      getActions: ({ row }: GridRowParams) => [
        <MenuPopupState
          key={row.id as string}
          isMobile={isMobile}
          params={row}
          handleEdit={() => {
            setSelectedUser(row);
            setIsModalOpen(true);
          }}
          handleView={handleView}
          handleDelete={handleDelete}
        />
      ]
    }
  ];

  const handleEditUser = async (data: User) => {
    mutate();
  }
  const handleAddUser = async (data: User) => {
    mutate();
  }
  


  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport slotProps={{ tooltip: { title: '', sx: { width: 100 } }, button: { sx: { width: 50 } } }} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2} alignItems={'center'}>
          <GridToolbarQuickFilter variant="outlined" size="small" />
          <Button onClick={() => setIsModalOpen(true)} variant="contained" size='large' color="primary">Novo</Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    <Box sx={{ height: 'auto', width: '100%' }}>
      <DataGrid
        rows={users}
        columns={columns}
        pagination
        loading={isLoading}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        slots={{ toolbar: CustomToolbar || GridToolbar }}
        localeText={{
          toolbarColumns: "",
          toolbarFilters: "",
          toolbarExport: "",
        }}
        density="standard"
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },

          },
        }}
        sx={{
          '& .none': {
            display: 'none',
            '&& ': {
              display: 'none !important'
            }
          },
          '& .status-active': {
            color: 'green',
            fontWeight: 'bold'
          },
          '& .status-inactive': {
            color: 'red',
            fontWeight: 'bold'
          }
        }}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={async (data) => {
          await mutate();
        }}
      />

    </Box>
  );
};

export default UserDataGrid;