"use client";

import { ReactNode, useEffect } from "react";
import { Box, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function GameLayout({ children }: { children: ReactNode }) {
  const { activeGameId, hydrated, isLoggedIn, role } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const pathname = usePathname();

  if (!hydrated) return null;

  // Redirect hvis user er på active-game men ikke har et aktivt game
  useEffect(() => {
    if (pathname === "/game/active-game" && !activeGameId) {
      router.replace("/game/lobby");
    }
  }, [pathname, activeGameId, router]);

  const links = [
    {
      label: activeGameId ? "Active game" : "Lobby",
      href: activeGameId ? "/game/active-game" : "/game/lobby",
    },
    { label: "Game history", href: "/game/game-history" },
    { label: "Hall of Fame", href: "/game/hall-of-fame" },
    { label: "Bounty board", href: "/game/knockout-leaderboard" },
    ...(isLoggedIn && (role === "Admin" || role === "Gamemaster")
      ? [{ label: "Game panel", href: "/game/game-control-panel" }]
      : []),
  ];

  const cleanPath = pathname.replace(/\/$/, "");
  const activeIndex = links.findIndex(
    (link) => cleanPath === link.href.replace(/\/$/, "")
  );

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Tabs
  value={activeIndex === -1 ? false : activeIndex}
  variant="scrollable"
  scrollButtons="auto"
  allowScrollButtonsMobile
  textColor="inherit"
  indicatorColor="secondary"
  sx={{
    "& .MuiTabs-flexContainer": {
      justifyContent: isMobile ? "flex-start" : "center", 
    },
    "& .MuiTabs-scroller": {
      scrollBehavior: "smooth",
    },
  }}
>
  {links.map((link) => (
    <Tab
      key={link.href}
      label={link.label}
      component={Link}
      href={link.href}
      sx={{ minWidth: isMobile ? 120 : 160 }}
    />
  ))}
</Tabs>
      </Box>

      <Box mt={3}>{children}</Box>
    </Box>
  );
}