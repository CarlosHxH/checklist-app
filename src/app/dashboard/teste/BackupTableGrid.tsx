"use client"
import React, { useState } from 'react';
import { DataGrid, GridColDef, GridToolbar,GridActionsCellItem,GridRowParams} from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { Box } from '@mui/material';

// User interface definition
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const UserDataGrid: React.FC = () => {
  // Sample user data
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'inactive' },
    // Add more sample users
  ]);

  // Handle user actions
  const handleEdit = (id: number) => {
    console.log(`Edit user ${id}`);
    // Implement edit logic
  };

  const handleDelete = (id: number) => {
    console.log(`Delete user ${id}`);
    setUsers(users.filter(user => user.id !== id));
  };

  const handleView = (id: number) => {
    console.log(`View user ${id}`);
    // Implement view logic
  };

  // Column definitions
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      filterOperators: 'contains'
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1,
      filterOperators: 'contains'
    },
    { 
      field: 'role', 
      headerName: 'Perfil', 
      flex: 0.5,
      type: 'singleSelect',
      valueOptions: ['Admin', 'Usuária', 'Motorista']
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.5,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
      cellClassName: (params) => 
        params.value === 'active' ? 'status-active' : 'status-inactive'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.id as number)}
        />,
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.id as number)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id as number)}
          color="error"
        />
      ]
    }
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={users}
        columns={columns}
        pagination
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
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
    </Box>
  );
};

export default UserDataGrid;