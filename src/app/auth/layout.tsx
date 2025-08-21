"use client"
import MuiProvider from '@/provider/MuiProvider';

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <MuiProvider>
      {children}
    </MuiProvider>
  );
}