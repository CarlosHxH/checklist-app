"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { formatDate } from '@/lib/ultils';
import FileUploader from '@/components/FileUploader';

interface Inspection {
  id: string;
  userId: string;
  vehicleId: string;
  dataInspecao: Date;
  crlvEmDia: string;
  certificadoTacografoEmDia: string;
  nivelAgua: string;
  nivelOleo: string;
  eixo: string;
  dianteira?: string;
  descricaoDianteira?: string;
  tracao?: string;
  descricaoTracao?: string;
  truck?: string;
  descricaoTruck?: string;
  quartoEixo?: string;
  descricaoQuartoEixo?: string;
  avariasCabine?: string;
  descricaoAvariasCabine?: string;
  bauPossuiAvarias?: string;
  descricaoAvariasBau?: string;
  funcionamentoParteEletrica?: string;
  descricaoParteEletrica?: string;
  fotoVeiculo?: string;
}

const STATUS_OPTIONS = ['Em dia', 'Vencido', 'N/A'];
const CONDITION_OPTIONS = ['Normal', 'Requer Atenção', 'Crítico', 'N/A'];

const InspectionList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Inspection> | null>(null);
  const [filter, setFilter] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (inspection?: Inspection) => {
    if (inspection) {
      setFormData({
        ...inspection,
        dataInspecao: formatDate(inspection.dataInspecao) as any,
      });
      setIsEdit(true);
    } else {
      setFormData({
        userId: '',
        vehicleId: '',
        dataInspecao: formatDate(new Date()) as any,
        crlvEmDia: '',
        certificadoTacografoEmDia: '',
        nivelAgua: '',
        nivelOleo: '',
        eixo: '',
      });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFormData(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>|any, child?: React.ReactNode)=>{
    const { name, value } = e.target;
    if (formData) setFormData({...formData, [name]: value});
  };
  const handleToggle = (event: { [key: string]: any }) => setFormData((prev) => ({ ...prev, ...event }));

  const handleSubmit = async () => {
    if (!formData) return;

    try {
      const url = isEdit ? `/api/admin/inspections/${formData.id}` : '/api/admin/inspections';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, { method,
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({...formData, dataInspecao: new Date(formData.dataInspecao as any)}),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchInspections();
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        const response = await fetch(`/api/admin/inspections/${id}`, {method: 'DELETE'});
        if (response.ok) fetchInspections();
      } catch (error) {
        console.error('Error deleting inspection:', error);
      }
    }
  };

  const fetchInspections = async () => {
    try {
      const response = await fetch(`/api/admin/inspections?filter=${filter}`);
      const data = await response.json();
      setInspections(data);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    }
  };

  useEffect(() => {fetchInspections()}, [filter]);
  
  const renderMobileCard = (inspection: Inspection) => (
    <Card key={inspection.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Vehicle: {inspection.vehicleId}
          </Typography>
          <Box>
            <IconButton onClick={() => handleOpenDialog(inspection)} size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(inspection.id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Typography color="textSecondary" gutterBottom>
          Date: {formatDate(inspection.dataInspecao)}
        </Typography>
        
        <Box sx={{ mt: 1 }}>
          <Typography>CRLV: {inspection.crlvEmDia}</Typography>
          <Typography>Water Level: {inspection.nivelAgua}</Typography>
          <Typography>Oil Level: {inspection.nivelOleo}</Typography>
        </Box>

        {expandedCard === inspection.id && (
          <Box sx={{ mt: 2 }}>
            <Typography>Tachograph: {inspection.certificadoTacografoEmDia}</Typography>
            <Typography>Front Axis: {inspection.dianteira}</Typography>
            <Typography>Traction: {inspection.tracao}</Typography>
            {/* Add more fields as needed */}
          </Box>
        )}

        <Button
          size="small"
          onClick={() => setExpandedCard(expandedCard === inspection.id ? null : inspection.id)}
          endIcon={<ExpandMoreIcon />}
          sx={{ mt: 1 }}
        >
          {expandedCard === inspection.id ? 'Show Less' : 'Show More'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        justifyContent: 'space-between' 
      }}>
        <TextField
          label="Filter"
          variant="outlined"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          fullWidth={isMobile}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          fullWidth={isMobile}
        >
          Nova inspeção
        </Button>
      </Box>

      {isMobile ? (
        <Box>
          {inspections.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(renderMobileCard)}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>CRLV</TableCell>
                <TableCell>Nível da água</TableCell>
                <TableCell>Nível de óleo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspections
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell>{formatDate(inspection.dataInspecao)}</TableCell>
                    <TableCell>{inspection.crlvEmDia}</TableCell>
                    <TableCell>{inspection.nivelAgua}</TableCell>
                    <TableCell>{inspection.nivelOleo}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(inspection)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(inspection.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={inspections.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '.MuiTablePagination-select': {
                minWidth: '16px'
              }
            }}
          />
        </TableContainer>
      )}

      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {isEdit ? 'Edit Inspection' : 'New Inspection'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Informações básicas</Typography>
            </Grid>

            {/* Truck Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Condição do caminhão</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Condição do veiculo</InputLabel>
                <Select
                  name="truck"
                  value={formData?.truck || ''}
                  onChange={handleInputChange}
                  label="Condição do caminhão"
                >
                  {CONDITION_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Truck Description"
                name="descricaoTruck"
                value={formData?.descricaoTruck || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Fourth Axis Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Fourth Axis</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fourth Axis Condition</InputLabel>
                <Select
                  name="quartoEixo"
                  value={formData?.quartoEixo || ''}
                  onChange={handleInputChange}
                  label="Fourth Axis Condition"
                >
                  {CONDITION_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fourth Axis Description"
                name="descricaoQuartoEixo"
                value={formData?.descricaoQuartoEixo || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Cabin Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Cabin Condition</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cabin Damage</InputLabel>
                <Select
                  name="avariasCabine"
                  value={formData?.avariasCabine || ''}
                  onChange={handleInputChange}
                  label="Cabin Damage"
                >
                  {['None', 'Minor', 'Major'].map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cabin Damage Description"
                name="descricaoAvariasCabine"
                value={formData?.descricaoAvariasCabine || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Cargo Box Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Condição do Baú</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Descrição </InputLabel>
                <Select
                  name="bauPossuiAvarias"
                  value={formData?.bauPossuiAvarias || ''}
                  onChange={handleInputChange}
                  label="Box Damage"
                >
                  {['None', 'Minor', 'Major'].map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Box Damage Description"
                name="descricaoAvariasBau"
                value={formData?.descricaoAvariasBau || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Electrical System */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Electrical System</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Electrical System Status</InputLabel>
                <Select
                  name="funcionamentoParteEletrica"
                  value={formData?.funcionamentoParteEletrica || ''}
                  onChange={handleInputChange}
                  label="Electrical System Status"
                >
                  {CONDITION_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Electrical System Description"
                name="descricaoParteEletrica"
                value={formData?.descricaoParteEletrica || ''}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Vehicle Photo */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Vehicle Photo</Typography>
            </Grid>
            <Grid item xs={12}>
                <FileUploader name={"fotoVeiculo"} value={formData?.fotoVeiculo} onChange={handleToggle} label={"Foto do veiculo de frente"}/>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            fullWidth={isMobile}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InspectionList;