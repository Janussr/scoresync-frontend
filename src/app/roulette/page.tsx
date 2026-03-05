"use client";

import { useState } from "react";
import { Box, Typography, Button, ButtonGroup } from "@mui/material";
import Image from "next/image";

export default function RoulettePage() {
  const [activeTab, setActiveTab] = useState("cheatsheet");

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
      >
        Roulette
      </Typography>

      {/* Knapper til at skifte mellem tabs */}
      <ButtonGroup sx={{ mb: 3, display: "flex", justifyContent: "center" }}>

        <Button
          variant={activeTab === "rules" ? "contained" : "outlined"}
          onClick={() => setActiveTab("rules")}
        >
          Rules
        </Button>
        <Button
          variant={activeTab === "cheatsheet" ? "contained" : "outlined"}
          onClick={() => setActiveTab("cheatsheet")}
        >
          Cheatsheet
        </Button>
      </ButtonGroup>

      {/* Indhold */}
      {activeTab === "cheatsheet" && (
        <Box sx={{ textAlign: "center" }}>
          <Image
            src="/images/French-Roulette-Rules.png"
            alt="Black Jack Cheatsheet"
            width={500}
            height={300}
            priority
            style={{ width: "100%", height: "auto", margin: "0 auto" }}
          />
        </Box>
      )}

      {activeTab === "rules" && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            Bet Types
          </Typography>
          <ul>
            <li><strong>Straight Up:</strong> Bet on a single number. Pays 35:1.</li>
            <li><strong>Split:</strong> Bet on two adjacent numbers. Pays 17:1.</li>
            <li><strong>Street:</strong> Bet on three numbers in a row. Pays 11:1.</li>
            <li><strong>Corner:</strong> Bet on four numbers in a square. Pays 8:1.</li>
            <li><strong>Six Line:</strong> Bet on six numbers (two rows). Pays 5:1.</li>
            <li><strong>Red / Black:</strong> Bet on the color. Pays 1:1.</li>
            <li><strong>Even / Odd:</strong> Bet on even or odd numbers. Pays 1:1.</li>
            <li><strong>High / Low:</strong> Bet on 1–18 or 19–36. Pays 1:1.</li>
            <li><strong>Dozens:</strong> Bet on 1–12, 13–24, or 25–36. Pays 2:1.</li>
            <li><strong>Columns:</strong> Bet on one of the three columns. Pays 2:1.</li>
          </ul>

          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3, mb: 1 }}>
            Rules
          </Typography>
          <ul>
            <li>Players place their bets on the table before the ball is put into play.</li>
            <li>The croupier spins the wheel and throws the ball in the opposite direction.</li>
            <li>Before the ball lands on a number, betting is closed.</li>
            <li>Winning bets are paid out according to the set odds.</li>
            <li>Losing bets are removed from the table.</li>
          </ul>
        </Box>
      )}
    </Box>
  );
}
