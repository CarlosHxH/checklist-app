import { Controller, FieldError } from 'react-hook-form';
import { 
  ToggleButtonGroup, 
  ToggleButton, 
  Typography, 
  Stack, 
  useTheme,
  FormHelperText 
} from '@mui/material';

interface ToggleOption {
  value: string;
  label: string;
  disabled?: boolean;
  'aria-label'?: string;
}

interface GroupRadioProps {
  // React Hook Form props (opcionais)
  control?: any;
  name?: string;
  error?: FieldError;
  
  // Props standalone
  value?: string;
  onChange?: (value: string) => void;
  
  // Props comuns
  label?: string | React.ReactNode;
  options: ToggleOption[];
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  errorMessage?: string;
  sx?: any;
}

const GroupRadio = ({ 
  // React Hook Form props
  control, 
  name, 
  error,
  
  // Standalone props
  value: valueProp,
  onChange: onChangeProp,
  
  // Common props
  label, 
  options,
  helperText,
  required = false,
  disabled = false,
  size = 'medium',
  orientation = 'horizontal',
  fullWidth = true,
  errorMessage,
  sx = {}
}: GroupRadioProps) => {
  const theme = useTheme();
  
  // Verifica se está sendo usado com react-hook-form
  const isControlled = control && name;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { px: 2, py: 1 };
      case 'large':
        return { px: 4, py: 2 };
      default:
        return { px: 3, py: 1.5 };
    }
  };

  const hasError = error || errorMessage;

  // Renderiza o conteúdo do toggle group
  const renderToggleGroup = (currentValue: string, handleChange: (value: string) => void) => (
    <Stack spacing={1}>
      {label && (
        <Typography 
          variant="subtitle2" 
          color={hasError ? 'error' : 'inherit'}
        >
          {label}
          {required && (
            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
      )}
      
      <ToggleButtonGroup
        exclusive
        value={currentValue || ''}
        onChange={(_, newValue) => {
          if (newValue !== null) {
            handleChange(newValue);
          }
        }}
        aria-label={typeof label === 'string' ? label : 'Toggle selection'}
        disabled={disabled}
        fullWidth={fullWidth}
        orientation={orientation}
        sx={{
          '& .MuiToggleButton-root': {
            ...getSizeStyles(),
            border: `1px solid ${hasError ? theme.palette.error.main : theme.palette.divider}`,
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
            },
            '&.Mui-disabled': {
              border: `1px solid ${theme.palette.action.disabled}`,
            }
          },
          ...(orientation === 'vertical' && {
            flexDirection: 'column',
            '& .MuiToggleButton-root': {
              width: '100%',
            }
          }),
          ...sx
        }}
      >
        {options.map((option) => (
          <ToggleButton 
            key={option.value}
            value={option.value} 
            aria-label={option['aria-label'] || option.label}
            disabled={option.disabled}
          >
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      
      {(error?.message || errorMessage || helperText) && (
        <FormHelperText error={!!hasError}>
          {error?.message || errorMessage || helperText}
        </FormHelperText>
      )}
    </Stack>
  );

  // Se estiver usando react-hook-form, usa Controller
  if (isControlled) {
    return (
      <Controller
        name={name!}
        control={control}
        render={({ field: { onChange, value } }) => 
          renderToggleGroup(value, onChange)
        }
      />
    );
  }

  // Caso contrário, usa como componente standalone
  return renderToggleGroup(valueProp || '', onChangeProp || (() => {}));
};

export default GroupRadio;

// Exemplo de uso:
/*
const maintenanceOptions = [
  { value: 'PREVENTIVA', label: 'PREVENTIVA' },
  { value: 'CORRETIVA', label: 'CORRETIVA' }
];

const priorityOptions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta', disabled: false }
];

// No seu formulário:
<GroupRadio
  control={control}
  name="maintenanceType"
  label="Tipo de Manutenção"
  options={maintenanceOptions}
  error={errors.maintenanceType}
  required
/>

<GroupRadio
  control={control}
  name="priority"
  label="Prioridade"
  options={priorityOptions}
  orientation="vertical"
  size="small"
  helperText="Selecione a prioridade da tarefa"
/>
*/