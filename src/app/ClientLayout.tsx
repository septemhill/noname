"use client";

import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/Header";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Providers>
        <Header />
        {children}
      </Providers>
    </ThemeProvider>
  );
}
