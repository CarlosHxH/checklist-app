// components/AppBar.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LogoutButton from './LogoutButton';

const MyAppBar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, marginLeft: 2 }}>
          5sTransportes
        </Typography>
        <LogoutButton/>
      </Toolbar>
    </AppBar>
  );
};

export default MyAppBar;