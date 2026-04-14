import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "./Context/AdminContext";
import ThemeProvider from "./Hooks/ThemeProvider";
import LangProvider from "./Hooks/LangProvider";

export const metadata: Metadata = {
  title: {
    default: "AWN Admin Dashboard",
    template: "%s | AWN Admin",
  },
  description: "Administrative Master Interface for AWN Platform - Manage volunteers, companies, and financial operations securely.",
  keywords: ["volunteering", "impact", "governance", "admin dashboard", "management portal"],
  authors: [{ name: "AWN Team" }],
  robots: "noindex, nofollow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
