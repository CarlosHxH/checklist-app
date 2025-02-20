"use client"
import { Container } from '@mui/material';
import CustomFab from '@/components/_ui/CustomFab';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import CardViagemList from './CardViagemList';

export default function Viagens({id}: {id:string}) {
  const { data, isLoading } = useSWR(`/api/${id || ""}`, fetcher)
  if(isLoading) return <Loading/>

  const CustomFabs = () =>  (data.length === 0 || !!data[0]?.end)?<CustomFab href={'/viagem/inicio/create'} variant={"Plus"} />:<></>;

  return (
    <Suspense>
      <Container maxWidth="lg">
        <CustomFabs />
        <CardViagemList data={data} />
      </Container>
    </Suspense>
  );
}