'use client';
import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import ReusableTable, {  ColumnConfig, FilterConfig,  SearchConfig, ExpandableConfig, ExportConfig  } from '@/components/DataTable';
import { getOrders, OrderWithRelations, deleteOrder } from './actions';
import { dateDiff, today } from '@/lib/ultils';
import OrderEditModal from './OrderEditModal';
import OrderCreateModal from './OrderCreateModal';
import { MaintenanceCenter, Oficina, user, vehicle } from '@prisma/client';

// Função auxiliar para formatação de data
function newDate(dataString: string) {
  const data = new Date(dataString);
  const options = {
    timeZone: 'America/Cuiaba'
  };
  const dataFormatada = data.toLocaleString('pt-BR', options);
  return dataFormatada;
}

export default function OrdersTableExample() {
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [createModal, setCreateModal] = useState(false);
  
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [users, setUsers] = useState<user[]>([]);
  const [vehicles, setVehicles] = useState<vehicle[]>([]);
  const [maintenanceCenter, setMaintenanceCenter] = useState<MaintenanceCenter[]>([]);
  const [oficinas, setOficinas] = useState<Oficina[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      
      if (data) {
        setOrders(data.orders);
        setUsers(data.users);
        setVehicles(data.vehicles);
        setOficinas(data.oficina);
        setMaintenanceCenter(data.maintenanceCenter);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id:string, callback: ()=>void) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não será capaz de reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, exclua!"
    });

    if (result.isConfirmed) {
      await deleteOrder(id);
      await Swal.fire({
        title: "Excluída!",
        text: "Excluído com sucesso!",
        icon: "success"
      }).then(callback);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // Configuração das colunas
  const columns: ColumnConfig<OrderWithRelations>[] = [
    { key: 'id', label: 'OS', render: (row) => `#${String(row.id).padStart(5, '0')}`, width: 100},
    { key: 'user.name', label: 'Responsável', width: 150 },
    { key: 'vehicle', label: 'Veículo', render: (row) => `${row.vehicle.plate} - ${row.vehicle.model}`, width: 210 },
    { key: 'oficina.name', label: 'Oficina', align: 'right', width: 150, render: (row) => (<Typography fontSize={12}>{row.oficina.name}</Typography>)},
    { key: 'startedData', label: 'Data INÍCIO', align: 'right', width: 120, render: (row) => newDate(row.startedData.toString()) || "N/A" },
    { key: 'finishedData', label: 'Data FINAL', align: 'right', width: 120, render: (row) => row.finishedData ? newDate(row.finishedData.toString()) : "N/A" },
    { key: 'duration', label: 'Tempo Parado', align: 'right', width: 150, render: (row) => (
      <Typography fontSize={12}>{dateDiff(row.startedData.toString(), row?.finishedData?.toString())}</Typography>
    )},
    { key: 'isCompleted', label: 'Status', align: 'right', width: 160,
      render: (row) => (<Typography fontSize={12} color={row.isCompleted ? "success" : "error"}> {row.isCompleted ? "FINALIZADO" : "EM MANUTENÇÃO"} </Typography>),
    },
    { key: 'osNumber', label: 'Ações', align: 'right', width: 140,
      render: (row, onRefresh) => (<>
        <IconButton size="small" onClick={() => setSelectedOrder(row)}><Edit /></IconButton>
        <IconButton size="small" color='error' onClick={()=>{onDelete(row.osNumber,onRefresh)}}><Delete /></IconButton>
      </>),
    }
  ];

  // Configuração da busca
  const searchConfig: SearchConfig<OrderWithRelations> = {
    searchFields: ['user.name', 'vehicle.model', 'vehicle.plate', 'id'],
    placeholder: 'Pesquisar por responsável, veículo, OS...'
  };

  // Configuração dos filtros
  const filtersConfig: FilterConfig[] = [
    { key: 'user.name', label: 'Responsável', type: 'select', getOptionsFromData: true },
    { key: 'vehicle.plate', label: 'Placa', type: 'select', getOptionsFromData: true },
    { key: 'oficina.name', label: 'Oficina', type: 'select', getOptionsFromData: true },
    { key: 'isCompleted', label: 'Status', type: 'select', options: [   { value: 'true', label: 'FINALIZADO' },   { value: 'false', label: 'EM MANUTENÇÃO' } ]}
  ];

  // Configuração dos detalhes expansíveis
  const expandableConfig: ExpandableConfig<OrderWithRelations> = {
    render: (row) => (
      <Box sx={{ display: 'flex', gap: 4, mb: 2, flexDirection: 'column' }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Detalhes da ordem de serviço
          </Typography>
          <Table size="small" aria-label="inspection-start">
            <TableHead>
              <TableRow>
                <TableCell sx={{fontWeight:'bold'}}>Tipo de manutenção</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Centro de manutenção</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>Quilometragem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{row.maintenanceType}</TableCell>
                <TableCell>{row.maintenanceCenter?.name}</TableCell>
                <TableCell>{row.kilometer}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography sx={{fontWeight:'bold'}}>Descrição do serviço:</Typography>
                  <Typography variant='subtitle1'>{row.serviceDescriptions}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
    )
  };

  // Configuração da exportação
  const exportConfig: ExportConfig<OrderWithRelations> = {
    enabled: true,
    filename: `orders_${today()}.csv`,
    mapData: (row) => ({
      "Número OS": "#" + String(row.id).padStart(5, '0'),
      "Usuario": row.user.name,
      "Veiculo Placa": row.vehicle.plate,
      "Veiculo Modelo": row.vehicle.model,
      "Quilometragem": row.kilometer,
      "Tipo de manutenção": row.maintenanceType,
      "Centro Manutenção": row.maintenanceCenter?.name,
      "Oficina": row.oficina.name,
      "Data de Inicio": row.startedData.toISOString(),
      "Data de Finalizacao": row?.finishedData ? row.finishedData.toISOString():"",
      "Tempo parado": dateDiff(row.startedData.toString(), row?.finishedData?.toString()),
      "Finalizado": row.isCompleted ? "SIM" : "NÃO",
      "Descrição do serviço": row.serviceDescriptions,
    })
  };

  return (
    <div>
      <ReusableTable
        data={orders}
        loading={loading}
        onRefresh={fetchOrders}
        title="Ordem de Serviços"
        columns={columns}
        keyField="id"
        searchConfig={searchConfig}
        filtersConfig={filtersConfig}
        rowsPerPage={5}
        expandableConfig={expandableConfig}
        exportConfig={exportConfig}
        createConfig={{
          enabled: true,
          onCreateClick: () => setCreateModal(true),
        }}
        emptyMessage="Nenhuma ordem de serviço encontrada"
      />

      <OrderEditModal
        open={selectedOrder !== null}
        onClose={() => {
          setSelectedOrder(null);
          fetchOrders();
        }}
        orderData={selectedOrder}
        users={users}
        oficinas={oficinas}
        vehicles={vehicles}
        centers={maintenanceCenter}
      />

      <OrderCreateModal
        open={createModal}
        onClose={() => {
          setCreateModal(false);
          fetchOrders();
        }}
        users={users}
        oficinas={oficinas}
        vehicles={vehicles}
        centers={maintenanceCenter}
      />
    </div>
  );
}