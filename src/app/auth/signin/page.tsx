import * as React from 'react';
import { SignInPage, SupportedAuthProvider, type AuthProvider } from '@toolpad/core/SignInPage';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';

export default function SignIn() {
const providers: { id: SupportedAuthProvider; name: string }[] = [
    { id: 'credentials', name: 'Credentials' },
  ];
  return (
    <SignInPage
      providers={providers}
      slotProps={{
        emailField: {
          type: 'text',
          label: 'Usuário',
          placeholder: 'Usuário'
        },
        passwordField: {
          label: 'Senha',
          placeholder: '********'
        }
      }}
      signIn={async (
        provider: AuthProvider,
        formData: FormData,
        callbackUrl?: string,
      ) => {
        'use server';
        try {
          return await signIn(provider.id, {
            ...(formData && { username: formData.get('email'), password: formData.get('password') }),
            redirectTo: callbackUrl ?? '/',
          });
        } catch (error) {
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
          }
          // Handle Auth.js errors
          if (error instanceof AuthError) {
            const errorMessage = error.message.split(". Read more")[0].trim();
            return {
              error: errorMessage,
              type: (error as any).type,
            };
          }
          // An error boundary must exist to handle unknown errors
          return {
            error: 'Something went wrong.',
            type: 'UnknownError',
          };
        }
      }}
    />
  );
}
