"use client"
import { Container } from '@mui/material';
import AppBar from '@/components/_ui/AppBar';
import CustomFab from '@/components/_ui/CustomFab';
import { useSession } from 'next-auth/react';
import InspectionCardList from './InspectionCardList';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import { Suspense } from 'react';
import Loading from '@/components/Loading';

export default function Home() {
  const { data: session } = useSession();
  const { data, isLoading } = useSWR(`/api/${session?.user.id || ""}`, fetcher)

  if(isLoading) return <Loading/>
  
  const CustomFabs = () => {
    return (data.length === 0 || !!data[0]?.end)?<CustomFab href={'/viagem/create'} variant={"Plus"} />:<></>;
  };

  return (
    <Suspense>
      <Container maxWidth="lg">
        <AppBar />
        <CustomFabs />
        <InspectionCardList inspections={data} />
      </Container>
    </Suspense>
  );
}