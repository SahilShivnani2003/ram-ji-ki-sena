import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/tabs/HomeScreen';
import MandirScreen from '../screens/tabs/MandirScreen';
import KathaScreen from '../screens/tabs/KathaScreen';
import PanditScreen from '../screens/tabs/PanditScreen';
import CommunityScreen from '../screens/tabs/CommunityScreen';
import { Itab } from '../types/tab.types';
import { CustomTabBar } from '../components/ui/CustomTabBar';

// ── Types ────────────────────────────────────────────────────────────────────
export type RootTabParamList = {
  Home: undefined;
  Mandirs: undefined;
  Katha: undefined;
  Pandits: undefined;
  Community: undefined;
};

// ── Tab config ───────────────────────────────────────────────────────────────
// All icons from Ionicons — consistent stroke weight, clean at small sizes
const TABS: Itab[] = [
  {
    key: 'Home',
    icon: 'home-outline',
    iconActive: 'home',
    component: HomeScreen,
  },
  {
    key: 'Mandirs',
    icon: 'business-outline', // clean building silhouette — reads clearly at 23px
    iconActive: 'business',
    component: MandirScreen,
  },
  {
    key: 'Katha',
    icon: 'book-outline',
    iconActive: 'book',
    component: KathaScreen,
  },
  {
    key: 'Pandits',
    icon: 'person-outline',
    iconActive: 'person',
    component: PanditScreen,
  },
  {
    key: 'Community',
    icon: 'people-outline',
    iconActive: 'people',
    component: CommunityScreen,
  },
];

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={props => <CustomTabBar {...props} tabs={TABS} />}
    screenOptions={{ headerShown: false }}
  >
    {TABS.map(({ key, component }) => (
      <Tab.Screen key={key} name={key} component={component} />
    ))}
  </Tab.Navigator>
);

export default TabNavigator;
