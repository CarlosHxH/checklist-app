"use client"
import React, { useEffect, useState } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {
  DataGrid, GridColDef, GridToolbar,
  GridRowParams, GridToolbarQuickFilter, GridToolbarContainer,
  GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport
} from '@mui/x-data-grid';
import { Alert, Box, Button, Grid, IconButton, Modal, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import VerticalActions from '@/components/_ui/VerticalActions';
import { getOrders, OrderWithRelations } from './action';
import formatDate from '@/lib/formatDate';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { TreeItem } from '@mui/x-tree-view/TreeItem';


function BasicSimpleTreeView() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <SimpleTreeView>
        <TreeItem itemId="grid" label="Data Grid">
          <TreeItem itemId="grid-community" label="@mui/x-data-grid" />
          <TreeItem itemId="grid-pro" label="@mui/x-data-grid-pro" />
          <TreeItem itemId="grid-premium" label="@mui/x-data-grid-premium" />
        </TreeItem>
        <TreeItem itemId="pickers" label="Date and Time Pickers">
          <TreeItem itemId="pickers-community" label="@mui/x-date-pickers" />
          <TreeItem itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
        </TreeItem>
      </SimpleTreeView>
    </Box>
  );
}

// Separate Modal Component
const ViewModal: React.FC<{
  data: OrderWithRelations | null;
  open: boolean;
  onClose: () => void;
}> = ({ data, open, onClose }) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "75%",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  if (!data) return null;
  const vehicle = data.vehicle ? `${data.vehicle.plate} - ${data.vehicle.model}` : 'N/A'
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Detalhes da Ordem de Serviço
        </Typography>

        <Grid container>

          <Grid size={{ xs: 5, sm: 4 }}>
            <Typography sx={{ mt: 2 }}>OS: #{`${String(data.id).padStart(5, '0')}`}</Typography>
          </Grid>
          <Grid size={{ xs: 7, sm: 4 }}>
            <Typography sx={{ mt: 2 }}>Tipo: {data.maintenanceType || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography sx={{ mt: 2 }}>Status: {data.isCompleted ? 'Finalizado' : 'Em andamento'}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography sx={{ mt: 2 }}>Usuário: {data.user?.name || 'N/A'} </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography sx={{ mt: 2 }}>Veículo: {vehicle}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography>Data de Entrada: {data.entryDate ? formatDate(data.entryDate) : 'N/A'}
            </Typography>
            <Typography>Data de Conclusão: {data.completionDate ? formatDate(data.completionDate) : 'Em andamento'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography sx={{ mt: 2 }}>Centro de manutenção: {data?.maintenanceCenter?.name || "N/A"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography sx={{ mt: 2 }}>Oficina: {data?.destination || "N/A"}</Typography>
          </Grid>

          <Grid size={12} sx={{ mt: 2 }}>
            <Typography fontSize={22}>Serviço: </Typography>
            <Typography>{data.serviceDescriptions || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="contained">
            Fechar
          </Button>
        </Box>
      </Box>
    </Modal >
  );
};

const OrdersPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [row, setRow] = useState<OrderWithRelations[]>();
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);

  const [collapsed, setCollapsed] = useState("");

  // Use useEffect instead of useMemo for side effects
  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      try {
        const orders = await getOrders();
        if (orders) {
          setRow(orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, []);

  const [paginationModel, setPaginationModel] = React.useState({ pageSize: 10, page: 0 });

  const calcularDiferenca = (inicio: string, fim?: string) => {
    const inicio1 = new Date(inicio);
    const fim1 = fim ? new Date(fim) : new Date();
    const diferencaMs = fim1.getTime() - inicio1.getTime();
    return {
      milissegundos: diferencaMs,
      segundos: Math.floor(diferencaMs / 1000),
      minutos: Math.floor(diferencaMs / (1000 * 60)),
      horas: Math.floor(diferencaMs / (1000 * 60 * 60)),
      dias: Math.floor(diferencaMs / (1000 * 60 * 60 * 24)),
      meses: Math.floor(diferencaMs / (1000 * 60 * 60 * 24 * 30.44)), // aproximado
      anos: Math.floor(diferencaMs / (1000 * 60 * 60 * 24 * 365.25)) // aproximado
    };
  }

  function dateDiff(dataInicial: string, dataFinal: string) {
    const diff = calcularDiferenca(dataInicial, dataFinal);

    if (diff.dias > 0) {
      const horasRestantes = diff.horas % 24;
      const minRest = diff.minutos % 60;
      return `${diff.dias} dias, ${horasRestantes} horas ${minRest > 0 ? "e " + minRest + " minutos" : ""} `;
    } else if (diff.horas > 0) {
      const minRest = diff.minutos % 60;
      return `${diff.horas} horas ${minRest > 0 ? "e " + minRest + " minutos" : ""}`;
    } else {
      return `${diff.minutos} minutos`;
    }
  }

  // Handle modal operations
  const handleViewOrder = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };


  const ITEMS = [
    { id: 'tree-view-community', label: 'Community' },
    { id: 'tree-view-another-item', label: 'Another Item' },
  ];

function getItemId(item:OrderWithRelations) {
  return item.id;
}
  
  // Column definitions
  const columns: GridColDef[] = [
    {
      field: '', headerName: '', width: 20, renderCell(params) {
        const check = () => setCollapsed(test ? "" : params.row.id)
        const test = (params.row.id === collapsed);
        return (
          <Box>
            <IconButton onClick={check}>{test ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
          </Box>
        )
      },
    },
    { field: 'id', headerName: 'OS', maxWidth: 70, valueFormatter: (v) => `#${String(v).padStart(5, '0')}` },
    { field: 'user', headerName: 'Usuário', flex: 1, valueFormatter: (v: { name: string }) => v.name },
    { field: 'vehicle', headerName: 'Veiculo', flex: 1, valueFormatter: (v: { plate: string; model: string }) => `${v.plate} - ${v.model}` },
    { field: 'maintenanceType', headerName: 'Tipo manutenção', flex: 1 },
    { field: 'entryDate', headerName: 'ENTRADA', minWidth: 140, valueFormatter: (v) => formatDate(v) },
    { field: 'completionDate', headerName: 'SAÍDA', minWidth: 140, valueFormatter: (v) => formatDate(v) },
    { field: 'time', headerName: 'TEMPO PARADO', flex: 1, valueFormatter: (v, row) => dateDiff(row.entryDate, row.completionDate) },
    { field: 'isCompleted', headerName: 'FINALIZADO', flex: 1, maxWidth: 110, valueFormatter: (v) => v ? "SIM" : "NÃO" },
    {
      field: 'actions', type: 'actions', headerName: 'Ações', minWidth: 120,
      getActions: ({ row }: GridRowParams) => [
        <VerticalActions
          key={row.id as string}
          isMobile={isMobile}
          params={row}
          handleEdit={() => { }}
          handleView={() => handleViewOrder(row as OrderWithRelations)}
          handleDelete={() => { }}
        />
      ]
    }
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport slotProps={{ tooltip: { sx: { width: 100 } }, button: { sx: { width: 50 } } }} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={2} alignItems={'center'}>
          <GridToolbarQuickFilter variant="outlined" size="small" />
          <Button onClick={() => { }} variant="contained" size='large' color="primary">Novo</Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  const xs = isMobile ? { year: false, eixo: false, model: false } : null

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ m: 4 }}>
        <Typography fontSize={26}>Ordem de Serviços</Typography>
      </Box>
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <DataGrid
          rows={row || []}
          columns={columns}
          loading={loading}
          pagination
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          slots={{ toolbar: CustomToolbar || GridToolbar }}
          localeText={{
            toolbarColumns: "",
            toolbarFilters: "",
            toolbarExport: "",
            toolbarDensity: ""
          }}
          density="standard"
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            columns: {
              columnVisibilityModel: { ...xs },
            },
          }}
        />
      </Box>

      {/* Modal Component */}
      <ViewModal
        data={selectedOrder}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default OrdersPage;