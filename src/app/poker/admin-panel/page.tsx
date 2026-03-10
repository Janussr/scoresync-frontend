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
import {
  getActiveGame,
  getAllGames,
  cancelGame,
  startGame,
  endGame,
  removeGame,
  updateRules,
} from "@/lib/api/games";
import { addScore, addPointsBulk, removePoints, adminRebuy } from "@/lib/api/scores";
import { addParticipants, removeParticipant } from "@/lib/api/participants";
import { registerAdminKnockout } from "@/lib/api/bounties";
import { getAllUsers } from "@/lib/api/users";
import { Score } from "@/lib/models/score";
import { Game, Participant } from "@/lib/models/game";
import { User } from "@/lib/models/user";
import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
    if (role !== "Admin") router.replace("/");
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
        setCurrentGame({ ...active, participants, scores: active.scores || [] });
        setRebuyValue(active.rebuyValue ?? "");
        setBountyValue(active.bountyValue ?? "");
        const inputs: { [key: number]: string } = {};
        participants.forEach((p) => (inputs[p.userId] = ""));
        setScoreInputs(inputs);
      } else setCurrentGame(null);
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
      showError(err.message || "Failed to start game");
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
      showError(err.message || "Failed to add score");
    }
  };

  const handleEndGameClick = () => setEndGameConfirmOpen(true);

  const confirmEndOrCancelGame = async () => {
    if (!currentGame) return;
    try {
      if (currentGame.scores.length === 0) await cancelGame(currentGame.id);
      else await endGame(currentGame.id);
      setCurrentGame(null);
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
      showError(err.message || " ");
    }
  };

  const handleCancelRemoveParticipant = () => {
    setParticipantToRemove(null);
    setRemoveParticipantConfirmOpen(false);
  };

  const handleConfirmRemoveParticipant = async () => {
    if (!currentGame || !participantToRemove) return;
    try {
      const updatedParticipants = await removeParticipant(currentGame.id, participantToRemove.userId);
      setCurrentGame((prev) => (prev ? { ...prev, participants: updatedParticipants } : prev));
    } catch (err) {
      alert("Couldn't remove player");
    } finally {
      handleCancelRemoveParticipant();
    }
  };

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
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to remove points");
    } finally {
      handleCancelRemove();
    }
  };

  const addAllScoresHandler = async () => {
    if (!currentGame) return;
    const scoresToAdd = Object.entries(scoreInputs)
      .map(([userId, points]) => ({ userId: Number(userId), points: Number(points) }))
      .filter((s) => s.points > 0);
    if (scoresToAdd.length === 0) return;

    try {
      await addPointsBulk(currentGame.id, scoresToAdd);
      setScoreInputs({});
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to add bulk points");
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
      handleCancelRemoveGame();
    }
  };

  const handleSaveRules = async () => {
    if (!currentGame) return;
    try {
      setSavingRules(true);
      await updateRules(currentGame.id, Number(rebuyValue), Number(bountyValue));
      fetchActiveGame();
    } catch (err: any) {
      showError(err.message || "Failed to save rules");
    } finally {
      setSavingRules(false);
    }
  };

  const registerKnockoutHandler = async () => {
    if (!currentGame || !killerUserId || !victimUserId) return;
    try {
      setKnockoutLoading(true);
      await registerAdminKnockout(currentGame.id, killerUserId, victimUserId);
      fetchActiveGame();
      setKillerUserId("");
      setVictimUserId("");
    } catch (err: any) {
      showError(err.message || "Failed to register knockout");
    } finally {
      setKnockoutLoading(false);
    }
  };

  const handleRebuy = async (userId: number) => {
    if (!currentGame) return;
    try {
      setLoadingAction(true);
      await adminRebuy(currentGame.id, userId);
      fetchActiveGame();
    } catch (err: any) {
      alert(err.message || "Rebuy failed");
    } finally {
      setLoadingAction(false);
    }
  };

  if (!isLoggedIn || role !== "Admin") return null;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", md: 900 },
        mx: "auto",
        px: { xs: 1, md: 0 },
        mt: 4,
      }}
    >
      <Typography
        mb={3}
        sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" }, fontWeight: 500 }}
      >
        Poker Game Admin
      </Typography>

      {!currentGame ? (
        <Button variant="contained" color="success" onClick={startGameHandler}>
          Start New Game
        </Button>
      ) : (
        <Card sx={{ mb: { xs: 2, md: 4 } }}>
          <CardContent>
            <Typography variant="h6">
              Active Game #{currentGame.gameNumber}
            </Typography>
            <Typography>
              Started: {new Date(currentGame.startedAt).toLocaleString("da-DK")}
            </Typography>

            <Divider sx={{ my: 2 }} />

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
                <Typography>Choose Player to Join</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
                  <Select
                    value={selectedUserId}
                    displayEmpty
                    onChange={handleSelectUser}
                    sx={{ width: { xs: "100%", sm: 220 } }}
                  >
                    <MenuItem value="" disabled>
                      Choose player to game
                    </MenuItem>
                    {users
                      .filter((u) =>
                        !currentGame?.participants.some((p) => p.userId === u.id)
                      )
                      .map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.name} ({u.username})
                        </MenuItem>
                      ))}
                  </Select>
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
                      value={killerUserId}
                      displayEmpty
                      onChange={(e) => setKillerUserId(Number(e.target.value))}
                      sx={{ width: { xs: "100%", sm: 180 } }}
                    >
                      <MenuItem value="" disabled>
                        Select killer
                      </MenuItem>
                      {currentGame?.participants.map((p) => (
                        <MenuItem key={p.userId} value={p.userId}>
                          {p.userName}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      value={victimUserId}
                      displayEmpty
                      onChange={(e) => setVictimUserId(Number(e.target.value))}
                      sx={{ width: { xs: "100%", sm: 180 } }}
                    >
                      <MenuItem value="" disabled>
                        Select victim
                      </MenuItem>
                      {currentGame?.participants
                        .filter((p) => p.userId !== killerUserId)
                        .map((p) => (
                          <MenuItem key={p.userId} value={p.userId}>
                            {p.userName}
                          </MenuItem>
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
                </AccordionDetails>
              </Accordion>
            )}

            {/* --- Accordion for Participants --- */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Participants ({currentGame.participants.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {currentGame.participants.map((p) => (
                  <Box key={p.userId} sx={{ width: "100%", overflowX: "auto", mb: 1 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      {/* Participant Name */}
                      <Typography sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                        {p.userName}
                      </Typography>

                      {/* Points Input */}
                      <TextField
                        size="small"
                        label="Type points to add"
                        value={scoreInputs[p.userId] || ""}
                        onChange={(e) =>
                          setScoreInputs({ ...scoreInputs, [p.userId]: e.target.value })
                        }
                        sx={{ width: { xs: "100%", sm: 150 } }}
                      />

                      {/* Buttons in one row */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexShrink: 0, // Prevent buttons from shrinking
                          overflowX: "auto", // Scroll if screen is too narrow
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={() => addScoreHandler(p.userId)}
                        >
                          Add Points
                        </Button>

                        {currentGame.rebuyValue > 0 && (
                          <Button
                            variant="outlined"
                            color="warning"
                            onClick={() => handleRebuy(p.userId)}
                            disabled={loadingAction || currentGame.isFinished}
                          >
                            Rebuy (-{currentGame.rebuyValue})
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
                {currentGame.scores.map((s) => (
                  <Stack
                    key={s.id}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    mb={1}
                  >
                    <Typography sx={{ minWidth: { xs: "100%", sm: 140 } }}>
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

                <Link href={`/poker/game-results/${g.id}`} passHref>
                  <Button variant="outlined" size="small" sx={{ mt: { xs: 1, sm: 0 } }}>
                    View scoreboard
                  </Button>
                </Link>

                {g.isFinished && (
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





      {/* Remove Participant Confirmation Modal */}
      <Dialog
        open={removeParticipantConfirmOpen}
        onClose={handleCancelRemoveParticipant}
      >
        <DialogTitle>Remove Player</DialogTitle>
        <DialogContent>
          Are you sure you want to remove {participantToRemove?.userName} from the game?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemoveParticipant}>Cancel</Button>
          <Button color="error" onClick={handleConfirmRemoveParticipant}>
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