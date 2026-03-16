"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Divider,
  MenuItem,
} from "@mui/material";

import { getActiveGame } from "@/lib/api/games";
import { addScore, rebuy } from "@/lib/api/scores";
import { addParticipants as apiJoinGame, removeParticipant } from "@/lib/api/participants";
import { registerKnockout } from "@/lib/api/bounties";
import { Game } from "@/lib/models/game";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ErrorProvider, useError } from "@/context/ErrorContext";

export default function ActiveGamePlayerPage() {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [points, setPoints] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const { userId, username } = useAuth();
  const router = useRouter();
  const [knockoutUserId, setKnockoutUserId] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const { showError } = useError();

  // Fetch active game
  useEffect(() => {
    fetchActiveGame();
  }, []);

  const fetchActiveGame = async () => {
    const game = await getActiveGame();

    if (!game) {
      setCurrentGame(null);
      return;
    }

    setCurrentGame(game);

    if (userId && game.participants.some(p => p.userId === Number(userId))) {
      setHasJoined(true);
    }
  };

  const joinGame = async () => {
    // If not logged in -> login page
    if (!userId) {
      router.push("/login");
      return;
    }

    if (!currentGame) return;

    try {
      await apiJoinGame(currentGame.id, [userId]);
      setHasJoined(true);
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to join game");
    }
  };
  const submitScore = async () => {
    if (!currentGame || !userId || !points) return;

    try {
      await addScore(currentGame.id, userId, Number(points));
      setPoints("");
      fetchActiveGame();
    } catch (err: any) {
      if (err.message.includes("Game has ended") || err.message.includes("Game has ended")) {
        alert("Game has ended.");
      } else {
        showError("Something went wrong, try later")
      }
    }
  };

  const handleRebuy = async () => {
    if (!currentGame) return;

    try {
      setLoadingAction(true);
      await rebuy(currentGame.id);
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "Rebuy failed");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleKnockout = async () => {
    if (!currentGame || !knockoutUserId) return;

    try {
      setLoadingAction(true);
      await registerKnockout(currentGame.id, Number(knockoutUserId));
      setKnockoutUserId("");
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "Knockout failed");
    } finally {
      setLoadingAction(false);
    }
  };



  if (!currentGame) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 6, textAlign: "center" }}>
        <Typography variant="h5">Currently no active game</Typography>
      </Box>
    );
  }
  const myTotal = currentGame.scores
    .filter((s) => s.userId === Number(userId))
    .reduce((sum, s) => sum + s.points, 0);

  const me = currentGame.participants.find(
    (p) => p.userId === Number(userId)
  );
  return (
    <Box sx={{
      width: "100%",
      maxWidth: { md: 800 },
      mx: "auto",
      px: { xs: 1, md: 0 },
      mt: 4,
    }}>
      <Typography variant="h4" mb={3} textAlign="center" fontWeight="bold">
        Active game #{currentGame.gameNumber}
      </Typography>

      <Card>
        <CardContent>
          {!hasJoined ? (
            <Box textAlign="center">
              <Typography mb={2}>You are logged in as. {username} Click to join the game</Typography>
              <Button variant="contained" onClick={joinGame}>
                Join game
              </Button>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                You can only see and type in your own points.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography mb={2} fontWeight="bold">
                Playing as: {username}
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: "1px solid rgba(255,255,255,0.1)",
                  mb: 2,
                }}
              >
                <Typography fontWeight="bold">Your game status</Typography>

                <Typography>
                  Rebuys used: <b>{me?.rebuyCount ?? 0}</b>
                </Typography>

                <Typography>
                  Bounties on you: <b>{me?.activeBounties ?? 0}</b>
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  label="Points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  disabled={currentGame?.isFinished}
                  sx={{
                    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={submitScore}
                  disabled={currentGame?.isFinished}
                >
                  Add points
                </Button>

                {(currentGame.bountyValue > 0 || currentGame.rebuyValue > 0) && (
                  <Divider sx={{ my: 2 }} />
                )}

                {currentGame.rebuyValue > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Rebuy costs {currentGame.rebuyValue} points
                  </Typography>
                )}

                {currentGame.bountyValue > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Knockout gives {currentGame.bountyValue} points per bounty on target
                  </Typography>
                )}


                {currentGame.rebuyValue > 0 && (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleRebuy}
                    disabled={loadingAction || currentGame.isFinished}
                  >
                    Rebuy (-{currentGame.rebuyValue} points)
                  </Button>
                )}

                {currentGame.bountyValue > 0 && (
                  <Stack spacing={1}>
                    <TextField
                      select
                      label="Who did you knock out?"
                      value={knockoutUserId}
                      onChange={(e) => setKnockoutUserId(e.target.value)}
                    >
                      {currentGame.participants
                        .filter((p) => p.userId !== Number(userId))
                        .map((p) => (
                          <MenuItem key={p.userId} value={p.userId}>
                            {p.userName}
                          </MenuItem>
                        ))}
                    </TextField>

                    <Button
                      variant="outlined"
                      color="success"
                      onClick={handleKnockout}
                      disabled={loadingAction || !knockoutUserId || currentGame.isFinished}
                    >
                      Register Knockout (+{currentGame.bountyValue} bounty)
                    </Button>
                  </Stack>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography fontWeight="bold" mb={1}>
                  Your scores:
                </Typography>

                {currentGame.scores
                  .filter((s) => s.userId === Number(userId))
                  .map((s) => (
                    <Typography key={s.id}>{username}: +{s.points} point</Typography>
                  ))}

                <Typography mt={1} fontWeight="bold">
                  Total: {myTotal} points
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
      <Box marginBottom={2}></Box>
    </Box>
  );
}