"use client"
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface Data {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  state: string;
}

interface ColumnData {
  dataKey: keyof Data;
  label: string;
  numeric?: boolean;
  width?: number;
}

function createData(id: number): Data {
  return {
    id,
    firstName: "teste",
    lastName: "teste",
    age: 12,
    phone: "312312",
    state: "TESTE",
  };
}

const columns: ColumnData[] = [
  {
    width: 100,
    label: 'First Name',
    dataKey: 'firstName',
  },
  {
    width: 100,
    label: 'Last Name',
    dataKey: 'lastName',
  },
  {
    width: 50,
    label: 'Age',
    dataKey: 'age',
    numeric: true,
  },
  {
    width: 110,
    label: 'State',
    dataKey: 'state',
  },
  {
    width: 130,
    label: 'Phone Number',
    dataKey: 'phone',
  },
];

const rows: Data[] = Array.from({ length: 10 }, (_, index) => createData(index));

export default function ReactVirtualizedTable() {
  return (
    <Paper style={{ height: 400, width: '100%' }}>
      <TableContainer style={{ maxHeight: 400 }}>
        <Table sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.dataKey}
                  variant="head"
                  align={column.numeric ? 'right' : 'left'}
                  style={{ width: column.width }}
                  sx={{ backgroundColor: 'background.paper' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell
                    key={column.dataKey}
                    align={column.numeric ? 'right' : 'left'}
                  >
                    {row[column.dataKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}