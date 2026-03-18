import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useI18n } from '../../i18n';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme';
import { Itab } from '../../types/tab.types';

// ── Export so screens can pad their content correctly ─────────────────────────
export const TAB_BAR_HEIGHT = 72;

// ── Types ─────────────────────────────────────────────────────────────────────
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  tabs: Itab[];
}

// ── Single Tab Item ───────────────────────────────────────────────────────────
interface TabItemProps {
  isActive: boolean;
  icon: string;
  iconActive: string;
  label: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

const TabItem: React.FC<TabItemProps> = ({
  isActive,
  icon,
  iconActive,
  label,
  onPress,
  onLongPress,
  accessibilityLabel,
  testID,
}) => {
  const dotScale = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const dotOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const labelAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const iconAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(dotScale, {
        toValue: isActive ? 1 : 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(dotOpacity, {
        toValue: isActive ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelAnim, {
        toValue: isActive ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(iconAnim, {
        toValue: isActive ? 1 : 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const iconScale = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const iconTranslateY = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tab}
    >
      <Animated.View
        style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}
      >
        {/* Glow background circle on active */}
        <Animated.View
          style={[
            styles.glowCircle,
            { opacity: dotOpacity, transform: [{ scale: dotScale }] },
          ]}
        />

        {/* Icon */}
        <Animated.View
          style={{
            transform: [{ scale: iconScale }, { translateY: iconTranslateY }],
          }}
        >
          <Ionicons
            name={(isActive ? iconActive : icon) as any}
            size={23}
            color={isActive ? Colors.primary : Colors.textMuted}
          />
        </Animated.View>
      </Animated.View>

      {/* Label */}
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.label,
          isActive && styles.labelActive,
          { opacity: isActive ? 1 : 0.55 },
        ]}
      >
        {label}
      </Animated.Text>

      {/* Active dot */}
      <Animated.View
        style={[
          styles.activeDot,
          {
            opacity: dotOpacity,
            transform: [{ scaleX: dotScale }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

// ── Custom Tab Bar ────────────────────────────────────────────────────────────
export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  tabs,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const labelMap: Record<string, string> = {
    Home: t.home,
    Mandirs: t.mandirs,
    Katha: t.katha,
    Pandits: t.pandits,
    Community: t.community,
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      {/* Top gradient line */}
      <View style={styles.topLine} />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isActive = state.index === index;
        const tab = tabs.find(tb => tb.key === route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabItem
            key={route.key}
            isActive={isActive}
            icon={tab?.icon ?? 'ellipse-outline'}
            iconActive={tab?.iconActive ?? 'ellipse'}
            label={labelMap[route.name] ?? route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
          />
        );
      })}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    ...Shadow.lg,
  },

  // Thin saffron accent at very top
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.18,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingBottom: 2,
    gap: 2,
  },

  iconWrap: {
    width: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Soft saffron circle behind active icon
  glowCircle: {
    position: 'absolute',
    width: 40,
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    opacity: 0.12,
  },

  label: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Small saffron pill dot at bottom of active tab
  activeDot: {
    width: 18,
    height: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
});
