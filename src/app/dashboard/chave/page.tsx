"use client"
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import { VehicleKeyTable } from './VehicleKeyTable';
import Loading from '@/components/Loading';

export default function Page() {
  const { data, isLoading } = useSWR('/api/admin/keys', fetcher);
  
  if (isLoading) return <Loading />;
  
  const { vehicleKey, users, vehicles } = data;

  return (
    <div>
      <VehicleKeyTable
        vehicleKeys={vehicleKey}
        users={users}
        vehicles={vehicles}
        onSave={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}