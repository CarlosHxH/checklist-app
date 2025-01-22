'use client'

import { useEffect, useState } from 'react'
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { VehicleKey } from '@/types/vehicle'
import HistoryModal from './HistoryModal';
import { History } from '@mui/icons-material';


type DataType = { users: { id: string, name: string }[], vehicles: { id: string, plate: string, model: string }[], vehicleKeys: VehicleKey[] };

export default function VehicleKeysPage() {
  const [data, setData] = useState<DataType>({ users: [], vehicles: [], vehicleKeys: [] })
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedVehicleKeys, setSelectedVehicleKeys] = useState([]);

  const [vehicleKeys, setVehicleKeys] = useState<VehicleKey[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    vehicleId: ''
  })

  console.log(data);


  useEffect(() => {
    fetchVehicleKeys()
  }, [])

  const fetchVehicleKeys = async () => {
    try {
      const response = await fetch('/api/admin/keys')
      const data = await response.json()
      setData(data);
      setVehicleKeys(data.vehicleKeys)
    } catch (error) {
      console.error('Error fetching vehicle keys:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        fetchVehicleKeys()
        setFormData({ userId: '', vehicleId: '' })
      }
    } catch (error) {
      console.error('Error creating vehicle key:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box display="flex" justifyContent="end" bgcolor={'smoke'} alignItems="center" mb={4}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Novo cadastro
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Opções</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicleKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.id.slice(0, 6)}</TableCell>
                <TableCell>{key.user.name}</TableCell>
                <TableCell>{key.vehicle.plate}</TableCell>
                <TableCell>{key.parentId || 'N/A'}</TableCell>
                <TableCell>{new Date(key.createdAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(key.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedVehicleKeys(data);
                      setHistoryModalOpen(true);
                    }}
                  >
                    <History fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Transferir chave</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Usuário</InputLabel>
            <Select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}>
              {data && data?.users.map((u) => (<MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Veiculo</InputLabel>
            <Select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}>
              {data && data?.vehicles.map((v) => (<MenuItem key={v.id} value={v.id}>{v.plate + " - " + v.model}</MenuItem>))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      <HistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        vehicleKeys={selectedVehicleKeys}
      />
    </Container>
  )
}