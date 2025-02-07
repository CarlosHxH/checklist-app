"use client"
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { useSession } from 'next-auth/react';
import Viagens from './(home)/PageViagens';
import Inspecao from './(home)/PageInspecao';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`} aria-labelledby={`full-width-tab-${index}`} {...other}>
      {value === index && (<>{children}</>)}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function Page() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [value, setValue] = React.useState(0);

  const idUser = session?.user.id||''

  const handleChange = (event: React.SyntheticEvent, newValue: number) => { setValue(newValue) };
  return (
    <Box>
      <CustomAppBar />
      <AppBar position="static" color='transparent'>
        <Tabs value={value} onChange={handleChange} indicatorColor="secondary" textColor="inherit" variant="fullWidth" aria-label="Page-tabs">
          <Tab label="VIAGENS" {...a11yProps(0)} />
          <Tab label="INSPEÇÕES" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} dir={theme.direction}>
        <Typography variant='subtitle1' sx={{p:2, fontWeight:'bold'}}>VIAGENS</Typography>
        {session && <Viagens id={idUser} />}
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <Typography variant='subtitle1' sx={{p:2, fontWeight:'bold'}}>INSPEÇÕES</Typography>
        {session && <Inspecao id={idUser} />}
      </TabPanel>
    </Box>
  );
}
