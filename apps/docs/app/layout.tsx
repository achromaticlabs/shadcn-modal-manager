import "./global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Shadcn Modal Manager",
    default: "Shadcn Modal Manager",
  },
  description: "A lightweight, type-safe React modal management library",
};

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <html lang="en" suppressHydrationWarning>
    <body>
      <RootProvider>{children}</RootProvider>
    </body>
  </html>
);

export default Layout;
