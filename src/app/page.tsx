"use client";
import React, { Suspense } from "react";
import CustomFab from "@/components/CustomFab";
import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import VehicleInspectionList from "@/components/VehicleInspectionList";
import useSWR from "swr";
import { fetcher } from "@/lib/ultils";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, Typography } from "@mui/material";

export default function Home()
{
  const { data: session } = useSession();
  const { data, isLoading, error } = useSWR(`/api/inspections/user/${session?.user.id}`, fetcher);
  const router = useRouter();

  const handleView = (id: string) => router.push(`/inspection/${id}`);
  const handleEdit = (id: string) => router.push(`/inspection/${id}/edit`);

  return (
    <div>
      <Suspense fallback={<Loading />}>
        <ResponsiveAppBar title={"5sTransportes"} />
        {error ? <Typography>Nenhuma inspeção encontrada!</Typography> : ''}
        {isLoading && <Loading />}
        {data && data.length > 0 ? (
          <VehicleInspectionList inspections={data} onEdit={handleEdit} onView={handleView} />
        ) : (<Card sx={{ m: 5, p: 5, bgcolor: '#fff', height: 50 }}><Typography color="textPrimary">Nenhuma inspeção encontrada.</Typography></Card>)}
        <CustomFab href={'/inspection/create'} variant={"Plus"} />
      </Suspense>
    </div>
  );
}