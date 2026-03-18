import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import TabNavigator, { RootTabParamList } from './TabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { IDeity } from '../screens/tabs/HomeScreen';
import { useColorScheme } from 'react-native';
import NamLekhanScreen from '../screens/NaamLekhanScreen';

export type RootParamList = {
  splash: undefined;
  main: NavigatorScreenParams<RootTabParamList>;
  profile: undefined;
  login: undefined;
  forgotPassword: undefined;
  register: undefined;
  namLekhan: { deity: IDeity };
};

const Stack = createNativeStackNavigator<RootParamList>();

const AppNavigator = () => {
  const isDark = useColorScheme() === 'dark';
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          statusBarStyle: isDark ? 'light' : 'dark',
        }}
      >
        <Stack.Screen name="splash" component={SplashScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="register" component={RegisterScreen} />
        <Stack.Screen name="main" component={TabNavigator} />
        <Stack.Screen name="profile" component={ProfileScreen} />
        <Stack.Screen name="namLekhan" component={NamLekhanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
