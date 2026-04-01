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
import { getAllGames } from "@/lib/api/games";
import { GameDetails, HistoryEntry, Game } from "@/lib/models/game";
import { useError } from "@/context/ErrorContext";


export default function GameHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const games: Game[] = await getAllGames();

      const finishedGames = games
        .filter(g => g.isFinished && g.winner)
        .map(g => ({
          id: g.id,
          gameNumber: g.gameNumber,
          winnerName: g.winner!.userName,
          totalScore: g.winner!.winningScore,
          date: g.endedAt || g.winner!.winDate,
          playerCount: g.players?.length ?? 0,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setHistory(finishedGames);
    } catch (err: any) {
      showError(err.message || "failed to fetch game history")
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
        📜 Game History
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <List>
            {history.map((entry, i) => (
             <Box key={entry.id}>
  <ListItem sx={{ px: 0 }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      width="100%"
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            textTransform: "capitalize",
            color: "primary.main",
            pr: { sm: 2 },
          }}
        >
          {`Game #${entry.gameNumber} — ${entry.winnerName} — ${entry.totalScore} points`}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {new Date(entry.date).toLocaleString("da-DK")} • {entry.playerCount} players
        </Typography>
      </Box>

      <Box
  sx={{
    width: { xs: "100%", sm: "auto" },
    display: "flex",
    justifyContent: { xs: "center", sm: "flex-end" },
  }}
>
  <Button
    component={Link}
    href={`/game/game-results/${entry.id}`}
    variant="outlined"
    size="small"
    sx={{
      width: { xs: "50%", sm: "auto" },
    }}
  >
    Game results
  </Button>
</Box>
    </Stack>
  </ListItem>

  {i < history.length - 1 && <Divider />}
</Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}