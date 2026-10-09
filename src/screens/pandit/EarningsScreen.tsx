import React, { useEffect, useState } from 'react';
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
import { panditDashboardAPI } from '../../service/apis/panditDashboardService';

type Props = NativeBottomTabScreenProps<PanditTabParamList, 'Earnings'>;


// ── Data ──────────────────────────────────────────────────────────────────────
type MonthKey = 'Oct';

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
  Oct: {
    total: '0',
    pujas: 0,
    days: 31,
    cash: '0',
    online: '0',
    avg: '0',
    weeks: [
      { pct: 0, val: '0', label: 'W1' },
      { pct: 0, val: '0', label: 'W2' },
      { pct: 0, val: '0', label: 'W3' },
      { pct: 0, val: '0', label: 'W4' },
    ],
  },
};

const MONTHS: MonthKey[] = ['Oct'];

const PUJA_BREAKDOWN = [
  { name: 'Griha Pravesh', count: 0, amount: '0', pct: 0 },
  { name: 'Satyanarayan Puja', count: 0, amount: '0', pct: 0 },
  { name: 'Vivah Sanskar', count: 0, amount: '0', pct: 0 },
  { name: 'Other Pujas', count: 0, amount: '0', pct: 0 },
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
    amount: '0',
    type: 'credit',
  },
];

const BAR_MAX_H = 80;

// ── Component ─────────────────────────────────────────────────────────────────
export default function EarningsScreen({ navigation }: Props) {
  const [activeMonth, setActiveMonth] = useState<MonthKey>('Oct');
  const [earningsData, setEarningsData] = useState<any>(null);
  const data = earningsData || MONTH_DATA[activeMonth];

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await panditDashboardAPI.earnings();
      setEarningsData(response.data?.totalEarnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  }

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
          <Text style={styles.heroAmount}>{data?.total || 0}</Text>
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
