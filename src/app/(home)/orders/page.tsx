"use client";
import * as React from 'react';
import Box from "@mui/material/Box";
import CustomFab from "@/components/_ui/CustomFab";
import Container from '@mui/material/Container';
import useSWR from 'swr';
import { getOrders } from './action';
import OrderCard from './OrderCard';
import Loading from '@/components/Loading';
import { useSession } from 'next-auth/react';

export default function ServicePage() {
  const { data: session } = useSession();
  const { data: orders, isLoading } = useSWR(session?.user.id, getOrders);

  if(isLoading) return <Loading/>

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: "100%", display: 'flex', flexDirection: 'column',mb:5}}>
        {orders && <OrderCard data={orders} />}
        <CustomFab href="/orders/create" variant="Plus" />
      </Box>
    </Container>
  );
}