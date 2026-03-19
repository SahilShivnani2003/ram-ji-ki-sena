import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AuthInterface {
    user: any;
    isAuthenticated: boolean;
    token: string | null;
    login: (user: any | null, token: string | any) => void;
    loadUser: () => Promise<void>;
    logOut: () => void;
}

export const useAuthStore = create<AuthInterface>((set) => ({
    user: null,
    isAuthenticated: false,
    token: null,
    login: async (user, token) => {
        if (user && token) {
            await AsyncStorage.setItem('auth', JSON.stringify({ user, token }));

            set({ user: user, isAuthenticated: true, token: token });
        }
    },
    loadUser: async () => {
        const auth = JSON.parse(await AsyncStorage.getItem('auth') || '{}');
        if (auth) {
            set({ user: auth?.company, isAuthenticated: true, token: auth?.token })
        }
    },
    logOut: async () => {
        await AsyncStorage.removeItem('auth');

        set({ user: null, isAuthenticated: false, token: null })
    }
}))