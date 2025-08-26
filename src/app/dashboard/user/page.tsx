"use client"
import React from 'react';
import { DataGrid, GridActionsCellItem, GridColDef, GridEventListener, GridRowEditStopReasons, GridRowId, GridRowModesModel } from '@mui/x-data-grid';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import UserModal, { UserFormData } from './Forms';
import axios from 'axios';
import CustomToolbar from '@/components/CustomToolbar';
import { PageContainer } from '@toolpad/core/PageContainer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import Swal from 'sweetalert2';

const UserDataGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserFormData|null>(null);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const { data: rows, isLoading, mutate } = useSWR<UserFormData[]>('/api/v1/dashboard/users', fetcher);


  // Column definitions
  const columns: GridColDef[] = [
    {field: 'name',headerName: 'NOME',flex: isMobile ? 2 : 3,minWidth: 90},
    {field: 'username',headerName: 'USUÁRIO',flex: isMobile ? 1 : 0.8,minWidth: 100},
    {field: 'role',headerName: 'PERFIL',flex: 1,minWidth: 80,
      renderCell: ({ value }) => (
        <Box>{value==="ADMIN"?"ADMIN":value==="USER"?"USUÁRIO":"MOTORISTA"}</Box>
      )
    },
    {field: 'password',headerName: 'Senha',flex: 0.8,minWidth: 100,
      renderCell: ({ value }) => (<Box>{"********"}</Box>)},
    {field: 'isActive',headerName: 'STATUS',flex: isMobile ? 1 : 2, type: 'boolean',
      renderCell: ({value}) => (
        <Box>{value ? (<CheckIcon color='success' />) : (<CloseIcon color='error' />)}</Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'AÇÕES',
      flex: 1,
      minWidth: 70,
      getActions: ({ id, row }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id,row)}
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
    }
  ];


  const handleEditClick = (id: GridRowId, row: UserFormData) => () => {
    setSelectedUser(row)
    setIsModalOpen(true)
  };
  const handleDeleteClick = (id: GridRowId) => () => {
    const user = rows?.find((row)=>row.id === id)
    Swal.fire({
      title: "Tem certeza?",
      text: "Você não será capaz de reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, exclua!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        axios.delete(`/api/v1/dashboard/users/${id}`)
          .then(function (res) {
            Swal.fire({title: "Excluída!",text: "Excluido com sucesso!",icon: "success"});
          }).catch(function (error) {alert(error.response.data)});
      }
    });
  };
  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  return (
    <PageContainer title='Usuários'>
      <Box sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          loading={isLoading}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            toolbar: {
              title:"Usuários",
              onClick: () => {
                setIsModalOpen(true)
              }
            },
          }}
          showToolbar
        />

        <UserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={async () => {
            await mutate();
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </Box>
    </PageContainer>
  );
};

export default UserDataGrid;