"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import { loginUser } from "@/lib/api/users";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  setError(null);
  setLoading(true);

  try {
    const data = await loginUser(username, password);
    login(data.token);
    router.push("/poker/active-game");
  } catch (err: any) {
    setError(err.message ?? "Login fejlede");
  } finally {
    setLoading(false);
  }
};

 const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleLogin();
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
              color: "#8b0000",
              mb: 3,
            }}
          >
            ♠ Login ♦
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown} 
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown} 
          />

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "#8b0000",
              "&:hover": { backgroundColor: "#a30000" },
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logger ind..." : "Login"}
          </Button>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Don’t have an account?{" "}
            <MuiLink component={Link} href="/register" underline="hover">
              Register
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}