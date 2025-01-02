"use client";
import React from "react";
import { ToggleButtonGroup, Box, Typography, ToggleButton, styled } from "@mui/material";

interface ButtonLabelProps {
  label: string;
  name: string;
  value?: string | null;
  options: string[];
  error?: boolean | string;
  helperText?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyledToggleButton = styled(ToggleButton)({
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "5px",
  width: "100%",
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

export default function ButtonLabel({ 
  label, 
  name, 
  value = "", 
  options, 
  error, 
  helperText, 
  onChange 
}: ButtonLabelProps) {
  const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (!newValue || !onChange) return;
    
    onChange({
      target: {
        name,
        value: newValue,
        type: 'button',
        checked: false,
        valueAsNumber: 0,
        valueAsDate: null
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
      <Typography variant="body1" color="#444">{label}</Typography>
      <ToggleButtonGroup 
        value={value} 
        exclusive 
        onChange={handleChange} 
        aria-label={label}
      >
        {options.map(option => (
          <StyledToggleButton key={option} value={option}>
            {option}
          </StyledToggleButton>
        ))}
      </ToggleButtonGroup>
      {error && <Typography color="error" variant="caption">{helperText}</Typography>}
    </Box>
  );
}