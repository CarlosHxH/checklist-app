import { Button, Paper, TextField } from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";

export default function SearchBar({value,onChange,onAdd}:any) {
    return (
        <Paper sx={{ display: "flex", justifyContent: "end", gap: 2, p: 2 }}>
            <TextField
                name="filter"
                label="Filtrar"
                value={value}
                onChange={onChange}
                size="small"
                InputProps={{
                    startAdornment: (<SearchIcon sx={{ color: "action.active", mr: 1 }} />)
                }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Adicionar</Button>
        </Paper>
    )
}