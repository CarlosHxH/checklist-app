"use client";
import * as React from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Avatar, ThemeProvider } from '@mui/material';
import { signOut, useSession } from "next-auth/react";
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { redirect } from 'next/navigation';
import KeyIcon from '@mui/icons-material/Key';
import MapIcon from '@mui/icons-material/Map';
import RoomIcon from '@mui/icons-material/Room';
import NoCrashIcon from '@mui/icons-material/NoCrash';
import MenuIcon from '@mui/icons-material/Menu';
import { Session } from 'next-auth';
import MuiProvider from '@/provider/MuiProvider';

const drawerWidth = 240;

const createNavigation = (session?: Session) => {
  const isAdmin = session?.user.role === "ADMIN";
  
  return [
    { title: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { title: 'Chaves', icon: <KeyIcon />, href: '/dashboard/keys' },
    { title: 'Inspeções', icon: <RoomIcon />, href: '/dashboard/inspecao' },
    { title: 'Viagens', icon: <MapIcon />, href: '/dashboard/viagens' },
    ...(isAdmin ? [{ title: 'Ordem de Serviço', icon: <NoCrashIcon />, href: '/dashboard/orders' }] : []),
    { title: 'Usuários', icon: <GroupIcon />, href: '/dashboard/user' },
    { title: 'Veículos', icon: <LocalShippingIcon />, href: '/dashboard/vehicle' }
  ];
};

export default function DashboardPagesLayout({ children }: { children: React.ReactNode; }) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => { setMounted(true) }, []);

  if (!mounted || status === "loading") return null;
  if (!session || !["ADMIN", "USER"].some(role => session.user?.role?.includes(role))) redirect('/');

  const navigation = createNavigation(session);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Avatar src={"/favicon/icon.png"} alt={''} sx={{ mr: 2 }} />
        <Typography variant="h6" noWrap component="div">
          5sTransportes
        </Typography>
      </Toolbar>
      <List>
        {navigation.map((item) => (
          <ListItem button key={item.title} component="a" href={item.href}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={{}}>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              5sTransportes
            </Typography>
            <IconButton color="inherit" onClick={() => signOut()}>
              <Avatar src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8
          }}
        >
          {children}
        </Box>
      </Box>
    </MuiProvider>
  );
}