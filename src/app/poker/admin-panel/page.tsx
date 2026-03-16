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
import { AdminResetPwd, getAllUsers } from "@/lib/api/users";
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
  const [adminResetUserId, setAdminResetUserId] = useState<number | "">("");
  const [adminResetPassword, setAdminResetPassword] = useState("");
  const [adminResetConfirmOpen, setAdminResetConfirmOpen] = useState(false);
  const [adminResetLoading, setAdminResetLoading] = useState(false);
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
        Admin panel
      </Typography>


      <Card sx={{ mb: { xs: 2, md: 4 } }}>
        <CardContent>
          <Divider sx={{ my: 2 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Reset User Password</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start" mb={2}>
                {/* Vælg bruger */}
                <Select
                  value={adminResetUserId}
                  displayEmpty
                  onChange={(e) => setAdminResetUserId(Number(e.target.value))}
                  sx={{ width: { xs: "100%", sm: 220 } }}
                >
                  <MenuItem value="" disabled>
                    Select user
                  </MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.username})
                    </MenuItem>
                  ))}
                </Select>

                {/* Input for nyt password */}
                <TextField
                  size="small"
                  label="New Password"
                  type="password"
                  value={adminResetPassword}
                  onChange={(e) => setAdminResetPassword(e.target.value)}
                  sx={{ width: { xs: "100%", sm: 220 } }}
                />

                {/* Knap for at åbne confirmation */}
                <Button
                  variant="contained"
                  color="error"
                  disabled={!adminResetUserId || !adminResetPassword || adminResetLoading}
                  onClick={() => setAdminResetConfirmOpen(true)}
                >
                  Reset Password
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Reset password modal */}
      <Dialog
        open={adminResetConfirmOpen}
        onClose={() => setAdminResetConfirmOpen(false)}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          Are you sure you want to reset the password for{" "}
          {users.find((u) => u.id === adminResetUserId)?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminResetConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              if (!adminResetUserId || !adminResetPassword) return;

              try {
                setAdminResetLoading(true);
                await AdminResetPwd(adminResetUserId, adminResetPassword);
                setAdminResetConfirmOpen(false);
                setAdminResetPassword("");
                setAdminResetUserId("");
                alert("Password reset successfully");
              } catch (err: any) {
                alert(err.message || "Failed to reset password");
              } finally {
                setAdminResetLoading(false);
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}