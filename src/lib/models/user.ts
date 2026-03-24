export interface User {
  id: number;
  username: string;
}

export interface Player {
  userId: number;
  userName: string;
}

export type UserRole = "User" | "Admin" | "Gamemaster" | null;

export interface SetUserRoleResponse {
  message: string;
  user: User;
}