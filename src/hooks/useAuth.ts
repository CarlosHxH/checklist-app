// hooks/useAuth.ts
import { signIn } from 'next-auth/react';

interface LoginResponse {
  token?: string;
  error?: string;
}

export const useAuth = () => {
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        return { error: result.error };
      }

      // Buscar o token após login bem-sucedido
      const response = await fetch('/api/auth/token');
      const { token } = await response.json();

      // Salvar token no localStorage
      if (token) {
        localStorage.setItem('authToken', token);
      }

      return { token };
    } catch (error) {
      return { error: 'Erro ao realizar login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    // Outros procedimentos de logout...
  };

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  };

  return { login, logout, getToken };
};