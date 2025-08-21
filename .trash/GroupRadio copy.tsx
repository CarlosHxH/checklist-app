import { Controller } from 'react-hook-form';
import { ToggleButtonGroup, ToggleButton, Typography, Stack, useTheme } from '@mui/material';

interface MaintenanceTypeToggleProps {
  control: any;
  name: string;
  label?: string | React.ReactNode;
}

const GroupRadio = ({ control, name, label }: MaintenanceTypeToggleProps) => {
  const theme = useTheme();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Stack spacing={1}>
          <Typography variant="subtitle2">{label||''}</Typography>
          <ToggleButtonGroup
            exclusive
            value={value}
            onChange={(_, newValue) => {
              if (newValue !== null) {
                onChange(newValue);
              }
            }}
            aria-label="Select"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                },
                '&:not(.Mui-selected)': {
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }
              }
            }}
          >
            <ToggleButton value="PREVENTIVA" aria-label="Preventiva">PREVENTIVA</ToggleButton>
            <ToggleButton value="CORRETIVA" aria-label="Corretiva">CORRETIVA</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}
    />
  );
};
export default GroupRadio;