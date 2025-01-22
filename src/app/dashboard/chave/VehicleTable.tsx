"use client"
import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Button, TextField, Stack, Box, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, KeyboardArrowRight as ArrowIcon } from '@mui/icons-material';
import { VehicleKeyModal } from './VehicleModal';
import { User, Vehicle, VehicleKey, VehicleKeyFormData } from './Types';

interface VehicleKeyTableProps {
  vehicleKeys: VehicleKey[];
  users: User[];
  vehicles: Vehicle[];
  data: {
    id: string;
    vehicleKeys: VehicleKey[];
    users: User[];
    vehicles: Vehicle[];
  }[] |  VehicleKey[];
  onSave: (key: VehicleKeyFormData) => void;
  onDelete: (id: string) => void;
}

export const VehicleKeyTable: React.FC<VehicleKeyTableProps> = ({ data, vehicleKeys, users, vehicles, onSave, onDelete }) => {


  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filter, setFilter] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedKey, setSelectedKey] = React.useState<VehicleKey | undefined>();
/*
  // Filter keys based on search term
  const filteredKeyss = React.useMemo(() => {
    return vehicleKeys.filter((key) => {
      console.log(key);
      const searchStr = [
        key.user.name,
        key.vehicle.plate,
        key.vehicle.model,
        key.parent?.vehicle.plate,
      ].filter(Boolean).join(' ').toLowerCase();
      return searchStr.includes(filter.toLowerCase());
    }) || [];
  }, [vehicleKeys, filter]);

  // Get available parents (exclude self and children)
  const getAvailableParents = (currentKey?: VehicleKey) => {
    if (!currentKey) return vehicleKeys;
    const childIds = new Set<string>();
    const getChildIds = (key: VehicleKey) => {
      key.children.forEach(child => {
        childIds.add(child.id);
        getChildIds(child);
      });
    };
    if (currentKey) getChildIds(currentKey);
    return vehicleKeys.filter(
      key => key.id !== currentKey.id && !childIds.has(key.id)
    );
  };

  // Handle pagination
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle modal
  const handleEdit = (key: VehicleKey) => {
    setSelectedKey(key);
    setModalOpen(true);
  };
*/
  const handleAdd = () => {
    setSelectedKey(undefined);
    setModalOpen(true);
  };

  // Render hierarchical level indicator
  const getHierarchyLevel = (key: VehicleKey): number => {
    let level = 0;
    let currentKey = key;
    while (currentKey.parent) {
      level++; currentKey = currentKey.parent;
    }
    return level;
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleAdd}>
          Adicionar
        </Button>
      </Stack>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hierarquia</TableCell>
                <TableCell>Usuária</TableCell>
                <TableCell>Veículo</TableCell>
                <TableCell>Parent Key</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicleKeys
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      {[...Array(getHierarchyLevel(key))].map((_, i) => (
                        <ArrowIcon key={i} sx={{ ml: 1, color: 'action.disabled' }} />
                      ))}
                      <Chip label={key.children.length ? `Parent (${key.children.length})` : 'Key'} size="small" color={key.children.length ? 'primary' : 'default'} variant="outlined"/>
                    </TableCell>
                    <TableCell>{key?.user?.name || ""}</TableCell>
                    <TableCell>{key.vehicle.plate} - {key.vehicle.model}</TableCell>
                    <TableCell>{key.parent ? `${key.parent.vehicle.plate} - ${key.parent.user.name}` : '-'}</TableCell>
                    <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => {/*handleEdit(key) */}}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete(key.id)} disabled={key.children.length > 0}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/*<TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredKeys.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />*/}
      </Paper>
{/*
      <VehicleKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
        vehicleKey={selectedKey}
        users={users}
        vehicles={vehicles}
        availableParents={getAvailableParents(selectedKey)}
      />*/}
    </Box>
  );
};