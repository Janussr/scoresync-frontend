"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
} from "@mui/material";
import { getGamesHistoryPage } from "@/lib/api/games";
import { GameHistoryEntry, Game } from "@/lib/models/game";
import { useError } from "@/context/ErrorContext";


export default function GameHistoryPage() {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    fetchGames();
  }, []);

const fetchGames = async () => {
  setLoading(true);
  try {
    const games: GameHistoryEntry[] = await getGamesHistoryPage();

    const finishedGames: GameHistoryEntry[] = games.map((g) => ({
      id: g.id,
      gameNumber: g.gameNumber,
      winnerName: g.winnerName,
      totalScore: 0,
      date: g.date,
      playerCount: g.playerCount,
      type: g.type,
      roundCount: g.roundCount,
    }));

    setHistory(finishedGames);
  } catch (err: any) {
    showError(err.message || "failed to fetch game history");
  } finally {
    setLoading(false);
  }
};

  if (loading)
    return (
      <Typography sx={{ textAlign: "center", mt: 4 }}>Loading history...</Typography>
    );


  return (
    <Box sx={{
      width: "100%",
      maxWidth: { md: 800 },
      mx: "auto",
      px: { xs: 1, md: 0 },
      mt: 4,
    }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
      >
        Game History
      </Typography>
     <Card
  sx={{
    borderRadius: 2,
    boxShadow: 3,
    overflow: "hidden",
  }}
>
  <CardContent sx={{ p: 0 }}>
    <List disablePadding>
      {history.map((entry, i) => (
        <Box key={entry.id}>
          <ListItem
            sx={{
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 1.5, sm: 2 },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.5, sm: 2 }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              width="100%"
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ rowGap: 0.75 }}
                >
                  <Typography
                    sx={{
                      minWidth: "fit-content",
                      fontWeight: 700,
                      color: "primary.main",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontFamily: "Playfair Display, Georgia, serif",
                    }}
                  >
                    #{entry.gameNumber}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      color: "primary.main",
                    }}
                  >
                    🏆
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      textTransform: "capitalize",
                      color: "primary.main",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontFamily: "Playfair Display, Georgia, serif",
                    }}
                  >
                    {entry.winnerName}
                  </Typography>

                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: 1,
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      backgroundColor: "rgba(212, 175, 55, 0.05)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        lineHeight: 1.2,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "primary.main",
                        fontWeight: 700,
                      }}
                    >
                      {entry.type}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  spacing={0.75}
                  sx={{
                    mt: 0.5,
                    rowGap: 0.5,
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {new Date(entry.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {entry.roundCount} rounds
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {entry.playerCount} players
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  display: "flex",
                  justifyContent: { xs: "center", sm: "flex-end" },
                  flexShrink: 0,
                }}
              >
                <Button
                  component={Link}
                  href={`/game/game-results/${entry.id}`}
                  variant="outlined"
                  sx={{
                    minWidth: { xs: 180, sm: 165 },
                    px: 2.5,
                    py: 1,
                    borderRadius: 2.5,
                    borderColor: "rgba(212, 175, 55, 0.28)",
                    color: "common.white",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    fontFamily: "Playfair Display, Georgia, serif",
                    backgroundColor: "rgba(255,255,255,0.01)",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "rgba(212, 175, 55, 0.05)",
                    },
                  }}
                >
                  RESULTS
                </Button>
              </Box>
            </Stack>
          </ListItem>

          {i < history.length - 1 && (
            <Divider sx={{ borderColor: "rgba(212, 175, 55, 0.12)" }} />
          )}
        </Box>
      ))}
    </List>
  </CardContent>
</Card>
    </Box>
  );
}