"use client";

import { ReactNode } from "react";
import { Box, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function GameLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, role, hydrated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();

  if (!hydrated) return null;

  const links = [
    { label: "Active game", href: "/game/active-game" },
    { label: "Game history", href: "/game/game-history" },
    { label: "Hall of Fame", href: "/game/hall-of-fame" },
    { label: "Bounty board", href: "/game/knockout-leaderboard" },
  ];

  if (isLoggedIn) {
    if (role === "Admin" || role === "Gamemaster") {
      links.push({ label: "Game panel", href: "/game/game-control-panel" });
    }
    // if (role === "Admin") {
    //   links.push({ label: "Admin panel", href: "/account/admin-panel" });
    // }
  }

  const cleanPath = pathname.replace(/\/$/, "");
  const activeIndex = links.findIndex(
    (link) => cleanPath === link.href.replace(/\/$/, "")
  );

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeIndex === -1 ? false : activeIndex}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : undefined}
          centered={!isMobile}
          textColor="inherit"
          indicatorColor="secondary"
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