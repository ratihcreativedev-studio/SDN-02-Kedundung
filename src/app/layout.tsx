import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from '@/components/ui/notification-provider';
import { PageLoader } from '@/components/layout/page-loader';

export const metadata: Metadata = {
  title: "SIPANDA - SDN Kedundung 2",
  description:
    "Sistem Informasi Pendidikan Anak SD - SDN Kedundung 2, Kec. Magersari, Kota Mojokerto",
  keywords: [
    "SIPANDA",
    "SDN Kedundung 2",
    "Sistem Informasi",
    "Pendidikan",
    "Sekolah Dasar",
    "Mojokerto",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className="text-text-primary">
        <PageLoader />
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
