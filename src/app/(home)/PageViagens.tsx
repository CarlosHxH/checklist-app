"use client"
import { Container } from '@mui/material';
import CustomFab from '@/components/_ui/CustomFab';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import CardViagemList from './CardViagemList';


export default function Viagens({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR(id ? `/api/v1/viagens/user/${id}` : null, fetcher)
  if (isLoading) return <Loading />;
  if (error) return <Container>Erro ao carregar dados. Por favor, tente novamente.</Container>;

  const ShowCustomFab = () => {
    if (data[0] && (data[0].startId && !data[0].endId)) return;
    return <CustomFab href="/viagem" variant="Plus" />
  };
  
  return (
    <Suspense fallback={<Loading />}>
      <Container maxWidth="lg">
        <ShowCustomFab/>
        <CardViagemList data={data} />
      </Container>
    </Suspense>
  );
}

