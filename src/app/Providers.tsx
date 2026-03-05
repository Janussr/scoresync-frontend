"use client";

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import { AuthProvider } from "@/context/AuthContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ErrorProvider } from "@/context/ErrorContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ErrorProvider>
        {children}
        </ErrorProvider>
      </AuthProvider>
    </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
