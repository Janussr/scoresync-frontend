"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";
import { useError } from "@/context/ErrorContext";
import {
  getDatabaseKeepAwakeState,
  setDatabaseKeepAwake,
} from "@/lib/api/database";

export default function DatabasePingToggle() {
  const [isPinging, setIsPinging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    const loadState = async () => {
      try {
        const result = await getDatabaseKeepAwakeState();
        setIsPinging(result.enabled);
      } catch (err: any) {
        showError(err.message || "Failed to load keep-awake status");
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [showError]);

  const handleToggle = async (checked: boolean) => {
    try {
      const result = await setDatabaseKeepAwake(checked);
      setIsPinging(result.enabled);
    } catch (err: any) {
      showError(err.message || "Failed to update keep-awake status");
    }
  };

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
              onChange={(e) => handleToggle(e.target.checked)}
              color="success"
              disabled={isLoading}
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
          sx={{ color: isPinging ? "success.main" : "text.secondary" }}
        >
          {isPinging
            ? "Backend pings database every 5 minutes"
            : "Ping is disabled"}
        </Typography>
      </Stack>
    </Box>
  );
}