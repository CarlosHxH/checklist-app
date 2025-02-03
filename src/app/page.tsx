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

  if(isLoading) return <Loading/>;

  const Fab = () => {
    if(!data) return;
    if(data[0]?.end === null) return;
    return <CustomFab href={'/inspection/create'} variant={"Plus"} />
  }
  return (
    <Suspense fallback={isLoading}>
      <Container maxWidth="lg">
        <AppBar />
        <Fab />
        {data&&<InspectionCardList inspections={data} />}
      </Container>
    </Suspense>
  );
}