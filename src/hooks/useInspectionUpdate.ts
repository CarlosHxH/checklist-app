// hooks/useInspectionUpdate.ts
import axios, { AxiosError } from "axios";
import { useState, useCallback } from "react";
import { useSWRConfig } from "swr";

interface InspectionUpdateData {
  nivelAgua: string;
  nivelOleo: string;
  avariasCabine: string;
  bauPossuiAvarias: string;
  funcionamentoParteEletrica: string;
  descricaoAvariasCabine: string;
  descricaoAvariasBau: string;
  descricaoParteEletrica: string;
  resolvidoPor: string;
  observacoes: string;
  dianteira: string;
  descricaoDianteira: string;
  tracao: string;
  descricaoTracao: string;
  truck: string;
  descricaoTruck: string;
  quartoEixo: string;
  descricaoQuartoEixo: string;
}

interface SaveStatusData {
  section: "start" | "end";
  data: InspectionUpdateData;
}

interface InspectionUpdateResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface UseInspectionUpdateOptions {
  onSuccess?: (data: InspectionUpdateResponse) => void;
  onError?: (error: string) => void;
}

interface UseInspectionUpdateReturn {
  updateStatus: (data: SaveStatusData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useInspectionUpdate = (
  id: string,
  options: UseInspectionUpdateOptions = {}
): UseInspectionUpdateReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const { onSuccess, onError } = options;

  const updateStatus = useCallback(async (data: SaveStatusData): Promise<void> => {
    if (!id) {
      const errorMsg = "ID da inspeção é obrigatório";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!data.data.resolvidoPor?.trim()) {
      const errorMsg = "Campo 'Resolvido por' é obrigatório";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.put<InspectionUpdateResponse>(
        `/api/v1/dashboard/viagens/${id}/update-status`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      // Check for success response
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || "Falha ao atualizar o status!");
      }

      const responseData: InspectionUpdateResponse = response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || "Operação não foi bem-sucedida");
      }

      // Invalidate cache to trigger refetch
      await Promise.all([
        mutate("/api/v1/dashboard/viagens"),
        mutate(`/api/v1/dashboard/viagens/${id}`),
      ]);

      onSuccess?.(responseData);
    } catch (error) {
      let errorMessage = "Erro ao atualizar status!";

      if (error instanceof AxiosError) {
        // Handle different types of axios errors
        if (error.response) {
          // Server responded with error status
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Erro do servidor: ${error.response.status}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "Erro de conexão. Verifique sua internet.";
        } else {
          // Something else happened
          errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, mutate, onSuccess, onError]);

  return { 
    updateStatus, 
    loading, 
    error 
  };
};