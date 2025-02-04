"use client";

import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { Navigation } from '@toolpad/core/AppProvider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { signIn, signOut, useSession } from "next-auth/react";
import { AppProvider } from '@toolpad/core/nextjs';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Avatar } from '@mui/material';
import { Person2 } from '@mui/icons-material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { redirect } from 'next/navigation';
import KeyIcon from '@mui/icons-material/Key';

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
  }, { kind: 'header', title: 'Inspeções' },{
    segment: 'dashboard/inspection',
    title: 'Inspeções',
    icon: <BarChartIcon />,
  }, {
    segment: 'dashboard/user',
    title: 'Usuários',
    icon: <Person2 />,
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
        <PageContainer>{children}</PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}