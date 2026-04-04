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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAllGames,
  cancelGame,
  startGame,
  endGame,
  removeGame,
  updateRules,
  getAllActiveGamesForGamePanel,
  openGameForPlayers,
} from "@/lib/api/games";
import {
  addPointsBulk,
  removePoints,
  addScoreAdmin,
  rebuyAsAdmin,
} from "@/lib/api/scores";
import { AddPlayersToGameAsAdmin, removePlayer } from "@/lib/api/players";
import { registerAdminKnockout } from "@/lib/api/bounties";
import { getAllUsers } from "@/lib/api/users";
import { Score } from "@/lib/models/score";
import { Game, GamePanel, GameType, Player } from "@/lib/models/game";
import { User } from "@/lib/models/user";
import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { startRound } from "@/lib/api/rounds";
import { useGameHub } from "@/lib/hooks/useGameHub";


type ScoreInputsState = Record<number, Record<number, string>>;
type SelectedUsersState = Record<number, number[]>;
type RulesState = Record<number, { rebuyValue: number | ""; bountyValue: number | "" }>;
type KnockoutState = Record<number, { killerPlayerId: number | ""; victimPlayerId: number | "" }>;
type LoadingByGameState = Record<number, boolean>;

export default function GameControlPanelPage() {
  const router = useRouter();
  const { isLoggedIn, role, setActiveGameId } = useAuth();
  const { showError } = useError();

  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [selectedUserIdsByGame, setSelectedUserIdsByGame] = useState<SelectedUsersState>({});
  const [scoreInputsByGame, setScoreInputsByGame] = useState<ScoreInputsState>({});
  const [rulesByGame, setRulesByGame] = useState<RulesState>({});
  const [knockoutByGame, setKnockoutByGame] = useState<KnockoutState>({});
  const [openingGameByGame, setOpeningGameByGame] = useState<LoadingByGameState>({});

  const [savingRulesByGame, setSavingRulesByGame] = useState<LoadingByGameState>({});
  const [loadingActionByGame, setLoadingActionByGame] = useState<LoadingByGameState>({});
  const [knockoutLoadingByGame, setKnockoutLoadingByGame] = useState<LoadingByGameState>({});
  const [startingRoundByGame, setStartingRoundByGame] = useState<LoadingByGameState>({});
  const [endingGameByGame, setEndingGameByGame] = useState<LoadingByGameState>({});
  const [newGameType, setNewGameType] = useState<GameType>("Poker");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scoreToRemove, setScoreToRemove] = useState<Score | null>(null);

  const [endGameConfirmOpen, setEndGameConfirmOpen] = useState(false);
  const [gameToEnd, setGameToEnd] = useState<Game | null>(null);

  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [gameIdForPlayerRemoval, setGameIdForPlayerRemoval] = useState<number | null>(null);
  const [removePlayerConfirmOpen, setRemovePlayerConfirmOpen] = useState(false);

  const [removeGameConfirmOpen, setRemoveGameConfirmOpen] = useState(false);
  const [gameToRemove, setGameToRemove] = useState<Game | null>(null);


  // /** --- SIGNALR ONLY FOR ROUND/GAME EVENTS --- */
  // useGameHub({
  //   gameIds: activeGames.map((g) => g.id),
  //   onRoundStarted: () => {
  //     fetchActiveGames();
  //   },
  //   onGameFinished: () => {
  //     fetchActiveGames();
  //   },
  // });


  useEffect(() => {
    if (!isLoggedIn) router.replace("/account/login");
    else if (role !== "Admin" && role !== "Gamemaster") router.replace("/");
  }, [isLoggedIn, role, router]);

  useEffect(() => {
    if (!isLoggedIn || (role !== "Admin" && role !== "Gamemaster")) return;

    fetchUsers();
    fetchActiveGames();
  }, [isLoggedIn, role]);

  const normalizePanelGame = (game: GamePanel): Game => ({
    ...game,
    players: game.players ?? [],
    rounds: game.rounds ?? [],
    scores: game.rounds?.flatMap((r) => r.scores ?? []) ?? [],
  });



  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      showError(err.message || "Failed to fetch users");
    }
  };

  const fetchActiveGames = async () => {
    try {
      const data = await getAllActiveGamesForGamePanel();
      const normalized = data.map(normalizePanelGame);

      setActiveGames(normalized);

      setRulesByGame((prev) => {
        const next = { ...prev };
        for (const game of normalized) {
          next[game.id] ??= {
            rebuyValue: game.rebuyValue ?? "",
            bountyValue: game.bountyValue ?? "",
          };
        }
        return next;
      });

      setSelectedUserIdsByGame((prev) => {
        const next = { ...prev };
        for (const game of normalized) {
          next[game.id] ??= [];
        }
        return next;
      });

      setScoreInputsByGame((prev) => {
        const next = { ...prev };
        for (const game of normalized) {
          next[game.id] ??= {};
        }
        return next;
      });

      setKnockoutByGame((prev) => {
        const next = { ...prev };
        for (const game of normalized) {
          next[game.id] ??= { killerPlayerId: "", victimPlayerId: "" };
        }
        return next;
      });
    } catch (err: any) {
      showError(err.message || "Failed to fetch active games");
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

  const getAvailableUsersForGame = (game: Game) => {
    return users.filter((u) => {
      const alreadyInThisGame = game.players?.some(
        (p) => p.userId === u.id && p.isActive
      );

      const activeInAnotherGame = activeGames.some(
        (g) =>
          g.id !== game.id &&
          g.players?.some((p) => p.userId === u.id && p.isActive)
      );

      return !alreadyInThisGame && !activeInAnotherGame;
    });
  };

  const startGameHandler = async () => {
    try {
      await startGame(newGameType);
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to start game");
    }
  };

  const handleOpenGame = async (gameId: number) => {
    try {
      setOpeningGameByGame((prev) => ({ ...prev, [gameId]: true }));
      await openGameForPlayers(gameId);
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to open game");
    } finally {
      setOpeningGameByGame((prev) => ({ ...prev, [gameId]: false }));
    }
  };

  const handleStartRound = async (gameId: number) => {
    try {
      setStartingRoundByGame((prev) => ({ ...prev, [gameId]: true }));
      await startRound(gameId);
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to start round");
    } finally {
      setStartingRoundByGame((prev) => ({ ...prev, [gameId]: false }));
    }
  };

  const addScoreHandler = async (gameId: number, playerId: number) => {
    const value = Number(scoreInputsByGame[gameId]?.[playerId]);
    if (!value) return;

    try {
      setLoadingActionByGame((prev) => ({ ...prev, [gameId]: true }));
      await addScoreAdmin(gameId, playerId, value);

      setScoreInputsByGame((prev) => ({
        ...prev,
        [gameId]: {
          ...(prev[gameId] ?? {}),
          [playerId]: "",
        },
      }));

      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to add score");
    } finally {
      setLoadingActionByGame((prev) => ({ ...prev, [gameId]: false }));
    }
  };

  const addAllScoresHandler = async (gameId: number) => {
    const gameInputs = scoreInputsByGame[gameId] ?? {};
    const scoresToAdd = Object.entries(gameInputs)
      .map(([playerId, points]) => ({
        playerId: Number(playerId),
        points: Number(points),
      }))
      .filter((s) => s.points > 0);

    if (!scoresToAdd.length) return;

    try {
      setLoadingActionByGame((prev) => ({ ...prev, [gameId]: true }));
      await addPointsBulk(gameId, scoresToAdd);
      setScoreInputsByGame((prev) => ({
        ...prev,
        [gameId]: {},
      }));
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to add bulk points");
    } finally {
      setLoadingActionByGame((prev) => ({ ...prev, [gameId]: false }));
    }
  };

  const handleEndGameClick = (game: Game) => {
    setGameToEnd(game);
    setEndGameConfirmOpen(true);
  };

  const confirmEndOrCancelGame = async () => {
    if (!gameToEnd || endingGameByGame[gameToEnd.id]) return;

    const gameId = gameToEnd.id;
    const hasScores = (gameToEnd.scores?.length ?? 0) > 0;

    try {
      setEndingGameByGame((prev) => ({ ...prev, [gameId]: true }));

      if (!hasScores) {
        await cancelGame(gameId);
      } else {
        await endGame(gameId);
      }

      setActiveGameId(null);
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to end/cancel game");
    } finally {
      setEndingGameByGame((prev) => ({ ...prev, [gameId]: false }));
      setEndGameConfirmOpen(false);
      setGameToEnd(null);
    }
  };

  const handleAddPlayersAsAdmin = async (gameId: number) => {
    const selectedUserIds = selectedUserIdsByGame[gameId] ?? [];
    if (selectedUserIds.length === 0) return;

    try {
      await AddPlayersToGameAsAdmin(gameId, selectedUserIds);
      setSelectedUserIdsByGame((prev) => ({ ...prev, [gameId]: [] }));
      await fetchActiveGames();
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
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to remove points");
    } finally {
      setConfirmOpen(false);
      setScoreToRemove(null);
    }
  };

  const handleRebuy = async (gameId: number, playerId: number) => {
    try {
      setLoadingActionByGame((prev) => ({ ...prev, [gameId]: true }));
      await rebuyAsAdmin(gameId, playerId);
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to rebuy");
    } finally {
      setLoadingActionByGame((prev) => ({ ...prev, [gameId]: false }));
    }
  };

  const handleSaveRules = async (gameId: number) => {
    const rules = rulesByGame[gameId];
    if (!rules) return;

    try {
      setSavingRulesByGame((prev) => ({ ...prev, [gameId]: true }));
      await updateRules(
        gameId,
        Number(rules.rebuyValue),
        Number(rules.bountyValue)
      );
      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to save rules");
    } finally {
      setSavingRulesByGame((prev) => ({ ...prev, [gameId]: false }));
    }
  };

  const registerKnockoutHandler = async (gameId: number) => {
    const knockout = knockoutByGame[gameId];
    if (!knockout || !knockout.killerPlayerId || !knockout.victimPlayerId) return;

    try {
      setKnockoutLoadingByGame((prev) => ({ ...prev, [gameId]: true }));
      await registerAdminKnockout(
        gameId,
        knockout.killerPlayerId,
        knockout.victimPlayerId
      );

      setKnockoutByGame((prev) => ({
        ...prev,
        [gameId]: { killerPlayerId: "", victimPlayerId: "" },
      }));

      await fetchActiveGames();
    } catch (err: any) {
      showError(err.message || "Failed to register knockout");
    } finally {
      setKnockoutLoadingByGame((prev) => ({ ...prev, [gameId]: false }));
    }
  };

  const handleCancelRemovePlayer = () => {
    setRemovePlayerConfirmOpen(false);
    setPlayerToRemove(null);
    setGameIdForPlayerRemoval(null);
  };

  const handleConfirmRemovePlayer = async () => {
    if (!playerToRemove || gameIdForPlayerRemoval === null) return;

    try {
      await removePlayer(gameIdForPlayerRemoval, playerToRemove.playerId);
      setActiveGameId(null);
      await fetchActiveGames();
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
      await fetchAllGames();
    } catch (err: any) {
      showError(err.message || "Failed to remove game");
    } finally {
      handleCancelRemoveGame();
    }
  };

  if (!isLoggedIn || (role !== "Admin" && role !== "Gamemaster")) return null;

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", px: 1, mt: 4 }}>
      <Typography mb={3} sx={{ fontSize: { xs: "1.5rem", md: "2.125rem", textAlign: "center" }, fontWeight: 500 }}>
        Game Control Panel
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            New Game
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="new-game-type-label">Game Type</InputLabel>
              <Select
                labelId="new-game-type-label"
                value={newGameType}
                label="Game Type"
                onChange={(e) => setNewGameType(e.target.value as GameType)}
              >
                <MenuItem value="Poker">Poker</MenuItem>
                <MenuItem value="BlackJack">BlackJack</MenuItem>
                <MenuItem value="Roulette">Roulette</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" color="success" onClick={startGameHandler}>
              Start New Game
            </Button>
          </Stack>
        </CardContent>
      </Card>


      {activeGames.length === 0 ? (
        <Typography color="text.secondary" mb={4}>
          No active games
        </Typography>
      ) : (
        activeGames.map((game) => {
          const activePlayers = game.players?.filter((p) => p.isActive) ?? [];
          const availableUsers = getAvailableUsersForGame(game);
          const rules = rulesByGame[game.id] ?? {
            rebuyValue: game.rebuyValue ?? "",
            bountyValue: game.bountyValue ?? "",
          };
          const knockout = knockoutByGame[game.id] ?? {
            killerPlayerId: "",
            victimPlayerId: "",
          };
          const scoreInputs = scoreInputsByGame[game.id] ?? {};
          const selectedUserIds = selectedUserIdsByGame[game.id] ?? [];
          const totalScores = game.scores?.length ?? 0;

          const getPlayerTotalPoints = (playerId: number) => {
            return (game.scores ?? [])
              .filter((s) => s.playerId === playerId)
              .reduce((sum, s) => sum + s.points, 0);
          };

          return (
            <Card key={game.id} sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ mb: 2.5 }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontFamily: "Playfair Display, Georgia, serif",
                        }}
                      >
                        Game #{game.gameNumber}
                      </Typography>

                      <Box
                        sx={{
                          px: 1.2,
                          py: 0.35,
                          borderRadius: 1.5,
                          border: "1px solid rgba(212, 175, 55, 0.28)",
                          backgroundColor: "rgba(212, 175, 55, 0.06)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "primary.main",
                            fontWeight: 700,
                          }}
                        >
                          {game.type}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: game.isOpenForPlayers ? "success.main" : "warning.main",
                            boxShadow: game.isOpenForPlayers
                              ? "0 0 10px rgba(76, 175, 80, 0.5)"
                              : "0 0 10px rgba(244, 185, 66, 0.5)",
                          }}
                        />
                        <Typography
                          sx={{
                            color: game.isOpenForPlayers ? "success.main" : "warning.main",
                            fontWeight: 600,
                          }}
                        >
                          {game.isOpenForPlayers ? "Open" : "Setup only"}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Started: {new Date(game.startedAt).toLocaleString("da-DK")}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(3, minmax(0, 1fr))",
                        sm: "repeat(3, minmax(0, 1fr))",
                        md: "repeat(6, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    {[
                      {
                        label: "Round",
                        value: game.rounds?.length
                          ? `#${game.rounds[game.rounds.length - 1].roundNumber}`
                          : "-",
                        color: "primary.main",
                      },
                      // {
                      //   label: "Players",
                      //   value: String(activePlayers.length),
                      // },
                      {
                        label: "Rebuy",
                        value: game.rebuyValue ? `${game.rebuyValue}` : "-",
                      },
                      {
                        label: "Bounty",
                        value: game.bountyValue ? `${game.bountyValue}` : "-",
                      },
                      // {
                      //   label: "Scores",
                      //   value: String(totalScores),
                      // },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          px: 2,
                          py: 1.2,
                          borderRadius: 2,
                          border: "1px solid rgba(212, 175, 55, 0.16)",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            letterSpacing: "0.06em",
                            color: "text.secondary",
                            textTransform: "uppercase",
                            mr: 0.75,
                          }}
                        >
                          {item.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: item.color || "text.primary",
                            fontSize: "1rem",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

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
                        value={rules.rebuyValue}
                        onChange={(e) =>
                          setRulesByGame((prev) => ({
                            ...prev,
                            [game.id]: {
                              ...(prev[game.id] ?? { rebuyValue: "", bountyValue: "" }),
                              rebuyValue: e.target.value === "" ? "" : Number(e.target.value),
                            },
                          }))
                        }
                        sx={{ width: { xs: "100%", sm: 150 } }}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Bounty value"
                        value={rules.bountyValue}
                        onChange={(e) =>
                          setRulesByGame((prev) => ({
                            ...prev,
                            [game.id]: {
                              ...(prev[game.id] ?? { rebuyValue: "", bountyValue: "" }),
                              bountyValue: e.target.value === "" ? "" : Number(e.target.value),
                            },
                          }))
                        }
                        sx={{ width: { xs: "100%", sm: 150 } }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleSaveRules(game.id)}
                        disabled={!!savingRulesByGame[game.id]}
                        color="success"
                      >
                        Save rules
                      </Button>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Current rules: Rebuy = {game.rebuyValue ?? "-"} / Bounty ={" "}
                      {game.bountyValue ?? "-"}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Add players</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
                      <Select
                        multiple
                        value={selectedUserIds}
                        onChange={(e) =>
                          setSelectedUserIdsByGame((prev) => ({
                            ...prev,
                            [game.id]: e.target.value as number[],
                          }))
                        }
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
                            {u.username}
                          </MenuItem>
                        ))}
                      </Select>

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddPlayersAsAdmin(game.id)}
                        disabled={selectedUserIds.length === 0}
                      >
                        Add Players
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {game.bountyValue > 0 && (
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
                          value={knockout.killerPlayerId}
                          displayEmpty
                          onChange={(e) =>
                            setKnockoutByGame((prev) => ({
                              ...prev,
                              [game.id]: {
                                ...(prev[game.id] ?? {
                                  killerPlayerId: "",
                                  victimPlayerId: "",
                                }),
                                killerPlayerId: Number(e.target.value),
                              },
                            }))
                          }
                          sx={{ width: { xs: "100%", sm: 180 } }}
                        >
                          <MenuItem value="" disabled>
                            Killer...
                          </MenuItem>
                          {activePlayers.map((p) => (
                            <MenuItem key={`${p.playerId}-${p.username}`} value={p.playerId}>
                              {p.username}
                            </MenuItem>
                          ))}
                        </Select>

                        <Select
                          value={knockout.victimPlayerId}
                          displayEmpty
                          onChange={(e) =>
                            setKnockoutByGame((prev) => ({
                              ...prev,
                              [game.id]: {
                                ...(prev[game.id] ?? {
                                  killerPlayerId: "",
                                  victimPlayerId: "",
                                }),
                                victimPlayerId: Number(e.target.value),
                              },
                            }))
                          }
                          sx={{ width: { xs: "100%", sm: 180 } }}
                        >
                          <MenuItem value="" disabled>
                            Victim...
                          </MenuItem>
                          {activePlayers
                            .filter((p) => p.playerId !== knockout.killerPlayerId)
                            .map((p) => (
                              <MenuItem key={p.playerId} value={p.playerId}>
                                {p.username}
                              </MenuItem>
                            ))}
                        </Select>

                        <Button
                          variant="contained"
                          onClick={() => registerKnockoutHandler(game.id)}
                          disabled={
                            !!knockoutLoadingByGame[game.id] ||
                            !knockout.killerPlayerId ||
                            !knockout.victimPlayerId
                          }
                        >
                          Register Knockout
                        </Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Players ({activePlayers.length})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      mb={2}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2">Add multiple scores:</Typography>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => addAllScoresHandler(game.id)}
                        disabled={
                          Object.values(scoreInputs).filter((v) => Number(v) > 0).length === 0
                        }
                      >
                        Bulk Add Points
                      </Button>
                    </Box>

                    {activePlayers.map((p) => (
                      <Box
                        key={p.playerId}
                        sx={{
                          width: "100%",
                          overflowX: "auto",
                          mb: 1,
                          p: 1,
                          borderRadius: 2,
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          alignItems={{ xs: "stretch", sm: "center" }}
                        >
                          <Typography sx={{ minWidth: { xs: "100%", sm: 220 } }}>
                            {p.username.charAt(0).toUpperCase() + p.username.slice(1)}{": score "}
                            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                              {getPlayerTotalPoints(p.playerId)}
                            </Box>
                          </Typography>

                          <TextField
                            size="small"
                            label="Points..."
                            value={scoreInputs[p.playerId] || ""}
                            onChange={(e) =>
                              setScoreInputsByGame((prev) => ({
                                ...prev,
                                [game.id]: {
                                  ...(prev[game.id] ?? {}),
                                  [p.playerId]: e.target.value,
                                },
                              }))
                            }
                            sx={{ width: { xs: "100%", sm: 150 } }}
                          />

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
                              onClick={() => addScoreHandler(game.id, p.playerId)}
                            >
                              Add Points
                            </Button>

                            {game.rebuyValue > 0 && (
                              <Button
                                variant="outlined"
                                color="warning"
                                onClick={() => handleRebuy(game.id, p.playerId)}
                                disabled={!!loadingActionByGame[game.id] || game.isFinished}
                              >
                                Rebuy (-{game.rebuyValue})
                              </Button>
                            )}

                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                setPlayerToRemove(p);
                                setGameIdForPlayerRemoval(game.id);
                                setRemovePlayerConfirmOpen(true);
                              }}
                            >
                              Remove
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Score Entries ({totalScores})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {(game.rounds ?? []).map((round) => (
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
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ ml: 2, mb: 1 }}
                            >
                              <Box>
                                <Typography fontWeight="bold">{s.userName}</Typography>

                                <Typography
                                  sx={{
                                    ml: 1,
                                    color: s.points >= 0 ? "success.main" : "error.main",
                                  }}
                                >
                                  {s.points >= 0 ? "+" : ""}
                                  {s.points} <span style={{ opacity: 0.6 }}>({s.type})</span>
                                </Typography>
                              </Box>

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

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
                  {!game.isOpenForPlayers && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleOpenGame(game.id)}
                      disabled={!!openingGameByGame[game.id]}
                    >
                      Activate Game
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStartRound(game.id)}
                    disabled={!game.isOpenForPlayers || !!startingRoundByGame[game.id]}
                  >
                    Start Round: {game.rounds?.length ? game.rounds.length + 1 : 1}
                  </Button>

                  <Button
                    color={totalScores === 0 ? "warning" : "error"}
                    variant="contained"
                    onClick={() => handleEndGameClick(game)}
                    disabled={!!endingGameByGame[game.id]}
                  >
                    {totalScores === 0 ? "Cancel game" : "End game"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })
      )}


      {/* ABILITY TO FETCH ALL GAMES INCLUDING THE ACTIVE ONE */}
      {/* <Stack
        mt={2}
        mb={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, fontWeight: 500 }}
        >
          All Games
        </Typography>

        <Button variant="contained" color="success" onClick={fetchAllGames}>
          Fetch All Games
        </Button>
      </Stack> */}
      {[...games]
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .map((g) => (
          <Card key={g.id} sx={{ mt: 1 }}>
            <CardContent>
              {/* 🔝 HEADER */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography sx={{ fontWeight: 500 }}>
                  Game #{g.gameNumber} · {g.type} ·{" "}
                  {new Date(g.startedAt).toLocaleDateString("da-DK", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                    color: g.isFinished ? "error.main" : "success.main",
                  }}
                >
                  {g.isFinished ? "Finished" : "Active"}
                </Typography>
              </Stack>

              {/* 🔽 BUTTONS */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Box sx={{ flex: 1 }} />

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  <Box sx={{ flex: { xs: 1, sm: "0 0 auto" } }}>
                    <Link
                      href={`/game/game-results/${g.id}`}
                      passHref
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                      >
                        Game results
                      </Button>
                    </Link>
                  </Box>

                  {g.isFinished && role === "Admin" && (
                    <Box sx={{ flex: { xs: 1, sm: "0 0 auto" } }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveGameClick(g)}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

      <Dialog open={removePlayerConfirmOpen} onClose={handleCancelRemovePlayer}>
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

      <Dialog open={confirmOpen} onClose={handleCancelRemove}>
        <DialogTitle>Remove Points</DialogTitle>
        <DialogContent>
          Are you sure you want to remove {scoreToRemove?.points} points from{" "}
          {scoreToRemove?.userName}?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button color="error" onClick={handleRemovePoint}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={endGameConfirmOpen} onClose={() => setEndGameConfirmOpen(false)}>
        <DialogTitle>
          {(gameToEnd?.scores?.length ?? 0) === 0 ? "Cancel Game" : "End Game"}
        </DialogTitle>
        <DialogContent>
          {(gameToEnd?.scores?.length ?? 0) === 0
            ? "Are you sure you want to cancel this game? All progress will be lost."
            : "Are you sure you want to end this game?"}
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            onClick={confirmEndOrCancelGame}
            disabled={!!(gameToEnd && endingGameByGame[gameToEnd.id])}
          >
            {(gameToEnd?.scores?.length ?? 0) === 0 ? "Yes" : "End Game"}
          </Button>
          <Button
            onClick={() => {
              setEndGameConfirmOpen(false);
              setGameToEnd(null);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeGameConfirmOpen} onClose={handleCancelRemoveGame}>
        <DialogTitle>Delete Game Permanently</DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete Game #{gameToRemove?.gameNumber}? This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleConfirmRemoveGame}>
            Delete
          </Button>
          <Button onClick={handleCancelRemoveGame}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}