"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { getGameDetails } from "@/lib/api/games";
import { getPlayerGameScoreDetails } from "@/lib/api/scores";
import { GameDetails } from "@/lib/models/game";
import { useError } from "@/context/ErrorContext";
import { PlayerScoreDetails } from "@/lib/models/score";

export default function GameResultspage() {
  const params = useParams();
  const gameId = Number(params.gameId);
  const router = useRouter();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerScores, setPlayerScores] = useState<PlayerScoreDetails | null>(null);
  const { showError } = useError();

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const data = await getGameDetails(gameId);
        setGame(data);
      } catch (err: any) {
        showError(err.message || "Failed to fetch game");
        router.push("/poker");
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(gameId)) fetchGame();
  }, [gameId, router]);

  const openPlayerModal = async (playerId: number) => {
    if (!game) return;
    try {
      const data = await getPlayerGameScoreDetails(gameId, playerId);
      setPlayerScores(data);
      setModalOpen(true);
    } catch (err: any) {
      showError(err.message || "Failed to open dialog");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setPlayerScores(null);
  };

  const capitalize = (name: string) => {
    if (!name) return "";
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  if (loading) return <Typography sx={{ textAlign: "center", mt: 4 }}>Loading game...</Typography>;
  if (!game) return <Typography sx={{ textAlign: "center", mt: 4 }}>Game not found</Typography>;

  return (
    <Box sx={{ maxWidth: { xs: "100%", md: 800 }, mx: "auto", mt: 4, px: 2 }}>
      <Typography
        variant="h4"
        sx={{ mb: 2, textAlign: "center", fontWeight: "bold", fontSize: { xs: "1.5rem", md: "2rem" } }}
      >
        🎲 Game #{game.gameNumber} Scoreboard
      </Typography>

      <Typography
        variant="subtitle2"
        sx={{ mb: 2, textAlign: "center", fontSize: { xs: "0.875rem", md: "1rem" } }}
      >
        Started: {new Date(game.startedAt).toLocaleString("da-DK")}
        {game.endedAt && <> — Ended: {new Date(game.endedAt).toLocaleString("da-DK")}</>}
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          {game.scores
            ?.slice()
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((s, idx) => {
              const isWinner = game.winner?.userId === s.playerId;
              return (
                <Box key={`${s.id ?? idx}-${s.playerId}`} sx={{ mb: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, px: 2, borderRadius: 1, flexWrap: "wrap" }}
                  >
                    <Button
                      onClick={() => openPlayerModal(s.playerId)}
                      sx={{
                        textTransform: "none",
                        fontWeight: isWinner ? "bold" : "normal",
                        textAlign: "left",
                        minWidth: 0,
                        mr: 1,
                      }}
                    >
                      {idx + 1}. {capitalize(s.userName)}
                    </Button>

                    <Typography sx={{ fontWeight: isWinner ? "bold" : "normal", flexShrink: 0 }}>
                      {s.totalPoints} pts
                    </Typography>
                  </Stack>
                  <Divider />
                </Box>
              );
            })}

          {game.winner && (
            <Typography sx={{ mt: 2, textAlign: "center", fontWeight: "bold", fontSize: { xs: "1rem", md: "1.25rem" } }}>
              🏆 Winner: {game.winner.userName} ({game.winner.winningScore} pts)
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
<Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
  <DialogTitle>{playerScores?.userName} – Score Details</DialogTitle>
  <DialogContent dividers>
    {playerScores?.rounds.map((round) => (
      <Box key={round.roundId} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
          Round {round.roundNumber} ({new Date(round.startedAt).toLocaleString("da-DK")}) – Total: {round.totalPoints} pts
        </Typography>

        {round.entries.map((entry, idx) => (
          <Stack
            key={`${entry.id ?? idx}-${entry.createdAt}`}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 0.5, flexWrap: "wrap" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight="bold">
                {entry.points > 0 ? "+" : ""}
                {entry.points} pts
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {entry.type === "Chips" && "🎯 Chips"}
                {entry.type === "Rebuy" && "♻️ Rebuy"}
                {entry.type === "Bounty" && entry.victimUserName && <>💀 Knocked out {entry.victimUserName}</>}
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ flexShrink: 0 }}>
              {new Date(entry.createdAt).toLocaleString("da-DK")}
            </Typography>
          </Stack>
        ))}

        <Divider sx={{ my: 1 }} />
      </Box>
    ))}

    <Typography sx={{ mt: 1, fontWeight: "bold", textAlign: "right" }}>
      Total: {playerScores?.totalPoints}
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={closeModal}>Close</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}