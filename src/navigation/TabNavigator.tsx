import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/tabs/HomeScreen';
import MandirScreen from '../screens/tabs/MandirScreen';
import KathaScreen from '../screens/tabs/KathaScreen';
import PanditScreen from '../screens/tabs/PanditScreen';
import CommunityScreen from '../screens/tabs/CommunityScreen';
import { Itab } from '../types/tab.types';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import NamLekhanScreen from '../screens/NaamLekhanScreen';
import { IDeity } from '../types/IDeity';

// ── Types ────────────────────────────────────────────────────────────────────
export type RootTabParamList = {
  Home: undefined;
  Mandirs: undefined;
  Katha: undefined;
  Pandits: undefined;
  Community: undefined;
  Namlekhan: { deity?: IDeity };
};

// ── Tab config ───────────────────────────────────────────────────────────────
// All icons from Ionicons — consistent stroke weight, clean at small sizes
const TABS: Itab<RootTabParamList>[] = [
  // {
  //   key: 'Home',
  //   icon: 'home-outline',
  //   iconActive: 'home',
  //   component: HomeScreen,
  // },
  {
    key: 'Namlekhan',
    icon: 'home-outline',
    iconActive: 'home-outline',
    component: NamLekhanScreen,
  },
  {
    key: 'Mandirs',
    icon: 'business-outline', // clean building silhouette — reads clearly at 23px
    iconActive: 'business-outline',
    component: MandirScreen,
  },
  {
    key: 'Katha',
    icon: 'book-outline',
    iconActive: 'book-outline',
    component: KathaScreen,
  },
  {
    key: 'Pandits',
    icon: 'person-outline',
    iconActive: 'person-outline',
    component: PanditScreen,
  },
  {
    key: 'Community',
    icon: 'people-outline',
    iconActive: 'people-outline',
    component: CommunityScreen,
  },
];

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Namlekhan"
    tabBar={props => <CustomTabBar {...props} tabs={TABS} />}
    screenOptions={{ headerShown: false }}
  >
    {TABS.map(({ key, component }) => (
      <Tab.Screen key={key} name={key} component={component} />
    ))}
  </Tab.Navigator>
);

export default TabNavigator;
