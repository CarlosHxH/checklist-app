"use client"

import React from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

// User schema for validation
const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  username: z.string().min(3, { message: "Username deve ter pelo menos 3 caracteres" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }).optional(),
  role: z.enum(['ADMIN', 'USER', 'DRIVER'], {
    errorMap: () => ({ message: "Selecione um papel válido" })
  })
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserFormData | null;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export default function UserModal({
  isOpen,
  onClose,
  user,
  onSubmit
}: UserModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UserFormData>({
    /*resolver: zodResolver(userSchema),*/
    defaultValues: user || {
      name: '',
      username: '',
      password: '',
      role: 'USER'
    }
  });

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      onClose();
      reset();
    } catch (error) {
      console.error('Erro ao salvar usuário', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {user ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (<TextField {...field} placeholder="Nome completo" fullWidth />)}
            />
            {errors.name && (
              <Typography color="error">{errors.name.message}</Typography>
            )}

            <Controller
              name="username"
              control={control}
              render={({ field }) => (<TextField {...field} placeholder="Usuário para login" fullWidth />)}
            />
            {errors.username && (
              <Typography color="error">{errors.username.message}</Typography>
            )}

            <Controller
              name="password"
              control={control}
              render={({ field }) => (<TextField {...field} placeholder="Senha" fullWidth helperText={user ? "Deixe em branco para manter a senha atual" : ""}/>)}
            />
            {errors.password && (
              <Typography color="error">{errors.password.message}</Typography>
            )} 

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="USER">Usuário</MenuItem>
                  <MenuItem value="DRIVER">Motorista</MenuItem>
                </Select>
              )}
            />
            {errors.role && (
              <Typography color="error">{errors.role.message}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {user ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}