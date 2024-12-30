// /src/components/LoginForm.tsx
'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  // Hydration-safe state
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState({email: '',password: ''})
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  // Ensure component only renders on client
  useEffect(() => {setMounted(true)}, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!credentials.email || !credentials.password) {
      setError('Por favor, preencha todos os campos')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) { router.replace('/') }
      setIsLoading(false)
    } catch (err:unknown) {
      console.log(err);
      setError('Erro ao processar o login')
      setIsLoading(false)
    }
  }

  // Prevent server-side rendering of dynamic content
  if (!mounted) return null;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={credentials.email}
        onChange={(e) => setCredentials({
          ...credentials, 
          email: e.target.value
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

      {error && (<Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>{error}</Typography>)}

      <Button type="submit" fullWidth variant="contained" color="primary" disabled={isLoading} sx={{ mt: 3, mb: 2 }}>
        {isLoading ? (<CircularProgress size={24} />) : ('Entrar')}
      </Button>
    </Box>
  )
}