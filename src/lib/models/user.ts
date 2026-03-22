export interface User {
  id: number;
  username: string;
  name: string;
}

export interface Participant {
  userId: number;
  userName: string;
}

export type UserRole = "User" | "Admin" | "Gamemaster" | null;

export interface SetUserRoleResponse {
  message: string;
  user: User;
}