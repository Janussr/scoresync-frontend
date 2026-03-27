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
    ];

    if (isLoggedIn) {
        navLinks.push({ label: " Profile ", href: "/account/profile" });
    }
// ♠♠

    if (isLoggedIn && role === "Admin") {
        navLinks.push({ label: "Admin panel", href: "/account/admin-panel" });
    }

    return (
        <>
            <AppBar
                position="sticky"
                sx={{

                    background: "linear-gradient(180deg, #0b3d0b 0%, #072a07 100%)",
                    borderBottom: "2px solid gold",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between" }}>

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
                    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
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
            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <Box

                    sx={{
                        width: 260,
                        height: "100%",
                        p: 2,
                        background: `linear-gradient(180deg, #0b3d0b 0%, #0d4d0d 100%)`,
                        boxShadow: "inset 0 1px 0 rgba(255,215,0,0.2)",
                        color: "gold",
                    }}

                >
                    <Stack spacing={2}>
                        {isLoggedIn &&

                            <Box sx={{ textAlign: "center", mb: 2 }}>
                                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                    Logged in as
                                </Typography>

                                <Typography sx={{ fontWeight: "bold" }}>
                                    {username}
                                </Typography>
                            </Box>

                        }

                        {navLinks.map((link) => (
                            <Button
                                sx={{
                                    color: "gold",
                                    "&:hover": {
                                        backgroundColor: "rgba(255,215,0,0.1)",
                                    },
                                }}
                                key={link.href}
                                component={Link}
                                href={link.href}
                                onClick={() => setOpen(false)}
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
                                    color: "gold",
                                    "&:hover": {
                                        backgroundColor: "rgba(255,215,0,0.1)",
                                    },
                                }}>
                                Login
                            </Button>
                        ) : (
                            <Button onClick={() => {
                                logout();
                                setOpen(false);
                            }}
                                sx={{
                                    color: "gold",
                                    "&:hover": {
                                        backgroundColor: "rgba(255,215,0,0.1)",
                                    },
                                }}>Logout</Button>
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