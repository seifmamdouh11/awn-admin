import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Ledger",
};

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
