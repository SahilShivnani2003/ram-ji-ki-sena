// ─── Sanatan Seva Platform – Ram Naam Screen (Store-Integrated) ──────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Vibration,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme/colors';
import SpiritualHeader from '../../components/SpiritualHeader';
import { useAlert } from '../../context/AlertContext';
import { useAuthStore, selectUser } from '../../store/authStore';
import { useUserStore, selectLekhan, selectLeaderboard } from '../../store/userStore';

const { width } = Dimensions.get('window');

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface NaamOption {
  naam: string;
  transliteration: string;
  color: string;
  gradient: [string, string];
}

const NAAM_OPTIONS: NaamOption[] = [
  { naam: 'राम', transliteration: 'Ram', color: Colors.saffron, gradient: ['#BF360C', '#E65100'] },
  { naam: 'राधे', transliteration: 'Radhe', color: Colors.crimson, gradient: ['#7F0000', '#B71C1C'] },
  { naam: 'कृष्ण', transliteration: 'Krishna', color: '#1565C0', gradient: ['#0D47A1', '#1565C0'] },
  { naam: 'हरे राम', transliteration: 'Hare Ram', color: Colors.gold, gradient: ['#E65100', '#F9A825'] },
  { naam: 'ॐ', transliteration: 'Om', color: '#4A148C', gradient: ['#1A237E', '#4A148C'] },
  { naam: 'जय माता दी', transliteration: 'Jai Mata Di', color: '#880E4F', gradient: ['#880E4F', '#C2185B'] },
];

const MILESTONES = [108, 1008, 5000, 11000, 51000, 100000, 500000, 1000000];

type ActiveTab = 'write' | 'stats' | 'leaderboard';
type Props = NativeStackScreenProps<any, 'RamNaam'>;

// ─── Component ────────────────────────────────────────────────────────────────

const RamNaamScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('write');

  // Store bindings
  const lekhan = useUserStore(selectLekhan);
  const leaderboard = useUserStore(selectLeaderboard);
  const leaderboardStatus = useUserStore((s: any) => s.leaderboardStatus);
  const leaderboardFilter = useUserStore((s: any) => s.leaderboardFilter);

  const incrementCount = useUserStore((s: any) => s.incrementCount);
  const setSelectedNaam = useUserStore((s: any) => s.setSelectedNaam);
  const saveCount = useUserStore((s: any) => s.saveCount);
  const fetchLeaderboard = useUserStore((s: any) => s.fetchLeaderboard);
  const setLeaderboardFilter = useUserStore((s: any) => s.setLeaderboardFilter);

  const user = useAuthStore(selectUser);
  const { success, error } = useAlert();

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const selectedNaamOption =
    NAAM_OPTIONS.find((n) => n.naam === lekhan.selectedNaam) ?? NAAM_OPTIONS[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [floatAnim, glowAnim]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard(leaderboardFilter);
    }
  }, [activeTab, fetchLeaderboard, leaderboardFilter]);

  const handleNaamPress = () => {
    Vibration.vibrate(30);
    incrementCount();

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = async () => {
    const result = await saveCount();
    if (result.success) {
      success('जाप सुरक्षित हुआ 🙏', `कुल जाप: ${lekhan.totalCount.toLocaleString()}`);
    } else {
      error('सुरक्षित नहीं हुआ', result.message);
    }
  };

  const nextMilestone = MILESTONES.find((m) => m > lekhan.totalCount) ?? 1000000;
  const progress = Math.min((lekhan.totalCount / nextMilestone) * 100, 100);

  return (
    <View style={styles.container}>
      <SpiritualHeader
        title="राम नाम बैंक"
        titleHindi="Ram Naam Bank"
        showBack
        navigation={navigation}
        rightComponent={
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.8}
            style={styles.saveBtn}
            disabled={lekhan.isSaving}
          >
            <LinearGradient colors={[Colors.gold, Colors.amberLight]} style={styles.saveBtnGrad}>
              {lekhan.isSaving ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>💾 सेव</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        }
      />

      {/* Tab Bar */}
      <View style={styles.tabs}>
        {(['write', 'stats', 'leaderboard'] as ActiveTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'write' ? '✍️ लेखन' : tab === 'stats' ? '📊 आंकड़े' : '🏆 लीडरबोर्ड'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── WRITE TAB ─────────────────────────────── */}
        {activeTab === 'write' && (
          <View style={styles.writeTab}>
            {/* Naam Selector */}
            <View style={styles.naamSelector}>
              <Text style={styles.naamSelectorLabel}>नाम चुनें</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.naamScroll}
              >
                {NAAM_OPTIONS.map((n, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedNaam(n.naam)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        lekhan.selectedNaam === n.naam
                          ? n.gradient
                          : ['#FFF3E0', '#FFF3E0']
                      }
                      style={styles.naamChip}
                    >
                      <Text
                        style={[
                          styles.naamChipText,
                          lekhan.selectedNaam === n.naam && styles.naamChipTextActive,
                        ]}
                      >
                        {n.naam}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Press Button */}
            <View style={styles.pressArea}>
              <TouchableOpacity onPress={handleNaamPress} activeOpacity={0.9}>
                <Animated.View
                  style={[
                    styles.naamButton,
                    { transform: [{ scale: scaleAnim }, { translateY: floatAnim }] },
                  ]}
                >
                  <LinearGradient
                    colors={selectedNaamOption.gradient}
                    style={styles.naamButtonGrad}
                  >
                    <Animated.View
                      style={[
                        styles.naamGlowRing,
                        { opacity: glowAnim, borderColor: selectedNaamOption.color },
                      ]}
                    />
                    <Text style={styles.naamMain}>{selectedNaamOption.naam}</Text>
                    <Text style={styles.naamSub}>{selectedNaamOption.transliteration}</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
              <Text style={styles.tapHint}>👆 स्पर्श करें - नाम जपें</Text>
            </View>

            {/* Counters */}
            <View style={styles.counters}>
              <LinearGradient colors={['#FFF3E0', '#FFF8F0']} style={styles.countCard}>
                <Text style={styles.countValue}>{lekhan.sessionCount.toLocaleString()}</Text>
                <Text style={styles.countLabel}>इस सत्र में</Text>
              </LinearGradient>
              <LinearGradient
                colors={[Colors.saffronDark, Colors.saffron]}
                style={styles.countCardMain}
              >
                <Text style={styles.countValueMain}>{lekhan.todayCount.toLocaleString()}</Text>
                <Text style={styles.countLabelMain}>आज का जाप</Text>
              </LinearGradient>
              <LinearGradient colors={['#FFF3E0', '#FFF8F0']} style={styles.countCard}>
                <Text style={styles.countValue}>{lekhan.totalCount.toLocaleString()}</Text>
                <Text style={styles.countLabel}>कुल जाप</Text>
              </LinearGradient>
            </View>

            {/* Mala Counter */}
            <View style={styles.malaCard}>
              <Text style={styles.malaIcon}>📿</Text>
              <View>
                <Text style={styles.malaCount}>{lekhan.malaCount} माला</Text>
                <Text style={styles.malaLabel}>पूर्ण (108 × {lekhan.malaCount})</Text>
              </View>
            </View>

            {/* Milestone Progress */}
            <View style={[styles.milestoneCard, { marginHorizontal: Spacing.md }]}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneLabel}>
                  🎯 अगला लक्ष्य: {nextMilestone.toLocaleString()} जाप
                </Text>
                <Text style={styles.milestonePercent}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[Colors.saffron, Colors.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
            </View>

            {/* User Rank Banner */}
            {user && (
              <LinearGradient colors={Colors.gradientCrimson} style={styles.rankBanner}>
                <Text style={styles.rankIcon}>⭐</Text>
                <View>
                  <Text style={styles.rankName}>{user.name}</Text>
                  <Text style={styles.rankInfo}>
                    रैंक #{user.rank} • {user.city}
                  </Text>
                </View>
              </LinearGradient>
            )}
          </View>
        )}

        {/* ── STATS TAB ─────────────────────────────── */}
        {activeTab === 'stats' && (
          <View style={styles.statsTab}>
            <View style={styles.statsGrid}>
              {[
                { icon: '📿', label: 'कुल जाप', value: lekhan.totalCount.toLocaleString(), color: Colors.saffron },
                { icon: '🕐', label: 'आज का जाप', value: lekhan.todayCount.toLocaleString(), color: Colors.crimson },
                { icon: '📿', label: 'माला', value: lekhan.malaCount.toString(), color: Colors.gold },
                { icon: '⭐', label: 'रैंक', value: `#${user?.rank ?? '—'}`, color: Colors.info },
              ].map((stat, i) => (
                <View key={i} style={[styles.statCard, { borderTopColor: stat.color }]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {lekhan.lastSaved && (
              <View style={styles.lastSavedBanner}>
                <Text style={styles.lastSavedText}>
                  ✅ अंतिम सेव: {lekhan.lastSaved.toLocaleTimeString('hi-IN')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── LEADERBOARD TAB ───────────────────────── */}
        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardTab}>
            <LinearGradient colors={Colors.gradientCrimson} style={styles.lbHeader}>
              <Text style={styles.lbHeaderTitle}>🏆 जाप लीडरबोर्ड</Text>
              <Text style={styles.lbHeaderSub}>सर्वश्रेष्ठ राम भक्त</Text>
            </LinearGradient>

            <View style={styles.lbFilterRow}>
              {(
                [
                  { key: 'today', label: 'आज' },
                  { key: 'week', label: 'इस सप्ताह' },
                  { key: 'all', label: 'सर्वकालिक' },
                ] as Array<{ key: 'today' | 'week' | 'all'; label: string }>
              ).map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.lbFilter,
                    leaderboardFilter === key && styles.lbFilterActive,
                  ]}
                  onPress={() => setLeaderboardFilter(key)}
                >
                  <Text
                    style={[
                      styles.lbFilterText,
                      leaderboardFilter === key && styles.lbFilterTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {leaderboardStatus === 'loading' ? (
              <ActivityIndicator
                color={Colors.saffron}
                size="large"
                style={{ marginTop: 40 }}
              />
            ) : leaderboard.length > 0 ? (
              leaderboard.map((item: any, i: any) => {
                const medals = ['🏆', '🥈', '🥉'];
                const emoji = medals[i] ?? `${i + 1}️⃣`;
                return (
                  <View
                    key={item._id}
                    style={[styles.lbItem, i < 3 && styles.lbItemTop]}
                  >
                    <Text style={styles.lbRankEmoji}>{emoji}</Text>
                    <LinearGradient
                      colors={
                        i === 0
                          ? [Colors.gold, Colors.amberLight]
                          : i === 1
                            ? ['#B0BEC5', '#90A4AE']
                            : i === 2
                              ? ['#A1887F', '#8D6E63']
                              : Colors.gradientSaffron
                      }
                      style={styles.lbAvatar}
                    >
                      <Text style={styles.lbAvatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lbName}>{item.name}</Text>
                      <Text style={styles.lbCity}>📍 {item.city}</Text>
                    </View>
                    <View style={styles.lbCountBadge}>
                      <Text style={styles.lbCount}>
                        {item.totalCount.toLocaleString()}
                      </Text>
                      <Text style={styles.lbCountLabel}>जाप</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48 }}>📿</Text>
                <Text style={styles.emptyText}>कोई डेटा उपलब्ध नहीं</Text>
              </View>
            )}

            {user && (
              <View style={styles.myRank}>
                <Text style={styles.myRankLabel}>आपकी रैंक: </Text>
                <Text style={styles.myRankValue}>
                  #{user.rank} • {lekhan.totalCount.toLocaleString()} जाप
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: 20 },

  saveBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  saveBtnGrad: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full },
  saveBtnText: { color: Colors.white, fontSize: Typography.sm, fontWeight: '700' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: Colors.saffron },
  tabText: { fontSize: Typography.sm, color: Colors.brownLight, fontWeight: '600' },
  tabTextActive: { color: Colors.saffron, fontWeight: '800' },

  writeTab: { gap: 16 },

  naamSelector: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  naamSelectorLabel: {
    fontSize: Typography.xs,
    color: Colors.brownLight,
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  naamScroll: { paddingHorizontal: Spacing.md, gap: 8 },
  naamChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.full },
  naamChipText: { color: Colors.brownMid, fontSize: Typography.base, fontWeight: '700' },
  naamChipTextActive: { color: Colors.white },

  pressArea: { alignItems: 'center', paddingVertical: Spacing.xl },
  naamButton: { width: 200, height: 200 },
  naamButtonGrad: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadow.crimson,
  },
  naamGlowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    top: -10,
    left: -10,
  },
  naamMain: { color: Colors.white, fontSize: 42, fontWeight: '900', textAlign: 'center' },
  naamSub: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.sm, fontWeight: '500' },
  tapHint: { color: Colors.brownLight, fontSize: Typography.sm, marginTop: 16 },

  counters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 10,
    alignItems: 'center',
  },
  countCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  countCardMain: {
    flex: 1.3,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.gold,
  },
  countValue: { fontSize: Typography.xl, fontWeight: '900', color: Colors.saffron },
  countValueMain: { fontSize: Typography.xxl, fontWeight: '900', color: Colors.white },
  countLabel: { fontSize: 11, color: Colors.brownLight, marginTop: 2 },
  countLabelMain: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  malaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.parchment,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  malaIcon: { fontSize: 28 },
  malaCount: { fontSize: Typography.lg, fontWeight: '900', color: Colors.saffron },
  malaLabel: { fontSize: Typography.xs, color: Colors.brownLight },

  milestoneCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 10,
    ...Shadow.card,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneLabel: { fontSize: Typography.sm, color: Colors.darkText, fontWeight: '600' },
  milestonePercent: { fontSize: Typography.base, color: Colors.saffron, fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: Colors.creamDark, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },

  rankBanner: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankIcon: { fontSize: 28 },
  rankName: { color: Colors.goldLight, fontSize: Typography.base, fontWeight: '800' },
  rankInfo: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.xs, marginTop: 2 },

  statsTab: { padding: Spacing.md, gap: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: (width - Spacing.md * 2 - 10) / 2,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 3,
    ...Shadow.card,
    gap: 4,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: Typography.xl, fontWeight: '900' },
  statLabel: { fontSize: 10, color: Colors.brownLight, textAlign: 'center' },

  lastSavedBanner: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  lastSavedText: { fontSize: Typography.sm, color: Colors.success, fontWeight: '600' },

  leaderboardTab: { paddingBottom: 20 },
  lbHeader: { padding: Spacing.xl, alignItems: 'center', gap: 6 },
  lbHeaderTitle: { color: Colors.goldLight, fontSize: Typography.xl, fontWeight: '900' },
  lbHeaderSub: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.sm },

  lbFilterRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  lbFilter: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.creamDeep,
  },
  lbFilterActive: { backgroundColor: Colors.saffron },
  lbFilterText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
  lbFilterTextActive: { color: Colors.white, fontWeight: '700' },

  lbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.white,
  },
  lbItemTop: { backgroundColor: Colors.parchment },
  lbRankEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  lbAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbAvatarText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  lbName: { fontSize: Typography.sm, fontWeight: '700', color: Colors.darkText },
  lbCity: { fontSize: 11, color: Colors.brownLight },
  lbCountBadge: { alignItems: 'flex-end' },
  lbCount: { fontSize: Typography.base, fontWeight: '900', color: Colors.saffron },
  lbCountLabel: { fontSize: 10, color: Colors.brownLight },

  myRank: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.creamDeep,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.saffron,
  },
  myRankLabel: { fontSize: Typography.base, color: Colors.brownMid, fontWeight: '600' },
  myRankValue: { fontSize: Typography.base, color: Colors.saffron, fontWeight: '800' },

  emptyState: { alignItems: 'center', padding: 40, gap: 10 },
  emptyText: { fontSize: Typography.lg, color: Colors.brownLight, fontWeight: '600' },
});

export default RamNaamScreen;
