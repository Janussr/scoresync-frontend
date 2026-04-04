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
    return "rgba(255,255,255,0.78)";
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 820,
        mx: "auto",
        px: { xs: 1, sm: 1.5 },
        mt: { xs: 2, sm: 2.5 },
      }}
    >
      <Card
        sx={{
          borderRadius: 3,
          color: "#F5E7A1",
          border: "1px solid rgba(212,175,55,0.16)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.24)",
        }}
      >
        <Box sx={{ px: { xs: 1.25, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
          <Stack spacing={1.75}>
            <Box textAlign="center">
              <Typography
                sx={{
                  fontSize: { xs: "1.45rem", sm: "1.8rem" },
                  fontWeight: 700,
                  color: "#F7D64A",
                  lineHeight: 1.1,
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
                  gap: 0.65,
                  "& .MuiToggleButton-root": {
                    px: { xs: 1, sm: 1.5 },
                    py: 0.55,
                    borderRadius: "10px !important",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "rgba(255,255,255,0.86)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 700,
                    fontSize: { xs: "0.64rem", sm: "0.74rem" },
                    backgroundColor: "rgba(255,255,255,0.025)",
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
              <Stack alignItems="center" py={4}>
                <CircularProgress sx={{ color: "#D4AF37" }} />
              </Stack>
            ) : filteredHallOfFame.length === 0 ? (
              <Typography sx={{ textAlign: "center", py: 3 }}>
                No hall of fame entries found
              </Typography>
            ) : (
              <>
                <Stack
                  direction="row"
                  spacing={{ xs: 0.75, sm: 1.25 }}
                  justifyContent="center"
                  alignItems="end"
                  sx={{
                    maxWidth: 420,
                    mx: "auto",
                  }}
                >
                  {topThree[1] && (
                    <MiniPodiumCard
                      rank={2}
                      name={topThree[1].playerName}
                      wins={topThree[1].wins}
                      color={getRankColor(2)}
                      height={34}
                      mobile={isMobile}
                    />
                  )}

                  {topThree[0] && (
                    <MiniPodiumCard
                      rank={1}
                      name={topThree[0].playerName}
                      wins={topThree[0].wins}
                      color={getRankColor(1)}
                      height={48}
                      mobile={isMobile}
                    />
                  )}

                  {topThree[2] && (
                    <MiniPodiumCard
                      rank={3}
                      name={topThree[2].playerName}
                      wins={topThree[2].wins}
                      color={getRankColor(3)}
                      height={30}
                      mobile={isMobile}
                    />
                  )}
                </Stack>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid rgba(212,175,55,0.12)",
                    backgroundColor: "rgba(0,0,0,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: { xs: 1.1, sm: 1.5 },
                      py: 0.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      sx={{
                        px: { xs: 0.5, sm: 1 },
                        py: 0.8,
                        color: "rgba(212,175,55,0.62)",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      <Box sx={{ width: 34, flexShrink: 0 }}>#</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>Player</Box>
                      <Box sx={{ width: { xs: 70, sm: 84 }, textAlign: "right", flexShrink: 0 }}>
                        Wins
                      </Box>
                    </Stack>

                    {filteredHallOfFame.map((entry, i) => {
                      const rank = i + 1;
                      const medal =
                        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
                      const rankColor = getRankColor(rank);

                      return (
                        <Box key={`${entry.userId}-${entry.displayGameType}-${rank}`}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            sx={{
                              px: { xs: 0.5, sm: 1 },
                              py: { xs: 1, sm: 1.1 },
                            }}
                          >
                            <Box
                              sx={{
                                width: 34,
                                flexShrink: 0,
                                textAlign: "center",
                                fontWeight: 700,
                                color:
                                  rank > 3 ? "rgba(212,175,55,0.75)" : undefined,
                                fontSize: { xs: "0.88rem", sm: "0.95rem" },
                              }}
                            >
                              {medal}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.92rem", sm: "1rem" },
                                  fontWeight: 700,
                                  color: rank <= 3 ? "#F8E8B0" : "#F4F4F4",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  lineHeight: 1.15,
                                }}
                              >
                                {entry.playerName}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.15,
                                  fontSize: { xs: "0.7rem", sm: "0.76rem" },
                                  color: "rgba(212,175,55,0.68)",
                                  lineHeight: 1.1,
                                }}
                              >
                                {selectedGameType === "ALL"
                                  ? "All game types"
                                  : formatGameType(entry.gameType)}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                width: { xs: 70, sm: 84 },
                                textAlign: "right",
                                flexShrink: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: { xs: "1rem", sm: "1.2rem" },
                                  fontWeight: 800,
                                  color: rankColor,
                                  lineHeight: 1,
                                }}
                              >
                                {entry.wins}
                              </Typography>
                            </Box>
                          </Stack>

                          {i < filteredHallOfFame.length - 1 && (
                            <Divider sx={{ borderColor: "rgba(212,175,55,0.08)" }} />
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
        maxWidth: mobile ? 86 : 108,
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: mobile ? "0.66rem" : "0.76rem",
          fontWeight: 700,
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          mb: 0.15,
        }}
      >
        {name}
      </Typography>

      <Typography
        sx={{
          fontSize: mobile ? "0.64rem" : "0.7rem",
          color: "rgba(255,255,255,0.7)",
          mb: 0.45,
          lineHeight: 1.1,
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
            fontSize: mobile ? "0.88rem" : "0.98rem",
            fontWeight: 800,
            color,
            lineHeight: 1,
          }}
        >
          {rank}
        </Typography>
      </Box>
    </Box>
  );
}