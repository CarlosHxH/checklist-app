import { useAutocomplete } from '@mui/base/useAutocomplete';
import { styled } from '@mui/system';
import React, { useEffect } from 'react';
import { useController, Control } from 'react-hook-form';

interface Option {
  id: string;
  [key: string]: string;
}

interface AutocompleteProps {
  name: string;
  label?: string;
  options: Option[];
  control: Control<any>;
  rules?: Record<string, any>;
  keyExtractor?: keyof Option;
}

export default function CustomAutocomplete({
  name,
  label,
  options,
  control,
  rules,
  keyExtractor = 'name',
}: AutocompleteProps) {
  const [ value, setValue ] = React.useState<Option | null>(null);
  const {
    field: { value: fieldValue, onChange },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules
  });

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
    value: options.find(opt => opt.id === fieldValue) || null,
    onChange: (_, newValue) => {
      setValue(newValue);
      onChange(newValue?.id ?? null);
    },
    isOptionEqualToValue: (option, value) => 
      option?.[keyExtractor] === value?.[keyExtractor],
  });

  useEffect(() => {
    if (fieldValue && options.length) {
      const selectedOption = options.find(opt => opt.id === fieldValue);
      if (selectedOption) setValue(selectedOption);
    }
  }, [fieldValue, options, setValue]);

  return (
    <div style={{ marginBottom: '1rem', position: 'relative' }}>
      <StyledRoot {...getRootProps()} $focused={focused} $error={!!error}>
        <StyledInput
          {...getInputProps()}
          name={name}
          value={value ? value[keyExtractor] : ''}
          placeholder={label ? `${label} *` : ''}
          required
        />
      </StyledRoot>
      {error && <ErrorText>{error.message}</ErrorText>}
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