import { ReactNode } from "react";
import Providers from "./Providers";
import AppLayout from "@/components/layout/AppLayout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}