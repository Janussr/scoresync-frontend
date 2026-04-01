"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    Drawer,
    IconButton,
    Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout({ children }: { children: ReactNode }) {
    const { hydrated, isLoggedIn, logout, username, role } = useAuth();
    const [open, setOpen] = useState(false);

    if (!hydrated) {
        return <div>Loading...</div>; 
    }

    const navLinks = [
        { label: "♣ Black Jack ♣", href: "/game/blackjack" },
        { label: "♦ Poker ♦", href: "/game/poker" },
        { label: "♥ Roulette ♥", href: "/game/roulette" },
// ♠♠
    ];

    if (isLoggedIn) {
        navLinks.push({ label: " Profile ", href: "/account/profile" });
    }

    if (isLoggedIn && role === "Admin") {
        navLinks.push({ label: "Admin panel", href: "/account/admin-panel" });
    }

    return (
        <>
            <AppBar
                position="sticky"
               sx={{
    background:
      "linear-gradient(180deg, rgba(11,61,11,0.9) 0%, rgba(7,42,7,0.95) 100%)",
    backdropFilter: "blur(6px)",
    borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
  }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>

                    <Typography
                        component={Link}
                        href="/"
                       sx={{
    textDecoration: "none",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#f1c40f",
    fontSize: { xs: 18, md: 22 },
    fontFamily: "Playfair Display, serif",
    textShadow: "0 0 10px rgba(255,215,0,0.2)",
  }}
                    >
                        ♠ Poker Pals ♦
                    </Typography>

                    {/* Desktop menu */}
                    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
                        {navLinks.map((link) => (
                            <Button key={link.href} component={Link} href={link.href} sx={{ color: "gold" }}>
                                {link.label}
                            </Button>
                        ))}

                        {isLoggedIn && (
                            <Typography sx={{ color: "gold", fontStyle: "italic",  textTransform: "capitalize"}}>
                                {username}
                            </Typography>
                        )}

                        {!isLoggedIn ? (
                            <Button component={Link} href="/account/login" sx={{ color: "gold" }}>
                                Login
                            </Button>
                        ) : (
                            <Button onClick={logout} sx={{ color: "gold" }}>
                                Logout
                            </Button>
                        )}
                    </Box>

                    {/* Mobile menu button */}
                    <IconButton
                        sx={{ display: { xs: "flex", md: "none" }, color: "gold" }}
                        onClick={() => setOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <Box

                    sx={{
    width: 270,
    height: "100%",
    p: 2,
    background: `
      linear-gradient(180deg, rgba(11,61,11,0.95), rgba(7,42,7,1))
    `,
    borderRight: "1px solid rgba(212, 175, 55, 0.25)",
    color: "#f5e6a8",
  }}

                >
                    <Stack spacing={2}>
                       {isLoggedIn && (
  <Box
    sx={{
      textAlign: "center",
      mb: 2,
      pb: 2,
      borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
    }}
  >
    <Typography
      sx={{
        fontWeight: 700,
        textTransform: "capitalize",
        color: "#f1c40f",
        letterSpacing: "0.08em",
      }}
    >
      {username}
    </Typography>
  </Box>
)}

                        {navLinks.map((link) => (
                           <Button
  key={link.href}
  component={Link}
  href={link.href}
  onClick={() => setOpen(false)}
  fullWidth
  sx={{
    justifyContent: "flex-start",
    color: "rgba(245, 230, 168, 0.85)",
    fontWeight: 500,
    px: 2,
    py: 1.2,
    borderRadius: "10px",
    letterSpacing: "0.05em",

    "&:hover": {
      backgroundColor: "rgba(212, 175, 55, 0.08)",
      color: "#f1c40f",
      transform: "translateX(4px)",
    },
  }}
>
  {link.label}
</Button>
                        ))}

                        {!isLoggedIn ? (
                            <Button
                                component={Link}
                                href="/account/login"
                                onClick={() => setOpen(false)}
                                 sx={{
    mt: 2,
    pt: 2,
    color: "#80e573",
    justifyContent: "flex-start",

    "&:hover": {
      backgroundColor: "rgba(69, 231, 110, 0.08)",
    },
                                }}>
                                Login
                            </Button>
                        ) : (
                          <Button
  onClick={() => {
    logout();
    setOpen(false);
  }}
  fullWidth
  sx={{
    mt: 2,
    pt: 2,
    color: "#e57373",
    justifyContent: "flex-start",

    "&:hover": {
      backgroundColor: "rgba(229, 115, 115, 0.08)",
    },
  }}
>
  Logout
</Button>
                        )}
                    </Stack>
                </Box>
            </Drawer>

            {/* Page content */}
            <Container maxWidth="lg" disableGutters sx={{ mt: 0, pb: 1 }}>
                {children}
            </Container>
        </>
    );
}