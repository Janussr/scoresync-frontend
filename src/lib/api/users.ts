import { User } from "../models/user";
import { apiFetch } from "./clients";

export const getAllUsers = () =>
  apiFetch<User[]>(`/users`);

export const loginUser = (username: string, password: string) =>
  apiFetch<{ token: string }>(`/users/login`, {
    method: "POST",
    body: { username, password } as any,
  });

export const registerUser = (username: string, name: string, password: string) =>
  apiFetch<{ token: string }>(`/users/register`, {
    method: "POST",
    body: { username, name, password } as any,
  });

