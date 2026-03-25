"use client";

import { useState, useEffect } from "react";
import { Box, Stack, Button, Card, CardContent, Typography } from "@mui/material";
import { getActiveLobbyGames, joinGameAsPlayer, getGameDetails } from "@/lib/api/games";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useError } from "@/context/ErrorContext";
import { GameDetails } from "@/lib/models/game"; // Sørg for at have GameDetails typen

export default function LobbyPage() {
  const { userId, setActiveGameId } = useAuth();
  const router = useRouter();
  const { showError } = useError();


  const [lobbyGames, setLobbyGames] = useState<GameDetails[] | null>(null);
  const [loadingLobby, setLoadingLobby] = useState(false);
  const [joiningGameId, setJoiningGameId] = useState<number | null>(null);
  // ----- Fetch Lobby -----
  const fetchLobby = async () => {
    setLoadingLobby(true);
    try {
      const games = await getActiveLobbyGames();
      setLobbyGames(games);
    } catch (err: any) {
      showError(err.message || "Failed to fetch lobby");
    } finally {
      setLoadingLobby(false);
    }
  };

  // ----- Join Game -----
  const handleJoinGame = async (gameId: number) => {
    if (!userId) return showError("You must be logged in to join a game");

    try {
      setJoiningGameId(gameId);

      await joinGameAsPlayer(gameId, userId);

      setActiveGameId(gameId);

      router.push(`/game/active-game`);
    } catch (err: any) {
      showError(err.message || "Failed to join game");
    } finally {
      setJoiningGameId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, px: 2 }}>
      <Typography variant="h4" mb={3} textAlign="center">
        Game Lobby
      </Typography>
      <Stack alignItems="center">
        <Button onClick={fetchLobby} disabled={loadingLobby}>
          {loadingLobby ? "Loading..." : "Show Lobby"}
        </Button>
      </Stack>
      {lobbyGames && lobbyGames.length > 0 ? (
        <Stack spacing={2} mt={2}>
          {lobbyGames.map(game => (
            <Card key={game.id}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography>Game #{game.gameNumber}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {game.type}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleJoinGame(game.id)}
                  disabled={joiningGameId === game.id}
                >
                  {joiningGameId === game.id ? "Joining..." : "Join Game"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography mt={2} textAlign="center">
          Click "Show Lobby" to refresh.
        </Typography>
      )}
    </Box>
  );
}