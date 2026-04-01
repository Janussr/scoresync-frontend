"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import Link from "next/link";

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  const games = [
    { icon: "♣", title: "Black Jack", link: "/game/blackjack" },
    { icon: "♦", title: "Poker", link: "/game/poker" },
    { icon: "◉", title: "Roulette", link: "/game/roulette" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at top, rgba(20,80,20,0.45), transparent 35%),
          linear-gradient(180deg, #062b10 0%, #031a09 100%)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 1.5, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "1400px",
          minHeight: "92vh",
          border: "2px solid rgba(183, 148, 28, 0.7)",
          borderRadius: { xs: "18px", md: "28px" },
          px: { xs: 2, sm: 4, md: 8 },
          py: { xs: 4, md: 7 },
          color: "#f4d03f",
          overflow: "hidden",

          "&::before": {
            content: '""',
            position: "absolute",
            inset: { xs: "10px", md: "16px" },
            border: "1px solid rgba(183, 148, 28, 0.35)",
            borderRadius: { xs: "12px", md: "22px" },
            pointerEvents: "none",
          },
        }}
      >
        {/* HERO */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 10 } }}>
          <Typography
            sx={{
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5.5rem" },
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              color: "#f1c40f",
              lineHeight: 1.1,
              textShadow: "0 0 20px rgba(255,215,0,0.2)",
            }}
          >
            Poker Pals
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              mb: 4,
              fontSize: { xs: "0.9rem", md: "1.3rem" },
              letterSpacing: { xs: "0.25em", md: "0.4em" },
              color: "rgba(212, 175, 55, 0.65)",
            }}
          >
            ♠ ♥ ♣ ♦
          </Typography>

          <Box
            sx={{
              width: { xs: 120, md: 220 },
              height: "1px",
              backgroundColor: "rgba(212, 175, 55, 0.45)",
              mx: "auto",
              mb: { xs: 4, md: 6 },
            }}
          />
        </Box>

        {/* LOGIN / REGISTER */}
        {!isLoggedIn && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.5}
            justifyContent="center"
            alignItems="center"
            mb={{ xs: 6, md: 10 }}
          >
            <Button
              component={Link}
              href="/account/login"
              variant="outlined"
              fullWidth={true}
              sx={{
                maxWidth: 220,
                py: 1.3,
                borderRadius: "14px",
                borderColor: "rgba(220, 190, 70, 0.45)",
                color: "#f8f1d4",
                fontWeight: 700,
                letterSpacing: "0.15em",
                fontFamily: "serif",
                "&:hover": {
                  borderColor: "#d4af37",
                  backgroundColor: "rgba(212, 175, 55, 0.08)",
                },
              }}
            >
              LOGIN
            </Button>

            <Button
              component={Link}
              href="/account/register"
              variant="outlined"
              fullWidth={true}
              sx={{
                maxWidth: 220,
                py: 1.3,
                borderRadius: "14px",
                borderColor: "rgba(220, 190, 70, 0.45)",
                color: "#f8f1d4",
                fontWeight: 700,
                letterSpacing: "0.15em",
                fontFamily: "serif",
                "&:hover": {
                  borderColor: "#d4af37",
                  backgroundColor: "rgba(212, 175, 55, 0.08)",
                },
              }}
            >
              REGISTER
            </Button>
          </Stack>
        )}

        {/* GAME CARDS */}
        {/* GAME CARDS */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 4 }}
          justifyContent="center"
          alignItems="center" // <-- vigtig fix til mobil
        >
          {games.map((game) => (
            <Card
              key={game.title}
              sx={{
                width: "100%",
                maxWidth: 300,
                mx: "auto", // <-- centrerer på mobil
                background:
                  "linear-gradient(180deg, rgba(15,55,20,0.75), rgba(7,32,12,0.9))",
                border: "2px solid rgba(183, 148, 28, 0.5)",
                borderRadius: "16px",
                overflow: "hidden",
                transition: "0.25s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  borderColor: "#d4af37",
                },
              }}
            >
              <CardActionArea
                component={Link}
                href={game.link}
                sx={{
                  height: "100%",
                }}
              >
                <CardContent
                  sx={{
                    py: { xs: 3, md: 3.5 }, // <-- mindre højde
                    px: 2,
                    minHeight: 160, // <-- fast lavere højde
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "2rem", mb: 1 }}>
                    {game.icon}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: "1.3rem", md: "1.6rem" },
                      fontWeight: 700,
                      color: "#f1c40f",
                      fontFamily: "Georgia, serif",
                      mb: 1.5,
                    }}
                  >
                    {game.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(212, 175, 55, 0.8)",
                      fontSize: "0.9rem",
                      letterSpacing: "0.15em",
                    }}
                  >
                    JOIN
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}