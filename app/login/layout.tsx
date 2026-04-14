import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Secure login for AWN administrative staff.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
