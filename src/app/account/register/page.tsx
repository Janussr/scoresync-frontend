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
import { registerUser } from "@/lib/api/users"; 

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (!username || !username || !password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await registerUser(username, password);

      router.push("/account/login");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
   const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };


  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // background: "radial-gradient(circle at center, #8b0000, #1a0000)",
      }}
    >
      <Card
        sx={{
          width: 450,
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
            ♦ Create Account ♠
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown} 
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown} 
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown} 
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleRegister}
            disabled={loading}
            sx={{
              mt: 3,
              backgroundColor: "#8b0000",
              "&:hover": {
                backgroundColor: "#a30000",
              },
              fontWeight: "bold",
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Already have an account?{" "}
            <MuiLink component={Link} href="/account/login" underline="hover">
              Login
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
