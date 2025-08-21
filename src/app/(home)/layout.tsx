"use client"
<<<<<<< HEAD
import MuiProvider from '@/provider/MuiProvider';
=======
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();
>>>>>>> 1b903dacc644c9bbd407e1518f92f0c4aa3341d9

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
<<<<<<< HEAD
    <MuiProvider>
      {children}
    </MuiProvider>
=======
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
>>>>>>> 1b903dacc644c9bbd407e1518f92f0c4aa3341d9
  );
}