"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  TablePagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import useSWR from "swr";
import { User, UserCreateInput } from "@/types/user";
import Loading from "@/components/Loading";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: users, error, mutate } = useSWR<User[]>("/api/users", fetcher);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Filtros
  const [filters, setFilters] = React.useState({
    name: "",
    email: "",
    role: "ALL",
  });

  // Paginação
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [formData, setFormData] = React.useState<UserCreateInput>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  // Função para filtrar usuários
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      const nameMatch = user.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const emailMatch = user.email
        .toLowerCase()
        .includes(filters.email.toLowerCase());
      const roleMatch = filters.role === "ALL" || user.role === filters.role;

      return nameMatch && emailMatch && roleMatch;
    });
  }, [users, filters]);

  // Usuários paginados
  const paginatedUsers = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(0); // Reset para primeira página quando filtrar
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "USER",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: selectedUser.id }),
        });
      } else {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      mutate();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (error)
    return <Typography color="error">Erro ao carregar usuários</Typography>;
  if (!users) return <Loading />;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Adicionar usuário
        </Button>
      </Stack>

      {/* Filtros */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            name="name"
            label="Filtrar por nome"
            value={filters.name}
            onChange={handleFilterChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          />
          <TextField
            name="email"
            label="Filtrar por e-mail"
            value={filters.email}
            onChange={handleFilterChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          />
          <TextField name="role" label="Filtrar por função" select value={filters.role} onChange={handleFilterChange} size="small" fullWidth>
            <MenuItem value="ALL">Todos os perfis</MenuItem>
            <MenuItem value="USER">Usuário</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="DRIVER">Motorista</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              {!isMobile && <TableCell>Email</TableCell>}
              <TableCell>Permissão</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                {!isMobile && <TableCell>{user.email}</TableCell>}
                <TableCell>
                  <TextField
                    disabled
                    name="role"
                    select
                    fullWidth
                    value={user.role}
                  >
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="USER">Usuário</MenuItem>
                    <MenuItem value="DRIVER">Motorista</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedUser ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required fullWidth/>
              <TextField
                name="password"
                label="Senha"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!selectedUser}
                fullWidth
                helperText={
                  selectedUser
                    ? "Deixe em branco para manter a senha atual"
                    : ""
                }
              />
              <TextField
                name="role"
                label="Role"
                select
                value={formData.role}
                onChange={handleInputChange}
                required
                fullWidth
              >
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="USER">Usuário</MenuItem>
                <MenuItem value="DRIVER">Motorista</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedUser ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}
