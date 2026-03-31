"use client";

import { useEffect, useState } from "react";
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
} from "@mui/material";
import { HallOfFameEntry } from "@/lib/models/game";
import { getHallOfFame } from "@/lib/api/games";
import { useError } from "@/context/ErrorContext";

export default function HallOfFamePage() {
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const {showError} = useError();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHallOfFame();
        setHallOfFame(data);
      } catch (err: any) {
      showError(err.message || "failed to fetch hall of fame")
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🎖️";
  };

  return (
    <Box sx={{
    width: "100%",          
    maxWidth: { md: 500 },  
    mx: "auto",             
    px: { xs: 1, md: 0 },    
    mt: 4,
  }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
      >
        🏆 Hall of Fame
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : (
            <List>
              {hallOfFame.map((entry, i) => (
                <Box key={entry.playerName}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6"
                          sx={{textTransform: "capitalize"}}
                          >
                            {getMedal(i)} {entry.playerName}
                          </Typography>
                        </Stack>
                      }
                      secondary={`${entry.wins} wins`}
                    />
                    <Chip
                      label={`${entry.wins}`}
                      color={i === 0 ? "success" : i === 1 ? "warning" : "default"}
                    />
                  </ListItem>
                  {i < hallOfFame.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}