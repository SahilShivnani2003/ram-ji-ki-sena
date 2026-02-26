import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { SacredTabBar } from "../components/UI/bottomTabBar";
import CommunityScreen from "../screens/tabs/CommunityScreen";
import HomeScreen from "../screens/tabs/HomeScreen";
import MandirsScreen from "../screens/tabs/MandirsScreen";
import RamNaamScreen from "../screens/tabs/RamNaamScreen";
import { KathaScreen } from "../screens/tabs/kathaScreen";

export type TabParamList = {
    Home: undefined;
    RamNaam: undefined;
    Mandirs: undefined;
    Katha: undefined;
    Community: undefined;
};

interface TabConfig {
    name: keyof TabParamList;
    icon: string;
    label: string;
    screen: React.ComponentType<any>;
}

export const TAB_CONFIG: TabConfig[] = [
    { name: 'Home', icon: '🏠', label: 'होम', screen: HomeScreen },
    { name: 'RamNaam', icon: '📿', label: 'जाप', screen: RamNaamScreen },
    { name: 'Mandirs', icon: '🛕', label: 'मंदिर', screen: MandirsScreen },
    { name: 'Katha', icon: '📖', label: 'कथा', screen: KathaScreen },
    { name: 'Community', icon: '💬', label: 'समाज', screen: CommunityScreen },
];

const Tab = createBottomTabNavigator<TabParamList>();

export const MainTabs: React.FC = () => (
    <Tab.Navigator
        tabBar={(props) => <SacredTabBar {...props} />}
        screenOptions={{ headerShown: false }}
    >
        {TAB_CONFIG.map((tab) => (
            <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
        ))}
    </Tab.Navigator>
);

