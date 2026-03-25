"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, Stack, Button, Typography, Card, CardContent, TextField, MenuItem, Divider } from "@mui/material";
import * as signalR from "@microsoft/signalr";

import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import { getActiveGameForPlayerPage } from "@/lib/api/games";
import { addScorePlayer, rebuyAsPlayer } from "@/lib/api/scores";
import { registerPlayerKnockout } from "@/lib/api/bounties";
import { GameDetails, RoundDto } from "@/lib/models/game";
import { leaveGame } from "@/lib/api/players";

export default function PlayerGamePage() {
  const router = useRouter();
  const { userId } = useAuth();
  const { showError } = useError();

  const [currentGame, setCurrentGame] = useState<GameDetails | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundDto | null>(null);
  const [points, setPoints] = useState("");
  const [knockoutPlayerId, setKnockoutPlayerId] = useState<number | "">("");
  const [loadingAction, setLoadingAction] = useState(false);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // ----- Fetch active game for this player -----
  useEffect(() => {
    if (!userId) return;

    const fetchGame = async () => {
      try {
        const game = await getActiveGameForPlayerPage();
        if (!game) return;

        setCurrentGame(game);
      } catch (err: any) {
        showError(err.message || "Failed to load active game");
      }
    };

    fetchGame();
  }, [userId, showError]);

  // ----- Setup SignalR once -----
  useEffect(() => {
    if (!currentGame) return;
    if (connectionRef.current) return; // prevent multiple connections

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_HUB_URL!}`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => connection.invoke("JoinGameGroup", currentGame.id))
      .catch(console.error);

    connection.on("RoundStarted", (round: RoundDto) => setCurrentRound(round));
    connection.on("RoundEnded", () => setCurrentRound(null));
    connection.on("GameUpdated", (game: GameDetails) => {
      if (game.isFinished) {
        router.push(`/game/${game.id}/results`);
      }
    });

    return () => {
      if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        connectionRef.current.invoke("LeaveGameGroup", currentGame.id).catch(() => {});
        connectionRef.current.stop().catch(() => {});
      }
    };
  }, [currentGame, router]);

  // ----- Actions -----
  const me = currentGame?.players?.find(p => p.userId === userId);

  const myScores = currentGame?.scores.filter(s => s.playerId === me?.playerId) || [];
  const myTotal = myScores.reduce((sum, s) => sum + s.totalPoints, 0);

  const submitScore = async () => {
  if (!currentGame || !points) return;
  try {
    setLoadingAction(true);
    await addScorePlayer(currentGame.id, Number(points));
    setPoints("");
    
    // Opdater spillet med ny score
    const updated = await getActiveGameForPlayerPage();
    setCurrentGame(updated);
  } catch (err: any) {
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

    if (connectionRef.current) {
  await connectionRef.current.stop();
  connectionRef.current = null;
}

    setCurrentGame(null);

    router.push("/game/lobby");
  } catch (err: any) {
    showError(err.message || "Failed to leave game");
  } finally {
    setLoadingAction(false);
  }
};

  if (!currentGame || !me) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ width: "100%", maxWidth: { md: 800 }, mx: "auto", px: { xs: 1, md: 0 }, mt: 4 }}>
      <Typography variant="h4" mb={3} textAlign="center" fontWeight="bold">
        Game #{currentGame.gameNumber}
      </Typography>

      {currentRound && (
        <Card sx={{ my: 2, p: 2, bgcolor: "info.light" }}>
          <Typography variant="h6">Round #{currentRound.roundNumber} started</Typography>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography mb={2} fontWeight="bold">
            Playing as: {me.username}
          </Typography>

          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper", border: "1px solid rgba(255,255,255,0.1)", mb: 2 }}>
            <Typography fontWeight="bold">Your game status</Typography>
            <Typography>Total points: <b>{myTotal}</b></Typography>
          </Box>

          <Stack spacing={2}>
            <TextField label="Points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
            <Button variant="contained" onClick={submitScore}>Add points</Button>

            {((currentGame.rebuyValue ?? 0) > 0 || (currentGame.bountyValue ?? 0) > 0) && <Divider sx={{ my: 2 }} />}

            {currentGame.rebuyValue && currentGame.rebuyValue > 0 && (
              <Button variant="outlined" color="warning" onClick={handleRebuy} disabled={loadingAction}>
                Rebuy (-{currentGame.rebuyValue})
              </Button>
            )}

            {currentGame.bountyValue && currentGame.bountyValue > 0 && (
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

            <Typography fontWeight="bold" mb={1}>Your scores:</Typography>
            {myScores.map(s => (
              <Typography key={s.playerId}>+{s.totalPoints} points</Typography>
            ))}
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