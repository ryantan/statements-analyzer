import { Navigation } from '@/components/Navigation';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AntdRegistry } from '@ant-design/nextjs-registry';
// To make antd v5 support react 19
import '@ant-design/v5-patch-for-react-19';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Statements Analyzer',
  description: 'Upload and analyze your financial statements with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <Navigation />
          <main style={{ padding: '24px' }}>{children}</main>
        </AntdRegistry>
      </body>
    </html>
  );
}
