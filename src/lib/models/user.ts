export type UserRole = "User" | "Admin" | "Gamemaster" | null;

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface SetUserRoleResponse {
  message: string;
  user: User;
}

