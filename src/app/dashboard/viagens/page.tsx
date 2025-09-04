'use client';
import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Edit, Delete, ReportProblem, Visibility } from '@mui/icons-material';
import Swal from 'sweetalert2';
import ReusableTable, { ColumnConfig, FilterConfig, SearchConfig, ExpandableConfig, ExportConfig, CustomFilterConfig } from '@/components/DataTable';
import { dateDiff, fetcher, today } from '@/lib/ultils';
import { Inspect, inspection, MaintenanceCenter, Oficina, user, vehicle } from '@prisma/client';
import useSWR from 'swr';
import StatusUpdateModal from './Modal';
import formatDate from '@/lib/formatDate';
import { useInspectionUpdate } from '@/hooks/useInspectionUpdate';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Função auxiliar para formatação de data
function newDate(dataString: string) {
  const data = new Date(dataString);
  const options = { timeZone: 'America/Cuiaba' };
  const dataFormatada = data.toLocaleString('pt-BR', options);
  return dataFormatada;
}


type VehicleInspection = Inspect & {
  start: inspection;
  end: inspection;
  vehicle: Partial<vehicle>;
  user: user;
}

export default function OrdersTableExample() {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR<VehicleInspection[]>('/api/v1/dashboard/viagens', fetcher);
  const [selected, setSelected] = useState<VehicleInspection|null>();

  const onDelete = async (id: string) => {
    
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
      try {
        const response = await axios.delete(`/api/v2/inspect/${id}`);
        await Swal.fire({title: "Excluída!",text: "Excluído com sucesso!",icon: "success"});
        mutate()
      } catch (error) {
        console.error('Delete failed:', error);
        await Swal.fire({title: "Error!",text: "Erro ao DELETAR",icon: "error"});
      }
    }
  }

  // Configuração das colunas
  const columns: ColumnConfig<VehicleInspection>[] = [
    { key: 'user.name', label: 'RESPONSÁVEL', width: 160, align: 'center' },
    { key: 'vehicle.plate', label: 'VEICULO', align: 'center', width: 80 },
    { key: 'start.dataInspecao', label: 'DATA INÍCIO', align: 'center', width: 120, render(row, onRefresh, value) {
      return <>{new Date(row.start.createdAt).toLocaleString()}</>
    }},
    { key: 'end.dataInspecao', label: 'DATA FINAL', align: 'center', width: 160, render(row, onRefresh, value) {
      return <>{row?.endId ? new Date(row.end.createdAt).toLocaleString() : ""}</>
    }},
    { key: 'start.kilometer', label: 'KM INÍCIO', align: 'center', width: 120 },
    { key: 'end.kilometer', label: 'KM FINAL', align: 'center', width: 160 },
    {
      key: 'status', label: 'STATUS', align: 'center', width: 160, render(row) {
        if (row.endId)
          return <Typography color='success'>FINALIZADO</Typography>
        return <Typography color='warning'>EM ANDAMENTO</Typography>
      },
      renderFilter: {
        enabled: true,
        type: 'select',
        options: [
          { value: 'FINALIZADO', label: 'FINALIZADO' },
          { value: 'EM ANDAMENTO', label: 'EM ANDAMENTO' }
        ],
        getFilterValue: (row) => row.endId ? "FINALIZADO" : "EM ANDAMENTO"
      }
    },
    {
      key: 'id', label: 'Ações', align: 'right', width: 100,
      render: (row) => {
        const hasIssues = () => {
          const check = [row.start, ...(row?.end ? [row.end] : [])].map(item => (
            item.nivelAgua != 'NORMAL' ||
            item.nivelOleo != 'NORMAL' ||
            item.avariasCabine === 'SIM' ||
            item.bauPossuiAvarias === 'SIM' ||
            item.funcionamentoParteEletrica === 'RUIM' ||
            item?.dianteira === 'RUIM' ||
            item?.tracao === 'RUIM' ||
            item?.truck === 'RUIM' ||
            item?.quartoEixo === 'RUIM'
          ));
          return check.includes(true);
        };
        return (
          <Box>
            <IconButton size="small" onClick={() => router.push(`/dashboard/viagens/${row.id}`)}>
                <Visibility />
              </IconButton>
            <IconButton size="small" color='error' onClick={() => onDelete(row.id)}><Delete /></IconButton>
            {hasIssues() ? (
              <IconButton size="small" onClick={() => { setSelected(row) }} color="warning">
                <ReportProblem />
              </IconButton>
            ) : <></>}
          </Box>)
      }
    }
  ];

  // Configuração da busca
  const searchConfig: SearchConfig<VehicleInspection> = {
    searchFields: ['user.name', 'vehicle.model', 'vehicle.plate', 'id'],
    placeholder: 'Pesquisar por responsável, veículo, OS...'
  };

  // Configuração dos filtros
  const filtersConfig: FilterConfig[] = [
    { key: 'user.name', label: 'Responsável', type: 'select', getOptionsFromData: true },
    { key: 'vehicle.plate', label: 'Placa', type: 'select', getOptionsFromData: true },
  ];

  // Configuração dos detalhes expansíveis
  const RenderTableBody = ({label,value="N/A"}:{label:string,value?:string})=>(
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell>{ value || 'N/A'}</TableCell>
    </TableRow>
  );
  const expandableConfig: ExpandableConfig<VehicleInspection> = {
    render: (row) => (
      <Box sx={{ display: 'flex', gap: 4, mb: 2, flexDirection: 'column' }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Detalhes da ordem de serviço
          </Typography>
          <Box sx={{ display: "flex" }}>
            {[row.start, ...(row?.end ? [row.end] : [])].map((item, index) => (
              <Box key={index} flex={1}>
                <Typography variant="subtitle1" fontWeight={"bold"} gutterBottom>
                  {index === 0 ? "Inicio da Viagem:" : "Final da Viagem:"} {item?.dataInspecao ? formatDate(item.dataInspecao.toString()) : 'Data não disponível'}
                </Typography>
                <Table size="small" aria-label="inspection-start">
                  <TableBody>
                    {
                    [{
                      "CRLV": item.crlvEmDia,
                      "Certificado Tacógrafo":item?.certificadoTacografoEmDia,
                      "Nível de Água":item?.nivelAgua,
                      "Nível de Óleo":item?.nivelOleo,
                      "Pneus Dianteiros":item?.dianteira,
                      "Pneus Tração":item?.tracao,
                      "Truck":item?.truck,
                      "4° Eixo":item?.quartoEixo,
                      "Avarias Cabine":item.avariasCabine,
                      "Avarias Baú":item?.bauPossuiAvarias,
                      "Parte Elétrica": item?.funcionamentoParteEletrica || "N/A",
                      "Extintor": item?.extintor || "N/A"
                    }].map((item) =>  Object.entries(item).map(([label, value], i) => (
                        <RenderTableBody key={i} label={label} value={value||""} />
                      )))
                    }
                  </TableBody>
                </Table>
              </Box>))}
          </Box>
        </Box>
      </Box>
    )
  };


  if (!data) return <></>;

  return (
    <div>
      <ReusableTable
        data={data}
        loading={isLoading}
        onRefresh={mutate}
        title="Ordem de Serviços"
        columns={columns}
        keyField="id"
        searchConfig={searchConfig}
        filtersConfig={filtersConfig}
        rowsPerPage={5}
        expandableConfig={expandableConfig}
        exportConfig={{
          enabled: true,
          filename: "inspecoes_veiculares.csv",
          mapData: (row) => ({
            id: row.id,
            status: row.user.name,
            dataINICIO: new Date(row.start.createdAt).toLocaleDateString('pt-BR'),
            dataFINAL: row.endId?new Date(row.end.createdAt).toLocaleDateString('pt-BR'):"",
            veiculo: `${row.vehicle.make} ${row.vehicle.model}`,
            placa: row.vehicle.plate,
            KmInicial: row.start.kilometer,
            KmFinal: row.endId ? row.end.kilometer : ''
          })
        }}
        emptyMessage="Nenhuma ordem de serviço encontrada"
      />

      <StatusUpdateModal
        open={!!selected}
        onClose={() => setSelected(null)}
        inspectionData={selected}
        onSave={async (id,data) => {
          const { data: res } = await axios.put(`/api/v1/dashboard/viagens/${id}/update-status`,data);
          if(res){
            alert("Error ao salvar");
            mutate();
          }
        }}
        loading={isLoading}
      />
    </div>
  );
}