"use client";

import {
  Box,
  Stack,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, updatePassword, updateUsername } from "@/lib/api/users";
import { UserRole } from "@/lib/models/user";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth(); 
  const [user, setUser] = useState<{ id: number; username: string; role: UserRole } | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/account/login");
      return;
    }

    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setNewUsername(currentUser.username);
      } else {
        router.replace("/account/login");
      }
    };

    fetchUser();
  }, [isLoggedIn, router]);

 const handleUsernameUpdate = async () => {
  if (!user) return;

  try {
    setLoading(true);

    const response = await updateUsername(newUsername);

    setUser({ ...user, username: response.user.username });

    setUsernameDialogOpen(false);
    setSnackbarMessage("Username updated successfully");
    setSnackbarOpen(true);
  } catch (err: any) {
    setSnackbarMessage(err.message || "Failed to update username");
    setSnackbarOpen(true);
  } finally {
    setLoading(false);
  }
};
  const handlePasswordUpdate = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordDialogOpen(false);
      setSnackbarMessage("Password updated successfully");
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(err.message || "Failed to update password");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || !user) return null;

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography mb={3} sx={{ fontSize: "2rem", fontWeight: 500 }}>
        Profile
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Username</Typography>
          <Stack direction="row" spacing={2} alignItems="center" mt={1}>
            <TextField
              label="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Button
              variant="contained"
              disabled={loading || newUsername === user.username}
              onClick={() => setUsernameDialogOpen(true)}
            >
              Update
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">Password</Typography>
          <Stack direction="column" spacing={2} mt={1}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="error"
              disabled={loading || !currentPassword || !newPassword}
              onClick={() => setPasswordDialogOpen(true)}
            >
              Update
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Username Dialog */}
      <Dialog open={usernameDialogOpen} onClose={() => setUsernameDialogOpen(false)}>
        <DialogTitle>Update Username</DialogTitle>
        <DialogContent>
          Are you sure you want to change your username from "{user.username}" to "{newUsername}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsernameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUsernameUpdate} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Update Password</DialogTitle>
        <DialogContent>
          Are you sure you want to change your password?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handlePasswordUpdate} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}