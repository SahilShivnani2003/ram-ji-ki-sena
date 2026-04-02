import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/tabs/HomeScreen';
import MandirScreen from '../screens/tabs/MandirScreen';
import KathaScreen from '../screens/tabs/KathaScreen';
import PanditScreen from '../screens/tabs/PanditScreen';
import CommunityScreen from '../screens/tabs/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NamLekhanScreen from '../screens/NaamLekhanScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CustomDrawerContent } from '../components/ui/CustomDrawerContent';
import { Colors, Spacing } from '../theme';
import { IDrawerItem } from '../types/IDrawerItems';
import { IDeity } from '../types/IDeity';

export type DrawerParamList = {
    Home: undefined;
    Mandir: undefined;
    Katha: undefined;
    Pandit: undefined;
    Community: undefined;
    Profile: undefined;
    Namlekhan: { deity: IDeity };
};

const drawerItems: IDrawerItem[] = [
    {
        key: 'Home',
        icon: 'home-outline',
        iconActive: 'home',
        label: 'home',
    },
    {
        key: 'Mandir',
        icon: 'business-outline',
        iconActive: 'business',
        label: 'mandirs',
    },
    {
        key: 'Katha',
        icon: 'book-outline',
        iconActive: 'book',
        label: 'katha',
    },
    {
        key: 'Pandit',
        icon: 'person-outline',
        iconActive: 'person',
        label: 'pandits',
    },
    {
        key: 'Community',
        icon: 'people-outline',
        iconActive: 'people',
        label: 'community',
    },
    {
        key: 'Profile',
        icon: 'person-circle-outline',
        iconActive: 'person-circle',
        label: 'profile',
    },
    {
        key: 'Namlekhan',
        icon: 'document-text-outline',
        iconActive: 'document-text',
        label: 'Naam Lekhan',
    },
];
const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={props => <CustomDrawerContent {...props} drawerItems={drawerItems} />}
            screenOptions={{headerShown: false, drawerActiveTintColor: Colors.primary}}
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
