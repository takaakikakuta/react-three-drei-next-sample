import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PositionProvider } from '@/components/hooks/PositionContext'
import "./globals.css";
import { PointOverlProvider } from "@/components/hooks/PointOverContext";
import React, { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Suspense fallback={<div>Loading...</div>}>
        <PointOverlProvider>
          <PositionProvider>
            {children}
          </PositionProvider>
        </PointOverlProvider>
      </Suspense>
      </body>
    </html>
  );
}
