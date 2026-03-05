"use client";

import { ReactNode } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Stack
} from "@mui/material";
import Link from "next/link";
import Providers from "./Providers";
import { useAuth } from "@/context/AuthContext";

function Header() {
  const { isLoggedIn, logout, isAdmin, hydrated, username } = useAuth();
  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #4a1f1f, #8b0000)",
        borderBottom: "2px solid gold",
        boxShadow: "0 0 15px rgba(255, 215, 0, 0.4)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            letterSpacing: "2px",
            color: "gold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            component={Link}
            href="/"
            sx={{
              color: "gold",
              "&:hover": { color: "white", transform: "scale(1.1)" },
              transition: "0.2s",
            }}
          >
            ♠ Poker pals ♦
          </Button>

          <Typography
            variant="subtitle2"
            sx={{ color: "gold", ml: 2, fontStyle: "italic", textTransform: "capitalize" }}
          >
            {isLoggedIn ? `${username}` : ""}
          </Typography>

        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={Link} href="/blackjack" sx={{ color: "gold" }}>
            ♣ Black Jack
          </Button>

          <Button component={Link} href="/poker" sx={{ color: "gold" }}>
            ♦ Poker
          </Button>

          <Button component={Link} href="/roulette" sx={{ color: "gold" }}>
            ♠ Roulette
          </Button>

          <Box>
            {!isLoggedIn ? (
              <Button component={Link} href="/login" sx={{ color: "gold" }}>
                Login
              </Button>
            ) : (
              <Stack direction="column" alignItems="center" spacing={0.3}>
                <Button
                  onClick={logout}
                  sx={{
                    color: "gold",
                    "&:hover": { color: "white", transform: "scale(1.05)" },
                    transition: "0.2s",
                  }}
                >
                  Logout
                </Button>

              </Stack>
            )}

          </Box>

        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {children}
          </Container>
        </Providers>
      </body>
    </html>
  );
}