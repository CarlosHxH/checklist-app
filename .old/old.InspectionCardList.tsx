"use client"
import { Box, Button, Dialog, DialogContent, DialogTitle, Input, Menu, MenuItem, Select, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';

interface TripModalProps {
  inspection: any;
  onSave: (data: any) => void;
}

const TripModal: React.FC<TripModalProps> = ({ inspection, onSave }) => {
  const [open, setOpen] = useState(true);
  const [formData, setFormData] = useState({
    kilometer: '',
    crlvEmDia: '',
    nivelAgua: '',
    nivelOleo: '',
    dianteira: '',
    tracao: '',
    vehicleId: ''
  });
  console.log({inspection});
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      type: inspection?.start ? 'end' : 'start'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Box>
        <Button variant={inspection?.start ? "outlined" : "contained"}>
          {inspection?.start ? "Finalizar Viagem" : "Iniciar Viagem"}
        </Button>
      </Box>
      <DialogContent className="max-w-md">
        <Box>
          <DialogTitle>
            {inspection?.start ? "Finalizar Viagem" : "Iniciar Viagem"}
          </DialogTitle>
          <Typography>
            Preencha os dados da {inspection?.start ? "finalização" : "inicialização"} da viagem
          </Typography>
        </Box>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="vehicleId" className="text-right">
              Veículo
            </label>
            <Input
              id="vehicleId"
              name="vehicleId"
              className="col-span-3"
              value={formData.vehicleId}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="kilometer" className="text-right">
              Quilometragem
            </label>
            <Input
              id="kilometer"
              name="kilometer"
              type="number"
              className="col-span-3"
              value={formData.kilometer}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="crlvEmDia" className="text-right">
              CRLV em dia
            </label>
            <Select
              value={formData.crlvEmDia}
              onChange={(e) => handleSelectChange('crlvEmDia', e.target.value)}
            >
              <Menu open={false}>
                <MenuItem value="SIM">Sim</MenuItem>
                <MenuItem value="NAO">Não</MenuItem>
              </Menu>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="nivelAgua" className="text-right">
              Nível de Água
            </label>
            <Select
              value={formData.nivelAgua}
              onChange={(e) => handleSelectChange('nivelAgua', e.target.value)}
            >
              <Menu open={false}>
                <MenuItem value="OK">OK</MenuItem>
                <MenuItem value="BAIXO">Baixo</MenuItem>
                <MenuItem value="CRITICO">Crítico</MenuItem>
              </Menu>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="nivelOleo" className="text-right">
              Nível de Óleo
            </label>
            <Select
              value={formData.nivelOleo}
              onChange={(e) => handleSelectChange('nivelOleo', e.target.value)}
            >
              <Menu open={false}>
                <MenuItem value="OK">OK</MenuItem>
                <MenuItem value="BAIXO">Baixo</MenuItem>
                <MenuItem value="CRITICO">Crítico</MenuItem>
              </Menu>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="dianteira" className="text-right">
              Pneus Dianteiros
            </label>
            <Select
              value={formData.dianteira}
              onChange={(e) => handleSelectChange('dianteira', e.target.value)}
            >
              <Menu open={false}>
                <MenuItem value="OK">OK</MenuItem>
                <MenuItem value="DESGASTADO">Desgastado</MenuItem>
                <MenuItem value="CRITICO">Crítico</MenuItem>
              </Menu>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="tracao" className="text-right">
              Pneus Tração
            </label>
            <Select
              value={formData.tracao}
              onChange={(e) => handleSelectChange('tracao', e.target.value)}
            >
              <Menu open={false}>
                <MenuItem value="OK">OK</MenuItem>
                <MenuItem value="DESGASTADO">Desgastado</MenuItem>
                <MenuItem value="CRITICO">Crítico</MenuItem>
              </Menu>
            </Select>
          </div>
        </div>

        <Box>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TripModal;