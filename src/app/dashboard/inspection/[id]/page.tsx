'use client'
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useParams } from 'next/navigation';
import Loading from '@/components/Loading';
import { formatDate } from '@/lib/ultils';

type Props = {
  id: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
  }
  vehicle: {
    plate: string
  }
}



export default function Page() {
  const { id } = useParams<{ id: string; tag: string; item: string }>();
  const [rows, setRows] = React.useState<Props[]>([]);

  React.useMemo(() => {
    const fetchInspections = async () => {
      console.log(id);
      const response = await fetch("/api/admin/vehicle", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      setRows(data);
    };

    fetchInspections();
  }, [id]);

  if (!id || !rows) return <Loading/>

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Usuario</TableCell>
            <TableCell align="right">Veiculo</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell sx={{xs:{display:'none'}}} align="right">Data</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">{row.user.name}</TableCell>
              <TableCell align="right">{row.vehicle.plate}</TableCell>
              <TableCell align="right">{row.status}</TableCell>
              <TableCell sx={{xs:{display:'none'}}} align="right">{formatDate(row.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}