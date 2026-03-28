import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme';
import { useI18n } from '../../i18n/index';

// ── Drawer Item Config ────────────────────────────────────────────────────────
interface DrawerItem {
  key: string;
  icon: string;
  iconActive: string;
  label: string;
}

const DRAWER_ITEMS: DrawerItem[] = [
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

// ── Custom Drawer Content ─────────────────────────────────────────────────────
export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (
  props
) => {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { state, navigation } = props;

  const handleItemPress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={Colors.primary} />
          <Text style={styles.appTitle}>Ram Sena</Text>
        </View>
        <View style={styles.headerAccent} />
      </View>

      {/* Drawer Items */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DRAWER_ITEMS.map((item) => {
          const isActive = state.routes[state.index].name === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.drawerItem, isActive && styles.drawerItemActive]}
              onPress={() => handleItemPress(item.key)}
              activeOpacity={0.7}
            >
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={(isActive ? item.iconActive : item.icon) as any}
                    size={24}
                    color={isActive ? Colors.primary : Colors.textSecondary}
                  />
                  {isActive && <View style={styles.activeIndicator} />}
                </View>
                <Text
                  style={[
                    styles.itemLabel,
                    isActive && styles.itemLabelActive,
                  ]}
                >
                  {t[item.label as keyof typeof t] || item.label}
                </Text>
              </View>
              {isActive && <View style={styles.activeBorder} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Text style={styles.footerText}>ॐ श्री राम जय राम जय जय राम ॐ</Text>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  appTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  headerAccent: {
    height: 3,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
  },

  // Drawer Items
  drawerItem: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'transparent',
    ...Shadow.sm,
  },
  drawerItemActive: {
    backgroundColor: Colors.saffronBg,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  itemLabel: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  itemLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },

  // Footer
  footer: {
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    paddingTop: Spacing.lg,
    ...Shadow.sm,
  },
  footerText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});