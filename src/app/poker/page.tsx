"use client";

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
        <Tab label="Cheat sheet" />
        <Tab label="Poker Hands" />
        <Tab label="Starting Hands" />
        <Tab label="Interesting Stats" />
      </Tabs>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Stack spacing={2} direction="column" alignItems="center" mt={3}>
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: 350, sm: 500 },
              mt: 2,
            }}
          >
            <Image
              src="/images/poker-cheatsheet.jpg"
              alt="Poker Cheatsheet"
              width={500}
              height={300}
              style={{ width: "100%", height: "auto", display: "block", margin: "0 auto" }}
              priority
            />
          </Box>
        </Stack>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
          >
            Texas Hold’em Hand Probabilities
          </Typography>
          <Stack spacing={1}>
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
      )}

      {activeTab === 2 && (
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
          >
            Texas Hold’em Starting Hands
          </Typography>
          <Stack spacing={1}>
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

      {activeTab === 3 && (
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
          >
            Interesting Poker Stats
          </Typography>
          <Stack spacing={1}>
            <Typography><strong>Chance of hitting a set with a pocket pair:</strong> 11.8% (≈ 1 in 8.5)</Typography>
            <Typography><strong>Chance of flopping a flush draw with suited cards:</strong> ~10.9%</Typography>
            <Typography><strong>Chance of flopping a straight draw:</strong> ~10.5%</Typography>
            <Typography><strong>Chance the board alone makes the best hand:</strong> ~4–5%</Typography>
            <Typography><strong>Chance of getting AA twice in a row:</strong> 1 in 48,841</Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
}