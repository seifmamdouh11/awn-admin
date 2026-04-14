import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies Desk",
};

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
