"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Chip,
  ButtonBase,
} from "@mui/material";

import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";

import { getGameDetails } from "@/lib/api/games";
import { getPlayerGameScoreDetails } from "@/lib/api/scores";
import { GameDetails } from "@/lib/models/game";
import { useError } from "@/context/ErrorContext";
import { PlayerScoreDetails } from "@/lib/models/score";

export default function GameResultspage() {
  const params = useParams();
  const gameId = Number(params.gameId);
  const router = useRouter();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [playerScores, setPlayerScores] = useState<PlayerScoreDetails | null>(null);
  const { showError } = useError();

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const data = await getGameDetails(gameId);
        setGame(data);
      } catch (err: any) {
        showError(err.message || "Failed to fetch game");
        router.push("/poker");
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(gameId)) fetchGame();
  }, [gameId, router, showError]);

  const openPlayerModal = async (playerId: number) => {
    if (!game) return;

    try {
      const data = await getPlayerGameScoreDetails(gameId, playerId);
      setPlayerScores(data);
      setModalOpen(true);
    } catch (err: any) {
      showError(err.message || "Failed to open dialog");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setPlayerScores(null);
  };

  const sortedScores = useMemo(() => {
    if (!game?.scores) return [];
    return [...game.scores].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [game]);

  const winner = sortedScores[0];

  const capitalize = (name: string) => {
    if (!name) return "";
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("da-DK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const getRankLabel = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  if (loading) {
    return <Typography sx={{ textAlign: "center", mt: 4 }}>Loading game...</Typography>;
  }

  if (!game) {
    return <Typography sx={{ textAlign: "center", mt: 4 }}>Game not found</Typography>;
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { md: 800 },
        mx: "auto",
        px: { xs: 1, md: 0 },
        mt: 4,
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(212, 175, 55, 0.18)",
          overflow: "hidden",
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 3, sm: 3.5 },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "0.72rem",
              color: "text.secondary",
              mb: 1,
            }}
          >
            Final standings
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem" },
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            ♠ Game #{game.gameNumber}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              lineHeight: 1.8,
            }}
          >
            Started {formatDateTime(game.startedAt)}
            {game.endedAt && <> · Ended {formatDateTime(game.endedAt)}</>}
          </Typography>
        </Box>

        {!!winner && (
          <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2 }}>
            <Card
              sx={{
                borderRadius: 2,
                border: "1px solid rgba(212, 175, 55, 0.24)",
                background:
                  "linear-gradient(90deg, rgba(24,70,22,0.82), rgba(9,34,14,0.96))",
              }}
            >
              <CardContent sx={{
                px: { xs: 2, sm: 2.5 }, py: 1, "&:last-child": {
                  pb: 1,
                },
              }}>
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: "rgba(212, 175, 55, 0.08)",
                      border: "1px solid rgba(212, 175, 55, 0.18)",
                      flexShrink: 0,
                    }}
                  >
                    <EmojiEventsRoundedIcon sx={{ color: "primary.main", fontSize: 30 }} />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        fontSize: "0.72rem",
                        color: "text.secondary",
                        mb: 0.25,
                      }}
                    >
                      Winner
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: { xs: "1.4rem", sm: "2rem" },
                        lineHeight: 1,
                        wordBreak: "break-word",
                      }}
                    >
                      {capitalize(winner.userName)}
                    </Typography>

                    <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                      {winner.totalPoints} Points
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2 }}>
          <Card
            sx={{
              borderRadius: 1.5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "58px 1fr 90px", sm: "70px 1fr 110px" },
                px: { xs: 1.5, sm: 2 },
                py: 1.25,
                borderBottom: "1px solid rgba(212, 175, 55, 0.12)",
                color: "text.secondary",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                #
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                Player
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  textAlign: "right",
                }}
              >
                Points
              </Typography>
            </Box>

            {sortedScores.map((s, idx) => {
              const isWinner = game.winner?.userId === s.playerId || idx === 0;

              return (
                <ButtonBase
                  key={`${s.id ?? idx}-${s.playerId}`}
                  onClick={() => openPlayerModal(s.playerId)}
                  sx={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: isWinner
                      ? "linear-gradient(90deg, rgba(212,175,55,0.06), rgba(212,175,55,0.01))"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(212, 175, 55, 0.04)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "58px 1fr 90px", sm: "70px 1fr 110px" },
                      alignItems: "center",
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 1.4, sm: 1.7 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: idx < 3 ? "primary.main" : "text.secondary",
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                      }}
                    >
                      {getRankLabel(idx)}
                    </Typography>

                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: "rgba(212, 175, 55, 0.08)",
                          color: "primary.main",
                          border: "1px solid rgba(212, 175, 55, 0.22)",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(capitalize(s.userName))}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: isWinner ? 700 : 600,
                            color: isWinner ? "primary.main" : "text.primary",
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {capitalize(s.userName)}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.82rem",
                            color: "text.secondary",
                          }}
                        >
                          tap for details 
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: isWinner ? "primary.main" : "text.primary",
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          lineHeight: 1,
                        }}
                      >
                        {s.totalPoints}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "text.secondary",
                          mt: 0.35,
                        }}
                      >
                        pts
                      </Typography>
                    </Box>
                  </Box>

                  {idx < sortedScores.length - 1 && (
                    <Divider sx={{ borderColor: "rgba(212, 175, 55, 0.10)" }} />
                  )}
                </ButtonBase>
              );
            })}
          </Card>
        </Box>
      </Box>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            textTransform: "capitalize",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {playerScores?.userName} – Score Details
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {playerScores?.rounds.map((round) => (
              <Card
                key={round.roundId}
                sx={{
                  borderRadius: 2.5,
                  boxShadow: "none",
                  border: "1px solid rgba(212, 175, 55, 0.14)",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        Round {round.roundNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(round.startedAt)}
                      </Typography>
                    </Box>

                    <Chip
                      label={`${round.totalPoints} Points`}
                      sx={{
                        color: "primary.main",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        backgroundColor: "rgba(212, 175, 55, 0.05)",
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Stack spacing={1}>
                    {round.entries.map((entry, idx) => (
                      <Box key={`${entry.id ?? idx}-${entry.createdAt}`}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={2}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {entry.points > 0 ? "+" : ""}
                              {entry.points} Points
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {entry.type === "Chips" && "🎯 Chips"}
                              {entry.type === "Rebuy" && "♻️ Rebuy"}
                              {entry.type === "Bounty" &&
                                `💀 Knocked out ${entry.victimUserName ?? "player"}`}
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                            {formatDateTime(entry.createdAt)}
                          </Typography>
                        </Stack>

                        {idx < round.entries.length - 1 && <Divider sx={{ mt: 1.25 }} />}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Typography sx={{ fontWeight: 700, textAlign: "right" }}>
              Total: {playerScores?.totalPoints} pts
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeModal} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}