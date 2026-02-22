import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';

import { Colors, Typography, Radius, Shadow, SacredSymbols } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import RamNaamScreen from '../screens/RamNaamScreen';
import MandirsScreen from '../screens/MandirsScreen';
import PanditScreen from '../screens/PanditScreen';
import CommunityScreen from '../screens/CommunityScreen';

// ─── Navigation Type Definitions ─────────────────────────────────

export type RootStackParamList = {
  Main: undefined;
  Pandit: undefined;
  Blog: undefined;
};

export type TabParamList = {
  Home: undefined;
  RamNaam: undefined;
  Mandirs: undefined;
  Katha: undefined;
  Community: undefined;
};

// Placeholder screens
const KathaScreen: React.FC = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream }}>
    <Text style={{ fontSize: 52 }}>📖</Text>
    <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.darkText, marginTop: 12 }}>कथा इवेंट्स</Text>
    <Text style={{ color: Colors.brownLight, marginTop: 8 }}>Coming Soon...</Text>
  </View>
);

const BlogScreen: React.FC = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream }}>
    <Text style={{ fontSize: 52 }}>✍️</Text>
    <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.darkText, marginTop: 12 }}>ब्लॉग</Text>
    <Text style={{ color: Colors.brownLight, marginTop: 8 }}>Coming Soon...</Text>
  </View>
);

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

interface TabConfig {
  name: keyof TabParamList;
  icon: string;
  label: string;
  screen: React.ComponentType<any>;
}

const TAB_CONFIG: TabConfig[] = [
  { name: 'Home', icon: '🏠', label: 'होम', screen: HomeScreen },
  { name: 'RamNaam', icon: '📿', label: 'जाप', screen: RamNaamScreen },
  { name: 'Mandirs', icon: '🛕', label: 'मंदिर', screen: MandirsScreen },
  { name: 'Katha', icon: '📖', label: 'कथा', screen: KathaScreen },
  { name: 'Community', icon: '💬', label: 'समाज', screen: CommunityScreen },
];

const SacredTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarWrapper}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF8F0']}
        style={styles.tabBar}
      >
        {/* Gold top border */}
        <LinearGradient
          colors={[Colors.saffronDark, Colors.gold, Colors.saffronDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tabGoldBorder}
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TAB_CONFIG.find(t => t.name === route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              {isFocused ? (
                <LinearGradient
                  colors={[Colors.saffronDark, Colors.saffron]}
                  style={styles.tabActiveIcon}
                >
                  <Text style={styles.tabIconText}>{tab?.icon}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactiveIcon}>
                  <Text style={styles.tabIconText}>{tab?.icon}</Text>
                </View>
              )}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const MainTabs: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <SacredTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    {TAB_CONFIG.map(tab => (
      <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
    ))}
  </Tab.Navigator>
);

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Shadow.dark,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingHorizontal: 4,
    borderTopWidth: 0,
    position: 'relative',
  },
  tabGoldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabActiveIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.gold,
  },
  tabInactiveIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 9,
    color: Colors.brownLight,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Colors.saffron,
    fontWeight: '800',
  },
});

export default AppNavigator;
