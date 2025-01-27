"use client"
import * as React from 'react';
import { 
  DataGrid, 
  GridToolbar, 
  GridColDef, 
  GridFilterModel, 
  GridActionsCellItem
} from '@mui/x-data-grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/ultils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import UserModal from './Forms';
import axios from 'axios';
import { Button, useMediaQuery, useTheme } from '@mui/material';



const dateFormatter = new Intl.DateTimeFormat('pt-BR', { 
  day: 'numeric', 
  month: 'short', 
  year: 'numeric' 
});

export default function UserDataGrid() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: rows, isLoading } = useSWR('/api/users', fetcher);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [], 
    quickFilterValues: ['']
  });
  const [ignoreDiacritics, setIgnoreDiacritics] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleAddUser = async (data: any) => {
    try {
      await axios.post('/api/users', data);
      mutate('/api/users');
    } catch (error) {
      console.error('Erro ao adicionar usuário', error);
    }
  };

  const handleEditUser = async (data: any) => {
    try {
      await axios.put(`/api/users/${data.id}`, data);
      mutate('/api/users');
    } catch (error) {
      console.error('Erro ao editar usuário', error);
    }
  };

  const handleDeleteUser = async (id:string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      mutate('/api/users');
    } catch (error) {
      console.error('Erro ao deletar usuário', error);
    }
  };
  
  const roles = {'ADMIN':2, 'USER':1, 'DRIVER':0};
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 200},
    { field: 'username', headerName: 'Usuário', headerClassName: `${isMobile?'d-none':''}`,cellClassName: `${isMobile?'d-none':''}`},
    { 
      field: 'createdAt',
      headerName: 'Data de Criação',
      type: 'dateTime',
      width: 150, 
      valueFormatter: (v) => dateFormatter.format(new Date(v as string)),
      headerClassName: `${isMobile?'d-none':''}`,
      cellClassName: `${isMobile?'d-none':''}`
    },
    {
      field: 'role',
      headerName: 'Perfil',
      getOptionLabel: (v) => ['Motorista', 'Usuário', 'Administrador'][roles[v as keyof typeof roles]],
      type: 'singleSelect', 
      valueOptions: ['ADMIN', 'USER', 'DRIVER'],
      width: 110,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key={`edit-${row.id}`}
          icon={<EditIcon />}
          label="Editar"
          onClick={() => {
            setSelectedUser(row);
            setIsModalOpen(true);
          }}
        />,
        <GridActionsCellItem
          key={`delete-${row.id}`}
          icon={<DeleteIcon />}
          label="Deletar"
          onClick={() => handleDeleteUser(row.id)}
          color="error"
        />,
      ]
    },
  ];

  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          Adicionar Usuário
        </Button>
      </div>

      <FormControlLabel
        control={
          <Switch 
            checked={ignoreDiacritics}
            onChange={(e) => setIgnoreDiacritics(e.target.checked)}
          />
        }
        label="Ignorar Diacríticos"
      />
      
      <Button onClick={() => setIsModalOpen(true)}>
        Adicionar Usuário
      </Button>

      <div className="h-[400px] w-full">
        <DataGrid
          key={ignoreDiacritics.toString()}
          rows={rows}
          loading={isLoading}
          columns={columns}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          ignoreDiacritics={ignoreDiacritics}
          autoPageSize
          disableRowSelectionOnClick
          className="bg-white shadow-md rounded-lg"
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={selectedUser ? handleEditUser : handleAddUser}
      />
    </div>
  );
}