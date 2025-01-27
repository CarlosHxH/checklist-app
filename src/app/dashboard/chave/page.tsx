'use client';

import { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { formatDate } from '@/lib/ultils';

interface KeyLog {
  id: number;
  vehicleId: number;
  employeeId: number;
  pickupTime: string;
  returnTime: string | null;
  status: string;
  vehicle: {
    plate: string;
    model: string;
  };
  employee: {
    name: string;
    document: string;
  };
}

export default function Home() {
  const [keyLogs, setKeyLogs] = useState<KeyLog[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'plate', headerName: 'Placa', width: 130,
      valueGetter: (params: GridValueGetterParams) => params.row.vehicle.plate,
    },
    { field: 'model', headerName: 'Modelo', width: 130,
      valueGetter: (params: GridValueGetterParams) => params.row.vehicle.model,
    },
    { field: 'employeeName', headerName: 'Funcionário', width: 180,
      valueGetter: (params: GridValueGetterParams) => params.row.employee.name,
    },
    { field: 'pickupTime', headerName: 'Retirada', width: 180,
      valueGetter: (params: GridValueGetterParams) =>
        formatDate(new Date(params.row.pickupTime)),
    },
    { field: 'returnTime', headerName: 'Devolução', width: 180,
      valueGetter: (params: GridValueGetter) =>
        params.row.returnTime
          ? formatDate(new Date(params.row.returnTime))
          : '-',
    },
    { field: 'status', headerName: 'Status', width: 130 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 130,
      renderCell: (params) => {
        return params.row.status === 'PENDING' ? (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleReturn(params.row.id)}
          >
            Devolver
          </Button>
        ) : null;
      },
    },
  ];

  useEffect(() => {
    fetchKeyLogs();
  }, []);

  const fetchKeyLogs = async () => {
    const response = await fetch('/api/keys');
    const data = await response.json();
    setKeyLogs(data);
  };

  const handleCreateKeyLog = async () => {
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehicleId: parseInt(selectedVehicle),
        employeeId: parseInt(selectedEmployee),
      }),
    });

    if (response.ok) {
      setOpenDialog(false);
      fetchKeyLogs();
      setSelectedVehicle('');
      setSelectedEmployee('');
    }
  };

  const handleReturn = async (id: number) => {
    const response = await fetch(`/api/keys/${id}/return`, {
      method: 'POST',
    });

    if (response.ok) {
      fetchKeyLogs();
    }
  };

  return (
    <div style={{ height: 600, width: '100%', padding: 20 }}>
      <h1>Controle de Chaves de Veículos</h1>
      
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: 20 }}
      >
        Nova Retirada
      </Button>

      <DataGrid
        rows={keyLogs}
        columns={columns}
        paginationModel={{ pageSize: 10, page: 0 }}
        pageSizeOptions={[10]}
        checkboxSelection={false}
        disableRowSelectionOnClick
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nova Retirada de Chave</DialogTitle>
        <DialogContent>
          <FormControl fullWidth style={{ marginTop: 20 }}>
            <InputLabel>Veículo</InputLabel>
            <Select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              {vehicles.map((vehicle: any) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth style={{ marginTop: 20 }}>
            <InputLabel>Funcionário</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map((employee: any) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.document}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateKeyLog} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}