import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const AUTH_STORAGE_KEY = 'cipherstudio_token';
const BASE_URL_STORAGE_KEY = 'cipherstudio_api_base_url';

function getSavedBaseUrl(): string | null {
  try {
    return window.localStorage.getItem(BASE_URL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setSavedBaseUrl(url: string) {
  try {
    window.localStorage.setItem(BASE_URL_STORAGE_KEY, url);
  } catch {}
}

function normalizeBaseUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === '127.0.0.1') {
      u.hostname = 'localhost';
    }
    return u.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
}

function getInitialBaseUrl(): string {
  const fromEnv = ENV_BASE_URL ? normalizeBaseUrl(ENV_BASE_URL) : null;
  const fromSaved = getSavedBaseUrl() ? normalizeBaseUrl(getSavedBaseUrl() as string) : null;
  return fromEnv || fromSaved || 'http://localhost:8080';
}

let token: string | null = null;

function getToken(): string | null {
  if (token) return token;
  token = window.localStorage.getItem(AUTH_STORAGE_KEY);
  return token;
}

function setToken(t: string) {
  token = t;
  window.localStorage.setItem(AUTH_STORAGE_KEY, t);
}

export const api = axios.create({
  baseURL: `${getInitialBaseUrl()}/api`,
  withCredentials: false
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = getToken();
  if (t) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${t}`;
  }
  return config;
});

async function discoverAndSetBaseUrl(): Promise<string | null> {
  if (ENV_BASE_URL) return null; // Respect explicit env configuration
  const hosts = ['localhost']; // Avoid 127.0.0.1 due to user environment blocking
  const ports = Array.from({ length: 11 }, (_, i) => 8080 + i);

  const controller = new AbortController();
  const timeout = (ms: number) => setTimeout(() => controller.abort(), ms);

  for (const host of hosts) {
    for (const port of ports) {
      const base = `http://${host}:${port}`;
      try {
        const id = timeout(600);
        const res = await fetch(`${base}/health`, { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) {
          setSavedBaseUrl(base);
          api.defaults.baseURL = `${base}/api`;
          return base;
        }
      } catch {
        // ignore and continue scanning
      }
    }
  }
  return null;
}

let isDiscovering = false;
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  // Retry once after discovery if network error (no response)
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const isNetwork = !error.response; // CORS/connection issues
  if (isNetwork && original && !original._retried && !isDiscovering) {
    original._retried = true;
    isDiscovering = true;
    try {
      const found = await discoverAndSetBaseUrl();
      if (found) {
        return api(original);
      }
    } finally {
      isDiscovering = false;
    }
  }
  return Promise.reject(error);
});

// Do not auto-register; only use token if present
export async function ensureAuth(): Promise<void> {
  if (getToken()) return;
  // no token available; caller should trigger login/register UI
}

export async function authRegister(username: string, email: string, password: string): Promise<void> {
  const { data } = await api.post('/auth/register', { username, email, password });
  setToken(data.token);
}

export async function authLogin(emailOrUsername: string, password: string): Promise<void> {
  const { data } = await api.post('/auth/login', { emailOrUsername, password });
  setToken(data.token);
}

export async function authMe(): Promise<{ id: string; username: string; email: string } | null> {
  try {
    if (!getToken()) return null;
    const { data } = await api.get('/auth/me');
    return data.user || null;
  } catch {
    return null;
  }
}

export type BackendProject = { _id: string; name: string; description?: string };
export type BackendFile = {
  _id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  path: string;
};

export const backend = {
  async listProjects(): Promise<BackendProject[]> {
    await ensureAuth();
    const { data } = await api.get('/projects');
    return data.projects as BackendProject[];
  },
  async createProject(name: string, description?: string): Promise<BackendProject> {
    await ensureAuth();
    const { data } = await api.post('/projects', { name, description });
    return data.project as BackendProject;
  },
  async getProject(id: string): Promise<BackendProject> {
    await ensureAuth();
    const { data } = await api.get(`/projects/${id}`);
    return data.project as BackendProject;
  },
  async deleteProject(id: string): Promise<void> {
    await ensureAuth();
    await api.delete(`/projects/${id}`);
  },
  async listFiles(projectId: string): Promise<BackendFile[]> {
    await ensureAuth();
    const { data } = await api.get(`/projects/${projectId}/files`);
    return data.files as BackendFile[];
  },
  async createFile(projectId: string, body: { parentId?: string | null; name: string; type: 'file' | 'folder'; content?: string }): Promise<BackendFile> {
    await ensureAuth();
    const { data } = await api.post(`/projects/${projectId}/files`, body);
    return data.file as BackendFile;
  },
  async updateFile(fileId: string, body: { name?: string; content?: string }): Promise<BackendFile> {
    await ensureAuth();
    const { data } = await api.put(`/files/${fileId}`, body);
    return data.file as BackendFile;
  },
  async deleteFile(fileId: string): Promise<void> {
    await ensureAuth();
    await api.delete(`/files/${fileId}`);
  }
};


