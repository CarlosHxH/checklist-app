<<<<<<< HEAD
//src\app\auth\signin\LoginForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
=======
// /src/components/LoginForm.tsx
'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
>>>>>>> 1b903dacc644c9bbd407e1518f92f0c4aa3341d9

export default function LoginForm() {
  // Hydration-safe state
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  // Ensure component only renders on client
  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!credentials.username || !credentials.password) {
      setError('Por favor, preencha todos os campos')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        redirect: true,
        username: credentials.username,
        password: credentials.password
      })
<<<<<<< HEAD
      if (!result?.ok) {
        if (result?.error === "CredentialsSignin") {
          setError('Usuario ou senha invalido!')
        } else {
          setError('Erro ao fazer login, verifique suas credenciais e tente novamente!')
        }
        setIsLoading(false)
      } else if (result?.ok) {
        router.replace('/');
      }
    } catch (err: unknown) {
=======

      if (result?.error) {
        setError('Erro ao processar o login')
      } else if (result?.ok) { router.replace('/') }
      setIsLoading(false)
    } catch (err:unknown) {
>>>>>>> 1b903dacc644c9bbd407e1518f92f0c4aa3341d9
      console.log(err);
      setError('Erro ao processar o login')
      setIsLoading(false)
    }
  }

  // Prevent server-side rendering of dynamic content
  if (!mounted) return null;

  return (
    <>
<<<<<<< HEAD
      <Typography component="h1" variant="h5" color={'primary'} sx={{ mb: 2, fontWeight: 'bold' }}>Informe o usuario e senha</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          label="Usuário"
          name="username"
          autoComplete="username"
          autoFocus
          value={credentials.username}
          disabled={isLoading}
          onChange={(e) => setCredentials({
            ...credentials,
            username: e.target.value
          })}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Senha"
          type="password"
          id="password"
          autoComplete="current-password"
          value={credentials.password}
          disabled={isLoading}
          onChange={(e) => setCredentials({
            ...credentials,
            password: e.target.value
          })}
        />
=======
    <Typography component="h1" variant="h5" color={'primary'} sx={{ mb: 2, fontWeight: 'bold' }}>Informe o usuario e senha</Typography>
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="username"
        label="Usuário"
        name="username"
        autoComplete="username"
        autoFocus
        value={credentials.username}
        onChange={(e) => setCredentials({
          ...credentials, 
          username: e.target.value
        })}
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Senha"
        type="password"
        id="password"
        autoComplete="current-password"
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials, 
          password: e.target.value
        })}
      />
>>>>>>> 1b903dacc644c9bbd407e1518f92f0c4aa3341d9

        {error && (<Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>{error}</Typography>)}

        <Button type="submit" fullWidth variant="contained" color="primary" disabled={isLoading} sx={{ mt: 3, mb: 2 }}>
          {isLoading ? (<CircularProgress size={24} />) : ('Entrar')}
        </Button>
      </Box>
    </>
  )
}