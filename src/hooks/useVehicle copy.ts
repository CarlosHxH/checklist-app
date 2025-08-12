import { useEffect, useState } from 'react';
import { vehicle } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export default function useVehicleHook(id?: string | undefined) {

  const [data, setData] = useState<vehicle | vehicle[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        setIsLoading(true);
        setError(null);
        
        let vehicle;
        if (id) { vehicle = await prisma.vehicle.findUnique({where: { id }}) }
        else { vehicle = await prisma.vehicle.findMany() }
        
        setData(vehicle);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVehicle();
  }, [id]);

  return { data, isLoading, error };
}