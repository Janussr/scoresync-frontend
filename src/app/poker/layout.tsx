"use client";

import { ReactNode } from "react";
import { Stack, Button, Box } from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PokerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoggedIn, role, isAdmin, hydrated } = useAuth();
if (!hydrated) return null;

  return (
    <Box>
      <Stack spacing={2} direction="row" justifyContent="center" mt={5}>
        <Button component={Link} href="/poker/active-game" variant="contained">
          Join game
        </Button>

        <Button component={Link} href="/poker/game-history" variant="contained">
          Game history
        </Button>

        <Button component={Link} href="/poker" variant="contained">
         Poker hand ranking
        </Button>

        <Button component={Link} href="/poker/hall-of-fame" variant="contained">
          Hall of Fame
        </Button>

          <Button component={Link} href="/poker/knockout-leaderboard" variant="contained">
          Bounty board
        </Button>

         {isLoggedIn && isAdmin && (
          <Button component={Link} href="/poker/admin-panel" variant="contained">
            Admin panel
          </Button>
        )}

      </Stack>

      <Box mt={4}>{children}</Box>
    </Box>
  );
}
