import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Itab } from '../types/tab.types';
import HomeScreen from '../screens/pandit/DashboardScreen';
import BookingsScreen from '../screens/pandit/BookingScreen';
import EarningsScreen from '../screens/pandit/EarningsScreen';
import ProfileScreen from '../screens/pandit/PanditProfileScreen';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import { IDeity } from '../types/IDeity';
import NamLekhanScreen from '../screens/NaamLekhanScreen';

export type PanditTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Earnings: undefined;
  Profile: undefined;
  Namlekhan: { deity?: IDeity };
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
    icon: 'cart-outline',
    iconActive: 'cart',
    component: BookingsScreen,
  },
  {
    key: 'Earnings',
    icon: 'cash-outline',
    iconActive: 'cash',
    component: EarningsScreen,
  },
  {
    key: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
    component: ProfileScreen,
  },
  {
    key: 'Namlekhan',
    icon: 'document-text-outline',
    iconActive: 'document-text',
    component: NamLekhanScreen,
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
