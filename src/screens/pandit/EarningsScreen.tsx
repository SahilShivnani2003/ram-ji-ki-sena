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

type Props = NativeBottomTabScreenProps<PanditTabParamList, 'Earnings'>;


// ── Data ──────────────────────────────────────────────────────────────────────
type MonthKey = 'Jan' | 'Feb' | 'Mar' | 'Apr';

const MONTH_DATA: Record<
  MonthKey,
  {
    total: string;
    pujas: number;
    days: number;
    cash: string;
    online: string;
    avg: string;
    weeks: { pct: number; val: string; label: string }[];
  }
> = {
  Jan: {
    total: '₹31,200',
    pujas: 14,
    days: 31,
    cash: '₹20,000',
    online: '₹11,200',
    avg: '₹2,228',
    weeks: [
      { pct: 0.6, val: '₹7.8k', label: 'W1' },
      { pct: 0.7, val: '₹8.4k', label: 'W2' },
      { pct: 0.55, val: '₹7.2k', label: 'W3' },
      { pct: 0.65, val: '₹7.8k', label: 'W4' },
    ],
  },
  Feb: {
    total: '₹36,400',
    pujas: 16,
    days: 28,
    cash: '₹22,000',
    online: '₹14,400',
    avg: '₹2,275',
    weeks: [
      { pct: 0.72, val: '₹9.1k', label: 'W1' },
      { pct: 0.65, val: '₹8.4k', label: 'W2' },
      { pct: 0.8, val: '₹10.3k', label: 'W3' },
      { pct: 0.68, val: '₹8.6k', label: 'W4' },
    ],
  },
  Mar: {
    total: '₹42,800',
    pujas: 19,
    days: 28,
    cash: '₹28,500',
    online: '₹14,300',
    avg: '₹2,253',
    weeks: [
      { pct: 0.65, val: '₹9.2k', label: 'W1' },
      { pct: 0.8, val: '₹11.4k', label: 'W2' },
      { pct: 1.0, val: '₹14.1k', label: 'W3' },
      { pct: 0.57, val: '₹8.1k', label: 'W4' },
    ],
  },
  Apr: {
    total: '₹8,100',
    pujas: 4,
    days: 19,
    cash: '₹4,500',
    online: '₹3,600',
    avg: '₹2,025',
    weeks: [
      { pct: 0.4, val: '₹4.5k', label: 'W1' },
      { pct: 0.3, val: '₹3.6k', label: 'W2' },
      { pct: 0.0, val: '', label: 'W3' },
      { pct: 0.0, val: '', label: 'W4' },
    ],
  },
};

const MONTHS: MonthKey[] = ['Jan', 'Feb', 'Mar', 'Apr'];

const PUJA_BREAKDOWN = [
  { name: 'Griha Pravesh', count: 5, amount: '₹18,500', pct: 43 },
  { name: 'Satyanarayan Puja', count: 7, amount: '₹12,600', pct: 29 },
  { name: 'Vivah Sanskar', count: 2, amount: '₹8,200', pct: 19 },
  { name: 'Other Pujas', count: 5, amount: '₹3,500', pct: 9 },
];

interface Transaction {
  icon: string;
  title: string;
  sub: string;
  date: string;
  amount: string;
  type: 'credit' | 'debit';
}

const TRANSACTIONS: Transaction[] = [
  {
    icon: '🙏',
    title: 'Satyanarayan Puja',
    sub: 'Ramesh Sharma',
    date: 'Today',
    amount: '+₹2,100',
    type: 'credit',
  },
  {
    icon: '🏠',
    title: 'Griha Pravesh',
    sub: 'Sunita Verma',
    date: 'Today',
    amount: '+₹4,500',
    type: 'credit',
  },
  {
    icon: '💸',
    title: 'Withdrawal',
    sub: 'HDFC Bank ···4521',
    date: 'Yesterday',
    amount: '-₹5,000',
    type: 'debit',
  },
  {
    icon: '🔥',
    title: 'Navratri Havan',
    sub: 'RWA Sector 11',
    date: 'Mar 15',
    amount: '+₹9,000',
    type: 'credit',
  },
  {
    icon: '💍',
    title: 'Vivah Panchami',
    sub: 'Mohit & Priya',
    date: 'Mar 18',
    amount: '+₹7,500',
    type: 'credit',
  },
  {
    icon: '💸',
    title: 'Withdrawal',
    sub: 'HDFC Bank ···4521',
    date: 'Mar 12',
    amount: '-₹8,000',
    type: 'debit',
  },
];

const BAR_MAX_H = 80;

// ── Component ─────────────────────────────────────────────────────────────────
export default function EarningsScreen({ navigation }: Props) {
  const [activeMonth, setActiveMonth] = useState<MonthKey>('Mar');
  const data = MONTH_DATA[activeMonth];

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
            <Text style={styles.headerLabel}>Financial Overview</Text>
            <Text style={styles.headerTitle}>Earnings</Text>
          </View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons
              name="download-outline"
              size={20}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          {activeMonth} 2025 · Updated just now
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <LinearGradient
          colors={[Colors.secondary, Colors.primary] as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>
            Total Earnings · {activeMonth} 2025
          </Text>
          <Text style={styles.heroAmount}>{data.total}</Text>
          <Text style={styles.heroPeriod}>
            {data.pujas} pujas completed · {data.days} days
          </Text>

          <View style={styles.heroSplit}>
            {[
              { label: 'CASH', val: data.cash },
              { label: 'ONLINE', val: data.online },
              { label: 'AVG/PUJA', val: data.avg },
            ].map(item => (
              <View key={item.label} style={styles.heroSplitItem}>
                <Text style={styles.heroSplitLabel}>{item.label}</Text>
                <Text style={styles.heroSplitVal}>{item.val}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Weekly Breakdown ── */}
        <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
        <View style={styles.card}>
          {/* Month selector */}
          <View style={styles.monthRow}>
            {MONTHS.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setActiveMonth(m)}
                activeOpacity={0.8}
              >
                {activeMonth === m ? (
                  <LinearGradient
                    colors={Colors.gradientRam as string[]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.monthChipActive}
                  >
                    <Text style={styles.monthChipTextActive}>{m}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.monthChip}>
                    <Text style={styles.monthChipText}>{m}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Bar chart */}
          <View style={styles.chartRow}>
            {data.weeks.map((b, i) => (
              <View key={i} style={styles.barWrapper}>
                {!!b.val && <Text style={styles.barValLabel}>{b.val}</Text>}
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight] as string[]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={[
                    styles.bar,
                    { height: Math.max(4, BAR_MAX_H * b.pct) },
                  ]}
                />
                <Text style={styles.barLabel}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Puja Type Breakdown ── */}
        <Text style={styles.sectionTitle}>By Puja Type</Text>
        <View style={styles.card}>
          {PUJA_BREAKDOWN.map((p, i) => (
            <View
              key={i}
              style={[
                styles.breakdownItem,
                i === PUJA_BREAKDOWN.length - 1 && { marginBottom: 0 },
              ]}
            >
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownName}>{p.name}</Text>
                <Text style={styles.breakdownAmount}>{p.amount}</Text>
              </View>
              <View style={styles.progressBg}>
                <LinearGradient
                  colors={Colors.gradientRam as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${p.pct}%` as any }]}
                />
              </View>
              <Text style={styles.breakdownSub}>
                {p.count} pujas · {p.pct}%
              </Text>
            </View>
          ))}
        </View>

        {/* ── Recent Transactions ── */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.card}>
          {TRANSACTIONS.map((t, i) => (
            <View
              key={i}
              style={[
                styles.txnItem,
                i === TRANSACTIONS.length - 1 && styles.txnItemLast,
              ]}
            >
              <View style={styles.txnIconWrap}>
                <Text style={styles.txnIcon}>{t.icon}</Text>
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnTitle}>{t.title}</Text>
                <Text style={styles.txnSub}>
                  {t.sub} · {t.date}
                </Text>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  { color: t.type === 'credit' ? '#2E7D32' : Colors.error },
                ]}
              >
                {t.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Withdraw button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{ marginTop: Spacing.lg }}
        >
          <LinearGradient
            colors={Colors.gradientRam as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.withdrawBtn}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color={Colors.textLight}
            />
            <Text style={styles.withdrawText}>WITHDRAW EARNINGS</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  heroLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textLight,
    letterSpacing: 1,
    marginTop: 4,
  },
  heroPeriod: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  heroSplit: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  heroSplitItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  heroSplitLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  heroSplitVal: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.textLight,
    marginTop: 3,
  },

  // Month selector
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  monthChipActive: {
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 5,
  },
  monthChip: {
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthChipText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  monthChipTextActive: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    fontWeight: '600',
  },

  // Bar chart
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
  barValLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 9, color: Colors.textMuted },

  // Breakdown
  breakdownItem: { marginBottom: Spacing.md },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  breakdownName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  breakdownAmount: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.saffronBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  breakdownSub: { fontSize: 10, color: Colors.textMuted, marginTop: 3 },

  // Transactions
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.saffronBg,
  },
  txnItemLast: { borderBottomWidth: 0 },
  txnIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.saffronBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnIcon: { fontSize: 16 },
  txnInfo: { flex: 1 },
  txnTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  txnSub: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  txnAmount: { fontSize: Fonts.sizes.md, fontWeight: '700' },

  withdrawBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  withdrawText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 2,
  },
});
