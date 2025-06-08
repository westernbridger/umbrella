export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  getStats: () => apiFetch('/stats'),
  getMessagesToday: () => apiFetch<{count: number}>('/messages/today'),
  getActiveUsers: () => apiFetch<{count: number}>('/users/active'),
  getActivity: () => apiFetch<any[]>('/activity'),
  getBots: () => apiFetch<any[]>('/bots'),
  getUsers: () => apiFetch<any[]>('/users'),
  getLogs: () => apiFetch<any[]>('/logs'),
  getTasks: () => apiFetch<any[]>('/tasks'),
};
