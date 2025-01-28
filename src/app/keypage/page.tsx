'use client'
import { useEffect, useState } from 'react'
import { 
  Alert,
  Box, 
  Button,
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Paper,
  Snackbar,
  Typography,
  useTheme
} from '@mui/material'
import { Check, Close } from '@mui/icons-material'
import ResponsiveAppBar from '@/components/ResponsiveAppBar'
import Loading from '@/components/Loading'
import { formatDate } from '@/utils'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
}

interface Vehicle {
  id: string
  plate: string
  model: string
}

interface KeyTransfer {
  id: string
  userId: string
  vehicleId: string
  createdAt: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  user: User
  vehicle: Vehicle
  confirmationCode?: string
}

export default function KeyConfirmationPage() {
  const { data: session } = useSession();
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false) // Estado para ações de confirmação/rejeição
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pendingTransfers, setPendingTransfers] = useState<KeyTransfer[]>([])
  const [selectedTransfer, setSelectedTransfer] = useState<KeyTransfer | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  // Carrega as transferências pendentes
  useEffect(() => {
    if (session?.user?.id) {
      checkPendingTransfers()
      const interval = setInterval(checkPendingTransfers, 30000) // Polling a cada 30 segundos
      return () => clearInterval(interval)
    }
  }, [session])

  // Busca as transferências pendentes
  const checkPendingTransfers = async () => {
    try {
      const response = await fetch('/api/keys/pending')
      if (!response.ok) throw new Error('Erro ao carregar transferências pendentes')
      const data = await response.json()
      setPendingTransfers(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Erro ao verificar transferências pendentes')
    } finally {
      setLoading(false)
    }
  }

  // Filtra as transferências pendentes para o usuário logado
  const userPendingTransfers = pendingTransfers.filter(
    (transfer) => transfer.user.id === session?.user.id
  )
  

  // Abre o diálogo de confirmação
  const handleConfirm = (transfer: KeyTransfer) => {
    setSelectedTransfer(transfer)
    setConfirmDialogOpen(true)
  }

  // Abre o diálogo de rejeição
  const handleReject = (transfer: KeyTransfer) => {
    setSelectedTransfer(transfer)
    setRejectDialogOpen(true)
  }

  // Confirma a transferência
  const confirmTransfer = async () => {
    if (!selectedTransfer) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/keys/confirm/${selectedTransfer.id}`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Erro ao confirmar transferência')
      
      setSuccess('Chave recebida com sucesso!')
      await checkPendingTransfers()
    } catch (error) {
      console.error('Error:', error)
      setError('Erro ao confirmar recebimento')
    } finally {
      setActionLoading(false)
      setConfirmDialogOpen(false)
      setSelectedTransfer(null)
    }
  }

  // Rejeita a transferência
  const rejectTransfer = async () => {
    if (!selectedTransfer) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/keys/reject/${selectedTransfer.id}`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Erro ao rejeitar transferência')
      
      setSuccess('Transferência rejeitada com sucesso')
      await checkPendingTransfers()
    } catch (error) {
      console.error('Error:', error)
      setError('Erro ao rejeitar transferência')
    } finally {
      setActionLoading(false)
      setRejectDialogOpen(false)
      setSelectedTransfer(null)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <ResponsiveAppBar title={"5sTransportes"} showBackButton />

      <Typography variant="h5" gutterBottom>
        Confirmação de Recebimento de Chaves
      </Typography>

      {loading && userPendingTransfers.length === 0 ? (
        <Loading />
      ) : userPendingTransfers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
          <Typography>
            Não há transferências pendentes de confirmação
          </Typography>
        </Paper>
      ) : (
        userPendingTransfers.map((transfer) => (
          <Paper key={transfer.id} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {transfer.vehicle.model}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Placa: {transfer.vehicle.plate}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Data da transferência: {formatDate(new Date(transfer.createdAt))}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<Check />}
                onClick={() => handleConfirm(transfer)}
                disabled={actionLoading}
              >
                Confirmar Recebimento
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Close />}
                onClick={() => handleReject(transfer)}
                disabled={actionLoading}
              >
                Rejeitar
              </Button>
            </Box>
          </Paper>
        ))
      )}

      {/* Diálogo de Confirmação */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Recebimento</DialogTitle>
        <DialogContent>
          <Typography>
            Confirma o recebimento da chave do veículo{' '}
            {selectedTransfer?.vehicle.model} - {selectedTransfer?.vehicle.plate}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmTransfer} variant="contained" color="success" disabled={actionLoading}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Rejeição */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Rejeitar Transferência</DialogTitle>
        <DialogContent>
          <Typography>
            Rejeitar o recebimento da chave do veículo{' '}
            {selectedTransfer?.vehicle.model} - {selectedTransfer?.vehicle.plate}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
          <Button onClick={rejectTransfer} variant="contained" color="error" disabled={actionLoading}>
            Rejeitar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Sucesso */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Snackbar de Erro */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}