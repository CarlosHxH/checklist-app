"use client";
import React, { Suspense } from "react";
import CustomFab from "@/components/_ui/CustomFab";
import AppBar from "@/components/_ui/AppBar";
import MainList from "./MainList";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function Home()
{
  const router = useRouter();
  const { data, status } = useSession();
  if(status === "unauthenticated") signIn();

  const handleView = (id: string) => router.push(`/inspection/${id}`);
  const handleEdit = (id: string) => router.push(`/inspection/${id}/edit`);
  
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <AppBar />
        <MainList userId={data?.user.id||""} onEdit={handleEdit} onView={handleView} />
        <CustomFab href={'/inspection/create'} variant={"Plus"} />
      </Suspense>
    </div>
  );
}