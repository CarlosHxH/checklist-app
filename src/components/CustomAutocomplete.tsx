import { useAutocomplete } from '@mui/base/useAutocomplete';
import { styled } from '@mui/system';
import { useEffect, useState, ChangeEvent } from 'react';

interface Option {
  id: string;
  [key: string]: string;
}

interface AutocompleteProps {
  name: string;
  label?: string;
  options: Option[];
  error?: boolean | string;
  helperText?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string | boolean;
  keyExtractor?: keyof Option;
}

export default function CustomAutocomplete({
  name,
  label,
  options,
  onChange,
  error,
  helperText,
  defaultValue,
  keyExtractor = 'plate',
}: AutocompleteProps) {
  const [value, setValue] = useState<Option | null>(null);

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
  } = useAutocomplete({
    options,
    getOptionLabel: (option: Option) => option[keyExtractor] || '',
    value,
    onChange: (_, newValue) => {
      setValue(newValue);
      if (onChange) {
        onChange({
          target: {
            name,
            value: newValue?.id ?? null,
            type: 'text',
            checked: false,
            valueAsNumber: 0,
            valueAsDate: null
          }
        } as ChangeEvent<HTMLInputElement>);
      }
    },
    isOptionEqualToValue: (option, value) => 
      option?.[keyExtractor] === value?.[keyExtractor],
  });

  useEffect(() => {
    if (defaultValue && options.length) setValue(options.filter(e=>e.id===defaultValue)[0]);
  }, [defaultValue, options]);

  return (
    <div style={{ marginBottom: '1rem', position: 'relative' }}>
      <StyledRoot {...getRootProps()} $focused={focused} $error={!!error}>
        <StyledInput
          {...getInputProps()}
          name={name}
          placeholder={label ? `${label} *` : ''}
          required
        />
      </StyledRoot>
      {helperText && <ErrorText>{helperText}</ErrorText>}
      {groupedOptions.length > 0 && (
        <StyledListbox {...getListboxProps()}>
          {(groupedOptions as Option[]).map((option, index) => (
            <StyledOption
              {...getOptionProps({ option, index })}
              key={option.id}
              value={option.id}
            >
              {option[keyExtractor]}
            </StyledOption>
          ))}
        </StyledListbox>
      )}
    </div>
  );
}

const StyledRoot = styled('div')<{ $focused?: boolean; $error?: boolean }>`
  position: relative;
  border-radius: 8px;
  border: 1px solid ${({ $error }) => ($error ? 'red' : '#DAE2ED')};
  padding: 8px;
  display: flex;
  background: white;
  
  ${({ $focused }) => $focused && `
    border-color: #3399FF;
    box-shadow: 0 0 0 3px rgba(51, 153, 255, 0.2);
  `}

  &:hover {
    border-color: #3399FF;
  }
`;

const StyledInput = styled('input')`
  font-size: 0.875rem;
  border: none;
  outline: none;
  width: 100%;
  padding: 4px;
`;

const StyledListbox = styled('ul')`
  position: absolute;
  z-index: 999;
  width: 100%;
  margin: 8px 0;
  padding: 8px;
  background: white;
  border: 1px solid #DAE2ED;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
`;

const StyledOption = styled('li')`
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;

  &[aria-selected="true"] {
    background-color: #DAECFF;
    color: #003A75;
  }

  &:hover {
    background-color: #F3F6F9;
  }
`;

const ErrorText = styled('span')`
  color: red;
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
`;





/*

const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B2',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Root = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[500]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0 2px 4px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
  };
  display: flex;
  gap: 5px;
  padding-right: 5px;
  overflow: hidden;
  width: 100%;
  padding: 5px;

  &.Mui-focused {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus-visible {
    outline: 0;
  }
  &.error {
    border: 1px solid red;
  }
`,
);

const Input = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 5px 5px;
  outline: 0;
  flex: 1 0 auto;
`,
);

const Listbox = styled('ul')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  width: 320px;
  border-radius: 12px;
  overflow: auto;
  outline: 0;
  max-height: 300px;
  z-index: 1;
  position: absolute;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  box-shadow: 0 2px 3px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.50)' : 'rgba(0,0,0, 0.05)'
  };
  `,
);

const Option = styled('li')(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    cursor: pointer;
  }

  &[aria-selected="true"] {
    background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
    color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
  }

  &.Mui-focused,
  &.Mui-focusVisible {
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.Mui-focusVisible {
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[500] : blue[200]};
  }

  &[aria-selected="true"].Mui-focused,
  &[aria-selected="true"].Mui-focusVisible {
    background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
    color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
  }
  `,
);*/