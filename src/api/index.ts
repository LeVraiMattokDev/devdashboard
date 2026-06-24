import type { Project, Task, ChangelogEntry, TeamMember, ServerInfo, AuthUser, AppUser } from '../types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  login: (username: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<AuthUser>('/auth/me'),

  logout: () =>
    request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ── Projects ──────────────────────────────────────────────────────────────────

export const projects = {
  list: () => request<Project[]>('/projects'),
  get: (id: string) => request<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const tasks = {
  list: (projectId?: string) =>
    request<Task[]>(projectId ? `/tasks?projectId=${projectId}` : '/tasks'),
  get: (id: string) => request<Task>(`/tasks/${id}`),
  create: (data: Partial<Task>) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ ok: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
};

// ── Changelog ─────────────────────────────────────────────────────────────────

export const changelog = {
  list: () => request<ChangelogEntry[]>('/changelog'),
  create: (data: Partial<ChangelogEntry>) =>
    request<ChangelogEntry>('/changelog', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ChangelogEntry>) =>
    request<ChangelogEntry>(`/changelog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<{ ok: boolean }>(`/changelog/${id}`, { method: 'DELETE' }),
};

// ── Team / Server ─────────────────────────────────────────────────────────────

export const team = {
  list: () => request<TeamMember[]>('/team'),
};

export const server = {
  info: () => request<ServerInfo & { stats: { projects: number; activeTasks: number } }>('/server-info'),
};

// ── Users (admin) ─────────────────────────────────────────────────────────────

export const users = {
  list: () => request<AppUser[]>('/users'),
  create: (data: Partial<AppUser> & { password: string }) =>
    request<AppUser>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<AppUser> & { password?: string }) =>
    request<AppUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),
};
