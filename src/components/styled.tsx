import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import MoreIcon from "@mui/icons-material/MoreVert";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import Label from "@mui/icons-material/Label";
import { HelperText, StyledInput } from "@/components/CustomStyled";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

export const View = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper
}));

export const Input = ({label,placeholder}:{label:string,placeholder:string}) => (
  <FormControl defaultValue={""} required>
    <Label>{label}</Label>
    <StyledInput placeholder={placeholder} />
    <HelperText />
  </FormControl>
);

export const MyStack = ({text}:{text:string[]}) => (
  <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap sx={{ flexWrap: "wrap" }}>
    {text && text.map((_d,_i)=><Item key={_i}>{_d}</Item>)}
  </Stack>
);
export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  flexGrow: 1,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

export const MenuIcon: React.FC = () => (
  <IconButton aria-label="options">
    <MoreIcon />
  </IconButton>
);

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));