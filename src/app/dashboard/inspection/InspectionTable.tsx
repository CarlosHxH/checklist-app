// components/InspectionTable.tsx
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, TablePagination, useTheme, useMediaQuery
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { formatDate, stringToDate } from "@/lib/ultils";
import { InspectionType } from "@/lib/formDataTypes";

interface InspectionTableProps {
  inspections: InspectionType[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (inspection: InspectionType) => void;
  onDelete: (id: string) => void;
}

export const InspectionTable = ({
  inspections,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: InspectionTableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Usuário</TableCell>
            <TableCell>Placa</TableCell>
            {!isMobile && <TableCell>Modelo</TableCell>}
            {!isMobile && <TableCell>Data</TableCell>}
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inspections
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell>{inspection.user?.name}</TableCell>
                <TableCell>{inspection.vehicle.licensePlate}</TableCell>
                {!isMobile && <TableCell>{inspection.vehicle.model}</TableCell>}
                {!isMobile && <TableCell>{formatDate(inspection.dataInspecao)}</TableCell>}
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => onEdit(inspection)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(inspection.id)}>
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
        page={page || 0}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Resultados por página:"
      />
    </TableContainer>
  );
};