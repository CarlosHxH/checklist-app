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
import { FireTruck, Person2 } from '@mui/icons-material';

// Move navigation configuration outside component to prevent recreation
const createNavigation = (): Navigation => [
  { kind: 'header', title: "Menu"},
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  { kind: 'header', title: 'Relatório' },
  {
    segment: 'dashboard/relatorio',
    title: 'Relatório',
    icon: <BarChartIcon />,
  },
  { kind: 'header', title: 'Adicionar' },{
    segment: 'dashboard/user',
    title: 'Usuários',
    icon: <Person2 />,
  },
  {
    segment: 'dashboard/vehicle',
    title: 'Veiculos',
    icon: <FireTruck />,
  }
];

const BRANDING = {
  logo:<Avatar src={"/ico.png"} alt={''}/>,
  title: '5sTransportes',
} as const;

export default function DashboardPagesLayout({
  children
}: {
  children: React.ReactNode;
}) {

  const { data: session, status } = useSession();
  
  // Use state to handle client-side navigation
  const [mounted, setMounted] = React.useState(false);

  const authentication = React.useMemo(() => {return { signIn, signOut }}, []);
  
  // Handle hydration mismatch by waiting for mount
  React.useEffect(() => { setMounted(true) }, []);

  // Memoize navigation to prevent unnecessary rerenders
  const navigation = React.useMemo(() => createNavigation(), []);

  // Return null or loading state during SSR
  if (!mounted || status === "loading") {
    return null;
  }
  
  return (
    <AppProvider session={session} authentication={authentication} branding={BRANDING} navigation={navigation}>
      <DashboardLayout>
        <PageContainer>{children}</PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}