"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box, Stack, Button, Typography, Card, CardContent, TextField, MenuItem, Divider, AccordionDetails, Accordion, AccordionSummary, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import { getActiveGameForPlayerPage } from "@/lib/api/games";
import { addScorePlayer, rebuyAsPlayer } from "@/lib/api/scores";
import { registerPlayerKnockout } from "@/lib/api/bounties";
import { ActivePlayerGame, GameDetails, RoundDto } from "@/lib/models/game";
import { leaveGame } from "@/lib/api/players";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useGameHub } from "@/lib/hooks/useGameHub";
import { KnockoutUpdatedDto } from "@/lib/models/bounty";
import { Score } from "@/lib/models/score";

export default function PlayerGamePage() {
  const router = useRouter();
  const { userId, setActiveGameId } = useAuth();
  const { showError } = useError();

  const [currentGame, setCurrentGame] = useState<ActivePlayerGame | null>(null);
  const activeRound = currentGame?.rounds?.find(r => !r.endedAt);
  const [points, setPoints] = useState("");
  const [knockoutPlayerId, setKnockoutPlayerId] = useState<number | "">("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // ----- Fetch active game for this player -----
  useEffect(() => {
    if (!userId) return;

    const fetchGame = async () => {
      try {
        const game = await getActiveGameForPlayerPage();

        if (!game) {
          setActiveGameId(null);
          router.replace("/game/lobby");
          return;
        }

        setCurrentGame(game);
        setActiveGameId(game.id);
      } catch (err: any) {
        showError(err.message || "Failed to load active game");
        setActiveGameId(null);
        router.replace("/game/lobby");
      } finally {
        setPageLoading(false);
      }
    };

    fetchGame();
  }, [userId, router, showError, setActiveGameId]);


  const currentGameId = currentGame?.id;

const handleRoundStarted = useCallback((newRound: RoundDto) => {
  setCurrentGame((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      rounds: [
        ...prev.rounds.map((round) =>
          !round.endedAt ? { ...round, endedAt: newRound.startedAt } : round
        ),
        newRound,
      ],
    };
  });
}, []);

  const handleGameFinished = useCallback((finishedGameId: number) => {
    setCurrentGame(null);
    router.push(`/game/game-results/${finishedGameId}`);
  }, [router]);

const handleKnockoutUpdated = useCallback((payload: KnockoutUpdatedDto) => {
  setCurrentGame((prev) => {
    if (!prev) return prev;

    const updatedMe =
      prev.me.playerId === payload.killerPlayerId
        ? { ...prev.me, activeBounties: payload.killerActiveBounties }
        : prev.me.playerId === payload.victimPlayerId
        ? { ...prev.me, activeBounties: payload.victimActiveBounties }
        : prev.me;

    const updatedTargets = prev.knockoutTargets.map((target) => {
      if (target.playerId === payload.killerPlayerId) {
        return { ...target, activeBounties: payload.killerActiveBounties };
      }

      if (target.playerId === payload.victimPlayerId) {
        return { ...target, activeBounties: payload.victimActiveBounties };
      }

      return target;
    });

    const activeRound = prev.rounds.find((r) => r.endedAt === null);

    return {
      ...prev,
      me: updatedMe,
      knockoutTargets: updatedTargets,
      rounds: activeRound
        ? prev.rounds.map((round) =>
            round.id !== activeRound.id
              ? round
              : {
                  ...round,
                  scores: [...round.scores, payload.score],
                }
          )
        : prev.rounds,
    };
  });
}, []);

  // ----- Setup GameHub -----
  useGameHub({
    gameId: currentGameId,
    onRoundStarted: handleRoundStarted,
    onGameFinished: handleGameFinished,
    onKnockout: handleKnockoutUpdated,
  });


  // ----- Actions -----const 
  const me = currentGame?.me;



 const submitScore = async () => {
  if (!currentGame || !me || !points) return;

  const parsedPoints = Number(points);
  if (Number.isNaN(parsedPoints)) return;

  try {
    setLoadingAction(true);

    const created = await addScorePlayer(currentGame.id, parsedPoints);

    const newScore: Score = {
      id: created.id || Date.now(),
      playerId: created.playerId,
      userId: created.userId,
      userName: created.userName ?? me.username,
      points: created.points,
      createdAt: new Date().toISOString(),
      totalPoints: 0,
      type: created.type,
      victimUserName: "",
      gameId: currentGame.id,
      roundId: created.rounds.id,
      roundNumber: created.rounds.roundNumber,
    };

    setCurrentGame((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        rounds: prev.rounds.map((round) =>
          round.id === created.rounds.id
            ? {
                ...round,
                scores: [...round.scores, newScore],
              }
            : round
        ),
      };
    });

    setPoints("");
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

    const created = await rebuyAsPlayer(currentGame.id);

    const rebuyScore: Score = {
      id: created.id || Date.now(),
      playerId: created.playerId,
      userId: me.userId,
      userName: me.username,
      points: created.points,
      createdAt: new Date().toISOString(),
      totalPoints: 0,
      type: created.type,
      victimUserName: "",
      gameId: currentGame.id,
      roundId: created.rounds.id,
      roundNumber: created.rounds.roundNumber,
    };

    setCurrentGame((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        me: {
          ...prev.me,
          rebuyCount: prev.me.rebuyCount + 1,
        },
        rounds: prev.rounds.map((round) =>
          round.id === created.rounds.id
            ? {
                ...round,
                scores: [...round.scores, rebuyScore],
              }
            : round
        ),
      };
    });
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

  if (pageLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 420, borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2} alignItems="center" py={2}>
              <CircularProgress />
              <Typography variant="h6" fontWeight="bold" textAlign="center">
                Joining active game...
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Please wait while we load your game data.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!currentGame || !me) return null;

  const myScores =
    currentGame?.rounds
      ?.flatMap(r => r.scores)
      .filter(s => s.playerId === me.playerId) ?? [];

  const myRebuys = me.rebuyCount;
  const myBounties = me.activeBounties;
  const myTotal = myScores.reduce((sum, s) => sum + s.points, 0);

  return (
    <Box sx={{ width: "100%", maxWidth: { md: 800 }, mx: "auto", px: { xs: 1, md: 0 }, mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Game #{currentGame.gameNumber}
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={() => setLeaveDialogOpen(true)}
          disabled={loadingAction}
        >
          Leave Game
        </Button>
      </Box>

      <Card>
        <CardContent>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"

          >
            <Typography fontWeight="bold"

              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                mb: 1,
                textTransform: "capitalize",
              }}

            >
              {me.username}
            </Typography>

            <Typography fontWeight="bold"
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                mb: 1,
              }}
            >
              {currentGame.type}
            </Typography>
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              border: "1px solid rgba(212, 175, 55, 0.18)",
              background:
                "linear-gradient(180deg, rgba(15,55,20,0.6), rgba(7,32,12,0.9))",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 1.5,
                color: "primary.main",
                letterSpacing: "0.05em",
                textAlign: "center",
              }}
            >
              Your Game Status
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(4, 1fr)",
                },
                gap: 1.5,
              }}
            >

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  Points
                </Typography>
                <Typography fontWeight={700} color="primary.main">
                  {myTotal}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  Round
                </Typography>
                <Typography fontWeight={700}>
                  #{activeRound?.roundNumber ?? "-"}
                </Typography>
              </Box>



              {(currentGame.bountyValue ?? 0) > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    Bounties
                  </Typography>
                  <Typography fontWeight={700}>
                    {myBounties}
                  </Typography>
                </Box>
              )}

              {(currentGame.rebuyValue ?? 0) > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    Rebuys
                  </Typography>
                  <Typography fontWeight={700}>
                    {myRebuys}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Stack spacing={2}>
            <TextField label="Enter Points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
            <Button variant="contained" onClick={submitScore} disabled={loadingAction}>
              {loadingAction ? "Saving..." : "Add points"}
            </Button>

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
                  {currentGame.knockoutTargets.map((p) => (
                    <MenuItem key={p.playerId} value={p.playerId}>
                      {p.username.charAt(0).toUpperCase() + p.username.slice(1)} {"-"} {p.activeBounties > 0 ? `(${p.activeBounties} bounties)` : "(no bounties)"}
                      {" rewards"} ({p.activeBounties * (currentGame.bountyValue ?? 0)} points)
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleKnockout}
                  disabled={!knockoutPlayerId || loadingAction}
                >
                  Register Knockout
                </Button>
              </Stack>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography fontWeight="bold">Round History</Typography>

            {(currentGame.rounds ?? [])
              .slice()
              .sort((a, b) => a.roundNumber - b.roundNumber)
              .map(round => {
                const myScores = round.scores;

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
      <Dialog open={leaveDialogOpen} onClose={() => !loadingAction && setLeaveDialogOpen(false)}>
        <DialogTitle>Leave game?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave this game? You will be returned to the lobby.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setLeaveDialogOpen(false)}
            disabled={loadingAction}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              setLeaveDialogOpen(false);
              await handleLeaveGame();
            }}
            disabled={loadingAction}
          >
            Leave Game
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}