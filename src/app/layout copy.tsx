import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAppProvider } from '@toolpad/core/nextjs';
import LinearProgress from '@mui/material/LinearProgress';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import "./globals.css";
import Image from "next/image";
import { signIn, signOut } from 'next-auth/react';
import { useSession } from "@toolpad/core/useSession";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CheckList 5s",
  description: "5sTransportes",
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon/icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon/icon.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/favicon/icon.png',
    },
  ],
};

const AUTHENTICATION = { signIn, signOut };
const BRANDING = {
  title: '5sTransportes',
  logo: <Image src={'/icon.png'} width={100} height={100} style={{ width: 'auto', height: 100 }} alt={'5s'} />
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-toolpad-color-scheme="light">
      <head>
        <meta name="apple-mobile-web-app-title" content="Checklist 5s" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Checklist 5s" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Checklist 5s" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <React.Suspense fallback={<LinearProgress />}>
            <NextAppProvider branding={BRANDING} authentication={AUTHENTICATION}>
                {children}
            </NextAppProvider>
          </React.Suspense>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
