import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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

type Props = NativeBottomTabScreenProps<PanditTabParamList, 'Home'>;

// ── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  {
    icon: 'calendar-outline',
    value: '4',
    label: 'PUJAS TODAY',
    change: '+1 from yesterday',
    changeUp: true,
    accent: Colors.primary,
  },
  {
    icon: 'cash-outline',
    value: '₹8,100',
    label: "TODAY'S EARNINGS",
    change: '+₹2,400',
    changeUp: true,
    accent: Colors.gold,
  },
];

const QUICK_STATS = [
  {
    icon: 'star-outline',
    value: '4.9',
    label: 'RATING',
    accent: Colors.secondary,
  },
  {
    icon: 'checkmark-done-outline',
    value: '312',
    label: 'COMPLETED',
    accent: '#4CAF50',
  },
  {
    icon: 'notifications-outline',
    value: '6',
    label: 'PENDING',
    accent: Colors.gold,
  },
];

const SCHEDULE = [
  {
    time: '9:00 AM',
    puja: 'Satyanarayan Puja',
    person: 'Ramesh Sharma · Sector 12',
    amount: '₹2,100',
    dotColor: Colors.primary,
  },
  {
    time: '12:30 PM',
    puja: 'Travel Time',
    person: 'Raj Nagar, Ghaziabad',
    amount: '',
    dotColor: Colors.gold,
  },
  {
    time: '2:00 PM',
    puja: 'Griha Pravesh',
    person: 'Sunita Verma · Raj Nagar',
    amount: '₹4,500',
    dotColor: '#4CAF50',
  },
  {
    time: '7:00 PM',
    puja: 'Evening Aarti',
    person: 'Personal',
    amount: '',
    dotColor: Colors.gold,
  },
];

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline', label: 'New\nBooking' },
  { icon: 'calendar-outline', label: 'Calendar' },
  { icon: 'chatbubble-outline', label: 'Messages' },
  { icon: 'time-outline', label: 'Availability' },
];

const WEEKLY_BARS = [
  { pct: 0.65, label: 'W1' },
  { pct: 0.8, label: 'W2' },
  { pct: 0.9, label: 'W3' },
  { pct: 0.6, label: 'W4' },
];

const BAR_MAX_H = 64;

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: Props) {
  const [available, setAvailable] = useState(true);
  
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Top saffron band */}
      <LinearGradient
        colors={Colors.gradientRam as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBand}
      />

      {/* ── Header ── */}
      <LinearGradient
        colors={[Colors.secondary, Colors.primary, Colors.gold] as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarEmoji}>🧑‍🦳</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Jai Shri Ram 🙏</Text>
              <Text style={styles.panditName}>Pt. Rajendra Sharma Ji</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBadge}>
            <Text style={styles.notifText}>🔔 3</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          Varanasi Shastriya Pandit · 14 yrs experience
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Availability Toggle ── */}
        <View style={styles.availRow}>
          <View style={styles.availLeft}>
            <View
              style={[
                styles.availDot,
                { backgroundColor: available ? '#4CAF50' : Colors.textMuted },
              ]}
            />
            <View>
              <Text style={styles.availTitle}>
                {available ? 'Available for Bookings' : 'Currently Unavailable'}
              </Text>
              <Text style={styles.availSub}>
                {available
                  ? 'Accepting new puja requests'
                  : 'Toggle to accept requests'}
              </Text>
            </View>
          </View>
          <Switch
            value={available}
            onValueChange={setAvailable}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={available ? Colors.primary : Colors.textMuted}
          />
        </View>

        {/* ── Today's Snapshot ── */}
        <Text style={styles.sectionTitle}>Today's Snapshot</Text>
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View
              key={s.label}
              style={[styles.statCard, { borderTopColor: s.accent }]}
            >
              <Ionicons name={s.icon} size={22} color={s.accent} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text
                style={[
                  styles.statChange,
                  { color: s.changeUp ? '#4CAF50' : Colors.error },
                ]}
              >
                {s.changeUp ? '↑' : '↓'} {s.change}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow3}>
          {QUICK_STATS.map(s => (
            <View
              key={s.label}
              style={[styles.statCard3, { borderTopColor: s.accent }]}
            >
              <Ionicons name={s.icon} size={18} color={s.accent} />
              <Text style={styles.statValue3}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.card}>
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity
                key={a.label}
                style={styles.qaBtn}
                activeOpacity={0.75}
              >
                <Ionicons name={a.icon} size={24} color={Colors.primary} />
                <Text style={styles.qaLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Today's Schedule ── */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.card}>
          {SCHEDULE.map((s, i) => (
            <View
              key={i}
              style={[
                styles.scheduleItem,
                i === SCHEDULE.length - 1 && styles.scheduleItemLast,
              ]}
            >
              <Text style={styles.scheduleTime}>{s.time}</Text>
              <View
                style={[styles.scheduleDot, { backgroundColor: s.dotColor }]}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.schedulePuja}>{s.puja}</Text>
                <Text style={styles.schedulePerson}>{s.person}</Text>
              </View>
              {!!s.amount && (
                <Text style={styles.scheduleAmount}>{s.amount}</Text>
              )}
            </View>
          ))}
        </View>

        {/* ── Monthly Earnings Preview ── */}
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.card}>
          <View style={styles.earningsPreviewRow}>
            <View>
              <Text style={styles.earningsPreviewLabel}>MARCH EARNINGS</Text>
              <Text style={styles.earningsPreviewVal}>₹42,800</Text>
            </View>
            <View style={styles.changePill}>
              <Text style={styles.changePillText}>+18% vs Feb</Text>
            </View>
          </View>
          {/* Mini bar chart */}
          <View style={styles.chartRow}>
            {WEEKLY_BARS.map((b, i) => (
              <View key={i} style={styles.barWrapper}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight] as string[]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={[styles.bar, { height: BAR_MAX_H * b.pct }]}
                />
                <Text style={styles.barLabel}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom saffron band */}
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

  // Header
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  greeting: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  panditName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  notifBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  notifText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },

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

  // Availability
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    ...Shadow.sm,
  },
  availLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  availSub: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2 },

  // Stats 2-col
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 3,
    padding: Spacing.md,
    gap: 3,
    ...Shadow.sm,
  },
  statValue: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  statLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1 },
  statChange: { fontSize: 10, marginTop: 2 },

  // Stats 3-col
  statsRow3: { flexDirection: 'row', gap: Spacing.sm },
  statCard3: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 3,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 3,
    ...Shadow.sm,
  },
  statValue3: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadow.sm,
  },

  // Quick actions
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  qaBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  qaLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Schedule
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.saffronBg,
  },
  scheduleItemLast: { borderBottomWidth: 0 },
  scheduleTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    width: 58,
    letterSpacing: 0.3,
  },
  scheduleDot: { width: 8, height: 8, borderRadius: 4 },
  scheduleInfo: { flex: 1 },
  schedulePuja: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  schedulePerson: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  scheduleAmount: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Earnings preview
  earningsPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  earningsPreviewLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  earningsPreviewVal: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  changePill: {
    backgroundColor: Colors.saffronBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  changePillText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },

  // Mini bar chart
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_MAX_H + 24,
    gap: Spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 9, color: Colors.textMuted },
});
