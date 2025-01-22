"use client"
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import { VehicleKeyTable } from './VehicleKeyTable';
import Loading from '@/components/Loading';
import RecursiveTreeView from './VehicleKeyTreeView';

export default function Page() {
  const { data, isLoading, mutate } = useSWR('/api/admin/keys', fetcher);
  
  if (isLoading) return <Loading />;
  
  const { vehicleKey, users, vehicles } = data;

  const onDelete = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir?")) return;
    try {
      await fetch("/api/admin/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Error deleting inspection:", error);
    } finally {
      mutate()
    }
  };
  return (
    <div>
      <VehicleKeyTable
        vehicleKeys={vehicleKey}
        users={users}
        vehicles={vehicles}
        onSave={mutate}
        onDelete={onDelete}
      />

      <RecursiveTreeView data={vehicleKey} />
    </div>
  );
}