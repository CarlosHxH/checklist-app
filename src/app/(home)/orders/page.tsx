"use client";
import * as React from 'react';
import Box from "@mui/material/Box";
import CustomFab from "@/components/_ui/CustomFab";
import Container from '@mui/material/Container';
import useSWR from 'swr';
import { getOrders } from './action';
import OrderCard from './OrderCard';
import { notFound } from 'next/navigation';
import Loading from '@/components/Loading';
import { useSession } from 'next-auth/react';

export default function ServicePage() {
  const { data:session } = useSession();
  const { data: orders, error } = useSWR(session?.user.id||"", getOrders);

  if(!orders) return <Loading/>
  if(error) notFound();

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: "100%", display: 'flex', flexDirection: 'column',mb:5}}>
        <OrderCard data={orders} />
        <CustomFab href="/orders/create" variant="Plus" />
      </Box>
    </Container>
  );
}