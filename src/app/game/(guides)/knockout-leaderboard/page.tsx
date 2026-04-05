"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
} from "@mui/material";
import { getKnockoutLeaderboard } from "@/lib/api/bounties";
import { useError } from "@/context/ErrorContext";
import { BountyRow } from "@/lib/models/bounty";

export default function BountyLeaderboard() {
  const [data, setData] = useState<BountyRow[]>([]);
  const { showError } = useError();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const rows = await getKnockoutLeaderboard();

        const totalMap: Record<number, BountyRow> = {};

        rows.forEach((row) => {
          if (!totalMap[row.userId]) {
            totalMap[row.userId] = { ...row };
          } else {
            totalMap[row.userId].knockouts += row.knockouts;
            totalMap[row.userId].timesKnockedOut += row.timesKnockedOut;
          }
        });

        const sorted = Object.values(totalMap).sort((a, b) => {
          if (b.knockouts !== a.knockouts) {
            return b.knockouts - a.knockouts;
          }
          return a.timesKnockedOut - b.timesKnockedOut;
        });

        setData(sorted);
      } catch (err: any) {
        showError(err.message || "Failed to fetch leaderboard");
      }
    };

    fetchLeaderboard();
  }, [showError]);

  const topPlayer = data[0];

  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <Box sx={{ mt: 2, px: 1 }}>
      <Box
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: 2,
          p: 2,
          border: "1px solid rgba(212,175,55,0.15)",
        }}
      >
        {/* TITLE */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            sx={{
              color: "#f2cc0c",
              fontWeight: 700,
              fontSize: "1.8rem",
              fontFamily: "Georgia, serif",
            }}
          >
             Bounty Board
          </Typography>
        </Box>

        {/* TOP PLAYER */}
        {topPlayer && (
      <Card
  sx={{
    mb: 2,
    borderRadius: 2,
    border: "1px solid rgba(212,175,55,0.2)",
  }}
>
  <CardContent sx={{ py: 1.5, px: 2 }}>
    <Stack
      direction="column"
      alignItems="center"
      textAlign="center"
      spacing={0.5}
    >
      <Typography
        sx={{
          color: "rgba(212,175,55,0.7)",
          fontSize: 11,
          letterSpacing: "0.15em",
        }}
      >
        MOST LETHAL PLAYER
      </Typography>

      <Typography
        sx={{
          color: "#f2cc0c",
          fontWeight: 700,
          fontSize: "1.4rem",
        }}
      >
        {capitalize(topPlayer.userName)}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          color: "rgba(212,175,55,0.7)",
        }}
      >
        {topPlayer.knockouts} KO • {topPlayer.timesKnockedOut} deaths
      </Typography>
    </Stack>
  </CardContent>
</Card>
        )}

        {/* TABLE */}
        <Card
          sx={{
            borderRadius: 1,
            background: "rgba(10,30,18,0.9)",
            border: "1px solid rgba(212,175,55,0.15)",
          }}
        >
          <TableContainer>
            <Table
              size="small"
              sx={{
                "& th, & td": {
                  px: 1.5,  
                  py: 1,    
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: "#d4af37",
                      fontSize: 11,
                      width: "60%", 
                    }}
                  >
                    Player
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      color: "#d4af37",
                      fontSize: 11,
                      width: "20%",
                    }}
                  >
                    Knockouts
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      color: "#d4af37",
                      fontSize: 11,
                      width: "20%",
                    }}
                  >
                    Deaths
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={row.userId}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontSize: 12, width: 18 }}>
                          {index + 1}
                        </Typography>

                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 11,
                            background: "rgba(212,175,55,0.1)",
                            border: "1px solid rgba(212,175,55,0.3)",
                          }}
                        >
                          {getInitials(row.userName)}
                        </Avatar>

                        <Typography sx={{ fontSize: 13 }}>
                          {capitalize(row.userName)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color: "#7ee0a1",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {row.knockouts}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color: "#ff8f8f",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {row.timesKnockedOut}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
}