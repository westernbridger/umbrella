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
  ping: () => apiFetch('/ping'),
  getServerStatus: () => apiFetch('/status'),
  startBot: () => apiFetch('/bot/start', { method: 'POST' }),
  stopBot: () => apiFetch('/bot/stop', { method: 'POST' }),
  restartBot: () => apiFetch('/bot/restart', { method: 'POST' }),
  getBots: () => apiFetch<any[]>('/bots'),
  createBot: (data: any) => apiFetch('/bots', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  updateBot: (id: string, data: any) => apiFetch(`/bots/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  deleteBot: (id: string) => apiFetch(`/bots/${id}`, { method: 'DELETE' }),
  getMessageStats: () => apiFetch<{ count: number }>('/stats/messages'),
  getActiveUsers: () => apiFetch<{ count: number }>('/stats/active-users'),
  getRecentActivity: () => apiFetch<any[]>('/activity/recent'),
  getSchedulerTasks: () => apiFetch<any[]>('/scheduler/tasks'),
};
