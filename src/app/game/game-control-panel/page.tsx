"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  TextField,
  MenuItem,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getActiveGames,
  getAllGames,
  cancelGame,
  startGame,
  endGame,
  removeGame,
  updateRules,
  getActiveGameForGamePanel

} from "@/lib/api/games";
import { addPointsBulk, removePoints, addScoreAdmin, rebuyAsAdmin } from "@/lib/api/scores";
import { AddPlayersToGameAsAdmin, removePlayer } from "@/lib/api/players";
import { registerAdminKnockout } from "@/lib/api/bounties";
import { adminResetPwd, getAllUsers } from "@/lib/api/users";
import { Score } from "@/lib/models/score";
import { Game, Player, RoundDto } from "@/lib/models/game";
import { User } from "@/lib/models/user";
import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { startRound } from "@/lib/api/rounds";
import { useGameHub } from "@/lib/hooks/useGameHub";

export default function GameControlPanelPage() {
  const router = useRouter();
  const { isLoggedIn, role, activeGameId, setActiveGameId } = useAuth();
  const { showError } = useError();

  /** --- STATE --- */
  const [games, setGames] = useState<Game[]>([]);
  const [activeGames, setActiveGames] = useState<Game[]>([]);

  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundDto | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [scoreInputs, setScoreInputs] = useState<{ [key: number]: string }>({});
  const [rebuyValue, setRebuyValue] = useState<number | "">("");
  const [bountyValue, setBountyValue] = useState<number | "">("");
  const [savingRules, setSavingRules] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [killerPlayerId, setKillerPlayerId] = useState<number | "">("");
  const [victimPlayerId, setVictimPlayerId] = useState<number | "">("");
  const [knockoutLoading, setKnockoutLoading] = useState(false);

  /** --- MODALS STATE --- */
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scoreToRemove, setScoreToRemove] = useState<Score | null>(null);
  const [endGameConfirmOpen, setEndGameConfirmOpen] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [removePlayerConfirmOpen, setRemovePlayerConfirmOpen] = useState(false);
  const [removeGameConfirmOpen, setRemoveGameConfirmOpen] = useState(false);
  const [gameToRemove, setGameToRemove] = useState<Game | null>(null);

  const { userId } = useAuth();

  const activePlayers = currentGame?.players.filter(p => p.isActive) ?? [];
  const availableUsers = users.filter(
    (u) => !(currentGame?.players.filter(p => p.isActive).some(p => p.userId === u.id))
  );
  /** --- REDIRECT NON-ADMINS --- */
  useEffect(() => {
    if (!isLoggedIn) router.replace("/account/login");
    else if (role !== "Admin" && role !== "Gamemaster") router.replace("/");
  }, [isLoggedIn, role, router]);

  /** --- FETCH DATA --- */
  useEffect(() => {
    fetchUsers();
    fetchCurrentActiveGame();
  }, []);

  useEffect(() => {
    if (currentGame) {
      setRebuyValue(currentGame.rebuyValue ?? "");
      setBountyValue(currentGame.bountyValue ?? "");
    }
  }, [currentGame]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      showError(err.message || "Failed to fetch users");
    }
  };

  const fetchCurrentActiveGame = async () => {
    try {
      const game = await getActiveGameForGamePanel(); // single GamePanel or null
      if (game) {
        // Flatten scores from rounds
        const allScores = game.rounds.flatMap(r => r.scores ?? []);

        setCurrentGame({
          ...game,
          players: game.players ?? [],
          scores: allScores,
        });

        setActiveGames([game]);
      } else {
        setCurrentGame(null);
        setActiveGames([]);
      }
    } catch (err: any) {
      showError(err.message || "Failed to fetch active game");
    }
  };




  const fetchAllGames = async () => {
    try {
      const data = await getAllGames();
      setGames(data);
    } catch (err: any) {
      showError(err.message || "Failed to fetch all games");
    }
  };

  /** --- SIGNALR ONLY FOR ROUND/GAME EVENTS --- */
  useGameHub({
    gameId: currentGame?.id,
    onRoundStarted: (round) => setCurrentRound(round),
    onRoundEnded: () => setCurrentRound(null),
    onGameFinished: () => {
      fetchCurrentActiveGame();
      router.push(`/game/game-results/${currentGame?.id}`);
    },
  });

  /** --- HANDLERS --- */
  const startGameHandler = async () => {
    try {
      const game = await startGame();
      setCurrentGame({ ...game, players: game.players ?? [], scores: game.scores ?? [] });
      fetchCurrentActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to start game");
    }
  };

  const handleStartRound = async () => {
    if (!currentGame) return;
    try {
      await startRound(currentGame.id);
      await fetchCurrentActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to start round");
    }
  };

  // const handleEndRound = async () => {
  //   if (!currentRound) return;
  //   try {
  //     await endRound(currentRound.id);
  //     fetchCurrentActiveGame();
  //   } catch (err: any) {
  //     showError(err.message || "Failed to end round");
  //   }
  // };

  const addScoreHandler = async (targetPlayerId: number) => {
    if (!currentGame) return;

    const value = Number(scoreInputs[targetPlayerId]);
    if (!value) return;

    try {
      setLoadingAction(true);
      await addScoreAdmin(currentGame.id, targetPlayerId, value);

      // Nulstil inputfelt
      setScoreInputs({ ...scoreInputs, [targetPlayerId]: "" });

      // Opdater spillet
      fetchCurrentActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to add score");
    } finally {
      setLoadingAction(false);
    }
  };

  const addAllScoresHandler = async () => {
    if (!currentGame) return;
    const scoresToAdd = Object.entries(scoreInputs)
      .map(([playerId, points]) => ({ playerId: Number(playerId), points: Number(points) }))
      .filter((s) => s.points > 0);
    if (!scoresToAdd.length) return;
    try {
      await addPointsBulk(currentGame.id, scoresToAdd);
      setScoreInputs({});
      fetchCurrentActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to add bulk points");
    }
  };

  const handleEndGameClick = () => setEndGameConfirmOpen(true);
  const confirmEndOrCancelGame = async () => {
    if (!currentGame) return;

    try {
      if ((currentGame.scores?.length ?? 0) === 0) {
        // Ingen scores endnu → cancel game
        await cancelGame(currentGame.id);
      } else {
        // Der er scores → end game
        await endGame(currentGame.id);
      }
      setCurrentGame(null);

    } catch (err: any) {
      showError(err.message || "Failed to end/cancel game");
    } finally {
      setEndGameConfirmOpen(false);
    }
  };



  const handleAddPlayersAsAdmin = async () => {
    if (!currentGame || selectedUserIds.length === 0) return;

    try {
      const newPlayers: Player[] = await AddPlayersToGameAsAdmin(currentGame.id, selectedUserIds);
      setCurrentGame(prev => prev
        ? { ...prev, players: [...prev.players, ...newPlayers] }
        : prev
      );
      setActiveGameId(currentGame.id);
      setSelectedUserIds([]); // reset selection
    } catch (err: any) {
      showError(err.message || "Failed to add players");
    }
  };

  const handleConfirmRemove = (score: Score) => {
    setScoreToRemove(score);
    setConfirmOpen(true);
  };

  const handleCancelRemove = () => {
    setConfirmOpen(false);
    setScoreToRemove(null);
  };

  const handleRemovePoint = async () => {
    if (!scoreToRemove) return;
    try {
      await removePoints(scoreToRemove.id);
      fetchCurrentActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to remove points");
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleRebuy = async (targetPlayerId: number) => {
    if (!currentGame || userId === null) return;

    try {
      setLoadingAction(true);

      await rebuyAsAdmin(currentGame.id, targetPlayerId);

      fetchCurrentActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to rebuy");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSaveRules = async () => {
    if (!currentGame) return;
    try {
      setSavingRules(true);
      await updateRules(currentGame.id, Number(rebuyValue), Number(bountyValue));
      fetchCurrentActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to save rules");
    } finally {
      setSavingRules(false);
    }
  };

  const registerKnockoutHandler = async () => {
    if (!currentGame || !killerPlayerId || !victimPlayerId) return;

    try {
      setKnockoutLoading(true);
      await registerAdminKnockout(currentGame.id, killerPlayerId, victimPlayerId);
      await fetchCurrentActiveGame();
      setKillerPlayerId("");
      setVictimPlayerId("");
    } catch (err: any) {
      showError(err.message || "Failed to register knockout");
    } finally {
      setKnockoutLoading(false);
    }
  };

  // const handleRemovePlayerClick = (player: Player) => {
  //   setPlayerToRemove(player);
  //   setRemovePlayerConfirmOpen(true);
  // };

  const handleCancelRemovePlayer = () => {
    setRemovePlayerConfirmOpen(false);
    setPlayerToRemove(null);
  };

  const handleConfirmRemovePlayer = async () => {
    if (!currentGame || !playerToRemove) return;
    try {
      await removePlayer(currentGame.id, playerToRemove.playerId);
      setCurrentGame(prev => prev ? { ...prev, players: prev.players.filter(p => p.playerId !== playerToRemove.playerId) } : prev);
      setActiveGameId(null);
    } catch (err: any) {
      showError(err.message || "Failed to remove player");
    } finally {
      handleCancelRemovePlayer();
    }
  };

  const handleRemoveGameClick = (game: Game) => {
    setGameToRemove(game);
    setRemoveGameConfirmOpen(true);
  };

  const handleCancelRemoveGame = () => {
    setRemoveGameConfirmOpen(false);
    setGameToRemove(null);
  };

  const handleConfirmRemoveGame = async () => {
    if (!gameToRemove) return;
    try {
      await removeGame(gameToRemove.id);
      fetchAllGames();
    } catch (err: any) {
      showError(err.message || "Failed to remove game");
    } finally {
      handleCancelRemoveGame();
    }
  };

  if (!isLoggedIn || (role !== "Admin" && role !== "Gamemaster")) return null;

  /** --- RENDER --- */
  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", px: 1, mt: 4 }}>
      {/* --- PAGE HEADER --- */}
      <Typography mb={3} sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" }, fontWeight: 500 }}>
        Poker Game Control
      </Typography>

      {/* --- ACTIVE GAME PANEL --- */}
      {!currentGame ? (
        <Button variant="contained" color="success" onClick={startGameHandler}>
          Start New Game
        </Button>
      ) : (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Active Game #{currentGame.gameNumber}</Typography>
            <Typography>
              Started: {new Date(currentGame.startedAt).toLocaleString("da-DK")}
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* --- START/END ROUND --- */}
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="contained" color="primary" onClick={handleStartRound} disabled={!!currentRound}>
                Start Round {currentGame?.rounds?.length ? currentGame.rounds.length + 1 : 1}
              </Button>
            </Stack>

            {/* --- Accordion for Game Rules --- */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Game Rules</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="flex-start"
                  mb={2}
                >
                  <TextField
                    size="small"
                    type="number"
                    label="Rebuy value"
                    value={rebuyValue}
                    onChange={(e) =>
                      setRebuyValue(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    sx={{ width: { xs: "100%", sm: 150 } }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Bounty value"
                    value={bountyValue}
                    onChange={(e) =>
                      setBountyValue(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    sx={{ width: { xs: "100%", sm: 150 } }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSaveRules}
                    disabled={savingRules}
                    color="success"
                  >
                    Save rules
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Current rules: Rebuy = {currentGame.rebuyValue ?? "-"} / Bounty ={" "}
                  {currentGame.bountyValue ?? "-"}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* --- Accordion for Choose Player to Join --- */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Choose Players to Join</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
                  <Select
                    multiple
                    value={selectedUserIds}
                    onChange={(e) => setSelectedUserIds(e.target.value as number[])}
                    renderValue={(selected) =>
                      (selected as number[])
                        .map((id) => {
                          const user = users.find((u) => u.id === id);
                          return user ? user.username : `Unknown (${id})`;
                        })
                        .join(", ")
                    }
                    sx={{ width: { xs: "100%", sm: 300 } }}
                  >
                    {availableUsers.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.username} ({u.username})
                      </MenuItem>
                    ))}
                  </Select>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddPlayersAsAdmin}
                    disabled={selectedUserIds.length === 0}
                  >
                    Add Players
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* --- Accordion for Admin Knockout --- */}
            {currentGame.bountyValue > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Register Knockout</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="flex-start"
                  >
                    <Select
                      value={killerPlayerId}
                      displayEmpty
                      onChange={(e) => setKillerPlayerId(Number(e.target.value))}
                      sx={{ width: { xs: "100%", sm: 180 } }}
                    >
                      <MenuItem value="" disabled>
                        Select killer
                      </MenuItem>
                      {currentGame?.players.map((p) => (
                        <MenuItem key={`${p.playerId}-${p.username}`} value={p.playerId}>
                          {p.username}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      value={victimPlayerId}
                      displayEmpty
                      onChange={(e) => setVictimPlayerId(Number(e.target.value))}
                      sx={{ width: { xs: "100%", sm: 180 } }}
                    >
                      <MenuItem value="" disabled>
                        Select victim
                      </MenuItem>
                      {currentGame?.players
                        .filter((p) => p.playerId !== killerPlayerId)
                        .map((p) => (
                          <MenuItem key={p.playerId} value={p.playerId}>
                            {p.username}
                          </MenuItem>
                        ))}
                    </Select>

                    <Button
                      variant="contained"
                      onClick={registerKnockoutHandler}
                      disabled={knockoutLoading || !killerPlayerId || !victimPlayerId}
                    >
                      Register Knockout
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* --- Accordion for Players --- */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Players ({activePlayers.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {activePlayers.map((p) => (
                  <Box key={p.playerId} sx={{ width: "100%", overflowX: "auto", mb: 1 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      {/* Player Name */}
                      <Typography sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                        {p.username}
                      </Typography>

                      {/* Points Input */}
                      <TextField
                        size="small"
                        label="Type points to add"
                        value={scoreInputs[p.playerId] || ""}
                        onChange={(e) =>
                          setScoreInputs({ ...scoreInputs, [p.playerId]: e.target.value })
                        }
                        sx={{ width: { xs: "100%", sm: 150 } }}
                      />

                      {/* Buttons in one row */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexShrink: 0,
                          overflowX: "auto",
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => addScoreHandler(p.playerId)}
                        >
                          Add Points
                        </Button>

                        {currentGame.rebuyValue > 0 && (
                          <Button
                            variant="outlined"
                            color="warning"
                            onClick={() => handleRebuy(p.playerId)}
                            disabled={loadingAction || currentGame.isFinished}
                          >
                            Rebuy (-{currentGame.rebuyValue})
                          </Button>
                        )}

                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setPlayerToRemove(p);
                            setRemovePlayerConfirmOpen(true);
                          }}
                        >
                          Remove Player
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>

            {/* --- Accordion for Score Entries --- */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Score Entries ({currentGame.scores.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {currentGame.rounds.map((round) => (
                  <Accordion key={round.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Round {round.roundNumber} ({round.scores?.length ?? 0} scores)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ maxHeight: 300, overflowY: "auto" }}>
                      {(round.scores ?? []).map((s) => (
                        <Stack
                          key={s.id}
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          alignItems={{ xs: "stretch", sm: "center" }}
                          mb={1}
                        >
                          <Typography sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                            {s.userName}: {s.points} points, type: {s.type}
                          </Typography>
                          {s.points > 0 && (
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleConfirmRemove(s)}
                            >
                              Remove
                            </Button>
                          )}
                        </Stack>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </AccordionDetails>
            </Accordion>


            {/* Action Buttons */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <Button variant="contained" color="success" onClick={addAllScoresHandler}>
                Add All Scores
              </Button>
              <Button
                color={currentGame.scores.length === 0 ? "warning" : "error"}
                variant="contained"
                onClick={handleEndGameClick}
              >
                {currentGame.scores.length === 0 ? "Cancel game" : "End game"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Fetch All Games Button */}
      <Box mt={2} mb={2}>
        <Button
          variant="contained"
          color="success"
          onClick={fetchAllGames}
        // sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Fetch All Games
        </Button>
      </Box>

      {/* All Games List */}
      <Typography
        sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, fontWeight: 500 }}
        mb={2}
      >
        All Games
      </Typography>

      {[...games]
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .map((g) => (
          <Card key={g.id} sx={{ mt: 1 }}>
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                sx={{ width: "100%", overflowX: "auto" }}
              >
                <Typography sx={{ flex: 1 }}>
                  Game #{g.gameNumber} — {g.isFinished ? "Finished" : "Active"}
                </Typography>

                <Link href={`/game/game-results/${g.id}`} passHref>
                  <Button variant="outlined" size="small" sx={{ mt: { xs: 1, sm: 0 } }}>
                    Game results
                  </Button>
                </Link>
                {g.isFinished && (role === "Admin") && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ mt: { xs: 1, sm: 0 } }}
                    onClick={() => handleRemoveGameClick(g)}
                  >
                    Delete permanently
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}





      {/* Remove Player Confirmation Modal */}
      <Dialog
        open={removePlayerConfirmOpen}
        onClose={handleCancelRemovePlayer}
      >
        <DialogTitle>Remove Player</DialogTitle>
        <DialogContent>
          Are you sure you want to remove {playerToRemove?.username} from the game?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemovePlayer}>Cancel</Button>
          <Button color="error" onClick={handleConfirmRemovePlayer}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Points Confirmation Modal */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelRemove}
      >
        <DialogTitle>Remove Points</DialogTitle>
        <DialogContent>
          Are you sure you want to remove {scoreToRemove?.points} points from {scoreToRemove?.userName}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button color="error" onClick={handleRemovePoint}>Remove</Button>
        </DialogActions>
      </Dialog>

      {/* End / Cancel Game Confirmation Modal */}
      <Dialog
        open={endGameConfirmOpen}
        onClose={() => setEndGameConfirmOpen(false)}
      >
        <DialogTitle>
          {currentGame?.scores.length === 0 ? "Cancel Game" : "End Game"}
        </DialogTitle>
        <DialogContent>
          {currentGame?.scores.length === 0
            ? "Are you sure you want to cancel this game? All progress will be lost."
            : "Are you sure you want to end this game?"}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndGameConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmEndOrCancelGame}>
            {currentGame?.scores.length === 0 ? "Cancel Game" : "End Game"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Game Confirmation Modal */}
      <Dialog
        open={removeGameConfirmOpen}
        onClose={handleCancelRemoveGame}
      >
        <DialogTitle>Delete Game Permanently</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete Game #{gameToRemove?.gameNumber}? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemoveGame}>Cancel</Button>
          <Button color="error" onClick={handleConfirmRemoveGame}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}