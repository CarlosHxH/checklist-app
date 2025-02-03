import React, { Suspense } from "react"
import InspectionForm from "./InspectionForm";
import AppBar from "@/components/_ui/AppBar";
import Loading from "@/components/Loading";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if(!id) <Loading/>;
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <AppBar showBackButton />
        <InspectionForm id={id} />
      </Suspense>
    </>
  );
}