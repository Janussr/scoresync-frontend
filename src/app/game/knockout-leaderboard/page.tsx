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
  TableContainer,
} from "@mui/material";
import { getKnockoutLeaderboard } from "@/lib/api/bounties";
import { BountyRow } from "@/lib/models/game";
import { useError } from "@/context/ErrorContext";
import SectionTitle from "@/components/ui/SectionTitle";

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
            totalMap[row.userId].totalBountyPoints += row.totalBountyPoints;
          }
        });

        const sorted = Object.values(totalMap).sort(
          (a, b) => b.totalBountyPoints - a.totalBountyPoints
        );

        setData(sorted);
      } catch (err: any) {
        showError(err.message || "Failed to fetch bounty leaderboard");
      }
    };

    fetchLeaderboard();
  }, [showError]);

  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="h5"
        textAlign="center"
      >
        <SectionTitle size="large">Bounty board</SectionTitle>
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Player</strong></TableCell>
                  <TableCell><strong>Knockouts</strong></TableCell>
                  <TableCell><strong>Times Knocked Out</strong></TableCell>
                  <TableCell><strong>Total Bounty Points</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.userId}>
                    <TableCell>{capitalize(row.userName)}</TableCell>
                    <TableCell>{row.knockouts}</TableCell>
                    <TableCell>{row.timesKnockedOut}</TableCell>
                    <TableCell>{row.totalBountyPoints}</TableCell>
                  </TableRow>
                ))}

                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No bounty data yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}