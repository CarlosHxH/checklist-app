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
  Grid,
  Input,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import useSWR from "swr";
import { User } from "@/types/user";
import Loading from "@/components/Loading";
import CustomAutocomplete from "@/components/CustomAutocomplete";
import ButtonLabel from "@/components/ButtonLabel";
import FileUploader from "@/components/FileUploader";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data, error, mutate } = useSWR(`/api/admin/inspections`, fetcher);
  
  console.log(data);
  
  
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
  const [formData, setFormData] = React.useState({
    userId: "",
    vehicleId: "",
    dataInspecao: new Date(),

    crlvEmDia: "",
    certificadoTacografoEmDia: "",
    nivelAgua: "",
    nivelOleo: "",

    eixo: 0,
    dianteira: "",
    descricaoDianteira: "",
    tracao: "",
    descricaoTracao: "",
    truck: "",
    descricaoTruck: "",
    quartoEixo: "",
    descricaoQuartoEixo: "",

    avariasCabine: "",
    descricaoAvariasCabine: "",

    bauPossuiAvarias: "",
    descricaoAvariasBau: "",

    funcionamentoParteEletrica: "",
    descricaoParteEletrica: "",
    fotoVeiculo: "",
  });
/*
  // Função para filtrar usuários
  const filteredUsers = React.useMemo(() => {
    if (!data.vehicles) return [];
/*
    return data.vehicles.filter((inspections) => {
      //const nameMatch = vehicle.name.toLowerCase().includes(filters.name.toLowerCase());
      //const emailMatch = vehicle.email.toLowerCase().includes(filters.email.toLowerCase());
      //const roleMatch = filters.role === "ALL" || vehicle.role === filters.role;
      return [];//'nameMatch' && 'emailMatch' && 'roleMatch';
    });* /
  }, [data.inspections, filters]);

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
    } else {
      setSelectedUser(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value, }));
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

  const handleToggle = (event: { [key: string]: any }) => setFormData((prev) => ({ ...prev, ...event }));

  if (error) return <Typography color="error">Erro ao carregar usuários</Typography>;
  if (!data.vehicles) return <Loading />;
*/
  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5"></Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={console.log}>
          Adicionar
        </Button>
      </Stack>

      {/* Filtros */}
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            name="name"
            label="Filtrar por nome"
            value={filters.name}
            onChange={console.log}
            size="small"
            fullWidth
            InputProps={{startAdornment: (<SearchIcon sx={{ color: "action.active", mr: 1 }} />)}}/>
          <TextField name="email" label="Filtrar por placa" value={filters.email} onChange={console.log} size="small" fullWidth InputProps={{ startAdornment: (<SearchIcon sx={{ color: "action.active", mr: 1 }} />) }} />
          <TextField name="role" label="Filtrar por função" select value={filters.role} onChange={console.log} size="small" fullWidth>
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
              <TableCell>Placa</TableCell>
              {!isMobile && <TableCell>Usuario</TableCell>}
              <TableCell>data</TableCell>
              <TableCell>Permissão</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.inspections.map((ins) => (
              <TableRow key={ins.id}>
                <TableCell>{ins.vehicle.licensePlate}</TableCell>
                {!isMobile && <TableCell>{}</TableCell>}
                <TableCell>
                  <TextField
                    disabled
                    name="role"
                    select
                    fullWidth
                    value={''}
                  >
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="USER">Usuário</MenuItem>
                    <MenuItem value="DRIVER">Motorista</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={console.log}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={console.log}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/*<TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />*/}
      </TableContainer>





      <Dialog open={openDialog} onClose={console.log} maxWidth="sm" fullWidth>
        <form onSubmit={console.log}>
          <DialogTitle>
            {selectedUser ? "Editar Inspeção" : "Adicionar nova Inspeção"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>


              <Grid item xs={12} md={12} sx={{ mt: 2 }}>
                <Input name="dataInpecao" type="date" onChange={console.log} required fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete keyExtractor="name" label={"Usuário"} onSelect={console.log} options={data.user} name={"userId"} />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete keyExtractor="licensePlate" label={"Veiculo"} onSelect={console.log} options={data.vehicles} name={"vehicleId"} />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"CRLV em dia?"} name={"crlvEmDia"} options={["SIM", "NÃO"]} />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"Cert. Tacografo em Dia?"} name={"certificadoTacografoEmDia"} options={["SIM", "NÃO"]} />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"Nivel Agua"} name={"nivelAgua"} options={["NORMAL", "BAIXO", "CRITICO"]} />
              </Grid>

              <Grid item xs={12} md={6}>
                <ButtonLabel label={"Nivel Oleo"} name={"certificadoTacografoEmDia"} options={["NORMAL", "BAIXO", "CRITICO"]} />
              </Grid>

              {formData.eixo > 1 && (
                <Grid item xs={12} md={6}>
                  <ButtonLabel
                    label={"TRAÇÃO"}
                    name={"tracao"}
                    options={["BOM", "RUIM"]}
                    onChange={console.log}
                  />
                  {formData.tracao === "RUIM" && (
                    <TextField
                      label={"Qual Defeito?"}
                      name="descricaoTracao"
                      value={formData.descricaoTracao}
                      multiline
                      fullWidth
                      rows={2}
                      onChange={console.log}
                    />
                  )}
                </Grid>
              )}

              {formData.eixo > 2 && (
                <Grid item xs={12} md={6}>
                  <ButtonLabel
                    label={"TRUCK"}
                    name={"truck"}
                    options={["BOM", "RUIM"]}
                    onChange={console.log}
                  />
                  {formData.truck === "RUIM" && (
                    <TextField
                      label={"Qual Defeito"}
                      name="descricaoTruck"
                      value={formData.descricaoTruck}
                      multiline
                      fullWidth
                      rows={2}
                      onChange={console.log}
                    />
                  )}
                </Grid>
              )}
              {formData.eixo > 3 && (
                <Grid item xs={12} md={6}>
                  <ButtonLabel
                    label={"Quarto Eixo"}
                    name={"quartoEixo"}
                    options={["BOM", "RUIM"]}
                    onChange={console.log}
                  />
                  {formData.quartoEixo === "RUIM" && (
                    <TextField
                      label={"Qual Defeito?"}
                      name="descricaoQuartoEixo"
                      value={formData.descricaoQuartoEixo}
                      onChange={console.log}
                      multiline
                      fullWidth
                      rows={2}
                    />
                  )}
                </Grid>
              )}

              <Grid item xs={12} style={{ borderBottom: "1px solid #444" }} />

              <Grid item xs={12} md={12}>
                <FileUploader label={"Foto Veiculo"} name={"fotoVeiculo"} onChange={console.log} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={console.log}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {selectedUser ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}
