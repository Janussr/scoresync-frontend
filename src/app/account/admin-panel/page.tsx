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
import { User, UserRole } from "@/lib/models/user";
import { useAuth } from "@/context/AuthContext";
import { useError } from "@/context/ErrorContext";
import { useEffect, useState } from "react";

export default function AdminPanelPage() {
  const router = useRouter();
  const { isLoggedIn, role } = useAuth();
  const { showError } = useError();

  const [users, setUsers] = useState<User[]>([]);
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

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  if (!isLoggedIn || role !== "Admin") return null;

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography mb={3} sx={{ fontSize: "2rem", fontWeight: 500 }}>
        Admin panel
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Divider sx={{ my: 2 }} />

          {/* Set User Role */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Set User Role</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Select
                  value={selectedUserId}
                  displayEmpty
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
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
                  onClick={() => setRoleConfirmOpen(true)}
                >
                  Set Role
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Reset Password */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Reset User Password</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Select
                  value={adminResetUserId}
                  displayEmpty
                  onChange={(e) => setAdminResetUserId(Number(e.target.value))}
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
                  sx={{ width: { xs: "100%", sm: 220 } }}
                />

                <Button
                  variant="contained"
                  color="error"
                  disabled={!adminResetUserId || !adminResetPassword || adminResetLoading}
                  onClick={() => setAdminResetConfirmOpen(true)}
                >
                  Reset Password
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Dialogs */}
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