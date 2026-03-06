"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from "@mui/material";

import { getKnockoutLeaderboard } from "@/lib/api/games";
import { BountyRow } from "@/lib/models/game";
import { useError } from "@/context/ErrorContext";

export default function BountyLeaderboardPage() {
  const [data, setData] = useState<BountyRow[]>([]);
  const { showError } = useError();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const rows = await getKnockoutLeaderboard();
        setData(rows);
      } catch (err: any) {
        showError(err.message || "Failed to fetch leaderboard");
      }
    };

    fetchLeaderboard();
  }, [showError]);

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
      <Typography
        variant="h4"
        mb={3}
        textAlign="center"
        fontWeight="bold"
      >
        Bounty Leaderboard
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Knockouts</TableCell>
                <TableCell>Times Knocked Out</TableCell>
                <TableCell>Total Bounty Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.userId}>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.knockouts}</TableCell>
                  <TableCell>{row.timesKnockedOut}</TableCell>
                  <TableCell>{row.totalBountyPoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}