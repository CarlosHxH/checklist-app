"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { useSession } from 'next-auth/react';
import MapIcon from '@mui/icons-material/Map';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Link } from '@mui/material';

export default function SelectedListItem() {
  const { data: session } = useSession();
  const check = session?.user.role != "DRIVER"

  const tabs = React.useMemo(() => {
    const baseTabs = [
      { label: "VIAGENS", href: '/viagem', icon: <MapIcon /> },
      { label: "INSPEÇÕES", href: '/inspecao', icon: <LocalShippingIcon /> },
      ...(check ? [{ label: "Ordem Serviço", href: '/orders', icon: <FactCheckIcon /> }] : [])
    ];
    return baseTabs;
  }, [check]);

  return (
    <Box sx={{ p: 4 }}>
      <CustomAppBar />
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <List component="nav" aria-label="main mailbox folders">
          {tabs.map((item, i) => (
            <Link key={i} href={item.href} underline="none">
              <ListItemButton
                sx={{ height: '6em' }}
                selected={i % 2 ? true : false}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Box>
    </Box>
  );
}
