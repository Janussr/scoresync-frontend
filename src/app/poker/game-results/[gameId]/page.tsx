"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Card, CardContent, Stack, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useRouter } from "next/navigation";

import { getGameDetails, getPlayerScoreDetails } from "@/lib/api/games";
import { GameDetails, PlayerScoreDetails } from "@/lib/models/game";


export default function GameResultspage() {
  const params = useParams();
  const gameId = Number(params.gameId);
  const router = useRouter();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerScores, setPlayerScores] = useState<PlayerScoreDetails | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const data = await getGameDetails(gameId);
        setGame(data);
      } catch (err) {
        console.error("Failed to fetch game:", err);
        router.push("/poker");
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(gameId)) fetchGame();
  }, [gameId, router]);

  const openPlayerModal = async (userId: number) => {
    if (!game) return;
    try {
      const data = await getPlayerScoreDetails(gameId, userId);
      setPlayerScores(data);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
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
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}>
        🎲 Game #{game.gameNumber} Scoreboard
      </Typography>

      <Typography variant="subtitle2" sx={{ mb: 2, textAlign: "center" }}>
        Started: {new Date(game.startedAt).toLocaleString("da-DK")}
        {game.endedAt && <> — Ended: {new Date(game.endedAt).toLocaleString("da-DK")}</>}
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          {game.scores?.slice()
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((s, idx) => {
              const isWinner = game.winner?.userId === s.userId;

              return (
                <Box key={`${s.id ?? idx}-${s.userId}`}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, px: 2, borderRadius: 1 }}
                  >
                    {/* Left side: placement number + name */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography
                        sx={{
                          minWidth: 24,
                          textAlign: "right",
                          fontWeight: "bold",
                          color: "text.secondary",
                        }}
                      >
                        {idx + 1}.
                      </Typography>

                      <Button
                        onClick={() => openPlayerModal(s.userId)}
                        sx={{
                          // fontWeight: isWinner ? "bold" : "normal",
                          textTransform: "none",
                          p: 0,
                          minWidth: 0,
                        }}
                      >
                        {capitalize(s.userName)}
                      </Button>
                    </Stack>

                    <Typography sx={{ fontWeight: isWinner ? "bold" : "normal" }}>
                      {s.totalPoints} points
                    </Typography>
                  </Stack>
                  <Divider />
                </Box>
              );
            })}

          {game.winner && (
            <Typography sx={{ mt: 2, textAlign: "center", fontWeight: "bold" }}>
              🏆 Winner: {game.winner.userName} ({game.winner.winningScore} pts)
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{playerScores?.userName} – Score Details</DialogTitle>
        <DialogContent dividers>
          {playerScores?.entries.map((entry, idx) => (
            <Stack
              key={`${entry.id ?? idx}-${entry.createdAt}`}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 1 }}
            >
              <Stack>
                <Typography fontWeight="bold">
                  {entry.points > 0 ? "+" : ""}
                  {entry.points} points
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {entry.type === "Chips" && "🎯 Chips"}
                  {entry.type === "Rebuy" && "♻️ Rebuy"}
                  {entry.type === "Bounty" && entry.knockedOutUserName && (
                    <>💀 Knocked out {entry.knockedOutUserName}</>
                  )}
                </Typography>
              </Stack>

              <Typography variant="caption">
                {new Date(entry.createdAt).toLocaleString("da-DK")}
              </Typography>
            </Stack>
          ))}
          {playerScores?.entries.length === 0 && <Typography>No scores yet.</Typography>}
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ mt: 1, fontWeight: "bold" }}>Total: {playerScores?.totalPoints}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}