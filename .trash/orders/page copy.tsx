"use client"
import React, { useMemo, useState } from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { getOrders, OrderWithRelations } from './action';

const rows: GridRowsProp = [
  { id: "#00001", name: 'Data Grid', description: 'the Community version', options: "#" },
  { id: "#00002", name: 'Data Grid Pro', description: 'the Pro version', options: "#" },
  { id: "#00003", name: 'Data Grid Premium', description: 'the Premium version', options: "#" },
];

const columns: GridColDef[] = [
  { field: 'id', headerName: 'OS', width: 300 },
  { field: 'user.name', headerName: 'Product Name', flex: 1 },
  { field: 'description', headerName: 'Description', width: 300 },
  { field: 'options', headerName: '', width: 80 },
];

export default function Page() {
  const [ data, setData ] = useState<OrderWithRelations[]>();
  
  useMemo(()=>{
    const setup = async()=>await getOrders().then(setData);
    setup();
  },[])
  
  return (
    <div style={{ width: '100%' }}>
      <DataGrid rows={data||rows} columns={columns} />
    </div>
  );
}
