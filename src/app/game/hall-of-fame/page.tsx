"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { HallOfFameEntry, GameType } from "@/lib/models/game";
import { getHallOfFame } from "@/lib/api/games";
import { useError } from "@/context/ErrorContext";

type HallOfFameFilter = "ALL" | GameType;

type DisplayEntry = HallOfFameEntry & {
  displayGameType?: HallOfFameFilter;
};

export default function HallOfFamePage() {
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameType, setSelectedGameType] =
    useState<HallOfFameFilter>("ALL");
  const { showError } = useError();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHallOfFame();
        setHallOfFame(data);
      } catch (err: any) {
        showError(err.message || "Failed to fetch hall of fame");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  const formatGameType = (gameType: HallOfFameFilter) => {
    if (gameType === "ALL") return "All";
    if (gameType === "BlackJack") return "Blackjack";
    if (gameType === "Poker") return "Poker";
    if (gameType === "Roullette") return "Roulette";
    return gameType;
  };

  const gameTypes = useMemo<HallOfFameFilter[]>(() => {
    const uniqueTypes = [...new Set(hallOfFame.map((entry) => entry.gameType))];
    return ["ALL", ...uniqueTypes];
  }, [hallOfFame]);

  const filteredHallOfFame = useMemo<DisplayEntry[]>(() => {
    if (selectedGameType !== "ALL") {
      return hallOfFame
        .filter((entry) => entry.gameType === selectedGameType)
        .sort((a, b) => b.wins - a.wins)
        .map((entry) => ({
          ...entry,
          displayGameType: entry.gameType,
        }));
    }

    const grouped = new Map<number, DisplayEntry>();

    for (const entry of hallOfFame) {
      const existing = grouped.get(entry.userId);

      if (existing) {
        existing.wins += entry.wins;
      } else {
        grouped.set(entry.userId, {
          ...entry,
          gameType: "Poker",
          displayGameType: "ALL",
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.wins - a.wins);
  }, [hallOfFame, selectedGameType]);

  const topThree = filteredHallOfFame.slice(0, 3);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#D4AF37";
    if (rank === 2) return "#BFC7D5";
    if (rank === 3) return "#B87333";
    return "rgba(255,255,255,0.8)";
  };

  const formatPlayerName = (name: string) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 980,
        mx: "auto",
        px: { xs: 1, sm: 2 },
        mt: 4,
      }}
    >
      <Card
        sx={{
          borderRadius: 4,
          color: "#F5E7A1",
          border: "1px solid rgba(212,175,55,0.18)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 4 }, py: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography
                sx={{
                  fontSize: { xs: "1.9rem", sm: "2.5rem" },
                  fontWeight: 700,
                  color: "#F7D64A",
                }}
              >
                Hall of Fame
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <ToggleButtonGroup
                exclusive
                value={selectedGameType}
                onChange={(_, value) => {
                  if (value) setSelectedGameType(value);
                }}
                sx={{
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButton-root": {
                    px: { xs: 1.5, sm: 2.5 },
                    py: 0.8,
                    borderRadius: "14px !important",
                    border: "1px solid rgba(255,255,255,0.16)",
                    color: "rgba(255,255,255,0.88)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    fontSize: { xs: "0.72rem", sm: "0.85rem" },
                    backgroundColor: "rgba(255,255,255,0.03)",
                    "&.Mui-selected": {
                      color: "#F7D64A",
                      backgroundColor: "rgba(212,175,55,0.10)",
                      borderColor: "rgba(212,175,55,0.35)",
                    },
                  },
                }}
              >
                {gameTypes.map((type) => (
                  <ToggleButton key={type} value={type}>
                    {formatGameType(type)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {loading ? (
              <Stack alignItems="center" py={5}>
                <CircularProgress sx={{ color: "#D4AF37" }} />
              </Stack>
            ) : filteredHallOfFame.length === 0 ? (
              <Typography sx={{ textAlign: "center", py: 4 }}>
                No hall of fame entries found
              </Typography>
            ) : (
              <>
                <Stack
                  direction="row"
                  spacing={{ xs: 1, sm: 2 }}
                  justifyContent="center"
                  alignItems="end"
                  sx={{
                    maxWidth: 560,
                    mx: "auto",
                  }}
                >
                  {topThree[1] && (
                    <MiniPodiumCard
                      rank={2}
                      name={topThree[1].playerName}
                      wins={topThree[1].wins}
                      color={getRankColor(2)}
                      height={44}
                      mobile={isMobile}
                    />
                  )}

                  {topThree[0] && (
                    <MiniPodiumCard
                      rank={1}
                      name={topThree[0].playerName}
                      wins={topThree[0].wins}
                      color={getRankColor(1)}
                      height={60}
                      mobile={isMobile}
                    />
                  )}

                  {topThree[2] && (
                    <MiniPodiumCard
                      rank={3}
                      name={topThree[2].playerName}
                      wins={topThree[2].wins}
                      color={getRankColor(3)}
                      height={36}
                      mobile={isMobile}
                    />
                  )}
                </Stack>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(212,175,55,0.14)",
                    backgroundColor: "rgba(0,0,0,0.14)",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ px: { xs: 1.5, sm: 2.5 } }}>
                    {filteredHallOfFame.map((entry, i) => {
                      const rank = i + 1;
                      const medal =
                        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
                      const rankColor = getRankColor(rank);

                      return (
                        <Box key={`${entry.userId}-${entry.displayGameType}-${rank}`}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
                            sx={{ py: { xs: 1.5, sm: 2 } }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  textAlign: "center",
                                  fontWeight: 700,
                                  color: rank > 3 ? "rgba(212,175,55,0.75)" : undefined,
                                  flexShrink: 0,
                                }}
                              >
                                {medal}
                              </Box>

                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: { xs: "1rem", sm: "1.3rem" },
                                    fontWeight: 700,
                                    color: rank <= 3 ? "#F8E8B0" : "#F4F4F4",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {entry.playerName}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.82rem", sm: "0.95rem" },
                                    color: "rgba(212,175,55,0.7)",
                                  }}
                                >
                                  {selectedGameType === "ALL"
                                    ? "All game types"
                                    : formatGameType(entry.gameType)}
                                </Typography>
                              </Box>
                            </Stack>

                            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: { xs: "1.25rem", sm: "1.8rem" },
                                  fontWeight: 800,
                                  color: rankColor,
                                  lineHeight: 1,
                                }}
                              >
                                {entry.wins}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.68rem", sm: "0.8rem" },
                                  textTransform: "uppercase",
                                  letterSpacing: "0.18em",
                                  color: "rgba(212,175,55,0.65)",
                                }}
                              >
                                Wins
                              </Typography>
                            </Box>
                          </Stack>

                          {i < filteredHallOfFame.length - 1 && (
                            <Divider sx={{ borderColor: "rgba(212,175,55,0.10)" }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Card>
              </>
            )}
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}

type MiniPodiumCardProps = {
  rank: number;
  name: string;
  wins: number;
  color: string;
  height: number;
  mobile: boolean;
};

function MiniPodiumCard({
  rank,
  name,
  wins,
  color,
  height,
  mobile,
}: MiniPodiumCardProps) {
  return (
    <Box
      sx={{
        flex: 1,
        maxWidth: mobile ? 110 : 150,
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: mobile ? "0.75rem" : "0.9rem",
          fontWeight: 700,
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          mb: 0.25,
        }}
      >
        {name}
      </Typography>

      <Typography
        sx={{
          fontSize: mobile ? "0.72rem" : "0.82rem",
          color: "rgba(255,255,255,0.72)",
          mb: 0.75,
        }}
      >
        {wins} wins
      </Typography>

      <Box
        sx={{
          height,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          border: `1px solid ${color}55`,
          background: `linear-gradient(180deg, ${color}20 0%, rgba(255,255,255,0.02) 100%)`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: mobile ? "1rem" : "1.2rem",
            fontWeight: 800,
            color,
          }}
        >
          {rank}
        </Typography>
      </Box>
    </Box>
  );
}