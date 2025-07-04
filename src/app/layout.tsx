import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sistema de veterinarias",
  description: "Created by Zone-devs",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Ahora Next renderiza Navbar en el servidor */}
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
