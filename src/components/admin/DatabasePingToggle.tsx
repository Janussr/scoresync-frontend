"use client";

import { useEffect, useRef, useState } from "react";
import {
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";
import { pingDatabase } from "@/lib/api/database";
import { useError } from "@/context/ErrorContext";

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutter

export default function DatabasePingToggle() {
  const [isPinging, setIsPinging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showError } = useError();

  useEffect(() => {
    if (!isPinging) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const runPing = async () => {
      try {
        await pingDatabase();
        console.log("DB ping success");
      } catch (err: any) {
        console.error("DB ping failed:", err);
        showError(err.message || "Database ping failed");
        setIsPinging(false); // stop automatisk hvis det fejler
      }
    };

    // Kør første ping med det samme
    runPing();

    // Start interval
    intervalRef.current = setInterval(() => {
      runPing();
    }, PING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPinging, showError]);

  return (
    <Box>
      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Database keep-awake
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isPinging}
              onChange={(e) => setIsPinging(e.target.checked)}
              color="success"
            />
          }
          label={
            <Typography sx={{ fontWeight: 500 }}>
              {isPinging ? "DB Ping ON" : "DB Ping OFF"}
            </Typography>
          }
        />

        <Typography
          variant="caption"
          sx={{
            color: isPinging ? "success.main" : "text.secondary",
          }}
        >
          {isPinging
            ? `Pinging database every ${PING_INTERVAL_MS / 60000} minutes`
            : "Ping is disabled"}
        </Typography>
      </Stack>
    </Box>
  );
}