import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useRef, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    Platform,
    StyleSheet,
    Animated,
    Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TAB_CONFIG } from "../../navigation/TabNavigation";
import { Colors, Radius, Shadow } from "../../theme/colors";

// ─── Vector icon map (MaterialCommunityIcons) ────────────────────────────────
const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
    Home: { active: "home",           inactive: "home-outline" },
    RamNaam: { active: "meditation",  inactive: "meditation" },
    Mandirs: { active: "temple-hindu",inactive: "temple-hindu" },
    Katha:   { active: "book-open",   inactive: "book-open-outline" },
    Community:{ active: "account-group", inactive: "account-group-outline" },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Single Tab Item ──────────────────────────────────────────────────────────
interface TabItemProps {
    route: { key: string; name: string };
    isFocused: boolean;
    onPress: () => void;
    index: number;
}

const TabItem: React.FC<TabItemProps> = ({ route, isFocused, onPress, index }) => {
    const tab    = TAB_CONFIG.find((t) => t.name === route.name);
    const icons  = TAB_ICONS[route.name] ?? { active: "circle", inactive: "circle-outline" };

    // Animated values
    const scaleAnim    = useRef(new Animated.Value(isFocused ? 1 : 0.85)).current;
    const translateY   = useRef(new Animated.Value(isFocused ? -6 : 0)).current;
    const opacityAnim  = useRef(new Animated.Value(isFocused ? 1 : 0.5)).current;
    const dotOpacity   = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const pillScale    = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim,  { toValue: isFocused ? 1 : 0.85,   useNativeDriver: true, tension: 120, friction: 8 }),
            Animated.spring(translateY, { toValue: isFocused ? -6 : 0,      useNativeDriver: true, tension: 120, friction: 8 }),
            Animated.timing(opacityAnim,{ toValue: isFocused ? 1 : 0.5,     useNativeDriver: true, duration: 200 }),
            Animated.spring(dotOpacity, { toValue: isFocused ? 1 : 0,       useNativeDriver: true, tension: 120, friction: 8 }),
            Animated.spring(pillScale,  { toValue: isFocused ? 1 : 0,       useNativeDriver: true, tension: 120, friction: 8 }),
        ]).start();
    }, [isFocused]);

    return (
        <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
        >
            {/* Floating icon container */}
            <Animated.View
                style={[
                    styles.iconWrapper,
                    {
                        transform: [{ scale: scaleAnim }, { translateY }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                {/* Active pill background */}
                <Animated.View style={[styles.pillBg, { transform: [{ scale: pillScale }] }]}>
                    <LinearGradient
                        colors={["#FF6B00", "#FF9500"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

                <Icon
                    name={isFocused ? icons.active : icons.inactive}
                    size={22}
                    color={isFocused ? "#FFFFFF" : Colors.brownLight}
                />
            </Animated.View>

            {/* Label */}
            <Text
                style={[
                    styles.label,
                    isFocused && styles.labelActive,
                ]}
            >
                {tab?.label}
            </Text>

            {/* Active dot indicator */}
            <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
        </TouchableOpacity>
    );
};

// ─── Main Tab Bar ─────────────────────────────────────────────────────────────
export const SacredTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => (
    <View style={styles.wrapper}>
        {/* Soft shadow overlay */}
        <View style={styles.shadowOverlay} />

        <LinearGradient
            colors={["#FFFDF9", "#FFF5E6"]}
            style={styles.bar}
        >
            {/* Decorative top border — saffron shimmer */}
            <LinearGradient
                colors={["transparent", Colors.saffronDark, Colors.gold, Colors.saffronDark, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.goldBorder}
            />

            {/* Om symbol center decoration */}
            <View style={styles.omDot} pointerEvents="none">
                <Text style={styles.omText}>ॐ</Text>
            </View>

            {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TabItem
                        key={route.key}
                        route={route}
                        isFocused={isFocused}
                        onPress={onPress}
                        index={index}
                    />
                );
            })}
        </LinearGradient>
    </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    shadowOverlay: {
        position: "absolute",
        top: -20,
        left: 0,
        right: 0,
        height: 20,
        // Soft upward shadow
        shadowColor: "#8B4513",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 0,
    },
    bar: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 28 : 10,
        paddingHorizontal: 4,
        // Android elevation
        elevation: 24,
        shadowColor: "#8B4513",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
    },
    goldBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2.5,
    },
    item: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 2,
        gap: 4,
    },
    iconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
    },
    pillBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        overflow: "hidden",
        // Glow effect
        shadowColor: "#FF6B00",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
        elevation: 8,
    },
    label: {
        fontSize: 10,
        color: Colors.brownLight,
        fontWeight: "500",
        letterSpacing: 0.2,
    },
    labelActive: {
        color: Colors.saffronDark,
        fontWeight: "800",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.saffron,
    },
    omDot: {
        position: "absolute",
        top: -14,
        left: SCREEN_WIDTH / 2 - 14,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#FFF5E6",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.gold,
        shadowColor: Colors.saffronDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    omText: {
        fontSize: 14,
        color: Colors.saffronDark,
        fontWeight: "800",
    },
});