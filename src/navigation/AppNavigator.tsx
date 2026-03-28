import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import TabNavigator, { RootTabParamList } from './TabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { IDeity } from '../screens/tabs/HomeScreen';
import { useColorScheme } from 'react-native';
import NamLekhanScreen from '../screens/NaamLekhanScreen';
import PanditTabNavigator, { PanditTabParamList } from './PanditTabNavigation';
import PanditRegisterScreen from '../screens/auth/PanditRegiterScreen';
import DrawerNavigator, { DrawerParamList } from './DrawerNavigator';

export type RootParamList = {
  splash: undefined;
  main: NavigatorScreenParams<RootTabParamList>;
  panditRegister: undefined;
  notifications: undefined;
  login: undefined;
  forgotPassword: undefined;
  register: undefined;
  pandit: NavigatorScreenParams<PanditTabParamList>;
  mainDrawer: NavigatorScreenParams<DrawerParamList>;
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
        <Stack.Screen name="notifications" component={NotificationScreen} />
        <Stack.Screen name="pandit" component={PanditTabNavigator} />
        <Stack.Screen name="mainDrawer" component={DrawerNavigator} />
        <Stack.Screen name="panditRegister" component={PanditRegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
