// ─── Sanatan Seva Platform – API Service ─────────────────────────────────────
// Centralized fetch-based API client with JWT auth support

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';
const TOKEN_KEY = 'auth_token';

// ─── Token Management ─────────────────────────────────────────────────────────

export const TokenService = {
  get: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },

  remove: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
}

export interface User {
  _id: string;
  username: string;
  name: string;
  city: string;
  contact: string;
  rank: number;
  currCount: number;
  totalCount: number;
  mala: number;
  role: 'user' | 'admin' | 'pandit' | 'mandir';
  profilePhoto?: string;
  state?: string;
  spiritualInterests?: string[];
  preferredMandir?: string;
  dailyCounts: Array<{ date: string; count: number }>;
  createdAt?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  name: string;
  city: string;
  state?: string;
  contact: string;
  password: string;
}

export interface SaveCountPayload {
  currentCount: number;
  totalCount: number;
  malaCount: number;
}

export interface Devotee {
  _id: string;
  name: string;
  city: string;
  totalCount: number;
  rank: number;
  avatar?: string;
}

export interface LekhanEntry {
  _id: string;
  date: string;
  count: number;
  naam: string;
}

// ─── HTTP Client ──────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  skipAuth?: boolean;
  isFormData?: boolean;
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const token = options.skipAuth ? null : await TokenService.get();

  const headers: Record<string, string> = {};

  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body !== undefined) {
    config.body = options.isFormData
      ? (body as FormData)
      : JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_URL}/api${endpoint}`, config);
    const json: ApiResponse<T> = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: json.message ?? `Error ${res.status}`,
      };
    }

    return json;
  } catch (error) {
    const message =
      error instanceof TypeError && error.message === 'Network request failed'
        ? 'नेटवर्क कनेक्शन उपलब्ध नहीं है'
        : 'कुछ गलत हो गया, कृपया पुनः प्रयास करें';
    return { success: false, message };
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const AuthAPI = {
  login: async (payload: LoginPayload): Promise<ApiResponse<{ user: User }>> => {
    const res = await request<{ user: User }>('POST', '/login', payload, {
      skipAuth: true,
    });
    if (res.success && res.token) {
      await TokenService.set(res.token);
    }
    return res;
  },

  register: async (
    payload: RegisterPayload
  ): Promise<ApiResponse<{ user: User }>> => {
    const res = await request<{ user: User }>('POST', '/register', payload, {
      skipAuth: true,
    });
    if (res.success && res.token) {
      await TokenService.set(res.token);
    }
    return res;
  },

  logout: async (): Promise<void> => {
    await request('GET', '/logout');
    await TokenService.remove();
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    return request<{ user: User }>('GET', '/me');
  },
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const UserAPI = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return request<{ user: User }>('GET', '/profile');
  },

  updateProfile: async (
    data: Partial<Pick<User, 'name' | 'city' | 'state' | 'spiritualInterests'>>
  ): Promise<ApiResponse<{ user: User }>> => {
    return request<{ user: User }>('PUT', '/profile', data);
  },

  uploadProfilePhoto: async (
    formData: FormData
  ): Promise<ApiResponse<{ photoUrl: string }>> => {
    return request<{ photoUrl: string }>('POST', '/profile/photo', formData, {
      isFormData: true,
    });
  },

  saveCount: async (
    payload: SaveCountPayload
  ): Promise<ApiResponse<{ user: User }>> => {
    return request<{ user: User }>('POST', '/save', payload);
  },

  getLekhanHistory: async (): Promise<ApiResponse<{ entries: LekhanEntry[] }>> => {
    return request<{ entries: LekhanEntry[] }>('GET', '/lekhan-history');
  },
};

// ─── Community API ────────────────────────────────────────────────────────────

export const CommunityAPI = {
  getAllDevotees: async (): Promise<ApiResponse<{ devotees: Devotee[] }>> => {
    return request<{ devotees: Devotee[] }>('GET', '/devotees');
  },

  searchUser: async (
    name: string
  ): Promise<ApiResponse<{ users: Devotee[] }>> => {
    return request<{ users: Devotee[] }>('GET', `/users/search?q=${encodeURIComponent(name)}`);
  },

  getLeaderboard: async (
    filter: 'today' | 'week' | 'all'
  ): Promise<ApiResponse<{ leaderboard: Devotee[] }>> => {
    return request<{ leaderboard: Devotee[] }>('GET', `/leaderboard?filter=${filter}`);
  },
};

export default { AuthAPI, UserAPI, CommunityAPI, TokenService };
