"use client"
import React from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Button, TextField, Stack, Box, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, KeyboardArrowRight as ArrowIcon } from "@mui/icons-material";
import { VehicleKeyModal } from "./VehicleKeyModal";
import { User, Vehicle, VehicleKey, VehicleKeyFormData } from "./Types";

interface VehicleKeyTableProps {
  vehicleKeys: VehicleKey[];
  users: User[];
  vehicles: Vehicle[];
  onSave: (key: VehicleKeyFormData) => void;
  onDelete: (id: string) => Promise<void>;
}

export const VehicleKeyTable: React.FC<VehicleKeyTableProps> = ({ vehicleKeys, users, vehicles, onSave, onDelete }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filter, setFilter] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedKey, setSelectedKey] = React.useState<VehicleKey | undefined>();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const filteredKeys = React.useMemo(() =>
    vehicleKeys.filter((key) => {
      const searchStr = [
        key.user?.name,
        key.vehicle?.plate,
        key.vehicle?.model,
        key.parent?.vehicle.plate,
        key.parent?.user.name
      ].filter(Boolean).join(" ").toLowerCase();
      
      return searchStr.includes(filter.toLowerCase());
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || vehicleKeys,
    [vehicleKeys, filter]
  );



  const getAvailableParents = (currentKey?: VehicleKey) => {
    if (!currentKey) return vehicleKeys;
    const childIds = new Set<string>();
    const getChildIds = (key: VehicleKey) => {
      key.children.forEach((child) => {
        childIds.add(child.id);
        getChildIds(child);
      });
    };
    
    getChildIds(currentKey);

    return vehicleKeys.filter(
      (key) =>
        key.id !== currentKey.id &&
        !childIds.has(key.id) && key.vehicle.id === currentKey.vehicle.id
    );
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (key: VehicleKey) => {
    setSelectedKey(key);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedKey(undefined);
    setModalOpen(true);
  };

  const handleDeleteKey = async (key: VehicleKey) => {
    try {
      setIsDeleting(true);
      await onDelete(key.id);
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete key');
    } finally {
      setIsDeleting(false);
    }
  };

  const getHierarchyLevel = (key: VehicleKey): number => {
    let level = 0;
    let currentKey = key;
    while (currentKey.parent) {
      level++;
      currentKey = currentKey.parent;
    }
    return level;
  };

  const renderHierarchyIcon = (level: number) => (
    [...Array(level)].map((_, i) => (
      <ArrowIcon key={i} sx={{ ml: 1, color: "action.disabled" }} />
    ))
  );
  
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
          Add Vehicle Key
        </Button>
      </Stack>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hierarquia</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Veículo</TableCell>
                <TableCell>Parent Key</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredKeys
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((key, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {renderHierarchyIcon(getHierarchyLevel(key))}
                      <Chip
                        label={key.children.length ? `Parent (${key.children.length})` : "Key"}
                        size="small"
                        color={key.children.length ? "primary" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{key.user.name}</TableCell>
                    <TableCell>
                      {key.vehicle.plate} - {key.vehicle.model}
                    </TableCell>
                    <TableCell>
                      {key.parent
                        ? `${key.parent.vehicle.plate} - ${key.parent.user.name}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(key.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(key)}
                        disabled={key.children.length > 0}
                        title={key.children.length > 0 ? "Cannot edit parent key" : "Edit key"}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteKey(key)}
                        disabled={key.children.length > 0 || isDeleting}
                        title={key.children.length > 0 ? "Cannot delete parent key" : "Delete key"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredKeys.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <VehicleKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
        vehicleKey={selectedKey}
        users={users}
        vehicles={vehicles}
        availableParents={getAvailableParents(selectedKey)}
      />
    </Box>
  );
};