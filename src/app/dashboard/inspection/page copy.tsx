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
  TextField,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  TablePagination
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import useSWR from "swr";
import Loading from "@/components/Loading";
import { fetcher, formatDate } from "@/lib/ultils";
import { type InspectionType } from "./types";
import Modal from "./Modal";

export default function UsersTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openDialog, setOpenDialog] = React.useState(false);

  const { data, error, mutate } = useSWR(`/api/admin/inspections`, fetcher);

  const [formData, setFormData] = React.useState({
    id: "",
    userId: "",
    vehicleId: "",
    dataInspecao: formatDate(new Date()),

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

  const handleChange = (event: any) => {
    const { name, type, checked, value } = event.target;
    console.log(formData);
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleToggle = (event: { [key: string]: any }) => {
    console.log(event);
    setFormData((prev) => ({ ...prev, ...event }));
  }

  if (error) return <Typography color="error">Erro ao carregar usuários</Typography>;
  if (!data) return <Loading />;

  console.log(data);
  
  const handleOpenDialog = (ins?:InspectionType) => {
    if (ins) {
      setFormData(ins);
    }
    setOpenDialog(true);
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

  const onClose = () => {
    setOpenDialog(false);
  };

  return (
    <Stack spacing={2}>

      <Modal
        toggle={openDialog}
        onClose={()=>setOpenDialog(e=>!e)}
        data={data}
        formData={formData}
        handleToggle={handleToggle}
        handleChange={handleChange}
      />

      {/* Filtros */}
      <Paper sx={{display:"flex", justifyContent:"end",gap:2,p: 2 }}>
        <TextField
          name="filter"
          label="Filtrar"
          value={""}
          onChange={console.log}
          size="small"
          InputProps={{
            startAdornment: (<SearchIcon sx={{ color: "action.active", mr: 1 }}/>)
          }} />
        <Button variant="contained" startIcon={<AddIcon />}  onClick={handleOpenDialog}>Adicionar</Button>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Placa</TableCell>
              {!isMobile && <TableCell>Modelo</TableCell>}
              {!isMobile && <TableCell>Data</TableCell>}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.inspections && data?.inspections.map((ins:InspectionType) => (
              <TableRow key={ins.id}>
                <TableCell>{ins?.user?.name}</TableCell>
                <TableCell>{ins?.vehicle.licensePlate}</TableCell>
                {!isMobile && <TableCell>{ins?.vehicle.model}</TableCell>}
                {!isMobile && <TableCell>{formatDate(ins?.vehicle.createdAt)}</TableCell>}
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenDialog(data.inspections)}><EditIcon/></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(data.inspections.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          labelRowsPerPage={"Resultados por página:"}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.inspections.length}
          rowsPerPage={8}
          page={0}
          onPageChange={e=>console.log}
          onRowsPerPageChange={e=>console.log}
        />
      </TableContainer>
    </Stack>
  );
}
