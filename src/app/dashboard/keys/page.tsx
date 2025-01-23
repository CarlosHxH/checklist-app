'use client'

import { useEffect, useState } from 'react'
import { 
  Box, 
  Button, 
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  FormControl, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  useMediaQuery, 
  useTheme
} from '@mui/material'
import { History } from '@mui/icons-material'
import HistoryModal from './HistoryModal'

interface User {
  id: string
  name: string
}

interface Vehicle {
  id: string
  plate: string
  model: string
  vehicleKeys?: VehicleKey[]
}

interface VehicleKey {
  id: string
  userId: string
  vehicleId: string
  createdAt: string
  updatedAt: string
  parentId: string | null
  user: User
  vehicle: Vehicle
}

interface DataType {
  users: User[]
  vehicles: Vehicle[]
  vehicleKeys: VehicleKey[]
}

interface GroupedVehicleKeys {
  [vehicleId: string]: {
    vehicle: Vehicle
    keys: VehicleKey[]
    latestKey: VehicleKey
  }
}

export default function VehicleKeysPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState<DataType>({ 
    users: [], 
    vehicles: [], 
    vehicleKeys: [] 
  })
  const [groupedVehicleKeys, setGroupedVehicleKeys] = useState<GroupedVehicleKeys>({})
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedVehicleKeys, setSelectedVehicleKeys] = useState<VehicleKey | null>(null)

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    vehicleId: ''
  })

  useEffect(() => {
    fetchVehicleKeys()
  }, [])

  useEffect(() => {
    if (data.vehicleKeys.length > 0) {
      groupVehicleKeys()
    }
  }, [data.vehicleKeys])

  const fetchVehicleKeys = async () => {
    try {
      const response = await fetch('/api/admin/keys')
      const fetchedData: DataType = await response.json()
      setData(fetchedData)
    } catch (error) {
      console.error('Error fetching vehicle keys:', error)
    }
  }

  const groupVehicleKeys = () => {
    const grouped = data.vehicleKeys.reduce<GroupedVehicleKeys>((acc, key) => {
      if (!acc[key.vehicleId]) {
        acc[key.vehicleId] = {
          vehicle: { 
            ...key.vehicle,
            vehicleKeys: data.vehicleKeys.filter(k => k.vehicleId === key.vehicleId)
          },
          keys: [],
          latestKey: key
        }
      }
      
      acc[key.vehicleId].keys.push(key)
      
      if (new Date(key.createdAt) > new Date(acc[key.vehicleId].latestKey.createdAt)) {
        acc[key.vehicleId].latestKey = key
      }
      
      return acc
    }, {})
    setGroupedVehicleKeys(grouped)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parentId: groupedVehicleKeys[formData.vehicleId]?.latestKey?.id || null
        }),
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
      <Box 
        display="flex" 
        justifyContent="flex-end" 
        alignItems="center" 
        mb={4}
      >
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
        >
          Novo cadastro
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {!isMobile&&<TableCell>Veículo</TableCell>}
              <TableCell>Último Responsável</TableCell>
              <TableCell>Placa</TableCell>
              {!isMobile&&<TableCell>Total Transferências</TableCell>}
              {!isMobile&&<TableCell>Última Transferência</TableCell>}
              <TableCell>Opções</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(groupedVehicleKeys).map((group, i:number) => (
              <TableRow key={i}>
                {!isMobile&&<TableCell>{group.vehicle.model}</TableCell>}
                <TableCell>{group.latestKey.user.name}</TableCell>
                <TableCell>{group.vehicle.plate}</TableCell>
                {!isMobile&&<TableCell>{group.keys.length}</TableCell>}
                {!isMobile&&<TableCell>{new Date(group.latestKey.createdAt).toLocaleString()}</TableCell>}
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedVehicleKeys(group.latestKey)
                      setHistoryModalOpen(true)
                    }}
                  >
                    <History fontSize="small" />
                    {isMobile && <Typography variant='body2'>{group.keys.length}</Typography>}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Transferir chave</DialogTitle>
        <DialogContent>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Veículo</InputLabel>
            <Select
              value={formData.vehicleId}
              label="Veículo"
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            >
              {data.vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {`${v.plate} - ${v.model}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
            <InputLabel>Usuário</InputLabel>
            <Select
              value={formData.userId}
              label="Usuário"
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            >
              {data.users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>

      {selectedVehicleKeys && (
        <HistoryModal
          open={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          vehicleKeys={groupedVehicleKeys[selectedVehicleKeys.vehicleId]}
        />
      )}
    </Container>
  )
}