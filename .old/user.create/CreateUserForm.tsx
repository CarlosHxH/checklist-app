"use client";
import React, { useState } from "react";
import { TextField, Button, Typography, Box, Grid } from "@mui/material";
import BottonLabel from "@/components/ButtonLabel";

const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({...formData,[name]: value,
    });
  };

  const handleToggle = (event: { [key: string]: any }) => {
    setFormData((prev) => ({ ...prev, ...event }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const user = await response.json();
      setSuccess(`User  ${JSON.stringify(user)} created successfully!`);
    } catch (error:any) {
      setError(error.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}

      <Grid item xs={12} md={6}>
        <BottonLabel label={"Tipo de usuario?"} name={"role"} options={["USER", "DRIVER", "ADMIN"]} value={formData.role} onChange={handleToggle}/>
      </Grid>

      <TextField label="Name" variant="outlined" fullWidth margin="normal" name="name" value={formData.name} onChange={handleChange} required/>
      <TextField label="Email" variant="outlined" fullWidth margin="normal" name={"email"} value={formData.email} onChange={handleChange} required/>
      <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" name="password" value={formData.password} onChange={handleChange} required/>
      <Button fullWidth type="submit" variant="contained" color="primary">
        Create User
      </Button>
    </Box>
  );
};

export default CreateUserForm;
