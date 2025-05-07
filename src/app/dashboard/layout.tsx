"use client";

import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Navigation } from '@toolpad/core/AppProvider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { redirect } from 'next/navigation';
import KeyIcon from '@mui/icons-material/Key';
import MapIcon from '@mui/icons-material/Map';
import RoomIcon from '@mui/icons-material/Room';
import BuildIcon from '@mui/icons-material/Build';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { PageContainer } from '@toolpad/core/PageContainer';

const BRANDING = {
  logo: <Avatar src={"/favicon/icon.png"} alt={'logo'} />,
  title: '5sTransportes',
} as const;

export default function DashboardPagesLayout({ children }: { children: React.ReactNode; }) {
  const { data: session } = useSession();
  const authentication = { signIn, signOut }

  if (!session || !["ADMIN", "USER"].some(role => session?.user.role?.includes(role))) redirect('/');
  
  const NAVIGATION: Navigation = [
    { kind: 'header', title: "Menu" },
    {
      segment: 'dashboard',
      title: 'Dashboard',
      pattern:'',
      icon: <DashboardIcon />,
    }, { kind: 'header', title: 'Chaves' },
    {
      segment: 'dashboard/keys',
      title: 'Chaves',
      icon: <KeyIcon />,
    }, { kind: 'header', title: 'Inspeções' },
    {
      segment: 'dashboard/inspecao',
      title: 'Inspeções',
      icon: <RoomIcon />,
      pattern: 'dashboard/inspecao/:id',
    }, {
      segment: 'dashboard/viagens',
      title: 'Viagens',
      icon: <MapIcon />,
      pattern: 'dashboard/viagens/:id',
    }, { kind: 'header', title: 'Outros' },
    {
      segment: 'dashboard/user',
      title: 'Usuários',
      icon: <GroupIcon />,
    }, {
      segment: 'dashboard/vehicle',
      title: 'Veiculos',
      icon: <LocalShippingIcon />,
    }, {
      segment: 'dashboard/issues',
      title: 'Manutenções',
      icon: <BuildIcon />,
    }
  ];

  return (
    <NextAppProvider session={session} authentication={authentication} branding={BRANDING} navigation={NAVIGATION}>
      <DashboardLayout>
        <PageContainer>
        {children}
        </PageContainer>
      </DashboardLayout>
    </NextAppProvider>
  );
}