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
  viewport: "width=device-width, initial-scale=1",
  robots: "noindex, nofollow",
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
