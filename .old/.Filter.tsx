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
  Grid,
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
  TextField,
  Tooltip
} from '@mui/material'
import { 
  History, 
  FilterList, 
  Clear 
} from '@mui/icons-material'
import HistoryModal from './HistoryModal'

// Interfaces remain the same as in previous implementation

interface Filters {
  vehicleModel?: string
  userNames?: string[]
  dateRange: {
    start?: string
    end?: string
  }
  minTransfers?: number
}

export default function VehicleKeysPage() {
  const [data, setData] = useState<DataType>({ 
    users: [], 
    vehicles: [], 
    vehicleKeys: [] 
  })
  const [groupedVehicleKeys, setGroupedVehicleKeys] = useState<GroupedVehicleKeys>({})
  const [filteredGroupedVehicleKeys, setFilteredGroupedVehicleKeys] = useState<GroupedVehicleKeys>({})
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedVehicleKeys, setSelectedVehicleKeys] = useState<VehicleKey | null>(null)

  const [open, setOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    vehicleId: ''
  })

  const [filters, setFilters] = useState<Filters>({
    dateRange: {}
  })

  useEffect(() => {
    fetchVehicleKeys()
  }, [])

  useEffect(() => {
    if (data.vehicleKeys.length > 0) {
      groupVehicleKeys()
    }
  }, [data.vehicleKeys])

  useEffect(() => {
    applyFilters()
  }, [groupedVehicleKeys, filters])

  const fetchVehicleKeys = async () => {
    try {
      const response = await fetch('/api/dashboard/admin/keys')
      const fetchedData: DataType = await response.json()
      setData(fetchedData)
    } catch (error) {
      console.error('Error fetching vehicle keys:', error)
    }
  }

  const groupVehicleKeys = () => {
    // Same implementation as previous version
    // ... (existing groupVehicleKeys logic)
  }

  const applyFilters = () => {
    const filtered = Object.fromEntries(
      Object.entries(groupedVehicleKeys).filter(([_, group]) => {
        // Vehicle Model Filter
        if (filters.vehicleModel && 
            !group.vehicle.model.toLowerCase().includes(filters.vehicleModel.toLowerCase())) {
          return false
        }

        // User Names Filter
        if (filters.userNames && filters.userNames.length > 0 && 
            !filters.userNames.includes(group.latestKey.user.name)) {
          return false
        }

        // Date Range Filter
        const keyDate = new Date(group.latestKey.createdAt)
        if (filters.dateRange.start && keyDate < new Date(filters.dateRange.start)) {
          return false
        }
        if (filters.dateRange.end && keyDate > new Date(filters.dateRange.end)) {
          return false
        }

        // Minimum Transfers Filter
        if (filters.minTransfers && group.keys.length < filters.minTransfers) {
          return false
        }

        return true
      })
    )

    setFilteredGroupedVehicleKeys(filtered)
  }

  const resetFilters = () => {
    setFilters({ dateRange: {} })
  }

  const renderFilterDialog = () => (
    <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Filtros de Veículos</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Modelo do Veículo"
              value={filters.vehicleModel || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev, 
                vehicleModel: e.target.value
              }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Usuários</InputLabel>
              <Select
                multiple
                value={filters.userNames || []}
                onChange={(e) => setFilters(prev => ({
                  ...prev, 
                  userNames: e.target.value as string[]
                }))}
              >
                {data.users.map((user) => (
                  <MenuItem key={user.id} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data Inicial"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.dateRange.start || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev, 
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data Final"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.dateRange.end || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev, 
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mínimo de Transferências"
              type="number"
              value={filters.minTransfers || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev, 
                minTransfers: Number(e.target.value)
              }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetFilters} startIcon={<Clear />}>
          Limpar
        </Button>
        <Button onClick={() => setFilterOpen(false)} variant="contained">
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
      >
        <Tooltip title="Filtros">
          <IconButton onClick={() => setFilterOpen(true)}>
            <FilterList />
          </IconButton>
        </Tooltip>
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
              <TableCell>Veículo</TableCell>
              <TableCell>Último Responsável</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Total Transferências</TableCell>
              <TableCell>Última Transferência</TableCell>
              <TableCell>Opções</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(filteredGroupedVehicleKeys).map((group) => (
              <TableRow key={group.vehicle.id}>
                {/* Table row content remains the same */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Existing dialogs and modals */}
      {renderFilterDialog()}

      {selectedVehicleKeys && (
        <HistoryModa
          open={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          vehicleKeys={groupedVehicleKeys[selectedVehicleKeys.vehicleId]}
        />
      )}
    </Container>
  )
}