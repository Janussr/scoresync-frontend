"use client";

import { useState } from "react";
import { Box, Typography, Button, ButtonGroup } from "@mui/material";
import Image from "next/image";

export default function BlackJackPage() {
    const [activeTab, setActiveTab] = useState("playerOptions");

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
            <Typography
                variant="h4"
                sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
            >
                Black Jack
            </Typography>

            {/* Knapper til at skifte mellem tabs */}
            <ButtonGroup sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                <Button
                    variant={activeTab === "playerOptions" ? "contained" : "outlined"}
                    onClick={() => setActiveTab("playerOptions")}
                >
                    Player options
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
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                        Player hand vs busting
                    </Typography>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        <li><strong>Player Hand Total 21:</strong> Probability of Busting 100%</li>
                        <li><strong>Player Hand Total 20:</strong> Probability of Busting 92%</li>
                        <li><strong>Player Hand Total 19:</strong> Probability of Busting 85%</li>
                        <li><strong>Player Hand Total 18:</strong> Probability of Busting 77%</li>
                        <li><strong>Player Hand Total 17:</strong> Probability of Busting 69%</li>
                        <li><strong>Player Hand Total 16:</strong> Probability of Busting 62%</li>
                        <li><strong>Player Hand Total 15:</strong> Probability of Busting 58%</li>
                        <li><strong>Player Hand Total 14:</strong> Probability of Busting 56%</li>
                        <li><strong>Player Hand Total 13:</strong> Probability of Busting 39%</li>
                        <li><strong>Player Hand Total 12:</strong> Probability of Busting 31%</li>
                    </ul>

                    {/* SKIFT TIL BLACK JACK BILLEDE */}
                    <Image
                        src="/images/black-jack-cheatsheet.jpg"
                        alt="Black Jack Cheatsheet"
                        width={500}
                        height={300}
                        priority
                        style={{ width: "100%", height: "auto", margin: "0 auto" }}
                    />


                </Box>


            )}

            {/* Player Options */}
            {activeTab === "playerOptions" && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                        Player Actions
                    </Typography>
                    <ul>
                        <li><strong>Hit:</strong> Draw an additional card. Pays 1:1</li>
                        <li><strong>Stand:</strong> Keep your current hand. Pays 1:1</li>
                        <li><strong>Double Down:</strong> Double your bet, draw one card, and stand. Pays 1:1 per hand</li>
                        <li><strong>Split:</strong> Split two cards of the same value into two hands. Pays 1:1 per hand</li>
                        <li><strong>Surrender:</strong> Give up the hand and lose half of your bet. Half of the bet is returned</li>
                        <li><strong>Insurance:</strong> Only available when the dealer’s upcard is an Ace. Place a side bet equal to half your original bet. If the dealer has blackjack, the insurance bet pays 2:1</li>
                        <li><strong>Five Card Charlie:</strong> If five cards are drawn without going bust. Pays 2:1</li>
                        <li><strong>Blackjack:</strong> If the player's first two cards total 21. Pays 3:2 "bet 10, win 15, total payout = 25"</li>
                        <li><strong>Push:</strong> A tie – the original bet is returned.</li>
                    </ul>

                    <Typography variant="h6" sx={{ fontWeight: "bold", mt: 3, mb: 1 }}>
                        Rules
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        1. The dealer deals two cards to each player and two to themselves.<br />
                        2. Players can "Hit" to receive more cards or "Stand" to keep their current hand.<br />
                        3. The goal is to get as close to 21 as possible without going over.<br />
                        4. Face cards count as 10, and Aces can count as 1 or 11.<br />
                        5. The dealer draws until reaching at least 17–21 and stands on soft 17 (e.g., Ace + 6 = soft 17).
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
