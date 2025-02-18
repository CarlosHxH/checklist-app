"use client";
import React from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import Loading from '@/components/Loading';
import { useSession } from 'next-auth/react';
import { Box, Chip, IconButton, Tooltip, Button } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Vehicle {
  plate: string;
  model: string;
}

interface Inspection {
  id: string;
  createdAt: string;
  status: string;
  kilometer: string;
  crlvEmDia: string;
  certificadoTacografoEmDia: string;
  nivelAgua: string;
  nivelOleo: string;
  avariasCabine: string;
  bauPossuiAvarias: string;
  funcionamentoParteEletrica: string;
  extintor: string;
  isFinished: boolean;
  vehicle: Vehicle;
}

const InspectionDashboard: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: inspections, error, mutate } = useSWR<Inspection[]>('/api/inspections', fetcher);
  const [loading, setLoading] = React.useState(false);

  console.log(inspections);

  
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta inspeção?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/inspections/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir inspeção');
      await mutate(); // Refresh the data
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir inspeção');
    } finally {
      setLoading(false);
    }
  };

  const StatusChip: React.FC<{ value: string }> = ({ value }) => {
    const getChipProps = () => {
      switch (value) {
        case 'BOM':
        case 'NORMAL':
        case 'SIM':
          return { color: 'success' as const, label: value };
        case 'RUIM':
        case 'BAIXO':
        case 'NÃO':
          return { color: 'error' as const, label: value };
        case 'CRITICO':
          return { color: 'error' as const, label: value, variant: 'outlined' as const };
        default:
          return { color: 'default' as const, label: value };
      }
    };

    return <Chip size="small" {...getChipProps()} />;
  };

  const columns: GridColDef[] = [
    {
      field: 'createdAt',
      headerName: 'Data',
      width: 100,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'vehicle',
      headerName: 'Veículo',
      width: 200,
      flex:1,
      valueGetter: (value, row) => `${row.vehicle.plate} - ${row.vehicle.model}`,
    },{
      field: 'status',
      headerName: 'Tipo',
      width: 80,
      flex:1,
    },
    {
      field: 'kilometer',
      headerName: 'KM',
      width: 80,
    },
    {
      field: 'crlvEmDia',
      headerName: 'CRLV',
      width: 100,
      renderCell: (params: GridRenderCellParams) => <StatusChip value={params.value} />,
    },
    {
      field: 'certificadoTacografoEmDia',
      headerName: 'Tacógrafo',
      width: 100,
      renderCell: (params: GridRenderCellParams) => <StatusChip value={params.value} />,
    },
    {
      field: 'nivelAgua',
      headerName: 'Água',
      width: 100,
      renderCell: (params: GridRenderCellParams) => <StatusChip value={params.value} />,
    },
    {
      field: 'nivelOleo',
      headerName: 'Óleo',
      width: 100,
      renderCell: (params: GridRenderCellParams) => <StatusChip value={params.value} />,
    },
    {
      field: 'extintor',
      headerName: 'Extintor',
      width: 100,
      renderCell: (params: GridRenderCellParams) => <StatusChip value={params.value} />,
    },
    {
      field: 'user',
      headerName: 'Usuario',
      width: 150,
      valueGetter: (value, row) => `${row.user.name}`
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Visualizar">
            <IconButton size="small" onClick={() => router.push(`/dashboard/inspecao/${params.row.id}`)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {/*<Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => router.push(`/inspections/${params.row.id}/edit`)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>*/}
        </Box>
      ),
    },
  ];

  if (error) return <div>Erro ao carregar as inspeções</div>;
  if (!inspections) return <Loading />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/inspections/new')}
        >
          Nova Inspeção
        </Button>
      </Box>

      <DataGrid
        rows={inspections}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          }
        }}
        slots={{ toolbar: GridToolbar }}
        localeText={{
          toolbarColumns: "",
          toolbarFilters: "",
          toolbarExport: "",
          toolbarDensity: ""
        }}
        density="standard"
        pageSizeOptions={[5, 10, 25, 50]}
        rowSelection={false}
        getRowHeight={() => 'auto'}
        rowHeight={48}
      />
    </Box>
  );
};

export default InspectionDashboard;