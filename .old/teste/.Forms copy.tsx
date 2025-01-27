"use client"

import React from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Dialog, DialogContent, DialogTitle, Input, MenuItem, Select, Typography } from '@mui/material';

// User schema for validation
const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  username: z.string().min(3, { message: "Username deve ter pelo menos 3 caracteres" }),
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

export default function UserModal({ isOpen, onClose, user, onSubmit}: UserModalProps) {
  console.log(user);
  
  const { control, handleSubmit, reset, formState: { errors }} = useForm<UserFormData>({
    /*resolver: zodResolver(userSchema),*/
    defaultValues: user || {
      name: '',
      username: '',
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
    <Dialog open={isOpen} onChange={onClose}>
      <DialogContent>
        <DialogTitle>{user ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Box>
            <Typography variant="h6">Nome</Typography>
            <Controller
              name="name"
              control={control}
              defaultValue={user?.name}
              render={({ field }) => (<Input {...field} placeholder="Nome completo"/>)}
            />
            {errors.name && (
              <Typography className="text-red-500 text-sm">
                {errors.name.message}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="h6">Username</Typography>
            <Controller 
              name="username"
              control={control}
              defaultValue={user?.username}	
              render={({ field }) => (
                <Input {...field} placeholder="Username"/>
              )}
            />
            {errors.username && (
              <Typography color='error' fontSize={'sm'}>{errors.username.message}</Typography>
            )}
          </Box>

          <Box>
            <Typography variant="h6">Permissão</Typography>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onChange={field.onChange} value={field.value} label="Selecione uma permissão" fullWidth>
                    <MenuItem value="USER">Usuário</MenuItem >
                    <MenuItem value="ADMIN">Administrador</MenuItem >
                    <MenuItem value="DRIVER">Motorista</MenuItem >
                </Select>
              )}
            />
            {errors.role && (<p className="text-red-500 text-sm">{errors.role.message}</p>)}
          </Box>

          <Box>
            <Button type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{user ? 'Atualizar' : 'Adicionar'}</Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}