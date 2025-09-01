"use client"
import { Container, Alert, Box } from '@mui/material';
import CustomFab from '@/components/_ui/CustomFab';
import Loading from '@/components/Loading';
import CardViagemList from './CardViagemList';
import { useSession } from 'next-auth/react';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import { fetcher } from '@/lib/ultils';
import useSWR from 'swr';

export default function Viagens() {
  const { data: session } = useSession();

  const { data, error, isLoading } = useSWR(
    session?.user.id ? `/api/v1/viagens/user/${session?.user.id}` : null,
    fetcher
  );

  // Show loading state
  if (isLoading) return <Loading />;

  // Show error state with better styling
  if (error) {
    return (
      <Container maxWidth="lg">
        <CustomAppBar showBackButton />
        <Box mt={2}>
          <Alert severity="error">
            Erro ao carregar dados. Por favor, tente novamente.
          </Alert>
        </Box>
        <CustomFab href="/viagem/create" variant="Plus" />
      </Container>
    );
  }

  // determinar se o Fab deve ser mostrado
  // Ocultar Fab se houver uma viagem ativa (tem startId, mas sem endid)
  const shouldShowFab = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return true;

    const activeTrip = data.find(trip => trip.startId && !trip.endId);
    return !activeTrip;
  };

  return (
    <Box>
      <CustomAppBar href='/' />
      <Container maxWidth="lg">
        <CardViagemList data={data || []} />
        {shouldShowFab() && (
          <CustomFab href="/viagem/create" variant="Plus" />
        )}
      </Container>
    </Box>
  );
}