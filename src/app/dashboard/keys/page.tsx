'use client'
import { useEffect, useState } from 'react'
import {
  Alert, Backdrop, Box, Button, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useMediaQuery, useTheme
} from '@mui/material'
import { History, Refresh } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close';
import HistoryModal from '@/components/_ui/HistoryModal'
import useSWR from 'swr';
import { fetcher } from '@/lib/ultils';
import Loading from '@/components/Loading';

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
  status: "CONFIRMED" | "REJECTED" | "PENDING";
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

interface FormData {
  userId: string
  vehicleId: string
}

export default function VehicleKeysPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { data, isLoading, mutate } = useSWR<DataType>('/api/dashboard/keys', fetcher, { refreshInterval: 3000 })

  const [groupedVehicleKeys, setGroupedVehicleKeys] = useState<GroupedVehicleKeys>({})
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [resendConfirmDialogOpen, setResendConfirmDialogOpen] = useState(false)
  const [selectedVehicleKeys, setSelectedVehicleKeys] = useState<VehicleKey | null>(null)
  const [formData, setFormData] = useState<FormData>({ userId: '', vehicleId: '' })
  const [resendingKey, setResendingKey] = useState<VehicleKey | null>(null)
  
  useEffect(() => {
    if (data && data.vehicleKeys.length > 0) {
      groupVehicleKeys()
    }
  }, [data])

  const groupVehicleKeys = () => {
    const grouped = data?.vehicleKeys?.reduce<GroupedVehicleKeys>((acc, key) => {
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
    if (grouped) {
      setGroupedVehicleKeys(grouped)
    }
  }

  const validateForm = (): string | null => {
    if (!formData.vehicleId) return 'Selecione um veículo'
    if (!formData.userId) return 'Selecione um usuário'
    const currentKey = groupedVehicleKeys[formData.vehicleId]?.latestKey
    if (currentKey && currentKey.userId === formData.userId) return 'A chave já está com este usuário'
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    setConfirmDialogOpen(true)
  }

  const handleResendNotification = async (key: VehicleKey) => {
    setResendingKey(key)
    setResendConfirmDialogOpen(true)
  }

  const handleConfirmResend = async () => {
    if (!resendingKey) return
    setResendConfirmDialogOpen(false)
    try {
      const response = await fetch(`/api/keys/resend`, {
        method: 'PUT',
        body: JSON.stringify({ id: resendingKey.id })
      })
      if (!response.ok) throw new Error('Erro ao reenviar notificação')
      mutate();
      setSuccessMessage('Notificação reenviada com sucesso!')
    } catch (error) {
      console.error('Error resending notification:', error)
      setError('Erro ao reenviar a notificação. Tente novamente.')
    } finally {
      setResendingKey(null)
    }
  }

  const handleConfirmedSubmit = async () => {
    setConfirmDialogOpen(false)
    try {
      const response = await fetch('/api/dashboard/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: groupedVehicleKeys[formData.vehicleId]?.latestKey?.id || null
        }),
      })
      if (!response.ok) throw new Error('Erro ao transferir chave')
        mutate();
      setSuccessMessage('Chave transferida com sucesso!')
      handleCloseModal()
    } catch (error) {
      console.error('Error creating vehicle key:', error)
      setError('Erro ao transferir a chave. Tente novamente.')
    } finally {
      mutate()
    }
  }

  const handleCloseModal = () => {
    setOpen(false)
    setError(null)
    setFormData({ userId: '', vehicleId: '' })
  }

  const getCurrentKeyHolder = (vehicleId: string) => {
    return groupedVehicleKeys[vehicleId]?.latestKey?.user?.name || 'Nenhum'
  }

  const getCurrentKeyStatusPending = (vehicleId: string)=>{
    return (groupedVehicleKeys[vehicleId]?.latestKey?.status === "PENDING")
  }

  if (isLoading) return <Loading/>;

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5">Gestão de Chaves</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Nova Transferência</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {!isMobile && <TableCell>Veículo</TableCell>}
              <TableCell>Responsável Atual</TableCell>
              <TableCell>Placa</TableCell>
              {!isMobile && <TableCell>Status</TableCell>}
              {!isMobile && <TableCell>Última Transferência</TableCell>}
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(groupedVehicleKeys).map((group, i) => {

              const status = group.latestKey.status
              const title = status === 'CONFIRMED' ? 'CONFIRMADO' : status === 'REJECTED' ? 'REJEITADA' : 'PENDING';
              const color = status === 'CONFIRMED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange';

              // Rejeita a transferência
              const handleCancelNotification = async (latestKey: VehicleKey) => {
                if (!confirm("Deseja cancelar a transferencia de chave?")) return;
                if (!latestKey) return
                try {
                  const response = await fetch(`/api/keys/reject/${latestKey.id}`, {method: 'POST'})
                  if (!response.ok) throw new Error('Erro ao rejeitar transferência')
                } catch (error) {
                  console.error('Error:', error)
                  setError('Erro ao rejeitar transferência')
                } finally {
                  mutate();
                }
              }

              return (
                <TableRow key={i}>
                  {!isMobile && <TableCell>{group.vehicle.model}</TableCell>}
                  <TableCell>{group.latestKey.user.name}</TableCell>
                  <TableCell>{group.vehicle.plate}</TableCell>
                  {!isMobile && <TableCell sx={{ color: color }}>{title}</TableCell>}
                  {!isMobile && <TableCell>{new Date(group.latestKey.createdAt).toLocaleString('pt-BR')}</TableCell>}
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <IconButton onClick={() => { setSelectedVehicleKeys(group.latestKey); setHistoryModalOpen(true) }}>
                        <History fontSize="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>{group.keys.length}</Typography>
                      </IconButton>
                      {status === 'REJECTED' && (
                        <IconButton onClick={() => handleResendNotification(group.latestKey)} title="Reenviar notificação" sx={{ ml: 1 }}>
                          <Refresh fontSize="small" color="primary" />
                        </IconButton>
                      )}
                      {status === 'PENDING' && (
                        <IconButton onClick={() => handleCancelNotification(group.latestKey)} title="Reenviar notificação" sx={{ ml: 1 }}>
                          <CloseIcon fontSize="small" color='error' />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>




      <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Nova Transferência de Chave</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
            <InputLabel>Veículo</InputLabel>
            <Select value={formData.vehicleId} label="Veículo" onChange={(e) => { setError(null); setFormData({ ...formData, vehicleId: e.target.value }) }}>
              {data?.vehicles?.map((v) => {
                if(getCurrentKeyStatusPending(v.id)) return;
                return (
                <MenuItem key={v.id} value={v.id}>
                  {`${v.plate} - ${v.model}`}
                  {formData.vehicleId === v.id && ` (Atual: ${getCurrentKeyHolder(v.id)})`}
                </MenuItem>
              )})}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Novo Responsável</InputLabel>
            <Select value={formData.userId} label="Novo Responsável" onChange={(e) => { setError(null); setFormData({ ...formData, userId: e.target.value }) }}>
              {data?.users?.map((u) => (
                <MenuItem key={u.id} value={u.id} disabled={groupedVehicleKeys[formData.vehicleId]?.latestKey?.userId === u.id}>
                  {u.name}
                  {groupedVehicleKeys[formData.vehicleId]?.latestKey?.userId === u.id && ' (Responsável Atual)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.userId || !formData.vehicleId}>Transferir</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Transferência</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja transferir a chave do veículo {formData.vehicleId && data?.vehicles.find(v => v.id === formData.vehicleId)?.model} para {formData.userId && data?.users.find(u => u.id === formData.userId)?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmedSubmit} variant="contained" autoFocus>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resendConfirmDialogOpen} onClose={() => setResendConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Reenvio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja reenviar a notificação para {resendingKey?.user.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResendConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmResend} variant="contained" autoFocus>Confirmar</Button>
        </DialogActions>
      </Dialog>

      {selectedVehicleKeys && (
        <HistoryModal
          open={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          vehicleKeys={groupedVehicleKeys[selectedVehicleKeys.vehicleId]}
        />
      )}

      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>{successMessage}</Alert>
      </Snackbar>

      <Backdrop sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  )
}