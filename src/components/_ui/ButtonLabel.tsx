"use client";
import React, { useState } from "react";
import { ToggleButtonGroup, Box, Typography, ToggleButton, styled, InputLabel } from "@mui/material";
import { useController, Control } from "react-hook-form";

type CommonProps = {
  label: string;
  options: string[];
  disabled?: boolean;
  error?: { message?: string } | string;
};

type ControlledProps = CommonProps & {
  name: string;
  control: Control<any>;
  rules?: Record<string, unknown>;
};

type UncontrolledProps = CommonProps & {
  value?: string;
  onChange?: (value: string) => void;
};

const StyledToggleButton = styled(ToggleButton)({
  padding: "5px",
  width: "100%",
  "&.error": {
    color: 'red',
    border: `1px solid red`,
  },
  "&:hover": {
    backgroundColor: "#999",
    color: "#fff",
    fontWeight: "bold",
  },
  "&.Mui-selected": {
    backgroundColor: "#0070f3",
    color: "white",
    "&:hover": {
      backgroundColor: "#0070f3",
    },
  },
});

function ControlledButtonLabel({ label, name, options, control, rules, disabled, error: propError }: ControlledProps) {
  const { field, fieldState } = useController({ name, control, rules });
  const error = fieldState.error ?? propError;

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue === null) return;
    field.onChange(newValue);
  };

  const errorMessage = error ? (typeof error === "string" ? error : error.message) : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <ToggleButtonGroup disabled={disabled} value={field.value} exclusive onChange={handleChange} aria-label={label}>
        {options.map((option) => (
          <StyledToggleButton className={!!error ? "error" : ""} disabled={disabled} key={option} value={option}>
            {option}
          </StyledToggleButton>
        ))}
      </ToggleButtonGroup>
      {errorMessage && (
        <Typography color="error" variant="caption">
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
}

function UncontrolledButtonLabel({ label, options, disabled, value: propValue, onChange: propOnChange, error: propError }: UncontrolledProps) {
  const [internalValue, setInternalValue] = useState<string | null>(propValue ?? null);
  const value = propValue !== undefined ? propValue : internalValue;
  const error = propError;

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue === null) return;
    if (propOnChange) {
      propOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const errorMessage = error ? (typeof error === "string" ? error : error.message) : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <ToggleButtonGroup disabled={disabled} value={value} exclusive onChange={handleChange} aria-label={label}>
        {options.map((option) => (
          <StyledToggleButton className={!!error ? "error" : ""} disabled={disabled} key={option} value={option}>
            {option}
          </StyledToggleButton>
        ))}
      </ToggleButtonGroup>
      {errorMessage && (
        <Typography color="error" variant="caption">
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
}

export default function ButtonLabel(props: ControlledProps | UncontrolledProps) {
  const isControlled = (p: ControlledProps | UncontrolledProps): p is ControlledProps =>
    (p as ControlledProps).control !== undefined && (p as ControlledProps).name !== undefined;

  if (isControlled(props)) {
    const { control, name, label, options, rules, disabled, error } = props;
    return (
      <ControlledButtonLabel
        control={control}
        name={name}
        label={label}
        options={options}
        rules={rules}
        disabled={disabled}
        error={error}
      />
    );
  }

  const { label, options, disabled, value, onChange, error } = props as UncontrolledProps;
  return (
    <UncontrolledButtonLabel
      label={label}
      options={options}
      disabled={disabled}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}