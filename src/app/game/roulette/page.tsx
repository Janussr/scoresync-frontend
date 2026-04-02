"use client";

import { useState } from "react";
import { Box, Typography, Tabs, Tab, Stack } from "@mui/material";
import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";
import RouletteFunWheel from "@/app/demo/roulette/page";

export default function RoulettePage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      <Typography
        variant="h4"
        sx={{ mb: 0, textAlign: "center", fontWeight: "bold" }}
      >
        Roulette
      </Typography>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Rules" />
        <Tab label="Demo" />
        <Tab label="Cheatsheet" />
      </Tabs>

      {/* Rules Tab */}
      {activeTab === 0 && (
        <Box sx={{ mt: 2 }}>

          <SectionTitle>Bet Types</SectionTitle>
          <Stack spacing={1} mb={3}>
            <Typography><strong>Straight Up:</strong> Bet on a single number. Pays 35:1.</Typography>
            <Typography><strong>Split:</strong> Bet on two adjacent numbers. Pays 17:1.</Typography>
            <Typography><strong>Street:</strong> Bet on three numbers in a row. Pays 11:1.</Typography>
            <Typography><strong>Corner:</strong> Bet on four numbers in a square. Pays 8:1.</Typography>
            <Typography><strong>Six Line:</strong> Bet on six numbers (two rows). Pays 5:1.</Typography>
            <Typography><strong>Red / Black:</strong> Bet on the color. Pays 1:1.</Typography>
            <Typography><strong>Even / Odd:</strong> Bet on even or odd numbers. Pays 1:1.</Typography>
            <Typography><strong>High / Low:</strong> Bet on 1–18 or 19–36. Pays 1:1.</Typography>
            <Typography><strong>Dozens:</strong> Bet on 1–12, 13–24, or 25–36. Pays 2:1.</Typography>
            <Typography><strong>Columns:</strong> Bet on one of the three columns. Pays 2:1.</Typography>
          </Stack>

          <SectionTitle>Rules</SectionTitle>
          <Stack spacing={0.5} mb={3} >
            <Typography>1. Players place their bets on the table before the ball is put into play.</Typography>
            <Typography>2. The croupier spins the wheel and throws the ball in the opposite direction.</Typography>
            <Typography>3. Before the ball lands on a number, betting is closed.</Typography>
            <Typography>4. Winning bets are paid out according to the set odds.</Typography>
            <Typography>5. Losing bets are removed from the table.</Typography>
          </Stack>
        </Box>
      )}
      {activeTab === 1 && (
        <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
          <Stack spacing={1} mt={2} sx={{ mb: 2 }}>
            <RouletteFunWheel />
          </Stack>
        </Box>
      )}
      {/* Cheatsheet Tab */}
      {activeTab === 2 && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Image
            src="/images/French-Roulette-Rules.png"
            alt="Roulette Cheatsheet"
            width={500}
            height={300}
            style={{ width: "100%", height: "auto", margin: "0 auto" }}
            priority
          />
        </Box>
      )}
    </Box>
  );
}