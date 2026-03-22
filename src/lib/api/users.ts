import { User, UserRole, SetUserRoleResponse } from "../models/user";
import { apiFetch } from "./clients"; 

export const loginUser = async (username: string, password: string): Promise<boolean> => {
  try {
    await apiFetch("/users/login", {
      method: "POST",
      body: { username, password }as any,
    });
    return true;
  } catch {
    return false;
  }
};

export const logoutUser = async (): Promise<void> => {
  await apiFetch("/users/logout", {
    method: "POST",
  });
};

export const getCurrentUser = async (): Promise<(User & { role: UserRole }) | null> => {
  try {
    return await apiFetch("/users/me");
  } catch {
    return null;
  }
};

export const setUserRole = async (userId: number, role: UserRole): Promise<SetUserRoleResponse> =>
  apiFetch("/users/admin/set-role", {
    method: "POST",
    body: { userId, role } as any,
  });

export const adminResetPwd = async (userId: number, newPassword: string): Promise<User> =>
  apiFetch("/users/admin/reset-password", {
    method: "POST",
    body: { userId, newPassword }as any,
  });

export const getAllUsers = async (): Promise<User[]> =>
  apiFetch("/users");

export const registerUser = (username: string, password: string) =>
  apiFetch<{ token: string }>(`/users/register`, {
    method: "POST",
    body: { username, password } as any,
  });