"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
} from "@mui/material";
import { HallOfFameEntry, GameType } from "@/lib/models/game";
import { getHallOfFame } from "@/lib/api/games";
import { useError } from "@/context/ErrorContext";

type HallOfFameFilter = "ALL" | GameType;

export default function HallOfFamePage() {
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameType, setSelectedGameType] = useState<HallOfFameFilter>("ALL");
  const { showError } = useError();

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

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🎖️";
  };

  const formatGameType = (gameType: HallOfFameFilter) => {
    if (gameType === "ALL") return "All Game Types";
    if (gameType === "BlackJack") return "BlackJack";
    if (gameType === "Poker") return "Poker";
    if (gameType === "Roullette") return "Roullette";
    return gameType;
  };

  const gameTypes = useMemo<HallOfFameFilter[]>(() => {
    const uniqueTypes = [...new Set(hallOfFame.map((entry) => entry.gameType))];
    return ["ALL", ...uniqueTypes];
  }, [hallOfFame]);

  const filteredHallOfFame = useMemo(() => {
    if (selectedGameType !== "ALL") {
      return hallOfFame
        .filter((entry) => entry.gameType === selectedGameType)
        .sort((a, b) => b.wins - a.wins);
    }

    const grouped = new Map<number, HallOfFameEntry>();

    for (const entry of hallOfFame) {
      const existing = grouped.get(entry.userId);

      if (existing) {
        existing.wins += entry.wins;
      } else {
        grouped.set(entry.userId, {
          ...entry,
          gameType: "Poker", // midlertidig gyldig enum-værdi, bruges ikke visuelt i ALL-view
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.wins - a.wins);
  }, [hallOfFame, selectedGameType]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { md: 500 },
        mx: "auto",
        px: { xs: 1, md: 0 },
        mt: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
      >
        🏆 Hall of Fame
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <TextField
            select
            fullWidth
            label="Game Type"
            value={selectedGameType}
            onChange={(e) => setSelectedGameType(e.target.value as HallOfFameFilter)}
            sx={{ mb: 3 }}
          >
            {gameTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {formatGameType(type)}
              </MenuItem>
            ))}
          </TextField>

          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : filteredHallOfFame.length === 0 ? (
            <Typography sx={{ textAlign: "center", py: 3 }}>
              No hall of fame entries found
            </Typography>
          ) : (
            <List>
              {filteredHallOfFame.map((entry, i) => (
                <Box
                  key={`${entry.userId}-${selectedGameType === "ALL" ? "ALL" : entry.gameType}`}
                >
                  <ListItem>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography
                            variant="h6"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {getMedal(i)} {entry.playerName}
                          </Typography>

                          {selectedGameType !== "ALL" && (
                            <Chip
                              size="small"
                              label={formatGameType(entry.gameType)}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      }
                      secondary={`${entry.wins} wins`}
                    />

                    <Chip
                      label={`${entry.wins}`}
                      color={
                        i === 0 ? "success" : i === 1 ? "warning" : "default"
                      }
                    />
                  </ListItem>

                  {i < filteredHallOfFame.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}