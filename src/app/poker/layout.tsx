"use client";

import { ReactNode } from "react";
import { Box, Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PokerLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isAdmin, hydrated } = useAuth(); 
  const theme = useTheme();                           
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); 
  const pathname = usePathname();                     

  if (!hydrated) return null;

  const links = [
    { label: "Join game", href: "/poker/active-game" },
    { label: "Game history", href: "/poker/game-history" },
    { label: "Poker hands", href: "/poker" },
    { label: "Hall of Fame", href: "/poker/hall-of-fame" },
    { label: "Bounty board", href: "/poker/knockout-leaderboard" },
    ...(isLoggedIn && isAdmin ? [{ label: "Admin panel", href: "/poker/admin-panel" }] : []),
  ];
const cleanPath = pathname.replace(/\/$/, "");

const activeIndex = links.findIndex(
  (link) => cleanPath === link.href.replace(/\/$/, "")
);

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeIndex !== -1 ? activeIndex : false}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : undefined}
          allowScrollButtonsMobile
          textColor="inherit"
          indicatorColor="secondary"
        >
          {links.map((link, index) => (
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