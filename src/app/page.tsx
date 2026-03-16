"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import Link from "next/link";

export default function HomePage() {

  const { isLoggedIn, role } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "90vh",
        // background: "radial-gradient(circle at top, #8b0000, #1a0000 70%)",
        // background: "#07250e",
        color: "white",
        textAlign: "center",
        py: 10,
      }}
    >
      {/* HERO SECTION */}
      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          color: "gold",
          textShadow: "0 0 20px rgba(255,215,0,0.6)",
          mb: 7,
        }}
      >
        ♠ Poker Pals ♦
      </Typography>

      {!isLoggedIn && (
        <Stack direction="row" spacing={3} justifyContent="center" mb={10}>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            sx={{
              backgroundColor: "gold",
              color: "black",
              fontWeight: "bold",
              px: 4,
              "&:hover": {
                backgroundColor: "#ffd700",
                transform: "scale(1.05)",
              },
              transition: "0.2s",
            }}
          >
            Login
          </Button>

          <Button
            component={Link}
            href="/register"
            variant="outlined"
            sx={{
              borderColor: "gold",
              color: "gold",
              fontWeight: "bold",
              px: 4,
              "&:hover": {
                backgroundColor: "rgba(255,215,0,0.1)",
                // backgroundColor: "#0b3d0b",
                transform: "scale(1.05)",
              },
              transition: "0.2s",
            }}
          >
            Register
          </Button>
        </Stack>
      )}
      {/* GAME PREVIEW CARDS */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        justifyContent="center"
        alignItems="center"
      >
        {[
          { title: "♣ Black Jack", link: "/blackjack" },
          { title: "♦ Poker", link: "/poker" },
          { title: "♠ Roulette", link: "/roulette" },
        ].map((game) => (
          <Card
            key={game.title}
            sx={{
              width: 280,
              // background: "linear-gradient(145deg, #4a1f1f, #2a0f0f)",
              background: "#0b3d0b",

              
              border: "2px solid gold",
              borderRadius: 4,
              boxShadow: "0 0 20px rgba(255,215,0,0.3)",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-10px) scale(1.05)",
                boxShadow: "0 0 30px rgba(255,215,0,0.6)",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{ color: "gold", fontWeight: "bold", mb: 2 }}
              >
                {game.title}
              </Typography>

              <Button
                component={Link}
                href={game.link}
                fullWidth
                variant="contained"
                // sx={{
                //   backgroundColor: "#8b0000",
                //   "&:hover": {
                //     backgroundColor: "#a30000",
                //   },
                  sx={{
            backgroundColor: "#596b06", // mørk rød
color: "gold",
"&:hover": {
  backgroundColor: "#1ba300",
}
                }}
              >
                Join
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
