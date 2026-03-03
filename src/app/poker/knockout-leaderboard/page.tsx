"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import { getKnockoutLeaderboard } from "@/lib/api/games";
import { BountyRow } from "@/lib/models/game";

export default function BountyLeaderboardPage() {
  const [data, setData] = useState<BountyRow[]>([]);

  useEffect(() => {
    getKnockoutLeaderboard()
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={3} textAlign="center">
        Bounty Leaderboard
      </Typography>
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
          {data.map(row => (
            <TableRow key={row.userId}>
              <TableCell>{row.userName}</TableCell>
              <TableCell>{row.knockouts}</TableCell>
              <TableCell>{row.timesKnockedOut}</TableCell>
              <TableCell>{row.totalBountyPoints}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}