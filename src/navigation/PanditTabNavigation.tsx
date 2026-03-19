import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Itab } from '../types/tab.types';
import HomeScreen from '../screens/pandit/DashboardScreen';
import BookingsScreen from '../screens/pandit/BookingScreen';
import EarningsScreen from '../screens/pandit/EarningsScreen';
import ProfileScreen from '../screens/pandit/PanditProfileScreen';
import { CustomTabBar } from '../components/ui/CustomTabBar';

export type PanditTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const panditTabs: Itab<PanditTabParamList>[] = [
  {
    key: 'Home',
    icon: 'home-outline',
    iconActive: 'home',
    component: HomeScreen,
  },
  {
    key: 'Bookings',
    icon: 'calender-outline',
    iconActive: 'calender',
    component: BookingsScreen,
  },
  {
    key: 'Earnings',
    icon: 'money-outline',
    iconActive: 'money',
    component: EarningsScreen,
  },
  {
    key: 'Profile',
    icon: 'user-outline',
    iconActive: 'user',
    component: ProfileScreen,
  },
];
const Tab = createBottomTabNavigator<PanditTabParamList>();

const PanditTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} tabs={panditTabs} />}
      screenOptions={{ headerShown: false }}
    >
      {panditTabs.map(({ key, component }) => (
        <Tab.Screen key={key} name={key} component={component} />
      ))}
    </Tab.Navigator>
  );
};

export default PanditTabNavigator;
