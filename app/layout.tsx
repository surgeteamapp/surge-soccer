import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { SessionProvider } from "@/context/SessionProvider";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Power Soccer Team Management Platform",
  description: "A comprehensive management platform for power soccer teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ overflowX: 'hidden', background: '#0a0a0a' }}>
      <body className={`${inter.className} bg-[#0a0a0a]`} style={{ overflowX: 'hidden', margin: 0, padding: 0 }}>
        <SessionProvider>
          <SocketProvider>{children}</SocketProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
