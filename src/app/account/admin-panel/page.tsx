"use client"

import {
  Box,
  Stack,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  TextField,
  MenuItem,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";
import { getAllUsers, adminResetPwd, setUserRole } from "@/lib/api/users";
import { getAllGames, removeGame } from "@/lib/api/games";
import { User, UserRole } from "@/lib/models/user";
import { GameListItemDto } from "@/lib/models/game";
import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import { useEffect, useState } from "react";
import DatabasePingToggle from "@/components/admin/DatabasePingToggle";

export default function AdminPanelPage() {
  const router = useRouter();
  const { isLoggedIn, role } = useAuth();
  const { showError } = useError();

  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<GameListItemDto[]>([]);
  const [adminResetUserId, setAdminResetUserId] = useState<number | "">("");
  const [adminResetPassword, setAdminResetPassword] = useState("");
  const [adminResetConfirmOpen, setAdminResetConfirmOpen] = useState(false);
  const [adminResetLoading, setAdminResetLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [hasFetchedGames, setHasFetchedGames] = useState(false);
  const [deleteGameId, setDeleteGameId] = useState<number | null>(null);
  const [deleteGameLoading, setDeleteGameLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
    if (role !== "Admin") router.replace("/");
  }, [isLoggedIn, role, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      showError(err.message || "Failed to fetch users");
    }
  };

 const fetchGames = async () => {
  try {
    setGamesLoading(true);
    const data = await getAllGames();
    setGames(data);
    setHasFetchedGames(true);
  } catch (err: any) {
    showError(err.message || "Failed to fetch games");
  } finally {
    setGamesLoading(false);
  }
};

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  if (!isLoggedIn || role !== "Admin") return null;

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Typography mb={3} sx={{ fontSize: "2rem", fontWeight: 500, textAlign: "center" }}>
        Admin panel
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Divider sx={{ my: 2 }} />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Set User Role</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Select
                  value={selectedUserId}
                  displayEmpty
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  fullWidth
                  sx={{ width: { xs: "100%", sm: 220 } }}
                >
                  <MenuItem value="" disabled>
                    Select user
                  </MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.username} ({u.username})
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  value={selectedRole || ""}
                  displayEmpty
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  fullWidth
                  sx={{ width: { xs: "100%", sm: 220 } }}
                >
                  <MenuItem value="" disabled>
                    Select role
                  </MenuItem>
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Gamemaster">Gamemaster</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>

                <Button
                  variant="contained"
                  color="primary"
                  disabled={!selectedUserId || !selectedRole || roleUpdateLoading}
                  sx={{
                    width: { xs: "100%", sm: "auto" }
                  }}
                  onClick={() => setRoleConfirmOpen(true)}
                >
                  Set Role
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Reset User Password</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Select
                  value={adminResetUserId}
                  displayEmpty
                  onChange={(e) => setAdminResetUserId(Number(e.target.value))}
                  fullWidth
                  sx={{ width: { xs: "100%", sm: 220 } }}
                >
                  <MenuItem value="" disabled>
                    Select user
                  </MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.username} ({u.username})
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  size="small"
                  label="New Password"
                  type="password"
                  value={adminResetPassword}
                  onChange={(e) => setAdminResetPassword(e.target.value)}
                  fullWidth
                  sx={{ width: { xs: "100%", sm: 220 } }}
                />

                <Button
                  variant="contained"
                  color="error"
                  disabled={!adminResetUserId || !adminResetPassword || adminResetLoading}
                  sx={{
                    width: { xs: "100%", sm: "auto" }
                  }}
                  onClick={() => setAdminResetConfirmOpen(true)}
                >
                  Reset Password
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          
<Accordion sx={{ mt: 2 }}>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography>Manage Games</Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Stack spacing={1.5}>
      <Button
        variant="contained"
        onClick={fetchGames}
        disabled={gamesLoading}
        sx={{ alignSelf: "flex-start" }}
      >
        {gamesLoading ? "Loading..." : "Fetch all games"}
      </Button>

      {!hasFetchedGames ? (
        <Typography color="text.secondary">
          Click "Fetch all games" to load games
        </Typography>
      ) : games.length === 0 ? (
        <Typography color="text.secondary">No games found</Typography>
      ) : (
        games.map((game) => (
          <Box
            key={game.id}
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography fontWeight={600}>
              Game #{game.gameNumber} - {game.type}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Status: {game.isFinished ? "Finished" : "Active"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Started: {game.startedAt ? new Date(game.startedAt).toLocaleString() : "-"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Ended: {game.endedAt ? new Date(game.endedAt).toLocaleString() : "-"}
            </Typography>

            <Box sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setDeleteGameId(game.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))
      )}
    </Stack>
  </AccordionDetails>
</Accordion>

        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <DatabasePingToggle />
        </CardContent>
      </Card>

      <Dialog open={adminResetConfirmOpen} onClose={() => setAdminResetConfirmOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          Are you sure you want to reset the password for{" "}
          {users.find((u) => u.id === Number(adminResetUserId))?.username}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminResetConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              if (!adminResetUserId || !adminResetPassword) return;
              try {
                setAdminResetLoading(true);
                await adminResetPwd(adminResetUserId, adminResetPassword);
                setAdminResetConfirmOpen(false);
                setAdminResetPassword("");
                setAdminResetUserId("");
                showSnackbar("Password reset successfully");
              } catch (err: any) {
                showSnackbar(err.message || "Failed to reset password");
              } finally {
                setAdminResetLoading(false);
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={roleConfirmOpen} onClose={() => setRoleConfirmOpen(false)}>
        <DialogTitle>Set User Role</DialogTitle>
        <DialogContent>
          Are you sure you want to set{" "}
          {users.find((u) => u.id === Number(selectedUserId))?.username}’s role to{" "}
          {selectedRole}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleConfirmOpen(false)}>Cancel</Button>
          <Button
            color="primary"
            onClick={async () => {
              if (!selectedUserId || !selectedRole) return;
              try {
                setRoleUpdateLoading(true);
                await setUserRole(Number(selectedUserId), selectedRole);
                setRoleConfirmOpen(false);
                setSelectedUserId("");
                setSelectedRole("");
                showSnackbar("User role updated successfully");
              } catch (err: any) {
                showSnackbar(err.message || "Failed to set role");
              } finally {
                setRoleUpdateLoading(false);
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteGameId !== null} onClose={() => setDeleteGameId(null)}>
  <DialogTitle>Delete Game</DialogTitle>
  <DialogContent>
    Are you sure you want to delete{" "}
    {games.find((g) => g.id === deleteGameId)
      ? `Game #${games.find((g) => g.id === deleteGameId)?.gameNumber}`
      : "this game"}
    ?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteGameId(null)} disabled={deleteGameLoading}>
      Cancel
    </Button>
    <Button
      color="error"
      disabled={deleteGameLoading || deleteGameId === null}
      onClick={async () => {
        if (deleteGameId === null) return;

        try {
          setDeleteGameLoading(true);
          await removeGame(deleteGameId);

          setGames((prev) => prev.filter((g) => g.id !== deleteGameId));
          setDeleteGameId(null);
          showSnackbar("Game deleted successfully");
        } catch (err: any) {
          showSnackbar(err.message || "Failed to delete game");
        } finally {
          setDeleteGameLoading(false);
        }
      }}
    >
      {deleteGameLoading ? "Deleting..." : "Delete"}
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