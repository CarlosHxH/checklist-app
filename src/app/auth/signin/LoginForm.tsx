// /src/components/LoginForm.tsx
'use client'
import { useState, useEffect, } from 'react'
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import authenticate from './action'
import { Form, useForm } from 'react-hook-form'

export default function LoginForm() {
  const { register, control, formState: { errors, isSubmitting }, } = useForm();
  // Hydration-safe state
  const [mounted, setMounted] = useState(false)
  const router = useRouter();

  // Ensure component only renders on client
  useEffect(() => { setMounted(true) }, [])
  // Prevent server-side rendering of dynamic content
  if (!mounted) return null;
  return (
    <Form
      onSubmit={async(data) => {
        const result = await authenticate(data.formData);
        if(result?.error) throw result.error
        console.log({result});
        
      }}
      control={control}
      onSuccess={() => {alert("Success")}}
      onError={() => {alert("error")}}
    >
      <Typography component="h1" variant="h5" color={'primary'} sx={{ mb: 2, fontWeight: 'bold' }}>Informe o usuario e senha</Typography>
      <Typography component="span" variant="inherit" color={'error'}>{errors.root?.message}</Typography>
      <Box sx={{ width: '100%' }}>
        <TextField
          disabled={isSubmitting} variant="outlined" margin="normal" required fullWidth id="username"
          label="Usuário" autoComplete="username" autoFocus
          {...register("username", { required: true })}
        />
        <TextField
          disabled={isSubmitting} variant="outlined" margin="normal" required fullWidth label="Senha"
          type="password" id="password" autoComplete="current-password"
          {...register("password", { required: true })}
        />
        {errors && (<Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>{errors.root?.message}</Typography>)}
        <Button type="submit" fullWidth variant="contained" color="primary" disabled={isSubmitting} sx={{ mt: 3, mb: 2 }}>
          {isSubmitting ? (<CircularProgress size={24} />) : ('Entrar')}
        </Button>
      </Box>
    </Form >
  )
}