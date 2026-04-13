"use client";

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
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "@/context/AuthContext";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const { hydrated, isLoggedIn, logout, username, role, activeGameId } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [gameMenuAnchor, setGameMenuAnchor] = useState<null | HTMLElement>(null);
  const [guideMenuAnchor, setGuideMenuAnchor] = useState<null | HTMLElement>(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);

  const openGameMenu = (event: React.MouseEvent<HTMLElement>) => {
    setGameMenuAnchor(event.currentTarget);
  };

  const openGuideMenu = (event: React.MouseEvent<HTMLElement>) => {
    setGuideMenuAnchor(event.currentTarget);
  };

  const openAccountMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const closeDesktopMenus = () => {
    setGameMenuAnchor(null);
    setGuideMenuAnchor(null);
    setAccountMenuAnchor(null);
  };


  useEffect(() => {
    if (!hydrated) return;

    if (pathname === "/game/active-game" && !activeGameId) {
      router.replace("/game/lobby");
    }
  }, [hydrated, pathname, activeGameId, router]);

  if (!hydrated) {
    return <div>Loading...</div>;
  }

  const guideLinks: NavItem[] = [
    { label: "Black Jack", href: "/game/blackjack" },
    { label: "Poker", href: "/game/poker" },
    { label: "Roulette", href: "/game/roulette" },
  ];

  const navigationLinks: NavItem[] = [
    {
      label: activeGameId ? "Active Game" : "Lobby",
      href: activeGameId ? "/game/active-game" : "/game/lobby",
    },
    { label: "Game History", href: "/game/game-history" },
    { label: "Hall of Fame", href: "/game/hall-of-fame" },
    ...((role === "Admin" || role === "Gamemaster")
      ? [{ label: "Game Panel", href: "/game/game-control-panel" }]
      : []),
  ];

  const accountLinks = useMemo(() => {
    const links: NavItem[] = [];

    if (isLoggedIn) {
      links.push({ label: "Profile", href: "/account/profile" });
    }

    if (isLoggedIn && role === "Admin") {
      links.push({ label: "Admin Panel", href: "/account/admin-panel" });
    }

    return links;
  }, [isLoggedIn, role]);

  const closeDrawer = () => setOpen(false);

  const menuLinkSx = {
    justifyContent: "flex-start",
    color: "#f1c40f",
    fontWeight: 700,
    px: 0,
    py: 1.1,
    minHeight: 0,
    borderRadius: 0,
    textTransform: "none",
    letterSpacing: "0.04em",
    fontSize: "1.1rem",
    fontFamily: "Georgia, serif",
    "&:hover": {
      backgroundColor: "transparent",
      color: "#ffd84d",
      transform: "translateX(4px)",
    },
  };

  const sectionLabelSx = {
    color: "rgba(212, 175, 55, 0.5)",
    fontSize: 11,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    mb: 1.25,
    fontFamily: "Georgia, serif",
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background:
            "linear-gradient(180deg, rgba(11,61,11,0.92) 0%, rgba(7,42,7,0.96) 100%)",
          backdropFilter: "blur(6px)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          pt: "env(safe-area-inset-top)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: 56, sm: 64 },
            px: 2,
          }}
        >
          <Typography
            component={Link}
            href="/"
            sx={{
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#f1c40f",
              fontSize: { xs: 18, md: 22 },
              fontFamily: "Playfair Display, Georgia, serif",
              textShadow: "0 0 10px rgba(255,215,0,0.16)",
            }}
          >
            ♠ Poker Pals ♦
          </Typography>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Button
              onClick={openGameMenu}
              sx={{ color: "gold", textTransform: "none" }}
            >
              Game
            </Button>

            <Menu
              anchorEl={gameMenuAnchor}
              open={Boolean(gameMenuAnchor)}
              onClose={closeDesktopMenus}
              PaperProps={{
                sx: {
                  bgcolor: "#0b2413",
                  color: "#f5e6a8",
                  border: "1px solid rgba(212,175,55,0.2)",
                },
              }}
            >
              {navigationLinks.map((link) => (
                <MenuItem
                  key={link.href}
                  component={Link}
                  href={link.href}
                  onClick={closeDesktopMenus}
                  selected={pathname === link.href}
                >
                  {link.label}
                </MenuItem>
              ))}
            </Menu>

            <Button
              onClick={openGuideMenu}
              sx={{ color: "gold", textTransform: "none" }}
            >
              Guides
            </Button>

            <Menu
              anchorEl={guideMenuAnchor}
              open={Boolean(guideMenuAnchor)}
              onClose={closeDesktopMenus}
              PaperProps={{
                sx: {
                  bgcolor: "#0b2413",
                  color: "#f5e6a8",
                  border: "1px solid rgba(212,175,55,0.2)",
                },
              }}
            >
              {guideLinks.map((link) => (
                <MenuItem
                  key={link.href}
                  component={Link}
                  href={link.href}
                  onClick={closeDesktopMenus}
                  selected={pathname === link.href}
                >
                  {link.label}
                </MenuItem>
              ))}
            </Menu>

            {isLoggedIn && accountLinks.length > 0 && (
              <>
                <Button
                  onClick={openAccountMenu}
                  sx={{ color: "gold", textTransform: "none" }}
                >
                  Account
                </Button>

                <Menu
                  anchorEl={gameMenuAnchor}
                  open={Boolean(gameMenuAnchor)}
                  onClose={closeDesktopMenus}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor: "#0b2413",
                        color: "#f5e6a8",
                        border: "1px solid rgba(212,175,55,0.2)",
                      },
                    },
                  }}
                >
                  {navigationLinks.map((link) => (
                    <MenuItem
                      key={link.href}
                      component={Link}
                      href={link.href}
                      onClick={closeDesktopMenus}
                      selected={pathname === link.href}
                    >
                      {link.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            {isLoggedIn && (
              <Typography
                sx={{
                  color: "gold",
                  fontStyle: "italic",
                  textTransform: "capitalize",
                  ml: 1,
                }}
              >
                {username}
              </Typography>
            )}

            {!isLoggedIn ? (
              <Button
                component={Link}
                href="/account/login"
                sx={{ color: "gold", textTransform: "none" }}
              >
                Login
              </Button>
            ) : (
              <Button onClick={logout} sx={{ color: "gold", textTransform: "none" }}>
                Logout
              </Button>
            )}
          </Box>

          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, color: "gold" }}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={open}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              maxWidth: "85vw",
              height: "100dvh",
              overflow: "hidden",
              color: "#f5e6a8",
              borderRight: "1px solid rgba(212, 175, 55, 0.22)",
              borderTopRightRadius: 28,
              borderBottomRightRadius: 28,
              boxShadow: "8px 0 30px rgba(0,0,0,0.45)",
              backgroundSize: "14px 14px, 14px 14px",
            },
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            pt: "calc(env(safe-area-inset-top) + 8px)",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(212,175,55,0.14)",
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#f1c40f",
                  fontWeight: 700,
                  fontSize: "1rem",
                  fontFamily: "Playfair Display, Georgia, serif",
                }}
              >
                Menu
              </Typography>

              {isLoggedIn && (
                <Typography
                  sx={{
                    mt: 0.25,
                    color: "rgba(245,230,168,0.72)",
                    fontSize: "0.8rem",
                    textTransform: "capitalize",
                  }}
                >
                  {username}
                </Typography>
              )}
            </Box>

            <IconButton
              onClick={closeDrawer}
              sx={{
                color: "rgba(212,175,55,0.7)",
                p: 0.5,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                px: 2,
                py: 1.5,
              }}
            >
              <Box>
                <Typography sx={sectionLabelSx}>Guides</Typography>

                <Stack spacing={0.2}>
                  {guideLinks.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                      <Button
                        key={link.href}
                        component={Link}
                        href={link.href}
                        onClick={closeDrawer}
                        fullWidth
                        sx={{
                          ...menuLinkSx,
                          py: 1.2,
                          px: 1,
                          borderRadius: 0,
                          backgroundColor: isActive ? "rgba(212,175,55,0.08)" : "transparent",
                          color: isActive ? "#ffd84d" : "#f1c40f",
                        }}
                      >
                        <Box component="span" sx={{ mr: 1.2, fontSize: "0.75rem" }}>
                          {link.label === "Black Jack"
                            ? "♣"
                            : link.label === "Poker"
                              ? "♦"
                              : "♥"}
                        </Box>
                        {link.label}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>

              <Divider
                sx={{
                  my: 2.5,
                  borderColor: "rgba(212,175,55,0.12)",
                }}
              />

              <Box>
                <Typography sx={sectionLabelSx}>Game</Typography>

                <Stack spacing={0.6}>
                  {navigationLinks.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                      <Button
                        key={link.href}
                        component={Link}
                        href={link.href}
                        onClick={closeDrawer}
                        fullWidth
                        sx={{
                          ...menuLinkSx,
                          backgroundColor: isActive ? "rgba(212,175,55,0.08)" : "transparent",
                          color: isActive ? "#ffd84d" : "#f1c40f",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            mr: 1.2,
                            color: "rgba(245,230,168,0.75)",
                          }}
                        >
                          —
                        </Box>
                        {link.label}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>

              {accountLinks.length > 0 && (
                <>
                  <Divider
                    sx={{
                      mt: 3,
                      mb: 2.5,
                      borderColor: "rgba(212,175,55,0.12)",
                    }}
                  />

                  <Box>
                    <Typography sx={sectionLabelSx}>Account</Typography>

                    <Stack spacing={0.6}>
                      {accountLinks.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                          <Button
                            key={link.href}
                            component={Link}
                            href={link.href}
                            onClick={closeDrawer}
                            fullWidth
                            sx={{
                              ...menuLinkSx,
                              backgroundColor: isActive
                                ? "rgba(212,175,55,0.08)"
                                : "transparent",
                              color: isActive ? "#ffd84d" : "#f1c40f",
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                mr: 1.2,
                                color: "rgba(245,230,168,0.75)",
                              }}
                            >
                              —
                            </Box>
                            {link.label}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>
                </>
              )}

              <Box sx={{ mt: "auto", pt: 3 }}>
                {!isLoggedIn ? (
                  <Button
                    component={Link}
                    href="/account/login"
                    onClick={closeDrawer}
                    fullWidth
                    sx={{
                      ...menuLinkSx,
                      color: "#80e573",
                      borderTop: "1px solid rgba(212,175,55,0.12)",
                      pt: 2,
                    }}
                  >
                    Login
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      logout();
                      closeDrawer();
                    }}
                    fullWidth
                    sx={{
                      ...menuLinkSx,
                      color: "#cf6f6f",
                      borderTop: "1px solid rgba(212,175,55,0.12)",
                      pt: 2,
                    }}
                  >
                    Logout
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Container maxWidth="lg" disableGutters sx={{ mt: 0, pb: 1 }}>
        {children}
      </Container>
    </>
  );
}