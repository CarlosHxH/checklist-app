"use client";

import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Navigation } from '@toolpad/core/AppProvider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { signIn, signOut, useSession } from "next-auth/react";
import { AppProvider } from '@toolpad/core/nextjs';
import { Avatar } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { redirect } from 'next/navigation';
import KeyIcon from '@mui/icons-material/Key';
import MapIcon from '@mui/icons-material/Map';
import RoomIcon from '@mui/icons-material/Room';
import NoCrashIcon from '@mui/icons-material/NoCrash';

// Move navigation configuration outside component to prevent recreation
const createNavigation = (): Navigation => [
  { kind: 'header', title: "Menu" }, {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  }, { kind: 'header', title: 'Chaves' }, {
    segment: 'dashboard/keys',
    title: 'Chaves',
    icon: <KeyIcon />,
  }, { kind: 'header', title: 'Inspeções' }, {
    segment: 'dashboard/inspecao',
    title: 'Inspeções',
    icon: <RoomIcon />,
    pattern: 'dashboard/inspecao/:id',
  }, {
    segment: 'dashboard/viagens',
    title: 'Viagens',
    icon: <MapIcon />,
    pattern: 'dashboard/viagens/:id',
  }, {
    segment: 'dashboard/orders',
    title: 'Ordem de Serviço',
    icon: <NoCrashIcon />,
    pattern: 'dashboard/viagens/:id',
  }, { kind: 'header', title: 'Outros' }, {
    segment: 'dashboard/user',
    title: 'Usuários',
    icon: <GroupIcon />,
  }, {
    segment: 'dashboard/vehicle',
    title: 'Veiculos',
    icon: <LocalShippingIcon />,
  }
];

const BRANDING = {
  logo: <Avatar src={"/favicon/icon.png"} alt={''} />,
  title: '5sTransportes',
} as const;

export default function DashboardPagesLayout({ children }: { children: React.ReactNode; }) {
  const { data: session, status } = useSession();
  // Use o estado para lidar com a navegação do lado do cliente
  const [mounted, setMounted] = React.useState(false);
  const authentication = React.useMemo(() => { return { signIn, signOut } }, []);
  // Handle hydration mismatch Esperando pelo Monte
  React.useEffect(() => { setMounted(true) }, []);
  // Memoize navigation to prevent unnecessary rerenders
  const navigation = React.useMemo(() => createNavigation(), []);
  // Retornar o estado nulo ou de carregamento durante a SSR
  if (!mounted || status === "loading") return null;
  if (!session || !["ADMIN", "USER"].some(role => session?.user.role?.includes(role))) redirect('/');
  console.log();

  return (
    <AppProvider session={session} authentication={authentication} branding={BRANDING} navigation={navigation}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AppProvider>
  );
}