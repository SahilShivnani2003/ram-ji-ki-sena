// ─── Sanatan Seva Platform – User Store ──────────────────────────────────────
// Zustand store for user profile, ram naam lekhan, community data

import { create } from 'zustand';
import {
  UserAPI,
  CommunityAPI,
  Devotee,
  LekhanEntry,
  SaveCountPayload,
} from '../services/api';
import { useAuthStore } from './authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface LekhanState {
  sessionCount: number;
  todayCount: number;
  totalCount: number;
  malaCount: number;
  selectedNaam: string;
  isSaving: boolean;
  lastSaved: Date | null;
}

interface UserStoreState {
  // Lekhan (Ram Naam counting)
  lekhan: LekhanState;

  // Community
  devotees: Devotee[];
  leaderboard: Devotee[];
  lekhanHistory: LekhanEntry[];
  leaderboardFilter: 'today' | 'week' | 'all';

  // Status
  devoteesStatus: LoadStatus;
  leaderboardStatus: LoadStatus;
  historyStatus: LoadStatus;

  // Lekhan Actions
  incrementCount: () => void;
  setSelectedNaam: (naam: string) => void;
  resetSessionCount: () => void;
  saveCount: () => Promise<{ success: boolean; message?: string }>;
  initLekhanFromUser: () => void;

  // Community Actions
  fetchDevotees: () => Promise<void>;
  fetchLeaderboard: (filter?: 'today' | 'week' | 'all') => Promise<void>;
  fetchLekhanHistory: () => Promise<void>;
  setLeaderboardFilter: (filter: 'today' | 'week' | 'all') => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserStoreState>()((set, get) => ({
  // ── Initial State ─────────────────────────────────────────────────────────

  lekhan: {
    sessionCount: 0,
    todayCount: 0,
    totalCount: 0,
    malaCount: 0,
    selectedNaam: 'राम',
    isSaving: false,
    lastSaved: null,
  },

  devotees: [],
  leaderboard: [],
  lekhanHistory: [],
  leaderboardFilter: 'all',

  devoteesStatus: 'idle',
  leaderboardStatus: 'idle',
  historyStatus: 'idle',

  // ── Lekhan Actions ────────────────────────────────────────────────────────

  incrementCount: () => {
    set((state) => ({
      lekhan: {
        ...state.lekhan,
        sessionCount: state.lekhan.sessionCount + 1,
        todayCount: state.lekhan.todayCount + 1,
        totalCount: state.lekhan.totalCount + 1,
        // Every 108 increments = 1 mala
        malaCount: Math.floor((state.lekhan.totalCount + 1) / 108),
      },
    }));
  },

  setSelectedNaam: (naam: string) => {
    set((state) => ({
      lekhan: {
        ...state.lekhan,
        selectedNaam: naam,
        sessionCount: 0,
      },
    }));
  },

  resetSessionCount: () => {
    set((state) => ({
      lekhan: { ...state.lekhan, sessionCount: 0 },
    }));
  },

  initLekhanFromUser: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set((state) => ({
      lekhan: {
        ...state.lekhan,
        totalCount: user.totalCount ?? 0,
        todayCount: user.currCount ?? 0,
        malaCount: user.mala ?? 0,
      },
    }));
  },

  saveCount: async () => {
    const { lekhan } = get();

    set((state) => ({
      lekhan: { ...state.lekhan, isSaving: true },
    }));

    const payload: SaveCountPayload = {
      currentCount: lekhan.todayCount,
      totalCount: lekhan.totalCount,
      malaCount: lekhan.malaCount,
    };

    const res = await UserAPI.saveCount(payload);

    if (res.success && res.data?.user) {
      // Sync updated user into auth store
      useAuthStore.getState().setUser(res.data.user);
      set((state) => ({
        lekhan: {
          ...state.lekhan,
          isSaving: false,
          lastSaved: new Date(),
          totalCount: res.data!.user.totalCount,
          malaCount: res.data!.user.mala,
        },
      }));
      return { success: true };
    }

    set((state) => ({
      lekhan: { ...state.lekhan, isSaving: false },
    }));
    return { success: false, message: res.message };
  },

  // ── Community Actions ─────────────────────────────────────────────────────

  fetchDevotees: async () => {
    if (get().devoteesStatus === 'loading') return;
    set({ devoteesStatus: 'loading' });

    const res = await CommunityAPI.getAllDevotees();

    if (res.success && res.data?.devotees) {
      set({ devotees: res.data.devotees, devoteesStatus: 'success' });
    } else {
      set({ devoteesStatus: 'error' });
    }
  },

  fetchLeaderboard: async (filter) => {
    const activeFilter = filter ?? get().leaderboardFilter;
    set({ leaderboardStatus: 'loading', leaderboardFilter: activeFilter });

    const res = await CommunityAPI.getLeaderboard(activeFilter);

    if (res.success && res.data?.leaderboard) {
      set({ leaderboard: res.data.leaderboard, leaderboardStatus: 'success' });
    } else {
      set({ leaderboardStatus: 'error' });
    }
  },

  setLeaderboardFilter: (filter) => {
    set({ leaderboardFilter: filter });
    get().fetchLeaderboard(filter);
  },

  fetchLekhanHistory: async () => {
    if (get().historyStatus === 'loading') return;
    set({ historyStatus: 'loading' });

    const res = await UserAPI.getLekhanHistory();

    if (res.success && res.data?.entries) {
      set({ lekhanHistory: res.data.entries, historyStatus: 'success' });
    } else {
      set({ historyStatus: 'error' });
    }
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectLekhan = (state: UserStoreState) => state.lekhan;
export const selectLeaderboard = (state: UserStoreState) => state.leaderboard;
export const selectDevotees = (state: UserStoreState) => state.devotees;
