"use client"
import { Container } from '@mui/material';
import { fetcher } from '@/lib/ultils';
import { Suspense } from 'react';
import CustomFab from '@/components/_ui/CustomFab';
import useSWR from 'swr';
import Loading from '@/components/Loading';
import VehicleInspectionCard from './CardInspecaoList';

export default function Inspecao({ id }: { id: string }) {

  const { data, isLoading } = useSWR(`/api/v1/inspecao/user/${id || ""}`, fetcher)

  if (isLoading) return <Loading />

  return (
    <Suspense>
      <Container maxWidth="lg">
        <CustomFab href={'/inspecao/create'} variant={"Plus"} color='success' />
        <VehicleInspectionCard data={data} />
      </Container>
    </Suspense>
  );
}