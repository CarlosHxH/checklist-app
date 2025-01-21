"use client"
import React from 'react';
import { VehicleKeyFormData } from './Types';
import { VehicleKeyTable } from './VehicleTable';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import Loading from '@/components/Loading';

const Page = () => {
  const { data, isLoading ,mutate } = useSWR('/api/admin/keys',fetcher);
  const handleSave = async (data: VehicleKeyFormData) => {
    // Implement save logic
    mutate();
  };

  const handleDelete = async (id: string) => {
    // Implement delete logic
    console.log(id);
    
  };
  if (isLoading) return <Loading/>
/*
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key];
      
    }
  }*/
  return (
    <VehicleKeyTable
      data={data}
      vehicleKeys={data?.[0].vehicleKey}
      users={data?.[0].user|| []}
      vehicles={data?.[0].vehicle}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
};
export default Page;
