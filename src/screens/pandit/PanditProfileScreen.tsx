import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../theme/index';
import { RootParamList } from '../../navigation/AppNavigator';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { PanditTabParamList } from '../../navigation/PanditTabNavigation';

type Props = NativeBottomTabScreenProps<PanditTabParamList, 'Profile'>;

// ── Data ──────────────────────────────────────────────────────────────────────
const SPECIALIZATIONS = [
  'Satyanarayan',
  'Griha Pravesh',
  'Vivah',
  'Navratri',
  'Havan',
  'Mundan',
];

const PROFILE_STATS = [
  { value: '312', label: 'Pujas Done' },
  { value: '4.9 ★', label: 'Rating' },
  { value: '14 yrs', label: 'Experience' },
];

const REVIEWS = [
  {
    name: 'Ramesh S.',
    date: 'Mar 18',
    stars: 5,
    puja: 'Satyanarayan Puja',
    review:
      'Excellent puja, very knowledgeable and punctual. Highly recommended!',
  },
  {
    name: 'Sunita V.',
    date: 'Mar 15',
    stars: 5,
    puja: 'Griha Pravesh',
    review:
      'Very calm and soothing presence. Explained every ritual beautifully!',
  },
  {
    name: 'Anil G.',
    date: 'Mar 10',
    stars: 4,
    puja: 'Mundan Sanskar',
    review: 'Professional, on time, and very thorough. Will book again.',
  },
];

interface MenuItem {
  icon: string;
  label: string;
  sub: string;
  badge?: string;
  destructive?: boolean;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      {
        icon: 'person-outline',
        label: 'Edit Profile',
        sub: 'Name, photo, bio, expertise',
      },
      {
        icon: 'location-outline',
        label: 'Service Areas',
        sub: 'Noida, Ghaziabad, Greater Noida',
      },
      {
        icon: 'pricetag-outline',
        label: 'Puja Pricing',
        sub: 'Set your rates per puja type',
      },
      {
        icon: 'card-outline',
        label: 'Bank Account',
        sub: 'HDFC ···4521 · Linked',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        icon: 'shield-checkmark-outline',
        label: 'Privacy & Security',
        sub: 'Password, 2FA, login sessions',
      },
      { icon: 'language-outline', label: 'Language', sub: 'English · हिंदी' },
      {
        icon: 'notifications-outline',
        label: 'Notifications',
        sub: 'Bookings, payments, updates',
        badge: '3',
      },
      { icon: 'moon-outline', label: 'Appearance', sub: 'Light mode' },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        icon: 'headset-outline',
        label: 'Help & Support',
        sub: 'Chat, call, raise a ticket',
        badge: '2',
      },
      {
        icon: 'document-text-outline',
        label: 'Terms & Privacy',
        sub: 'Legal documents',
      },
      { icon: 'star-outline', label: 'Rate the App', sub: 'Help us improve' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }: Props) {
  const [editMode, setEditMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () =>
          navigation
            .getParent<NativeStackNavigationProp<RootParamList>>()
            .replace('login'),
      },
    ]);
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < count ? 'star' : 'star-outline'}
        size={12}
        color={i < count ? Colors.gold : Colors.border}
      />
    ));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Top band */}
      <LinearGradient
        colors={Colors.gradientRam as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBand}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Hero ── */}
        <LinearGradient
          colors={[Colors.secondary, Colors.primary] as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Edit button */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditMode(p => !p)}
          >
            <Ionicons
              name={editMode ? 'checkmark' : 'pencil-outline'}
              size={16}
              color={Colors.textLight}
            />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>🧑‍🦳</Text>
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark" size={10} color={Colors.textLight} />
            </View>
          </View>

          <Text style={styles.heroName}>Pt. Rajendra Sharma Ji</Text>
          <Text style={styles.heroTitle}>✦ Varanasi Shastriya Pandit ✦</Text>

          {/* Specialization tags */}
          <View style={styles.tagsRow}>
            {SPECIALIZATIONS.map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color="rgba(255,255,255,0.75)"
            />
            <Text style={styles.locationText}>
              Noida, Ghaziabad, Greater Noida
            </Text>
          </View>
        </LinearGradient>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {PROFILE_STATS.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statItem,
                i === 0 && styles.statItemFirst,
                i === PROFILE_STATS.length - 1 && styles.statItemLast,
              ]}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Reviews ── */}
        <Text style={styles.sectionTitle}>Latest Reviews</Text>
        <View style={styles.card}>
          {REVIEWS.map((r, i) => (
            <View
              key={i}
              style={[
                styles.reviewItem,
                i === REVIEWS.length - 1 && styles.reviewItemLast,
              ]}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.reviewLeft}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {r.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Text style={styles.reviewPuja}>
                      {r.puja} · {r.date}
                    </Text>
                  </View>
                </View>
                <View style={styles.starsRow}>{renderStars(r.stars)}</View>
              </View>
              <Text style={styles.reviewText}>{r.review}</Text>
            </View>
          ))}
        </View>

        {/* ── Menu Sections ── */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    i === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconWrap}>
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.menuLabel,
                          item.destructive && { color: Colors.error },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.menuSub}>{item.sub}</Text>
                    </View>
                  </View>
                  <View style={styles.menuRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={Colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Sign Out ── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.versionText}>
          🙏 जय श्री राम · Aaradhana v1.0.0
        </Text>
      </ScrollView>

      {/* Bottom band */}
      <LinearGradient
        colors={
          [
            Colors.secondary,
            Colors.primary,
            Colors.gold,
            Colors.primary,
            Colors.secondary,
          ] as string[]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomBand}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBand: { height: 3, width: '100%' },
  bottomBand: { height: 3, width: '100%' },

  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  sectionTitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },

  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadow.sm,
  },

  // Hero
  heroCard: {
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    position: 'relative',
    ...Shadow.lg,
  },
  editBtn: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarEmoji: { fontSize: 36 },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
    marginTop: 3,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  tagText: { fontSize: 10, color: Colors.textLight, letterSpacing: 0.5 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  locationText: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statItemFirst: {},
  statItemLast: { borderRightWidth: 0 },
  statValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Reviews
  reviewItem: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.saffronBg,
  },
  reviewItemLast: { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  reviewLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.saffronBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewPuja: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  starsRow: { flexDirection: 'row', gap: 1 },
  reviewText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Menu
  menuCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.saffronBg,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.saffronBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuSub: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: Colors.textLight },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  signOutText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
