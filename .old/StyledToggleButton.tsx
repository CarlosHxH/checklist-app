import { ToggleButton } from '@mui/material';
import { styled } from '@mui/system';

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#ccc'//theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover':{
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    }
  },
}));