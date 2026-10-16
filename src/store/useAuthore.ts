import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import requestNotificationPermission from "../utils/requestNotificationPermission";
import { DeviceConfig } from "../utils/deviceConfig";
import { IRegisterDevice, registerDevice } from "../service/apis/notificationService";
import {
    getMessaging,
    getToken,
} from '@react-native-firebase/messaging';

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
            try {
                console.log('1. Requesting notification permission...');

                const hasPermission = await requestNotificationPermission();

                console.log('2. Permission result:', hasPermission);

                if (hasPermission) {
                    console.log('3. Getting FCM token...');

                    const fcmToken = await getToken(getMessaging());

                    console.log('4. FCM token:', fcmToken);

                    const registerDeviceData: IRegisterDevice = {
                        token: fcmToken,
                        deviceType: 'android',
                        platform: 'app',
                        appVersion: DeviceConfig.version,
                    };

                    console.log('5. Registering device...');

                    // await registerDevice(registerDeviceData);

                    console.log('6. Device registered successfully');
                }
            } catch (fcmError) {
                console.error('FCM/DEVICE ERROR:', fcmError);
            }
        }
    },
    loadUser: async () => {
        const auth = await AsyncStorage.getItem('auth');
        if (!auth) {
            set({
                user: null,
                isAuthenticated: false,
                token: null,
            });
            return;
        }
        const storedAuth = JSON.parse(auth);
        if (storedAuth) {
            set({ user: storedAuth.user, isAuthenticated: true, token: storedAuth.token })
        }
    },
    logOut: async () => {
        await AsyncStorage.removeItem('auth');

        set({ user: null, isAuthenticated: false, token: null })
    }
}))