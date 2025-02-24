import { Typography } from "@mui/material";
import CollapsibleTable from "./CollapsedTable";

export default function InspecoesPage() {
  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Inspeções de Viagens
      </Typography>
      <CollapsibleTable />
    </div>
  );
}