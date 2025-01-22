import { Box, Grid, TextField } from "@mui/material";
import { FilterValues } from "./Types";

const VehicleFilters: React.FC<{
    filters: FilterValues;
    onFilterChange: (filters: FilterValues) => void;
  }> = ({ filters, onFilterChange }) => {
    return (
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Placa"
              value={filters.plate}
              onChange={(e) => onFilterChange({ ...filters, plate: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Modelo"
              value={filters.model}
              onChange={(e) => onFilterChange({ ...filters, model: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Usuário"
              value={filters.userName}
              onChange={(e) => onFilterChange({ ...filters, userName: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Inicial"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Final"
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  export default VehicleFilters;