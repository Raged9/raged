// API Client for Porto-Design Frontend connecting to standalone Express backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_KEY = "porto_admin_token";
const PLAYER_KEY = "porto_player_profile";

export interface PlayerProfile {
  name: string;
  avatar: string;
  highscore: number;
  gamesPlayed: number;
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getPlayerProfile = (): PlayerProfile => {
  if (typeof window === "undefined") {
    return { name: "Guest", avatar: "/porto-icon.jpg", highscore: 0, gamesPlayed: 0 };
  }
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: "Guest", avatar: "/porto-icon.jpg", highscore: 0, gamesPlayed: 0 };
};

export const setPlayerProfile = (profile: Partial<PlayerProfile>): PlayerProfile => {
  const current = getPlayerProfile();
  const updated = { ...current, ...profile };
  if (typeof window !== "undefined") {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(updated));
  }
  return updated;
};

export interface ApiFetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.error) errorMsg = errData.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  techStack: string[];
  imageUrl?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TypingScoreItem {
  id?: string;
  playerName: string;
  wpm: number;
  accuracy: number;
  createdAt?: string;
}

export interface OffScreenPhotoItem {
  id: string;
  caption: string;
  imageUrl?: string;
  order: number;
  rotation?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const api = {
  // Health
  checkHealth: () => apiFetch<{ status: string; service: string }>("/api/health"),

  // Projects
  getProjects: () => apiFetch<ProjectItem[]>("/api/projects"),
  getProject: (id: string) => apiFetch<ProjectItem>(`/api/projects/${id}`),
  createProject: (data: Partial<ProjectItem>) =>
    apiFetch<ProjectItem>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: Partial<ProjectItem>) =>
    apiFetch<ProjectItem>(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/projects/${id}`, {
      method: "DELETE",
    }),

  // Off-Screen Photos
  getPhotos: () => apiFetch<OffScreenPhotoItem[]>("/api/photos"),
  updatePhoto: (id: string, data: Partial<OffScreenPhotoItem>) =>
    apiFetch<OffScreenPhotoItem>(`/api/photos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateAllPhotos: (photos: OffScreenPhotoItem[]) =>
    apiFetch<OffScreenPhotoItem[]>("/api/photos", {
      method: "PUT",
      body: JSON.stringify({ photos }),
    }),

  // Typing Game
  getTypingLeaderboard: (limit: number = 10) =>
    apiFetch<TypingScoreItem[]>(`/api/typing-scores/leaderboard?limit=${limit}`),
  submitTypingScore: (data: { playerName: string; wpm: number; accuracy: number }) =>
    apiFetch<TypingScoreItem>("/api/typing-scores", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin Auth
  loginAdmin: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; user: { id: string; email: string } }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAdminMe: () =>
    apiFetch<{ user: { id: string; email: string } }>("/api/admin/me"),

  // Contact
  submitContact: (data: { name: string; email: string; message: string }) =>
    apiFetch<{ success: boolean }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
