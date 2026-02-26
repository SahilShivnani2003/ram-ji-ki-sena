import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text, Platform, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { TAB_CONFIG } from "../../navigation/TabNavigation";
import { Colors, Radius, Shadow } from "../../theme/colors";

export const SacredTabBar: React.FC<BottomTabBarProps> = ({
    state,
    navigation,
}) => (
    <View style={tabStyles.wrapper}>
        <LinearGradient colors={['#FFFFFF', '#FFF8F0']} style={tabStyles.bar}>
            {/* Gold border top */}
            <LinearGradient
                colors={[Colors.saffronDark, Colors.gold, Colors.saffronDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={tabStyles.goldBorder}
            />

            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const tab = TAB_CONFIG.find((t) => t.name === route.name);

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
                        style={tabStyles.item}
                    >
                        {isFocused ? (
                            <LinearGradient
                                colors={[Colors.saffronDark, Colors.saffron]}
                                style={tabStyles.iconActive}
                            >
                                <Text style={tabStyles.iconText}>{tab?.icon}</Text>
                            </LinearGradient>
                        ) : (
                            <View style={tabStyles.iconInactive}>
                                <Text style={tabStyles.iconText}>{tab?.icon}</Text>
                            </View>
                        )}
                        <Text
                            style={[
                                tabStyles.label,
                                isFocused && tabStyles.labelActive,
                            ]}
                        >
                            {tab?.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </LinearGradient>
    </View>
);

const tabStyles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Shadow.dark,
    },
    bar: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        paddingHorizontal: 4,
        position: 'relative',
    },
    goldBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
        gap: 3,
    },
    iconActive: {
        width: 40,
        height: 40,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.gold,
    },
    iconInactive: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: { fontSize: 20 },
    label: {
        fontSize: 9,
        color: Colors.brownLight,
        fontWeight: '600',
    },
    labelActive: {
        color: Colors.saffron,
        fontWeight: '800',
    },
});