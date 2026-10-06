export type UserRole = "orgmenu" | "businessowners";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

export function destinationForRole(role: UserRole): string {
  return role === "orgmenu" ? "/orgmenu" : "/business";
}

async function handleAuthResponse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Authentication failed"
    );
  }
  return data as { user: AuthUser; token: string };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${getApiUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleAuthResponse(res);
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: UserRole
) {
  const res = await fetch(`${getApiUrl()}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleAuthResponse(res);
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${getApiUrl()}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }
  return data as {
    message: string;
    resetToken?: string;
    resetUrl?: string;
  };
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${getApiUrl()}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Reset failed"
    );
  }
  return data as { message: string };
}

const TOKEN_KEY = "mywhatsappmsg.token";
const USER_KEY = "mywhatsappmsg.user";

export function saveSession(user: AuthUser, token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSession(): { user: AuthUser; token: string } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    return { user: JSON.parse(raw) as AuthUser, token };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export interface DirectoryUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// Orgmenu-only: lists every registered user, newest first.
export async function getUsers(token: string): Promise<DirectoryUser[]> {
  const res = await fetch(`${getApiUrl()}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Failed to load users"
    );
  }
  return data.users ?? [];
}
