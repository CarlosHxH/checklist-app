// CollapsedTable.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { fetcher } from '@/lib/ultils';
import useSWR from 'swr';
import Loading from '@/components/Loading';

// Definição do tipo para os dados
interface VehicleInspection {
  id: string;
  userId: string;
  startId: string;
  endId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
  start: {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleKey: string | null;
    dataInspecao: string;
    status: string;
    crlvEmDia: string;
    certificadoTacografoEmDia: string;
    nivelAgua: string;
    nivelOleo: string;
    eixo: string;
    dianteira: string;
    descricaoDianteira: string;
    tracao: string;
    descricaoTracao: string;
    truck: string;
    descricaoTruck: string;
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
    avariasCabine: string;
    descricaoAvariasCabine: string | null;
    bauPossuiAvarias: string;
    descricaoAvariasBau: string | null;
    funcionamentoParteEletrica: string;
    descricaoParteEletrica: string | null;
    createdAt: string;
    updatedAt: string | null;
    kilometer: string;
    isFinished: boolean;
    extintor: string;
  };
  end: {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleKey: string | null;
    dataInspecao: string;
    status: string;
    crlvEmDia: string;
    certificadoTacografoEmDia: string;
    nivelAgua: string;
    nivelOleo: string;
    eixo: string;
    dianteira: string;
    descricaoDianteira: string;
    tracao: string;
    descricaoTracao: string;
    truck: string;
    descricaoTruck: string;
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
    avariasCabine: string;
    descricaoAvariasCabine: string | null;
    bauPossuiAvarias: string;
    descricaoAvariasBau: string | null;
    funcionamentoParteEletrica: string;
    descricaoParteEletrica: string | null;
    createdAt: string;
    updatedAt: string | null;
    kilometer: string;
    isFinished: boolean;
    extintor: string;
  };
}

// Componente de linha da tabela (Row)
function Row(props: { row: VehicleInspection }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  // Formatar a data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Diferença de quilometragem
  const kmDifference = Number(row.end.kilometer) - Number(row.start.kilometer);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.user.name}
        </TableCell>
        <TableCell align="right">{formatDate(row.createdAt)}</TableCell>
        <TableCell align="right">{row.start.kilometer} km</TableCell>
        <TableCell align="right">{row.end.kilometer} km</TableCell>
        <TableCell align="right">
          <Chip 
            label={`+${kmDifference} km`} 
            color={kmDifference > 0 ? "success" : "error"} 
            size="small" 
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalhes da Inspeção
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Inspeção Inicial ({formatDate(row.start.dataInspecao)})
                  </Typography>
                  <Table size="small" aria-label="inspection-start">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CRLV</TableCell>
                        <TableCell>{row.start.crlvEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Certificado Tacógrafo</TableCell>
                        <TableCell>{row.start.certificadoTacografoEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Água</TableCell>
                        <TableCell>{row.start.nivelAgua}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Óleo</TableCell>
                        <TableCell>{row.start.nivelOleo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Eixos</TableCell>
                        <TableCell>{row.start.eixo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Dianteiros</TableCell>
                        <TableCell>{row.start.dianteira}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Tração</TableCell>
                        <TableCell>{row.start.tracao}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Truck</TableCell>
                        <TableCell>{row.start.truck}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Cabine</TableCell>
                        <TableCell>{row.start.avariasCabine}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Baú</TableCell>
                        <TableCell>{row.start.bauPossuiAvarias}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Parte Elétrica</TableCell>
                        <TableCell>{row.start.funcionamentoParteEletrica}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Extintor</TableCell>
                        <TableCell>{row.start.extintor}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Inspeção Final ({formatDate(row.end.dataInspecao)})
                  </Typography>
                  <Table size="small" aria-label="inspection-end">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CRLV</TableCell>
                        <TableCell>{row.end.crlvEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Certificado Tacógrafo</TableCell>
                        <TableCell>{row.end.certificadoTacografoEmDia}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Água</TableCell>
                        <TableCell>{row.end.nivelAgua}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Nível de Óleo</TableCell>
                        <TableCell>{row.end.nivelOleo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Eixos</TableCell>
                        <TableCell>{row.end.eixo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Dianteiros</TableCell>
                        <TableCell>{row.end.dianteira}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pneus Tração</TableCell>
                        <TableCell>{row.end.tracao}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Truck</TableCell>
                        <TableCell>{row.end.truck}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Cabine</TableCell>
                        <TableCell>{row.end.avariasCabine}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avarias Baú</TableCell>
                        <TableCell>{row.end.bauPossuiAvarias}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Parte Elétrica</TableCell>
                        <TableCell>{row.end.funcionamentoParteEletrica}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Extintor</TableCell>
                        <TableCell>{row.end.extintor}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Componente principal da tabela
export default function CollapsibleTable() {
  const { data: rows, isLoading } = useSWR<VehicleInspection[]>('/api', fetcher);
  if(isLoading) return <Loading/>;
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Responsável</TableCell>
            <TableCell align="right">Data</TableCell>
            <TableCell align="right">KM Inicial</TableCell>
            <TableCell align="right">KM Final</TableCell>
            <TableCell align="right">Diferença</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}