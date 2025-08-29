"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { useSession } from 'next-auth/react';
import MapIcon from '@mui/icons-material/Map';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Card, CardHeader, Typography } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import Link from 'next/link';

function SelectedListItem({ tabs }: { tabs: { label: string; href: string; icon: React.ReactNode }[] }) {
  if (!tabs) {return (<></>)}
  return (
    <Box sx={{ p: 4 }}>
      <CustomAppBar />
      <Box sx={{ width: '100%' }}>
        {tabs.map((item, i) => (
          <Link key={i} href={item.href} style={{ textDecoration: "none" }}>
            <Card sx={{ mb: 2, py:3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{item.icon}</Box>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='h4' sx={{ textDecoration: "none" }}>
                      {item.label}
                    </Typography>
                  </Box>
                }
                action={<KeyboardArrowRight fontSize='large' />}
              />
            </Card>
          </Link>
        ))}

      </Box>
    </Box>
  );
}

export default function Page() {
  const { data: session } = useSession();
  const check = session?.user.role != "DRIVER"

  const tabs = React.useMemo(() => {
    const baseTabs = [
      { label: "VIAGENS", href: '/viagem', icon: <MapIcon fontSize='large' /> },
      { label: "INSPEÇÕES", href: '/inspecao', icon: <LocalShippingIcon fontSize='large' /> },
      ...(check ? [{ label: "Ordem Serviço", href: '/orders', icon: <FactCheckIcon fontSize='large' /> }] : [])
    ];
    return baseTabs;
  }, [check]);

  return (
    <React.Suspense>
      <SelectedListItem tabs={tabs} />
    </React.Suspense>
  )
}