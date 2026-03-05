"use client";

import { useEffect, useState } from "react";
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
import { getActiveGame, getAllGames, cancelGame, startGame, endGame, addParticipants, removeParticipant, addScore, removePoints, addPointsBulk, removeGame, updateRules, registerAdminKnockout, rebuy } from "@/lib/api/games";
import { getAllUsers } from "@/lib/api/users";
import { Score } from "@/lib/models/score";
import { Game, Participant } from "@/lib/models/game";
import { User } from "@/lib/models/user"
import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";

export default function AdminPanelPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [scoreInputs, setScoreInputs] = useState<{ [key: number]: string }>({});
  const [hasJoined, setHasJoined] = useState(false);
  const { isLoggedIn, role } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scoreToRemove, setScoreToRemove] = useState<Score | null>(null);
  const [endGameConfirmOpen, setEndGameConfirmOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null);
  const [removeParticipantConfirmOpen, setRemoveParticipantConfirmOpen] = useState(false);
  const [removeGameConfirmOpen, setRemoveGameConfirmOpen] = useState(false);
  const [gameToRemove, setGameToRemove] = useState<Game | null>(null);
  const [rebuyValue, setRebuyValue] = useState<number | "">("");
  const [bountyValue, setBountyValue] = useState<number | "">("");
  const [savingRules, setSavingRules] = useState(false);
  const [killerUserId, setKillerUserId] = useState<number | "">("");
  const [victimUserId, setVictimUserId] = useState<number | "">("");
  const [knockoutLoading, setKnockoutLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const { showError } = useError();

  // 🔐 Route protection
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (role !== "Admin") {
      router.replace("/");
      return;
    }
  }, [isLoggedIn, role, router]);

  useEffect(() => {
    fetchActiveGame();
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      showError(err.message || "Failed to fetch users");
    }
  };

  const fetchActiveGame = async () => {
    try {
      const active = await getActiveGame();
      if (active) {
        const participants = active.participants || [];
        const scores = active.scores || [];

        setCurrentGame({ ...active, participants, scores });

        setRebuyValue(active.rebuyValue ?? "");
        setBountyValue(active.bountyValue ?? "");

        const inputs: { [key: number]: string } = {};
        participants.forEach(p => (inputs[p.userId] = ""));
        setScoreInputs(inputs);
      } else {
        setCurrentGame(null);
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

  const startGameHandler = async () => {
    try {
      const game = await startGame();
      fetchActiveGame();
      setCurrentGame({ ...game, participants: [], scores: [] });
    } catch (err: any) {
      showError(err.message || "failed to start game")
    }
  };

  const addScoreHandler = async (userId: number) => {
    if (!currentGame) return;
    const value = Number(scoreInputs[userId]);
    if (!value) return;

    try {
      await addScore(currentGame.id, userId, value);
      setScoreInputs({ ...scoreInputs, [userId]: "" });
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "failed to add score")
    }
  };

  const handleEndGameClick = () => {
    setEndGameConfirmOpen(true);
  };

  const confirmEndOrCancelGame = async () => {
    if (!currentGame) return;

    try {
      if (currentGame.scores.length === 0) {
        await cancelGame(currentGame.id);
      } else {
        await endGame(currentGame.id);
      }
      setCurrentGame(null);
      // fetchAllGames();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setEndGameConfirmOpen(false);
    }
  };

  const handleSelectUser = async (e: SelectChangeEvent) => {
    const userId = Number(e.target.value);
    setSelectedUserId(String(userId));

    if (!currentGame || !userId) return;

    try {
      await addParticipants(currentGame.id, [userId]);
      setSelectedUserId("");
      fetchActiveGame();
      setHasJoined(true);
    } catch (err: any) {
      showError(err.message || " ")
    }
  };

  const handleCancelRemoveParticipant = () => {
    setParticipantToRemove(null);
    setRemoveParticipantConfirmOpen(false);
  };

  const handleConfirmRemoveParticipant = async () => {
    if (!currentGame || !participantToRemove) return;

    try {
      const updatedParticipants = await removeParticipant(
        currentGame.id,
        participantToRemove.userId
      );
      setCurrentGame(prev =>
        prev ? { ...prev, participants: updatedParticipants } : prev
      );
    } catch (err) {
      alert("Couldn't remove player");
    } finally {
      setParticipantToRemove(null);
      setRemoveParticipantConfirmOpen(false);
    }
  };

  //Handle remove points
  const handleConfirmRemove = (score: Score) => {
    setScoreToRemove(score);
    setConfirmOpen(true);
  };

  const handleCancelRemove = () => {
    setScoreToRemove(null);
    setConfirmOpen(false);
  };

  const handleRemovePoint = async () => {
    if (!scoreToRemove) return;
    try {
      await removePoints(scoreToRemove.id);
      fetchActiveGame() 
    } catch (err: any) {
      showError(err.message || "failed to remove points")
    } finally {
      setConfirmOpen(false);
      setScoreToRemove(null);
    }
  };

  const addAllScoresHandler = async () => {
    if (!currentGame) return;

    const scoresToAdd = Object.entries(scoreInputs)
      .map(([userId, points]) => ({ userId: Number(userId), points: Number(points) }))
      .filter(s => s.points > 0);

    if (scoresToAdd.length === 0) return;

    try {
      await addPointsBulk(currentGame.id, scoresToAdd);
      setScoreInputs({});
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to add bulk points")
    }
  };


  const handleRemoveGameClick = (game: Game) => {
    setGameToRemove(game);
    setRemoveGameConfirmOpen(true);
  };

  const handleCancelRemoveGame = () => {
    setGameToRemove(null);
    setRemoveGameConfirmOpen(false);
  };

  const handleConfirmRemoveGame = async () => {
    if (!gameToRemove) return;

    try {
      await removeGame(gameToRemove.id);
      fetchAllGames();
    } catch (err) {
      alert("Could not delete game");
    } finally {
      setRemoveGameConfirmOpen(false);
      setGameToRemove(null);
    }
  };


  const handleSaveRules = async () => {
    if (!currentGame) return;

    try {
      setSavingRules(true);

      await updateRules(
        currentGame.id,
        Number(rebuyValue),
        Number(bountyValue)
      );

      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "failed to save rules")
    } finally {
      setSavingRules(false);
    }
  };

  const registerKnockoutHandler = async () => {
    if (!currentGame || !killerUserId || !victimUserId) return;

    try {
      setKnockoutLoading(true);
      await registerAdminKnockout(currentGame.id, killerUserId, victimUserId);
      await fetchActiveGame();
      setKillerUserId("");
      setVictimUserId("");
    } catch (err: any) {
      showError(err.message || "Failed to register knockout");
    } finally {
      setKnockoutLoading(false);
    }
  };

  const handleRebuy = async () => {
    if (!currentGame) return;

    try {
      setLoadingAction(true);
      await rebuy(currentGame.id);
      fetchActiveGame();
    } catch (err: any) {
      alert(err.message || "Rebuy failed");
    } finally {
      setLoadingAction(false);
    }
  };

  //Keep this just above return
  if (!isLoggedIn || role !== "Admin") {
    return null;
  }
  return (
    <Box p={5}>
      <Typography variant="h4" mb={3}> Poker Game Admin</Typography>


      {!currentGame ? (
        <Button variant="contained" onClick={startGameHandler}>
          Start New Game
        </Button>
      ) : (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">
              Active Game #{currentGame.gameNumber}
            </Typography>
            <Typography>
              Started: {new Date(currentGame.startedAt).toLocaleString("da-DK")}
            </Typography>

            <Divider sx={{ my: 2 }} />
            {/* Set value of rebuy and bounty */}
            <Typography variant="subtitle1">Game Rules</Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <TextField
                size="small"
                type="number"
                label="Rebuy value"
                value={rebuyValue}
                onChange={(e) => setRebuyValue(e.target.value === "" ? "" : Number(e.target.value))}
                sx={{ width: 150 }}
              />


              <TextField
                size="small"
                type="number"
                label="Bounty value"
                value={bountyValue}
                onChange={(e) => setBountyValue(e.target.value === "" ? "" : Number(e.target.value))}
                sx={{ width: 150 }}
              />

              <Button
                variant="contained"
                onClick={handleSaveRules}
                disabled={savingRules}
              >
                Save rules
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Current rules: Rebuy = {currentGame.rebuyValue ?? "-"} / Bounty = {currentGame.bountyValue ?? "-"}
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Add participant */}
            <Stack direction="row" spacing={2} mb={2}>
              <Select
                value={selectedUserId}
                displayEmpty
                onChange={handleSelectUser}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="" disabled>
                  Choose player to game
                </MenuItem>
                {users
                  .filter((u) => !currentGame?.participants.some((p) => p.userId === u.id))
                  .map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.username})
                    </MenuItem>
                  ))}
              </Select>
            </Stack>
            {/* Knockout section */}
            {currentGame.bountyValue > 0 && (
            <Box sx={{ my: 2, p: 2, border: "1px dashed grey", borderRadius: 2 }}>
              <Typography variant="subtitle1" mb={1}>Admin Knockout</Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                {/* Killer dropdown */}
                <Select
                  value={killerUserId}
                  displayEmpty
                  onChange={(e) => setKillerUserId(Number(e.target.value))}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="" disabled>Select killer</MenuItem>
                  {currentGame?.participants.map(p => (
                    <MenuItem key={p.userId} value={p.userId}>{p.userName}</MenuItem>
                  ))}
                </Select>

                {/* Victim dropdown */}
                <Select
                  value={victimUserId}
                  displayEmpty
                  onChange={(e) => setVictimUserId(Number(e.target.value))}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="" disabled>Select victim</MenuItem>
                  {currentGame?.participants
                    .filter(p => p.userId !== killerUserId)
                    .map(p => (
                      <MenuItem key={p.userId} value={p.userId}>{p.userName}</MenuItem>
                    ))}
                </Select>

                <Button
                  variant="contained"
                  onClick={registerKnockoutHandler}
                  disabled={knockoutLoading || !killerUserId || !victimUserId}
                >
                  Register Knockout
                </Button>
              </Stack>
            </Box>
            )}
            {/* Participants + score inputs */}
            <Typography variant="subtitle1">Participants</Typography>
            {currentGame.participants.map((p) => (
              <Stack key={p.userId} direction="row" spacing={2} alignItems="center" mb={1}>
                <Typography sx={{ minWidth: 140 }}>{p.userName}</Typography>
                <TextField
                  size="small"
                  label="Type points to add"
                  value={scoreInputs[p.userId] || ""}
                  onChange={(e) =>
                    setScoreInputs({ ...scoreInputs, [p.userId]: e.target.value })
                  }
                />

                <Button variant="contained" onClick={() => addScoreHandler(p.userId)}>
                  Add Points
                </Button>

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

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setParticipantToRemove(p);
                    setRemoveParticipantConfirmOpen(true);
                  }}
                >
                  Remove Player
                </Button>
              </Stack>
            ))}
            <Divider sx={{ my: 2 }} />

            {/* All score entries */}
            <Typography variant="subtitle1">Score entries</Typography>
            {currentGame.scores.map((s) => (
              <Stack key={s.id} direction="row" spacing={2} alignItems="center" mb={1}>
                <Typography sx={{ minWidth: 140 }}>
                  {s.userName}: {s.points}
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

            <Dialog
              open={removeParticipantConfirmOpen}
              onClose={handleCancelRemoveParticipant}
            >
              <DialogTitle>Remove player?</DialogTitle>
              <DialogContent>
                Are you sure you want to remove {participantToRemove?.userName} from the game?
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelRemoveParticipant}>No</Button>
                <Button color="error" onClick={handleConfirmRemoveParticipant}>
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog open={confirmOpen} onClose={handleCancelRemove}>
              <DialogTitle>Confirm Removal</DialogTitle>
              <DialogContent>
                Are you sure you want to remove {scoreToRemove?.points} points from {scoreToRemove?.userName}?
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelRemove}>No</Button>
                <Button color="error" onClick={handleRemovePoint}>Yes</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={endGameConfirmOpen} onClose={() => setEndGameConfirmOpen(false)}>
              <DialogTitle>
                {currentGame?.scores.length === 0 ? "Cancel game?" : "End game?"}
              </DialogTitle>
              <DialogContent>
                {currentGame?.scores.length === 0
                  ? "Are you sure you want to cancel this game?"
                  : "Are you sure you want to end this game?"}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEndGameConfirmOpen(false)}>No</Button>
                <Button color="error" onClick={confirmEndOrCancelGame}>
                  Yes
                </Button>
              </DialogActions>
            </Dialog>

            <Button variant="contained" color="primary" onClick={addAllScoresHandler}>
              Add All Scores
            </Button>

            <Box display="flex" justifyContent="space-between" mt={2}></Box>
            <Button
              color={currentGame.scores.length === 0 ? "warning" : "error"}
              variant="contained"
              onClick={handleEndGameClick}
            >
              {currentGame.scores.length === 0 ? "Cancel game" : "End game"}
            </Button>
            <Box />
          </CardContent>
        </Card>

      )}

      <Dialog open={removeGameConfirmOpen} onClose={handleCancelRemoveGame}>
        <DialogTitle>Delete game?</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete Game #{gameToRemove?.gameNumber}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemoveGame}>No</Button>
          <Button color="error" onClick={handleConfirmRemoveGame}>
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box marginTop={2}></Box>
      <Button
        variant="contained"
        color="primary"
        onClick={fetchAllGames}
        sx={{ mb: 3 }}
      >
        Fetch All Games
      </Button>

      <Typography variant="h5" mt={4}>All Games</Typography>
      {[...games]
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .map((g) => (
          <Card key={g.id} sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography sx={{ flex: 1 }}>
                  Game #{g.gameNumber} — {g.isFinished ? "Finished" : "Active"}
                </Typography>

                <Link href={`/poker/game-results/${g.id}`} passHref>
                  <Button variant="outlined" size="small">
                    View scoreboard
                  </Button>
                </Link>

                {g.isFinished && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveGameClick(g)}
                  >
                    Delete permanently
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
    </Box>
  );
}