import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import HomeScreen, { IDeity } from '../screens/tabs/HomeScreen';
import NotificationScreen from '../screens/NotificationScreen';
import MandirScreen from '../screens/tabs/MandirScreen';
import KathaScreen from '../screens/tabs/KathaScreen';
import PanditScreen from '../screens/tabs/PanditScreen';
import CommunityScreen from '../screens/tabs/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NamLekhanScreen from '../screens/NaamLekhanScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomDrawerContent } from '../components/ui/CustomDrawerContent';
import { Colors, Spacing } from '../theme';

export type DrawerParamList = {
    Home: undefined;
    Mandir: undefined;
    Katha: undefined;
    Pandit: undefined;
    Community: undefined;
    Profile: undefined;
    Namlekhan: { deity: IDeity };
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={({ navigation }) => ({
                headerStyle: {
                    backgroundColor: Colors.cardBg,
                    elevation: 4,
                    shadowColor: Colors.secondary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                headerTintColor: Colors.textPrimary,
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 18,
                },
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.toggleDrawer()}
                        style={{
                            marginLeft: Spacing.lg,
                            padding: Spacing.sm,
                            borderRadius: 8,
                        }}
                    >
                        <Ionicons
                            name="menu"
                            size={24}
                            color={Colors.primary}
                        />
                    </TouchableOpacity>
                ),
            })}
        >
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Mandir" component={MandirScreen} />
            <Drawer.Screen name="Katha" component={KathaScreen} />
            <Drawer.Screen name="Pandit" component={PanditScreen} />
            <Drawer.Screen name="Community" component={CommunityScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="Namlekhan" component={NamLekhanScreen} />
        </Drawer.Navigator>
    );
}
