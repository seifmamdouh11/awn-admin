import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "./Context/AdminContext";
import ThemeProvider from "./Hooks/ThemeProvider";
import LangProvider from "./Hooks/LangProvider";

export const metadata: Metadata = {
  title: "AWN Admin Dashboard",
  description: "Administrative Master Interface for AWN Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased min-h-screen">
        <ThemeProvider>
          <LangProvider>
            <AdminProvider>
              {children}
            </AdminProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
