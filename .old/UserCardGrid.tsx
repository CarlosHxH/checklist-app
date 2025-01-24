"use client"
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Modal, 
  TextField, 
  Select, 
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon 
} from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const UserCardGrid: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'inactive' },
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete' | null>(null);

  const handleOpenModal = (user: User, mode: 'view' | 'edit' | 'delete') => {
    setSelectedUser(user);
    setModalMode(mode);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalMode(null);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? selectedUser : u
      );
      setUsers(updatedUsers);
      handleCloseModal();
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      handleCloseModal();
    }
  };

  const renderUserCard = (user: User) => (
    <Grid item xs={12} sm={6} md={4} key={user.id}>
      <Card 
        variant="outlined" 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <CardContent>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          <Typography variant="body2">
            Role: {user.role} | 
            Status: <span style={{ 
              color: user.status === 'active' ? 'green' : 'red',
              fontWeight: 'bold'
            }}>{user.status}</span>
          </Typography>
        </CardContent>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            startIcon={<ViewIcon />} 
            onClick={() => handleOpenModal(user, 'view')}
            variant="outlined"
          >
            View
          </Button>
          <Button 
            startIcon={<EditIcon />} 
            onClick={() => handleOpenModal(user, 'edit')}
            variant="outlined"
            color="primary"
          >
            Edit
          </Button>
          <Button 
            startIcon={<DeleteIcon />} 
            onClick={() => handleOpenModal(user, 'delete')}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  const renderModal = () => {
    if (!selectedUser) return null;

    return (
      <Modal 
        open={!!selectedUser} 
        onClose={handleCloseModal}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Box sx={{ 
          width: '90%', 
          maxWidth: 400, 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: 2 
        }}>
          {modalMode === 'view' && (
            <>
              <Typography variant="h6">User Details</Typography>
              <Typography>Name: {selectedUser.name}</Typography>
              <Typography>Email: {selectedUser.email}</Typography>
              <Typography>Role: {selectedUser.role}</Typography>
              <Typography>Status: {selectedUser.status}</Typography>
              <Button onClick={handleCloseModal} variant="contained" sx={{ mt: 2 }}>
                Close
              </Button>
            </>
          )}

          {modalMode === 'edit' && (
            <>
              <Typography variant="h6">Edit User</Typography>
              <TextField
                fullWidth
                label="Name"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedUser.role}
                  label="Role"
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedUser.status}
                  label="Status"
                  onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value as 'active' | 'inactive'})}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
                <Button onClick={handleSaveUser} variant="contained" color="primary">Save</Button>
              </Box>
            </>
          )}

          {modalMode === 'delete' && (
            <Box>
              <Typography variant="h6">Confirm Delete</Typography>
              <Typography>Are you sure you want to delete {selectedUser.name}?</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={handleCloseModal} variant="outlined">Cancel</Button>
                <Button onClick={handleDeleteUser} variant="contained" color="error">Delete</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        {users.map(renderUserCard)}
      </Grid>
      {renderModal()}
    </Box>
  );
};

export default UserCardGrid;