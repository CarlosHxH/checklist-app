"use client";
import React, { useState } from "react";
import {ToggleButtonGroup,Box,Typography,ToggleButton} from "@mui/material";
import { styled } from "@mui/system";

interface ButtonLabelProps {
  label: string;
  name: string;
  value?: string;
  options: string[];
  error?: boolean | string | null;
  helperText?: string | null;
  onChange?: (event: React.MouseEvent<HTMLElement>, value: string) => void;
}

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "5px 5px",
  width: "100%",
  "&:hover": {
    backgroundColor: "#999",
    color: "#fff",
    fontWeight: "bolder",
  },
  "&.Mui-selected": {
    backgroundColor: "#0070f3",
    color: "white",
    "&:hover": {
      backgroundColor: "#0070f3",
      color: "#fff",
    },
  },
}));

const ButtonLabel: React.FC<ButtonLabelProps> = ({label,name,value,options,error,helperText,onChange}) => {
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newValue: string | null ) => {
    if (newValue !== null) {
      setSelectedValue(newValue);
      if (onChange) {
        onChange(event, newValue);
      }
    }
  };

  const renderButton = (val: string) => (<StyledToggleButton name={name} key={val} value={val} aria-label={val}>{val}</StyledToggleButton>);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
      <Typography variant="body1" color="#444" sx={{ mt: "auto", mr: 1, alignItems: "center" }}>{label}</Typography>
      <ToggleButtonGroup value={selectedValue} exclusive onChange={handleAlignment} aria-label="Toggle">
        {options.map(renderButton)}
      </ToggleButtonGroup>
      {error && <span style={{ color: "red" }}>{helperText || ""}</span>}
    </Box>
  );
};

export default ButtonLabel;
