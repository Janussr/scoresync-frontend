"use client";

import SectionTitle from "@/components/ui/SectionTitle";
import { Stack, Box, Typography, Tabs, Tab, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

export default function PokerPage() {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ maxWidth: { xs: "100%", sm: 700 }, mx: "auto", mt: 4, px: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        Card Statistics
      </Typography>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : undefined}
        centered={!isMobile}
        sx={{ mb: 3 }}
      >
        <Tab label="Rules" />
        <Tab label="Card rankings" />
        <Tab label="Poker Stats" />

      </Tabs>
      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <SectionTitle size="large">
            Poker Rules
          </SectionTitle>

          <Stack spacing={1.5} mb={4}>
            <Typography>
              <strong>Objective:</strong> Win chips by either having the best hand at showdown or by making other players fold.
            </Typography>

            <Typography>
              <strong>Players:</strong> 2–10 players per table.
            </Typography>

            <Typography>
              <strong>Hole Cards:</strong> Each player is dealt 2 private cards face down.
            </Typography>

            <Typography>
              <strong>Community Cards:</strong> 5 cards are placed face up on the table (shared by all players).
            </Typography>
          </Stack>

          <SectionTitle size="large">
            Game flow
          </SectionTitle>

          <Stack spacing={1.5} mb={4}>
            <Typography>
              <strong>1. Pre-Flop:</strong> Players receive 2 cards and the first betting round begins.
            </Typography>

            <Typography>
              <strong>2. Flop:</strong> 3 community cards are revealed, followed by a betting round.
            </Typography>

            <Typography>
              <strong>3. Turn:</strong> The 4th community card is revealed, followed by another betting round.
            </Typography>

            <Typography>
              <strong>4. River:</strong> The 5th and final community card is revealed, followed by the last betting round.
            </Typography>

            <Typography>
              <strong>5. Showdown:</strong> Remaining players reveal their hands. Best 5-card combination wins.
            </Typography>
          </Stack>

          <SectionTitle size="large">
            Basic actions
          </SectionTitle>

          <Stack spacing={1.5} mb={3}>
            <Typography>
              <strong>Check:</strong> Pass the action without betting.
            </Typography>

            <Typography>
              <strong>Bet:</strong> Place chips into the pot.
            </Typography>

            <Typography>
              <strong>Call:</strong> Match another player’s bet.
            </Typography>

            <Typography>
              <strong>Raise:</strong> Increase the current bet.
            </Typography>

            <Typography>
              <strong>Fold:</strong> Give up your hand and any chips already in the pot.
            </Typography>
          </Stack>
        </Box>
      )}


      {activeTab === 1 && (
        <Stack spacing={2} direction="column" mt={3}>
          <Box>
            <SectionTitle size="large">
              Poker Stats
            </SectionTitle>
            <Stack spacing={1} mb={5}>
              <Typography><strong>Royal Flush:</strong> 0.0032% (1 in 30,940)</Typography>
              <Typography><strong>Straight Flush:</strong> 0.0279% (1 in 3,589)</Typography>
              <Typography><strong>Four of a Kind:</strong> 0.168% (1 in 595)</Typography>
              <Typography><strong>Full House:</strong> 2.60% (1 in 38)</Typography>
              <Typography><strong>Flush:</strong> 3.03% (1 in 33)</Typography>
              <Typography><strong>Straight:</strong> 4.62% (1 in 22)</Typography>
              <Typography><strong>Three of a Kind:</strong> 4.83% (1 in 21)</Typography>
              <Typography><strong>Two Pair:</strong> 23.5% (1 in 4.26)</Typography>
              <Typography><strong>One Pair:</strong> 43.8% (1 in 2.28)</Typography>
              <Typography><strong>High Card:</strong> 17.4% (1 in 5.74)</Typography>
            </Stack>



          </Box>
        </Stack>
      )}

      {activeTab === 2 && (
        <Box>

          <SectionTitle size="large">
            Texas Hold’em  Hands
          </SectionTitle>

          <Stack spacing={1} mb={5}>
            <Typography><strong>Royal Flush:</strong> 0.0032% (1 in 30,940)</Typography>
            <Typography><strong>Straight Flush:</strong> 0.0279% (1 in 3,589)</Typography>
            <Typography><strong>Four of a Kind:</strong> 0.168% (1 in 595)</Typography>
            <Typography><strong>Full House:</strong> 2.60% (1 in 38)</Typography>
            <Typography><strong>Flush:</strong> 3.03% (1 in 33)</Typography>
            <Typography><strong>Straight:</strong> 4.62% (1 in 22)</Typography>
            <Typography><strong>Three of a Kind:</strong> 4.83% (1 in 21)</Typography>
            <Typography><strong>Two Pair:</strong> 23.5% (1 in 4.26)</Typography>
            <Typography><strong>One Pair:</strong> 43.8% (1 in 2.28)</Typography>
            <Typography><strong>High Card:</strong> 17.4% (1 in 5.74)</Typography>
          </Stack>

          <SectionTitle size="large">
            Texas Hold’em Starting Hands
          </SectionTitle>

          <Stack spacing={1} mb={3}>
            <Typography><strong>Any Pocket Pair:</strong> 5.88% (1 in 17)</Typography>
            <Typography><strong>Specific Pair (AA, KK, etc):</strong> 0.45% (1 in 221)</Typography>
            <Typography><strong>Suited Cards:</strong> 23.5%</Typography>
            <Typography><strong>Offsuit Cards:</strong> 70.6%</Typography>
            <Typography><strong>AA:</strong> 0.45% (1 in 221)</Typography>
            <Typography><strong>AK Suited:</strong> 0.30% (1 in 332)</Typography>
            <Typography><strong>AK Offsuit:</strong> 0.90% (1 in 110)</Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}