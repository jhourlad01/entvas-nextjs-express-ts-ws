import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Auth0ProviderWrapper from "@/components/providers/Auth0Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Events Analytics Dashboard",
  description: "Senior Full Stack Developer Technical Assessment - Events analytics dashboard with webhook integration",
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
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Auth0ProviderWrapper>
          <Header />
          <main style={{ flexGrow: 1, padding: '24px 16px' }}>
            {children} 
          </main>
          <Footer />
        </Auth0ProviderWrapper>
      </body>
    </html>
  );
}
