// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Switch,
//   StatusBar,
//   Animated,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import {
//   Colors,
//   Fonts,
//   Spacing,
//   BorderRadius,
//   Shadow,
// } from '../../theme/index';
// import { RootParamList } from '../../navigation/AppNavigator';
// import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
// import { PanditTabParamList } from '../../navigation/PanditTabNavigation';
// import { panditDashboardAPI } from '../../service/apis/panditDashboardService';

// type Props = NativeBottomTabScreenProps<PanditTabParamList, 'Home'>;

// // ── Data ─────────────────────────────────────────────────────────────────────
// const STATS = [
//   {
//     icon: 'calendar-outline',
//     value: '4',
//     label: 'PUJAS TODAY',
//     change: '+1 from yesterday',
//     changeUp: true,
//     accent: Colors.primary,
//   },
//   {
//     icon: 'cash-outline',
//     value: '₹8,100',
//     label: "TODAY'S EARNINGS",
//     change: '+₹2,400',
//     changeUp: true,
//     accent: Colors.gold,
//   },
// ];

// const QUICK_STATS = [
//   {
//     icon: 'star-outline',
//     value: '4.9',
//     label: 'RATING',
//     accent: Colors.secondary,
//   },
//   {
//     icon: 'checkmark-done-outline',
//     value: '312',
//     label: 'COMPLETED',
//     accent: '#4CAF50',
//   },
//   {
//     icon: 'notifications-outline',
//     value: '6',
//     label: 'PENDING',
//     accent: Colors.gold,
//   },
// ];

// const SCHEDULE = [
//   {
//     time: '9:00 AM',
//     puja: 'Satyanarayan Puja',
//     person: 'Ramesh Sharma · Sector 12',
//     amount: '₹2,100',
//     dotColor: Colors.primary,
//   },
//   {
//     time: '12:30 PM',
//     puja: 'Travel Time',
//     person: 'Raj Nagar, Ghaziabad',
//     amount: '',
//     dotColor: Colors.gold,
//   },
//   {
//     time: '2:00 PM',
//     puja: 'Griha Pravesh',
//     person: 'Sunita Verma · Raj Nagar',
//     amount: '₹4,500',
//     dotColor: '#4CAF50',
//   },
//   {
//     time: '7:00 PM',
//     puja: 'Evening Aarti',
//     person: 'Personal',
//     amount: '',
//     dotColor: Colors.gold,
//   },
// ];

// const QUICK_ACTIONS = [
//   { icon: 'add-circle-outline', label: 'New\nBooking' },
//   { icon: 'calendar-outline', label: 'Calendar' },
//   { icon: 'chatbubble-outline', label: 'Messages' },
//   { icon: 'time-outline', label: 'Availability' },
// ];

// const WEEKLY_BARS = [
//   { pct: 0.65, label: 'W1' },
//   { pct: 0.8, label: 'W2' },
//   { pct: 0.9, label: 'W3' },
//   { pct: 0.6, label: 'W4' },
// ];

// const BAR_MAX_H = 64;

// // ── Component ─────────────────────────────────────────────────────────────────
// export default function HomeScreen({ navigation }: Props) {
//   const [available, setAvailable] = useState(true);
//   const [stats, setStats] = useState(STATS);
//   const [upcomingBooking, setUpcomingBooking] = useState();

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     const response = await panditDashboardAPI.stats();
//     setStats(response.data?.stats);
//     setUpcomingBooking(response.data?.upcomingBookings);
//   }

//   return (
//     <View style={styles.root}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

//       {/* Top saffron band */}
//       <LinearGradient
//         colors={Colors.gradientRam as string[]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//         style={styles.topBand}
//       />

//       {/* ── Header ── */}
//       <LinearGradient
//         colors={[Colors.secondary, Colors.primary, Colors.gold] as string[]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.header}
//       >
//         <View style={styles.headerRow}>
//           <View style={styles.headerLeft}>
//             <View style={styles.avatarWrap}>
//               <Text style={styles.avatarEmoji}>🧑‍🦳</Text>
//             </View>
//             <View>
//               <Text style={styles.greeting}>Jai Shri Ram 🙏</Text>
//               <Text style={styles.panditName}>Pt. Rajendra Sharma Ji</Text>
//             </View>
//           </View>
//           <TouchableOpacity style={styles.notifBadge}>
//             <Text style={styles.notifText}>🔔 3</Text>
//           </TouchableOpacity>
//         </View>
//         <Text style={styles.headerSub}>
//           Varanasi Shastriya Pandit · 14 yrs experience
//         </Text>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         {/* ── Availability Toggle ── */}
//         <View style={styles.availRow}>
//           <View style={styles.availLeft}>
//             <View
//               style={[
//                 styles.availDot,
//                 { backgroundColor: available ? '#4CAF50' : Colors.textMuted },
//               ]}
//             />
//             <View>
//               <Text style={styles.availTitle}>
//                 {available ? 'Available for Bookings' : 'Currently Unavailable'}
//               </Text>
//               <Text style={styles.availSub}>
//                 {available
//                   ? 'Accepting new puja requests'
//                   : 'Toggle to accept requests'}
//               </Text>
//             </View>
//           </View>
//           <Switch
//             value={available}
//             onValueChange={setAvailable}
//             trackColor={{ false: Colors.border, true: Colors.primaryLight }}
//             thumbColor={available ? Colors.primary : Colors.textMuted}
//           />
//         </View>

//         {/* ── Today's Snapshot ── */}
//         <Text style={styles.sectionTitle}>Today's Snapshot</Text>
//         <View style={styles.statsRow}>
//           {STATS.map(s => (
//             <View
//               key={s.label}
//               style={[styles.statCard, { borderTopColor: s.accent }]}
//             >
//               <Ionicons name={s.icon} size={22} color={s.accent} />
//               <Text style={styles.statValue}>{s.value}</Text>
//               <Text style={styles.statLabel}>{s.label}</Text>
//               <Text
//                 style={[
//                   styles.statChange,
//                   { color: s.changeUp ? '#4CAF50' : Colors.error },
//                 ]}
//               >
//                 {s.changeUp ? '↑' : '↓'} {s.change}
//               </Text>
//             </View>
//           ))}
//         </View>

//         <View style={styles.statsRow3}>
//           {QUICK_STATS.map(s => (
//             <View
//               key={s.label}
//               style={[styles.statCard3, { borderTopColor: s.accent }]}
//             >
//               <Ionicons name={s.icon} size={18} color={s.accent} />
//               <Text style={styles.statValue3}>{s.value}</Text>
//               <Text style={styles.statLabel}>{s.label}</Text>
//             </View>
//           ))}
//         </View>

//         {/* ── Quick Actions ── */}
//         <Text style={styles.sectionTitle}>Quick Actions</Text>
//         <View style={styles.card}>
//           <View style={styles.quickActionsRow}>
//             {QUICK_ACTIONS.map(a => (
//               <TouchableOpacity
//                 key={a.label}
//                 style={styles.qaBtn}
//                 activeOpacity={0.75}
//               >
//                 <Ionicons name={a.icon} size={24} color={Colors.primary} />
//                 <Text style={styles.qaLabel}>{a.label}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* ── Today's Schedule ── */}
//         <Text style={styles.sectionTitle}>Today's Schedule</Text>
//         <View style={styles.card}>
//           {SCHEDULE.map((s, i) => (
//             <View
//               key={i}
//               style={[
//                 styles.scheduleItem,
//                 i === SCHEDULE.length - 1 && styles.scheduleItemLast,
//               ]}
//             >
//               <Text style={styles.scheduleTime}>{s.time}</Text>
//               <View
//                 style={[styles.scheduleDot, { backgroundColor: s.dotColor }]}
//               />
//               <View style={styles.scheduleInfo}>
//                 <Text style={styles.schedulePuja}>{s.puja}</Text>
//                 <Text style={styles.schedulePerson}>{s.person}</Text>
//               </View>
//               {!!s.amount && (
//                 <Text style={styles.scheduleAmount}>{s.amount}</Text>
//               )}
//             </View>
//           ))}
//         </View>

//         {/* ── Monthly Earnings Preview ── */}
//         <Text style={styles.sectionTitle}>This Month</Text>
//         <View style={styles.card}>
//           <View style={styles.earningsPreviewRow}>
//             <View>
//               <Text style={styles.earningsPreviewLabel}>MARCH EARNINGS</Text>
//               <Text style={styles.earningsPreviewVal}>₹42,800</Text>
//             </View>
//             <View style={styles.changePill}>
//               <Text style={styles.changePillText}>+18% vs Feb</Text>
//             </View>
//           </View>
//           {/* Mini bar chart */}
//           <View style={styles.chartRow}>
//             {WEEKLY_BARS.map((b, i) => (
//               <View key={i} style={styles.barWrapper}>
//                 <LinearGradient
//                   colors={[Colors.primary, Colors.primaryLight] as string[]}
//                   start={{ x: 0, y: 1 }}
//                   end={{ x: 0, y: 0 }}
//                   style={[styles.bar, { height: BAR_MAX_H * b.pct }]}
//                 />
//                 <Text style={styles.barLabel}>{b.label}</Text>
//               </View>
//             ))}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom saffron band */}
//       <LinearGradient
//         colors={
//           [
//             Colors.secondary,
//             Colors.primary,
//             Colors.gold,
//             Colors.primary,
//             Colors.secondary,
//           ] as string[]
//         }
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//         style={styles.bottomBand}
//       />
//     </View>
//   );
// }

// // ── Styles ────────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: Colors.background },

//   topBand: { height: 3, width: '100%' },
//   bottomBand: { height: 3, width: '100%' },

//   // Header
//   header: {
//     paddingHorizontal: Spacing.xl,
//     paddingTop: Spacing.lg,
//     paddingBottom: Spacing.md,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
//   avatarWrap: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.5)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarEmoji: { fontSize: 22 },
//   greeting: {
//     fontSize: Fonts.sizes.xs,
//     color: 'rgba(255,255,255,0.8)',
//     letterSpacing: 1,
//   },
//   panditName: {
//     fontSize: Fonts.sizes.lg,
//     fontWeight: '700',
//     color: Colors.textLight,
//     letterSpacing: 0.5,
//   },
//   notifBadge: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.3)',
//     borderRadius: 20,
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 4,
//   },
//   notifText: {
//     fontSize: Fonts.sizes.xs,
//     color: Colors.textLight,
//     letterSpacing: 1,
//   },
//   headerSub: {
//     fontSize: Fonts.sizes.xs,
//     color: 'rgba(255,255,255,0.7)',
//     letterSpacing: 0.5,
//     marginTop: Spacing.xs,
//   },

//   scroll: {
//     paddingHorizontal: Spacing.xl,
//     paddingTop: Spacing.lg,
//     paddingBottom: Spacing.xxxl,
//   },

//   sectionTitle: {
//     fontSize: Fonts.sizes.xs,
//     color: Colors.primary,
//     fontWeight: '700',
//     letterSpacing: 3,
//     textTransform: 'uppercase',
//     marginBottom: Spacing.sm,
//     marginTop: Spacing.lg,
//   },

//   // Availability
//   availRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: Colors.cardBg,
//     borderRadius: BorderRadius.md,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     paddingHorizontal: Spacing.lg,
//     paddingVertical: Spacing.md,
//     marginTop: Spacing.xs,
//     ...Shadow.sm,
//   },
//   availLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
//   availDot: { width: 8, height: 8, borderRadius: 4 },
//   availTitle: {
//     fontSize: Fonts.sizes.sm,
//     fontWeight: '600',
//     color: Colors.textPrimary,
//   },
//   availSub: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2 },

//   // Stats 2-col
//   statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
//   statCard: {
//     flex: 1,
//     backgroundColor: Colors.cardBg,
//     borderRadius: BorderRadius.md,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderTopWidth: 3,
//     padding: Spacing.md,
//     gap: 3,
//     ...Shadow.sm,
//   },
//   statValue: {
//     fontSize: Fonts.sizes.xxl,
//     fontWeight: '700',
//     color: Colors.textPrimary,
//     marginTop: 4,
//   },
//   statLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1 },
//   statChange: { fontSize: 10, marginTop: 2 },

//   // Stats 3-col
//   statsRow3: { flexDirection: 'row', gap: Spacing.sm },
//   statCard3: {
//     flex: 1,
//     backgroundColor: Colors.cardBg,
//     borderRadius: BorderRadius.md,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderTopWidth: 3,
//     padding: Spacing.md,
//     alignItems: 'center',
//     gap: 3,
//     ...Shadow.sm,
//   },
//   statValue3: {
//     fontSize: Fonts.sizes.xl,
//     fontWeight: '700',
//     color: Colors.textPrimary,
//   },

//   // Card
//   card: {
//     backgroundColor: Colors.cardBg,
//     borderRadius: BorderRadius.md,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     padding: Spacing.lg,
//     ...Shadow.sm,
//   },

//   // Quick actions
//   quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   qaBtn: {
//     flex: 1,
//     alignItems: 'center',
//     gap: 5,
//     paddingVertical: Spacing.sm,
//     borderRadius: BorderRadius.sm,
//   },
//   qaLabel: {
//     fontSize: 9,
//     color: Colors.textSecondary,
//     letterSpacing: 0.5,
//     textAlign: 'center',
//     fontWeight: '600',
//   },

//   // Schedule
//   scheduleItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     paddingVertical: Spacing.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.saffronBg,
//   },
//   scheduleItemLast: { borderBottomWidth: 0 },
//   scheduleTime: {
//     fontSize: 11,
//     color: Colors.textMuted,
//     fontWeight: '600',
//     width: 58,
//     letterSpacing: 0.3,
//   },
//   scheduleDot: { width: 8, height: 8, borderRadius: 4 },
//   scheduleInfo: { flex: 1 },
//   schedulePuja: {
//     fontSize: Fonts.sizes.sm,
//     fontWeight: '600',
//     color: Colors.textPrimary,
//   },
//   schedulePerson: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
//   scheduleAmount: {
//     fontSize: Fonts.sizes.sm,
//     fontWeight: '700',
//     color: Colors.primary,
//   },

//   // Earnings preview
//   earningsPreviewRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: Spacing.md,
//   },
//   earningsPreviewLabel: {
//     fontSize: 10,
//     color: Colors.textMuted,
//     letterSpacing: 1,
//   },
//   earningsPreviewVal: {
//     fontSize: Fonts.sizes.xxl,
//     fontWeight: '800',
//     color: Colors.textPrimary,
//     marginTop: 2,
//   },
//   changePill: {
//     backgroundColor: Colors.saffronBg,
//     borderWidth: 1,
//     borderColor: Colors.border,
//     borderRadius: 20,
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: 3,
//   },
//   changePillText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },

//   // Mini bar chart
//   chartRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     height: BAR_MAX_H + 24,
//     gap: Spacing.sm,
//   },
//   barWrapper: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     gap: 4,
//   },
//   bar: { width: '100%', borderRadius: 4 },
//   barLabel: { fontSize: 9, color: Colors.textMuted },
// });
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../theme/index';
import { PanditTabParamList } from '../../navigation/PanditTabNavigation';
import { panditDashboardAPI } from '../../service/apis/panditDashboardService';
// 👇 adjust to wherever you keep the dashboard interfaces
import type {
  IPanditDashboardResponse,
  IPanditDashboardStats,
  IUpcomingBooking,
} from '../../types/panditDashboard';

type Props = NativeBottomTabScreenProps<PanditTabParamList, 'Home'>;

// ── View models (what the UI renders) ────────────────────────────────────────
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface OverviewCard {
  icon: IconName;
  value: string;
  label: string;
  note: string;
  noteColor: string;
  accent: string;
}

interface QuickStat {
  icon: IconName;
  value: string;
  label: string;
  accent: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  dateLabel: string;
  puja: string;
  person: string;
  amount: string;
  dotColor: string;
}

interface BarDatum {
  label: string;
  count: number;
}

interface QuickAction {
  icon: IconName;
  label: string;
}

const QUICK_ACTIONS: ReadonlyArray<QuickAction> = [
  { icon: 'add-circle-outline', label: 'New\nBooking' },
  { icon: 'calendar-outline', label: 'Calendar' },
  { icon: 'chatbubble-outline', label: 'Messages' },
  { icon: 'time-outline', label: 'Availability' },
];

const BAR_MAX_H = 64;
const BAR_MIN_H = 4;

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86_400_000;

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (amount: number): string => {
  const [int, dec] = amount.toFixed(2).split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`
    : last3;
  return `₹${grouped}${dec === '00' ? '' : `.${dec}`}`;
};

/** Reads the calendar day from "YYYY-MM-DD…" without timezone drift. */
const parseBookingDate = (value: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const formatDateLabel = (value: string): string => {
  const d = parseBookingDate(value);
  if (!d) return value;
  const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

/** "9:06 PM" → minutes since midnight (0 if it can't be parsed). */
const timeToMinutes = (time: string): number => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(time.trim());
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3]?.toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
};

const dotColorForStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return Colors.success;
    case 'pending':
      return Colors.gold;
    default:
      return Colors.primary;
  }
};

// ── API → view-model mappers ─────────────────────────────────────────────────
const buildOverview = (s: IPanditDashboardStats): OverviewCard[] => [
  {
    icon: 'calendar-outline',
    value: String(s.totalBookings),
    label: 'TOTAL BOOKINGS',
    note: `${s.pendingBookings} pending · ${s.confirmedBookings} confirmed`,
    noteColor: Colors.goldDark,
    accent: Colors.primary,
  },
  {
    icon: 'cash-outline',
    value: formatINR(s.totalEarnings),
    label: 'TOTAL EARNINGS',
    note: `from ${s.completedBookings} completed ${s.completedBookings === 1 ? 'puja' : 'pujas'
      }`,
    noteColor: Colors.success,
    accent: Colors.gold,
  },
];

const buildQuickStats = (s: IPanditDashboardStats): QuickStat[] => [
  {
    icon: 'star-outline',
    value: s.totalReviews > 0 ? s.averageRating.toFixed(1) : '—',
    label: 'RATING',
    accent: Colors.secondary,
  },
  {
    icon: 'checkmark-done-outline',
    value: String(s.completedBookings),
    label: 'COMPLETED',
    accent: Colors.success,
  },
  {
    icon: 'notifications-outline',
    value: String(s.pendingBookings),
    label: 'PENDING',
    accent: Colors.gold,
  },
];

const buildBars = (s: IPanditDashboardStats): BarDatum[] => [
  { label: 'Pending', count: s.pendingBookings },
  { label: 'Confirmed', count: s.confirmedBookings },
  { label: 'Completed', count: s.completedBookings },
];

const buildSchedule = (bookings: IUpcomingBooking[]): ScheduleItem[] =>
  [...bookings]
    .sort((a, b) => {
      const da = parseBookingDate(a.poojaDate)?.getTime() ?? 0;
      const db = parseBookingDate(b.poojaDate)?.getTime() ?? 0;
      return da - db || timeToMinutes(a.poojaTime) - timeToMinutes(b.poojaTime);
    })
    .map(b => ({
      id: b._id,
      time: b.poojaTime,
      dateLabel: formatDateLabel(b.poojaDate),
      puja: b.poojaType,
      person: [b.user.name, b.location.city].filter(Boolean).join(' · '),
      amount: formatINR(b.totalAmount),
      dotColor: dotColorForStatus(b.status),
    }));

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomeScreen(_props: Props) {
  const [available, setAvailable] = useState(true);
  const [dashboard, setDashboard] = useState<IPanditDashboardResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await panditDashboardAPI.stats();
      const data = response.data as IPanditDashboardResponse | undefined;
      if (!mounted.current) return;
      if (!data?.stats) {
        throw new Error('Dashboard data was not returned.');
      }
      setDashboard({
        stats: data.stats,
        upcomingBookings: data.upcomingBookings ?? [],
      });
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchDashboard();
  }, [fetchDashboard]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    void fetchDashboard();
  }, [fetchDashboard]);

  const stats = dashboard?.stats ?? null;

  const overview = useMemo(() => (stats ? buildOverview(stats) : []), [stats]);
  const quickStats = useMemo(
    () => (stats ? buildQuickStats(stats) : []),
    [stats],
  );
  const bars = useMemo(() => (stats ? buildBars(stats) : []), [stats]);
  const schedule = useMemo(
    () => buildSchedule(dashboard?.upcomingBookings ?? []),
    [dashboard],
  );

  const barMax = useMemo(
    () => bars.reduce((max, b) => Math.max(max, b.count), 0),
    [bars],
  );
  const completionRate =
    stats && stats.totalBookings > 0
      ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
      : 0;

  const headerSub = stats
    ? stats.totalReviews > 0
      ? `★ ${stats.averageRating.toFixed(1)} rating · ${stats.totalReviews} ${stats.totalReviews === 1 ? 'review' : 'reviews'
      }`
      : 'No reviews yet'
    : 'Pandit dashboard';

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
              {/* TODO: the dashboard API has no profile data – plug in the
                  logged-in pandit's name from your auth/profile store here. */}
              <Text style={styles.panditName}>Pandit Ji</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBadge}>
            <Text style={styles.notifText}>
              🔔{stats && stats.pendingBookings > 0 ? ` ${stats.pendingBookings}` : ''}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>{headerSub}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateSub}>Loading your dashboard…</Text>
        </View>
      ) : !dashboard ? (
        <View style={styles.centerState}>
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color={Colors.textMuted}
          />
          <Text style={styles.stateTitle}>Couldn't load your dashboard</Text>
          <Text style={styles.stateSub}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            activeOpacity={0.8}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {/* Refresh failed but we still have older data */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                Couldn't refresh · pull down to try again
              </Text>
            </View>
          ) : null}

          {/* ── Availability Toggle ── */}
          <View style={styles.availRow}>
            <View style={styles.availLeft}>
              <View
                style={[
                  styles.availDot,
                  {
                    backgroundColor: available
                      ? Colors.success
                      : Colors.textMuted,
                  },
                ]}
              />
              <View>
                <Text style={styles.availTitle}>
                  {available
                    ? 'Available for Bookings'
                    : 'Currently Unavailable'}
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

          {/* ── Overview ── */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            {overview.map(s => (
              <View
                key={s.label}
                style={[styles.statCard, { borderTopColor: s.accent }]}
              >
                <Ionicons name={s.icon} size={22} color={s.accent} />
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statChange, { color: s.noteColor }]}>
                  {s.note}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.statsRow3}>
            {quickStats.map(s => (
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

          {/* ── Upcoming Bookings ── */}
          <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
          <View style={styles.card}>
            {schedule.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyEmoji}>🪔</Text>
                <Text style={styles.emptyTitle}>No upcoming bookings</Text>
                <Text style={styles.emptySub}>
                  New puja requests will show up here.
                </Text>
              </View>
            ) : (
              schedule.map((s, i) => (
                <View
                  key={s.id}
                  style={[
                    styles.scheduleItem,
                    i === schedule.length - 1 && styles.scheduleItemLast,
                  ]}
                >
                  <View style={styles.scheduleTimeWrap}>
                    <Text style={styles.scheduleTime}>{s.time}</Text>
                    <Text style={styles.scheduleDate}>{s.dateLabel}</Text>
                  </View>
                  <View
                    style={[styles.scheduleDot, { backgroundColor: s.dotColor }]}
                  />
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.schedulePuja} numberOfLines={1}>
                      {s.puja}
                    </Text>
                    <Text style={styles.schedulePerson} numberOfLines={1}>
                      {s.person}
                    </Text>
                  </View>
                  {!!s.amount && (
                    <Text style={styles.scheduleAmount}>{s.amount}</Text>
                  )}
                </View>
              ))
            )}
          </View>

          {/* ── Booking Status ── */}
          <Text style={styles.sectionTitle}>Booking Status</Text>
          <View style={styles.card}>
            <View style={styles.earningsPreviewRow}>
              <View>
                <Text style={styles.earningsPreviewLabel}>COMPLETION RATE</Text>
                <Text style={styles.earningsPreviewVal}>{completionRate}%</Text>
              </View>
              <View style={styles.changePill}>
                <Text style={styles.changePillText}>
                  {stats?.totalBookings ?? 0} total
                </Text>
              </View>
            </View>
            {/* Mini bar chart */}
            <View style={styles.chartRow}>
              {bars.map(b => {
                const pct = barMax > 0 ? b.count / barMax : 0;
                return (
                  <View key={b.label} style={styles.barWrapper}>
                    <Text style={styles.barValue}>{b.count}</Text>
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryLight] as string[]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      style={[
                        styles.bar,
                        { height: Math.max(BAR_MIN_H, BAR_MAX_H * pct) },
                      ]}
                    />
                    <Text style={styles.barLabel}>{b.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

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

  // Loading / error
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.sm,
  },
  stateTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  stateSub: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  retryText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textLight,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorBannerText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.error,
    textAlign: 'center',
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
  scheduleTimeWrap: { width: 70 },
  scheduleTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scheduleDate: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
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

  // Empty schedule
  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
  emptyEmoji: { fontSize: 30 },
  emptyTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  emptySub: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },

  // Earnings / status preview
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
    height: BAR_MAX_H + 40,
    gap: Spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: { width: '100%', borderRadius: 4 },
  barValue: {
    fontSize: Fonts.sizes.xs + 1,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  barLabel: { fontSize: 9, color: Colors.textMuted },
});