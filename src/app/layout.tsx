import { ReactNode } from "react";
import Providers from "./Providers";
import AppLayout from "@/components/layout/AppLayout";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Poker Pals",
  description: "Poker Pals",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poker Pals",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1c1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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