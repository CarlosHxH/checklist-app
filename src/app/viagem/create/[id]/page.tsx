import React, { Suspense } from "react"
import InspectionForm from "./InspectionForm";
import CustomAppBar from "@/components/_ui/CustomAppBar";
import Loading from "@/components/Loading";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if(!id) <Loading/>;
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomAppBar showBackButton />
        <InspectionForm id={id} />
      </Suspense>
    </>
  );
}