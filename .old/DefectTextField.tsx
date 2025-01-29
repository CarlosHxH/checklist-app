import { TextField } from "@mui/material";

const DefectTextField: React.FC<{
  label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
}> = ({ label, name, value, onChange, error , ...props}) => (
  <TextField {...props} label={label} name={name} value={value} onChange={onChange} error={!!error} helperText={error} multiline fullWidth rows={2} />
);
export default DefectTextField;