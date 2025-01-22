"use client"
import { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Modal, Box, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';

interface ChaveVeiculo {
  id: number;
  user: { name: string };
  vehicle: { plate: string; model: string };
  createdAt: Date;
  devolucao: Date | null;
  parent?: ChaveVeiculo[]
  children?: ChaveVeiculo[]
  parentId: string;
}

interface Usuario {
  id: number;
  name: string;
}

interface Veiculo {
  id: number;
  plate: string;
  model: string;
}

const HistoricoDialog = ({ 
  open, 
  handleClose, 
  chaveAtual 
}: { 
  open: boolean; 
  handleClose: () => void; 
  chaveAtual: ChaveVeiculo; 
}) => {
  const [historico, setHistorico] = useState<ChaveVeiculo[]>([]);

  useEffect(() => {
    const buscarHistorico = async () => {
      const response = await fetch(`/api/chaves/historico/${chaveAtual.id}`);
      const data = await response.json();
      setHistorico(data.historico);
    };

    if (open) {
      buscarHistorico();
    }
  }, [open, chaveAtual.id]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Histórico da Chave - {chaveAtual.vehicle.plate}
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Retirada</TableCell>
              <TableCell>Devolução</TableCell>
              <TableCell>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historico.map((registro) => (
              <TableRow 
                key={registro.id}
                sx={{ 
                  bgcolor: registro.id === chaveAtual.id ? 'action.hover' : 'inherit'
                }}
              >
                <TableCell>{registro.user.name}</TableCell>
                <TableCell>
                  {new Date(registro.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {registro.devolucao 
                    ? new Date(registro.devolucao).toLocaleString() 
                    : '-'}
                </TableCell>
                <TableCell>
                  {registro.id === chaveAtual.id ? 'Atual' : 'Anterior'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function Home() {
  const [chaves, setChaves] = useState<ChaveVeiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroVeiculo, setFiltroVeiculo] = useState('');
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [chaveSelecionada, setChaveSelecionada] = useState<ChaveVeiculo | null>(null);

  const [novaChave, setNovaChave] = useState({ userId: '', vehicleId: '' });

  // Função para abrir o histórico
  const handleOpenHistorico = (chave: ChaveVeiculo) => {
    setChaveSelecionada(chave);
    setHistoricoOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch('/api/admin/keys');
    const data = await response.json();
    setChaves(data.chaves);
    setUsuarios(data.usuarios);
    setVeiculos(data.veiculos);
  };

  const handleSubmit = async () => {
    await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaChave),
    });
    setModalOpen(false);
    fetchData();
  };

  const chavesFiltradas = chaves.filter(chave => {
    const matchUsuario = chave.user.name.toLowerCase().includes(filtroUsuario.toLowerCase());
    const matchVeiculo = chave.vehicle.plate.toLowerCase().includes(filtroVeiculo.toLowerCase());
    return matchUsuario && matchVeiculo;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Filtrar por Usuário"
          value={filtroUsuario}
          onChange={(e) => setFiltroUsuario(e.target.value)}
          size="small"
        />
        <TextField
          label="Filtrar por Placa"
          value={filtroVeiculo}
          onChange={(e) => setFiltroVeiculo(e.target.value)}
          size="small"
        />
        <Button 
          variant="contained" 
          onClick={() => setModalOpen(true)}
        >
          Nova Retirada
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Retirada</TableCell>
              <TableCell>Devolução</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chavesFiltradas.map((chave) => (
              <TableRow key={chave.id}>
                <TableCell>{chave.user.name}</TableCell>
                <TableCell>{chave.vehicle.model}</TableCell>
                <TableCell>{chave.vehicle.plate}</TableCell>
                <TableCell>
                  {new Date(chave.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {chave.devolucao 
                    ? new Date(chave.devolucao).toLocaleString() 
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={chave.devolucao ? 'Devolvido' : 'Em uso'} 
                    color={chave.devolucao ? 'default' : 'primary'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!chave.devolucao && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => console.log(chave.id)}
                      >
                        Devolver
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenHistorico(chave)}
                    >
                      Histórico
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal de Histórico */}
      {chaveSelecionada && (
        <HistoricoDialog
          open={historicoOpen}
          handleClose={() => setHistoricoOpen(false)}
          chaveAtual={chaveSelecionada}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Nova Retirada de Chave
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Usuário</InputLabel>
            <Select
              value={novaChave.userId}
              onChange={(e) => setNovaChave({ ...novaChave, userId: e.target.value })}>
              {usuarios.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Veículo</InputLabel>
            <Select
              value={novaChave.vehicleId}
              onChange={(e) => setNovaChave({
                ...novaChave,
                vehicleId: e.target.value
              })}
            >
              {veiculos.map((v) => (<MenuItem key={v.id} value={v.id}>{v.model} - {v.plate}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
          >
            Salvar
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}