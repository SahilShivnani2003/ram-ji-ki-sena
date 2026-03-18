import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AuthInterface {
    company: any;
    isAuthenticated: boolean;
    token: string | null;
    login: (company: any | null, token: string | any) => void;
    loadCompany: () => Promise<void>;
    logOut: () => void;
}

export const useAuthStore = create<AuthInterface>((set) => ({
    company: null,
    isAuthenticated: false,
    token: null,
    login: async (company, token) => {
        if (company && token) {
            await AsyncStorage.setItem('auth', JSON.stringify({ company, token }));

            set({ company: company, isAuthenticated: true, token: token });
        }
    },
    loadCompany: async () => {
        const auth = JSON.parse(await AsyncStorage.getItem('auth') || '{}');
        if (auth) {
            set({ company: auth?.company, isAuthenticated: true, token: auth?.token })
        }
    },
    logOut: async () => {
        await AsyncStorage.removeItem('auth');

        set({ company: null, isAuthenticated: false, token: null })
    }
}))