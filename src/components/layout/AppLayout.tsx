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
    const { isLoggedIn, logout, username } = useAuth();
    const [open, setOpen] = useState(false);

    const navLinks = [
        { label: "♦ Poker ♦", href: "/game/poker" },
        { label: "♥ Roulette ♥", href: "/game/roulette" },
        { label: "♣ Black Jack ♣", href: "/game/blackjack" },
        { label: "♠ Lobby ♠", href: "/game/lobby" },
        { label: " Admin page ", href: "/account/admin-panel" },
    ];

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    // background: "linear-gradient(90deg, #4a1f1f, #8b0000)",
                    background: "#0b3d0b",
                    borderBottom: "2px solid gold",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>

                    {/* Logo */}
                    <Typography
                        component={Link}
                        href="/"
                        sx={{
                            textDecoration: "none",
                            fontWeight: "bold",
                            letterSpacing: "2px",
                            color: "gold",
                            fontSize: 22,
                        }}
                    >
                        ♠ Poker Pals ♦
                    </Typography>

                    {/* Desktop menu */}
                    <Box
                        sx={{
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        {navLinks.map((link) => (
                            <Button key={link.href} component={Link} href={link.href} sx={{ color: "gold" }}>
                                {link.label}
                            </Button>
                        ))}

                        {isLoggedIn && (
                            <Typography sx={{ color: "gold", fontStyle: "italic" }}>
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
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
                    <Stack spacing={2}>

                        {isLoggedIn && (
                            <Typography sx={{ fontStyle: "italic" }}>
                                Logged in as {username}
                            </Typography>
                        )}

                        {navLinks.map((link) => (
                            <Button
                                key={link.href}
                                component={Link}
                                href={link.href}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Button>
                        ))}

                        {!isLoggedIn ? (
                            <Button component={Link} href="/account/login">
                                Login
                            </Button>
                        ) : (
                            <Button onClick={logout}>Logout</Button>
                        )}

                    </Stack>
                </Box>
            </Drawer>

            {/* Page content */}
            <Container maxWidth="lg" disableGutters sx={{ mt: 4 }}>
                {children}
            </Container>
        </>
    );
}