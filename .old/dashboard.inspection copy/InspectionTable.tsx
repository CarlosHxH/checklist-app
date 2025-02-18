// components/InspectionTable.tsx
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, TablePagination, useTheme, useMediaQuery
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { formatDate } from "@/lib/ultils";
import { InspectionType } from "@/lib/formDataTypes";

interface InspectionTableProps {
  inspections: InspectionType[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDelete: (id: string) => void;
}


export const InspectionTable = ({
  inspections,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
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
            <TableCell>Status</TableCell>
            {!isMobile && <TableCell>Modelo</TableCell>}
            {!isMobile && <TableCell>Data</TableCell>}
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inspections
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((inspection) => {
              const color = {color: inspection?.isFinished?'#43a047':'#e53935'}
              return(
              <TableRow key={inspection.id}>
                <TableCell sx={color}>{inspection.user?.name}</TableCell>
                <TableCell sx={color}>{inspection?.vehicle?.plate}</TableCell>
                <TableCell sx={color}>{inspection?.isFinished?"Finalizada":"Não finalizada"}</TableCell>
                {!isMobile && <TableCell sx={color}>{inspection?.vehicle?.model}</TableCell>}
                {!isMobile && <TableCell sx={color}>{formatDate(inspection.dataInspecao)}</TableCell>}
                <TableCell align="right" sx={color}>
                  <IconButton color="error" onClick={() => onDelete(inspection.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )})}
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