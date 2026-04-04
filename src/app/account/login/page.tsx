"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const REMEMBERED_USERNAME_KEY = "rememberedUsername";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY);

    if (savedUsername) {
      setUsername(savedUsername);
      setRememberUsername(true);
    }
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const success = await login(username, password);

      if (success) {
        if (rememberUsername) {
          localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
        } else {
          localStorage.removeItem(REMEMBERED_USERNAME_KEY);
        }

        router.push("/");
      } else {
        setError("Invalid username or password");
      }
    } catch (err: any) {
      setError(err.message ?? "Login error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleRememberUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setRememberUsername(checked);

    if (!checked) {
      localStorage.removeItem(REMEMBERED_USERNAME_KEY);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          width: 400,
          borderRadius: 4,
          boxShadow: "0 0 25px rgba(255, 215, 0, 0.4)",
          border: "2px solid gold",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              color: "gold",
              mb: 3,
            }}
          >
            ♠ Login ♦
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} autoComplete="on">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox
                  checked={rememberUsername}
                  onChange={handleRememberUsernameChange}
                />
              }
              label="Remember username"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mt: 2,
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Don’t have an account?{" "}
            <MuiLink component={Link} href="/account/register" underline="hover">
              Register
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}