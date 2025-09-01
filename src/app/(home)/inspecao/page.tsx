"use client"
import { Box, Container } from '@mui/material';
import { fetcher } from '@/lib/ultils';
import { Suspense } from 'react';
import CustomFab from '@/components/_ui/CustomFab';
import useSWR from 'swr';
import Loading from '@/components/Loading';
import VehicleInspectionCard from './CardInspecaoList';
import { useSession } from 'next-auth/react';
import CustomAppBar from '@/components/_ui/CustomAppBar';

export default function Inspecao() {
  const { data: session } = useSession();
  const { data, isLoading } = useSWR(session ? `/api/v1/inspecao/user/${session?.user.id}` : null, fetcher)
  if (isLoading) return <Loading />

  return (
    <Suspense>
      <Box >
        <CustomAppBar href='/' />
        <Container maxWidth="lg">
          <VehicleInspectionCard data={data} />
        </Container>
        <CustomFab href={'/inspecao/create'} variant={"Plus"} color='success' />
      </Box>
    </Suspense>
  );
}