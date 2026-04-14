import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Management",
};

export default function ModeratorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
