import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <DocsLayout
    tree={source.pageTree}
    nav={{
      title: "Modal Manager",
    }}
  >
    {children}
  </DocsLayout>
);

export default Layout;
