import type { Metadata } from "next";
import { ReactNode } from "react";
import Providers from "./Providers";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Poker Pals",
  description: "Poker Pals",
  manifest: "/manifest.webmanifest",
  themeColor: "#0b1c1a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}