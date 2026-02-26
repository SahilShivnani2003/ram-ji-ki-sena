import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { BlogScreen } from '../screens/blogScreen';
import PanditScreen from '../screens/PanditScreen';
import { SplashScreen } from '../screens/splashScreen';
import { MainTabs } from './TabNavigation';

export type RootStackParamList = {
    Main: undefined;
    Login: undefined;
    Register: undefined;
    Pandit: undefined;
    Blog: undefined;
    splash: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    // ── Authenticated routes ──────────────────────────────────────────
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen
                            name="Pandit"
                            component={PanditScreen}
                            options={{ animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen
                            name="Blog"
                            component={BlogScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="splash" component={SplashScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        {/* Allow guest browsing */}
                        <Stack.Screen name="Main" component={MainTabs} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
