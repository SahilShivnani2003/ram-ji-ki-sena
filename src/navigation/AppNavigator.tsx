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

export type RootParamList = {
  splash: undefined;
  main: NavigatorScreenParams<RootTabParamList>;
  profile: undefined;
  login: undefined;
  forgotPassword: undefined;
  register: undefined;
};

const Stack = createNativeStackNavigator<RootParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' , statusBarStyle:'auto'}}
      >
        <Stack.Screen name="splash" component={SplashScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="register" component={RegisterScreen} />
        <Stack.Screen name="main" component={TabNavigator} />
        <Stack.Screen name="profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
