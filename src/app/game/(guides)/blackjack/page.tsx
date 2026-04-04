"use client";

import { useState } from "react";
import { Box, Typography, Stack, Tabs, Tab } from "@mui/material";
import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";
import BlackJackFunPage from "@/app/demo/blackjack/page";

export default function BlackJackPage() {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box sx={{ maxWidth: { xs: "100%", sm: 700 }, mx: "auto", mt: 4, px: { xs: 1, sm: 2 } }}>
            <Typography
                variant="h4"
                sx={{ mb: 0, textAlign: "center", fontWeight: "bold", fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
                Black Jack
            </Typography>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                centered
                sx={{ mb: 3 }}
            >
                <Tab label="Rules" />
                <Tab label="Demo" />
                <Tab label="Cheatsheet" />
            </Tabs>

            {/* Tab Panels */}
            {activeTab === 0 && (
                <Box>
                    <SectionTitle>Player Actions</SectionTitle>
                    <Stack spacing={1} mb={2}>
                        <Typography><strong>Hit:</strong> Draw an additional card. Pays 1:1</Typography>
                        <Typography><strong>Stand:</strong> Keep your current hand. Pays 1:1</Typography>
                        <Typography><strong>Double Down:</strong> Double your bet, draw one card, and stand. Pays 1:1 per hand</Typography>
                        <Typography><strong>Split:</strong> Split two cards of the same value into two hands. Pays 1:1 per hand</Typography>
                        <Typography><strong>Surrender:</strong> Give up the hand and lose half of your bet. Half of the bet is returned</Typography>
                        <Typography><strong>Insurance:</strong> Only available when the dealer’s upcard is an Ace. Place a side bet equal to half your original bet. If the dealer has blackjack, the insurance bet pays 2:1</Typography>
                        <Typography><strong>Five Card Charlie:</strong> If five cards are drawn without going bust. Pays 2:1</Typography>
                        <Typography><strong>Blackjack:</strong> If the player's first two cards total 21. Pays 3:2 "bet 10, win 15, total payout = 25"</Typography>
                        <Typography><strong>Push:</strong> A tie – the original bet is returned.</Typography>
                    </Stack>

                    <SectionTitle>
                        Rules
                    </SectionTitle>

                    <Stack spacing={0.5} mb={2}>
                        <Typography>1. The dealer deals two cards to each player and two to themselves.</Typography>
                        <Typography>2. Players can "Hit" to receive more cards or "Stand" to keep their current hand.</Typography>
                        <Typography>3. The goal is to get as close to 21 as possible without going over.</Typography>
                        <Typography>4. Face cards count as 10, and Aces can count as 1 or 11.</Typography>
                        <Typography>5. The dealer draws until reaching at least 17–21 and stands on soft 17 (e.g., Ace + 6 = soft 17).</Typography>
                    </Stack>
                </Box>
            )}

            {activeTab === 1 && (
                <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                    <Stack spacing={1} mt={2} sx={{ mb: 2 }}>
                        <BlackJackFunPage />
                    </Stack>
                </Box>
            )}

            {/* Cheatsheet Image Tab */}
            {activeTab === 2 && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Image
                        src="/images/black-jack-cheatsheet.jpg"
                        alt="Black Jack Cheatsheet"
                        width={500}
                        height={300}
style={{
  width: "100%",
  height: "auto",
  margin: "0 auto",
  borderRadius: "12px",
}}

                        priority
                    />
                </Box>
            )}

        </Box>
    );
}