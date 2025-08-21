"use client"
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { useSession } from 'next-auth/react';
import Viagens from './PageViagens';
import Inspecao from './PageInspecao';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`} aria-labelledby={`full-width-tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

const a11yProps = (index: number) => ({
  id: `full-width-tab-${index}`,
  'aria-controls': `full-width-tabpanel-${index}`,
});

export default function Page() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [value, setValue] = React.useState(0);

  const idUser = session?.user?.id ?? '';

  const handleChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);

<<<<<<< HEAD
  const tabs = React.useMemo(() => {
    const baseTabs = [
      { label: "VIAGENS", index: 0 },
      { label: "INSPEÇÕES", index: 1 },
      ...(!check?[{ label: "Ordem Serviço", index: 2 }]:[])
    ];
    return baseTabs;
  }, [check]);
=======
  const tabs = React.useMemo(() => [
    { label: "VIAGENS", index: 0 },
    { label: "INSPEÇÕES", index: 1 }
  ], []);
>>>>>>> 1b903dacc644c9bbd407e1518f92f0c4aa3341d9

  return (
    <Box>
      <CustomAppBar />
      <AppBar position="sticky" color='transparent' sx={{ boxShadow: 'none', borderBottom: '1px solid #E0E0E0', zIndex: 1000 }}>
        <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="inherit" variant="fullWidth" aria-label="Page-tabs">
          {tabs.map((tab) => (
            <Tab key={tab.index} label={tab.label} {...a11yProps(tab.index)} sx={{ fontSize: '1rem', fontWeight: 'bold' }} />
          ))}
        </Tabs>
      </AppBar>
      {session && (
        <>
          <TabPanel value={value} index={0} dir={theme.direction}>
            <Viagens id={idUser} />
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <Inspecao id={idUser} />
          </TabPanel>
<<<<<<< HEAD
          {!check&&<TabPanel value={value} index={2} dir={theme.direction}>
            <ServicePage />
          </TabPanel>}
=======
>>>>>>> 1b903dacc644c9bbd407e1518f92f0c4aa3341d9
        </>
      )}
    </Box>
  );
}