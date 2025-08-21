import { PrismaClient } from '@prisma/client';
import React from 'react';

interface Vehicle {
  id: string;
}

export function useVehicle(id: string | null) {
  const [data, setData] = React.useState<Vehicle | Vehicle[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const prisma = new PrismaClient();
  React.useEffect(() => {
    async function fetchVehicle() {
      try {
        setIsLoading(true);
        setError(null);
        
        let vehicle;
        if (id) {
          vehicle = await prisma.vehicle.findUnique({
            where: { id }
          });
        } else {
          vehicle = await prisma.vehicle.findMany();
        }
        
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