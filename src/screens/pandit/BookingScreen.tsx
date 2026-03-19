import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
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

type Props = NativeBottomTabScreenProps<PanditTabParamList, 'Bookings'>

// ── Types ─────────────────────────────────────────────────────────────────────
type BookingStatus = 'confirmed' | 'pending' | 'completed';

interface Booking {
  id: number;
  puja: string;
  person: string;
  address: string;
  date: string;
  duration: string;
  amount: string;
  status: BookingStatus;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const BOOKINGS: Booking[] = [
  {
    id: 1,
    puja: 'Satyanarayan Puja',
    person: 'Ramesh Sharma',
    address: 'Sector 12, Noida',
    date: 'Today, 9:00 AM',
    duration: '3 hrs',
    amount: '₹2,100',
    status: 'confirmed',
  },
  {
    id: 2,
    puja: 'Griha Pravesh',
    person: 'Sunita Verma',
    address: 'Raj Nagar, Ghaziabad',
    date: 'Today, 2:00 PM',
    duration: '5 hrs',
    amount: '₹4,500',
    status: 'confirmed',
  },
  {
    id: 3,
    puja: 'Mundan Sanskar',
    person: 'Anil Gupta',
    address: 'Vaishali, Ghaziabad',
    date: 'Tomorrow, 8:00 AM',
    duration: '2 hrs',
    amount: '₹1,800',
    status: 'pending',
  },
  {
    id: 4,
    puja: 'Kali Mata Puja',
    person: 'Deepa Singh',
    address: 'Indirapuram',
    date: 'Mar 21, 6:00 PM',
    duration: '4 hrs',
    amount: '₹3,200',
    status: 'pending',
  },
  {
    id: 5,
    puja: 'Vivah Panchami',
    person: 'Mohit & Priya',
    address: 'Greater Noida',
    date: 'Mar 18, 10:00 AM',
    duration: '6 hrs',
    amount: '₹7,500',
    status: 'completed',
  },
  {
    id: 6,
    puja: 'Navratri Havan',
    person: 'RWA Sector 11',
    address: 'Sector 11, Noida',
    date: 'Mar 15, 5:00 AM',
    duration: '8 hrs',
    amount: '₹9,000',
    status: 'completed',
  },
];

type Filter = 'all' | BookingStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_CONFIG: Record<
  BookingStatus,
  { color: string; bg: string; label: string; accent: string }
> = {
  confirmed: {
    color: '#2E7D32',
    bg: '#E8F5E9',
    label: 'CONFIRMED',
    accent: '#4CAF50',
  },
  pending: {
    color: '#F57F17',
    bg: '#FFF8E1',
    label: 'PENDING',
    accent: Colors.warning,
  },
  completed: {
    color: '#1565C0',
    bg: '#E3F2FD',
    label: 'COMPLETED',
    accent: Colors.info,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookingsScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered =
    filter === 'all' ? BOOKINGS : BOOKINGS.filter(b => b.status === filter);

  const counts = {
    all: BOOKINGS.length,
    confirmed: BOOKINGS.filter(b => b.status === 'confirmed').length,
    pending: BOOKINGS.filter(b => b.status === 'pending').length,
    completed: BOOKINGS.filter(b => b.status === 'completed').length,
  };

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

      {/* Header */}
      <LinearGradient
        colors={[Colors.secondary, Colors.primary, Colors.gold] as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>Manage</Text>
            <Text style={styles.headerTitle}>Bookings</Text>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={22} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          {counts.confirmed} upcoming · {counts.completed} completed this week
        </Text>
      </LinearGradient>

      {/* Filter chips */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.75}
              style={styles.filterChipWrap}
            >
              {filter === f.key ? (
                <LinearGradient
                  colors={Colors.gradientRam as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filterChipActive}
                >
                  <Text style={styles.filterChipTextActive}>
                    {f.label} {counts[f.key]}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    {f.label} {counts[f.key]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(b => {
          const cfg = STATUS_CONFIG[b.status];
          return (
            <View
              key={b.id}
              style={[styles.bookingCard, { borderLeftColor: cfg.accent }]}
            >
              {/* Top row */}
              <View style={styles.cardTopRow}>
                <Text style={styles.pujaName}>{b.puja}</Text>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                </View>
              </View>

              {/* Person */}
              <View style={styles.personRow}>
                <Ionicons
                  name="person-outline"
                  size={13}
                  color={Colors.textSecondary}
                />
                <Text style={styles.personName}>{b.person}</Text>
              </View>

              {/* Details */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.detailText}>{b.address}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.detailText}>{b.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="hourglass-outline"
                    size={12}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.detailText}>{b.duration}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.amount}>{b.amount}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.btnOutline}>
                    <Text style={styles.btnOutlineText}>Details</Text>
                  </TouchableOpacity>
                  {b.status !== 'completed' && (
                    <TouchableOpacity activeOpacity={0.85}>
                      <LinearGradient
                        colors={Colors.gradientRam as string[]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnFill}
                      >
                        <Text style={styles.btnFillText}>
                          {b.status === 'pending' ? 'Accept' : 'Navigate'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
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
  headerLabel: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterWrap: {
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChipWrap: {},
  filterChipActive: {
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  filterChipText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  filterChipTextActive: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  bookingCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  pujaName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  personName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  detailsRow: { gap: 4, marginBottom: Spacing.sm },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 11, color: Colors.textMuted },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.saffronBg,
  },
  amount: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  btnOutline: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  btnOutlineText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  btnFill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  btnFillText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.3,
  },
});
