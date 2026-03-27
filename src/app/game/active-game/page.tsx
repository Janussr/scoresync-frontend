"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, Stack, Button, Typography, Card, CardContent, TextField, MenuItem, Divider, AccordionDetails, Accordion, AccordionSummary } from "@mui/material";
import * as signalR from "@microsoft/signalr";

import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import { getActiveGameForPlayerPage } from "@/lib/api/games";
import { addScorePlayer, rebuyAsPlayer } from "@/lib/api/scores";
import { registerPlayerKnockout } from "@/lib/api/bounties";
import { GameDetails, RoundDto } from "@/lib/models/game";
import { leaveGame } from "@/lib/api/players";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useGameHub } from "@/lib/hooks/useGameHub";

export default function PlayerGamePage() {
  const router = useRouter();
  const { userId, setActiveGameId } = useAuth();
  const { showError } = useError();

  const [currentGame, setCurrentGame] = useState<GameDetails | null>(null);
  const activeRound = currentGame?.rounds?.find(r => !r.endedAt);
  // const [currentRound, setCurrentRound] = useState<RoundDto | null>(null);
  const [points, setPoints] = useState("");
  const [knockoutPlayerId, setKnockoutPlayerId] = useState<number | "">("");
  const [loadingAction, setLoadingAction] = useState(false);


  // ----- Fetch active game for this player -----
  useEffect(() => {
    if (!userId) return;

    const fetchGame = async () => {
      try {
        const game = await getActiveGameForPlayerPage();

        // Hvis spillet ikke findes, eller der ikke er nogen spillere endnu, redirect
        if (!game || !game.players?.some(p => p.userId === userId)) {
          setActiveGameId(null); // ryd global state
          router.replace("/game/lobby");
          return;
        }

        // Ellers sæt spillet
        setCurrentGame(game);

        setActiveGameId(game.id);
      } catch (err: any) {
        showError(err.message || "Failed to load active game");
        // Hvis fetch fejler, redirect også
        setActiveGameId(null);
        router.replace("/game/lobby");
      }
    };

    fetchGame();
  }, [userId, router, showError, setActiveGameId]);

   // ----- Setup GameHub -----
  useGameHub({
    gameId: currentGame?.id,

     onRoundStarted: async () => {
    const updated = await getActiveGameForPlayerPage();
    setCurrentGame(updated);
  },

    onGameFinished: () => {
    if (currentGame) {
      router.push(`/game/game-results/${currentGame.id}`);
    }
  }
  });


  // ----- Actions -----
  const me = currentGame?.players?.find(p => p.userId === userId);



  const submitScore = async () => {
    if (!currentGame || !points) return;
    try {
      setLoadingAction(true);
      await addScorePlayer(currentGame.id, Number(points));
      setPoints("");

      const updated = await getActiveGameForPlayerPage();
      setCurrentGame(updated);
    } catch (err: any) {
      if (err?.status === 404) {
        setActiveGameId(null);
        router.replace("/game/lobby");
        return;
      }
      showError(err.message || "Failed to add score");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRebuy = async () => {
    if (!currentGame || !me) return;
    try {
      setLoadingAction(true);
      await rebuyAsPlayer(currentGame.id);
      const updated = await getActiveGameForPlayerPage();
      setCurrentGame(updated);
    } catch (err: any) {
      if (err?.status === 404) {
        setActiveGameId(null);
        router.replace("/game/lobby");
        return;
      }
      showError(err.message || "Rebuy failed");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleKnockout = async () => {
    if (!currentGame || !knockoutPlayerId) return;

    try {
      setLoadingAction(true);
      await registerPlayerKnockout(currentGame.id, knockoutPlayerId);
      setKnockoutPlayerId("");
      const updated = await getActiveGameForPlayerPage();
      setCurrentGame(updated);
    } catch (err: any) {
      if (err?.status === 404) {
        setActiveGameId(null);
        router.replace("/game/lobby");
        return;
      }
      showError(err.message || "Knockout failed");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeaveGame = async () => {
    if (!currentGame) return;

    try {
      setLoadingAction(true);

      await leaveGame(currentGame.id);

      setCurrentGame(null);
      setActiveGameId(null);

      router.push("/game/lobby");
    } catch (err: any) {
      if (err?.status === 404) {
        setActiveGameId(null);
        router.replace("/game/lobby");
        return;
      }
      showError(err.message || "Failed to leave game");
    } finally {
      setLoadingAction(false);
    }
  };

  if (!currentGame || !me) return <Typography>Loading...</Typography>;

  const myScores = currentGame?.rounds
    ?.flatMap(r => r.scores)
    .filter(s => s.playerId === me?.playerId) ?? [];

  const myRebuys = myScores.filter(s => s.type === "Rebuy").length;
  const myBounties = myScores.filter(s => s.type === "Bounty").length;

  const myTotal = currentGame?.rounds
    ?.flatMap(r => r.scores)
    .filter(s => s.playerId === me?.playerId)
    .reduce((sum, s) => sum + s.points, 0) ?? 0;

  return (
    <Box sx={{ width: "100%", maxWidth: { md: 800 }, mx: "auto", px: { xs: 1, md: 0 }, mt: 4 }}>
      <Typography variant="h4" mb={3} textAlign="center" fontWeight="bold">
        Game #{currentGame.gameNumber}
      </Typography>

      <Card>
        <CardContent>
          <Typography mb={2} fontWeight="bold">
            Playing as: {me.username}
          </Typography>

          <Box sx={{ p: 1, borderRadius: 2, bgcolor: "background.paper", border: "1px solid rgba(255,255,255,0.1)", mb: 2 }}>
            <Typography fontWeight="bold">Your game status</Typography>
            <Typography color="primary">
              Current Round: #{activeRound?.roundNumber}
            </Typography>
            <Typography>Total points: <b>{myTotal}</b></Typography>
            {(currentGame.bountyValue ?? 0) > 0 && (
              <Typography>Bounties: <b>{myBounties}</b></Typography>
            )}

            {(currentGame.rebuyValue ?? 0) > 0 && (
              <Typography>Rebuys: <b>{myRebuys}</b></Typography>
            )}
          </Box>

          <Stack spacing={2}>
            <TextField label="Points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
            <Button variant="contained" onClick={submitScore}>Add points</Button>

            {((currentGame.rebuyValue ?? 0) > 0 || (currentGame.bountyValue ?? 0) > 0) && <Divider sx={{ my: 2 }} />}

            {(currentGame.rebuyValue ?? 0) > 0 && (
              <Button variant="outlined" color="warning" onClick={handleRebuy} disabled={loadingAction}>
                Rebuy (-{currentGame.rebuyValue})
              </Button>
            )}

            {(currentGame.bountyValue ?? 0) > 0 && (
              <Stack spacing={1}>
                <TextField
                  select
                  label="Who did you knock out?"
                  value={knockoutPlayerId}
                  onChange={(e) => setKnockoutPlayerId(Number(e.target.value))}
                >
                  {currentGame.players?.filter(p => p.playerId !== me.playerId).map(p => (
                    <MenuItem key={p.playerId} value={p.playerId}>{p.username}</MenuItem>
                  ))}
                </TextField>

                <Button variant="outlined" color="success" onClick={handleKnockout} disabled={!knockoutPlayerId || loadingAction}>
                  Register Knockout (+{currentGame.bountyValue})
                </Button>
              </Stack>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography fontWeight="bold">Rounds</Typography>

            {(currentGame.rounds ?? [])
              .slice()
              .sort((a, b) => a.roundNumber - b.roundNumber)
              .map(round => {
                const myScores = round.scores.filter(s => s.playerId === me.playerId);

                return (
                  <Accordion key={round.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight="bold">
                          Round {round.roundNumber}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({myScores.length} score{myScores.length !== 1 ? "s" : ""})
                        </Typography>
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails>
                      {myScores.map(score => (
                        <Typography
                          key={score.id}
                          sx={{
                            ml: 1,
                            color: score.points >= 0 ? "success.main" : "error.main"
                          }}
                        >
                          {score.points >= 0 ? "+" : ""}
                          {score.points}{" "}
                          <span style={{ opacity: 0.6 }}>
                            ({score.type})
                          </span>
                        </Typography>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
          </Stack>
        </CardContent>
      </Card>

      <Button
        variant="outlined"
        color="error"
        onClick={handleLeaveGame}
        disabled={loadingAction}
      >
        Leave Game
      </Button>
    </Box>
  );
}