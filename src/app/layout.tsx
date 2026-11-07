import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { themeBootstrap } from "@/components/theme/bootstrap";

export const metadata: Metadata = {
  title: "CapituLando",
  description:
    "Seu escritório literário: escreva capítulos, organize personagens e construa o universo das suas histórias com o CapituLando.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
