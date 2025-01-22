"use client"
import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField } from '@mui/material';
import { prisma } from '@/lib/prisma';
import { AddKeyModal } from './AddKeyModal';

interface Key {
  id: string;
  userId: string;
  vehicleId: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
  };
  vehicle: {
    model: string | null;
    id: string;
    plate: string;
  };
  parent: {
    user: {
      id: string;
      name: string;
    };
    vehicle: {
      model: string | null;
      id: string;
      plate: string;
    };
  }[]
}

const KeyTable = () => {
  interface Data {
    vehicleKey: Key[];
    users: { id: string; name: string }[];
    vehicles: { id: string; model: string | null; plate: string }[];
  }

  const [data, setData] = useState<Data | null>(null);
  const [keys, setKeys] = useState<Key[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<Key[]>([]);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [vehicleIdFilter, setVehicleIdFilter] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      const u = { select: { id: true, name: true } }
      const v = { select: { id: true, model: true, plate: true } }
      const [vehicleKey, users, vehicles] = await Promise.all([
          prisma.vehicleKey.findMany({
            include: {
              user: u,
              vehicle: v,
              parent: {
                include: {
                  user: u,
                  vehicle: v
                },
              },
              children: {
                include: {
                  user: u,
                  vehicle: v,
                },
              },
            },
          }),
          prisma.user.findMany({...u}),
          prisma.vehicle.findMany({...v}),
        ]);
      setData({vehicleKey, users, vehicles})
      setKeys(vehicleKey);
      setFilteredKeys(vehicleKey);
    };

    fetchKeys();
  }, []);

  useEffect(() => {
    setFilteredKeys(
      keys.filter(key =>
        (userIdFilter ? key.userId === String(userIdFilter) : true) &&
        (vehicleIdFilter ? key.vehicleId === String(vehicleIdFilter) : true)
      )
    );
  }, [userIdFilter, vehicleIdFilter, keys]);

  return (
    <Container>
      <TextField
        label="Filtrar por ID de Usuário"
        value={userIdFilter}
        onChange={(e) => setUserIdFilter(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Filtrar por ID de Veículo"
        value={vehicleIdFilter}
        onChange={(e) => setVehicleIdFilter(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Usuário</TableCell>
            <TableCell>Veículo</TableCell>
            <TableCell>Data de Assoc.</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>{key.id}</TableCell>
              <TableCell>{key.user.name}</TableCell>
              <TableCell>{key.vehicle.model}</TableCell>
              <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>Adicionar Chave</Button>

      <AddKeyModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(a) => {}}
        users={[]}
        vehicles={[]}
      />

    </Container>
  );
};

export default KeyTable;
