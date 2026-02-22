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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Radius, Shadow, SacredSymbols } from '../theme/colors';
import SpiritualHeader from '../components/SpiritualHeader';
import { SectionHeader, OmDivider } from '../components/UIComponents';

const { width } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────

interface NaamOption {
  naam: string;
  transliteration: string;
  color: string;
  gradient: [string, string];
}

interface LeaderboardItem {
  rank: number;
  name: string;
  city: string;
  count: string;
  avatar: string;
  emoji: string;
}

interface FloatingText {
  id: number;
  naam: string;
}

// ─── Data ────────────────────────────────────────────────────────

const NAAM_OPTIONS: NaamOption[] = [
  { naam: 'राम', transliteration: 'Ram', color: Colors.saffron, gradient: ['#BF360C', '#E65100'] },
  { naam: 'राधे', transliteration: 'Radhe', color: Colors.crimson, gradient: ['#7F0000', '#B71C1C'] },
  { naam: 'कृष्ण', transliteration: 'Krishna', color: '#1565C0', gradient: ['#0D47A1', '#1565C0'] },
  { naam: 'हरे राम', transliteration: 'Hare Ram', color: Colors.gold, gradient: ['#E65100', '#F9A825'] },
  { naam: 'ॐ', transliteration: 'Om', color: '#4A148C', gradient: ['#1A237E', '#4A148C'] },
  { naam: 'जय माता दी', transliteration: 'Jai Mata Di', color: '#880E4F', gradient: ['#880E4F', '#C2185B'] },
];

const LEADERBOARD: LeaderboardItem[] = [
  { rank: 1, name: 'राम भक्त राजेश', city: 'वाराणसी', count: '12,45,678', avatar: 'RR', emoji: '🏆' },
  { rank: 2, name: 'कृष्ण सेविका प्रिया', city: 'मथुरा', count: '10,23,456', avatar: 'KP', emoji: '🥈' },
  { rank: 3, name: 'हनुमान भक्त', city: 'अयोध्या', count: '8,90,123', avatar: 'HB', emoji: '🥉' },
  { rank: 4, name: 'माँ दुर्गा भक्त', city: 'वैष्णो देवी', count: '7,56,789', avatar: 'MD', emoji: '4️⃣' },
  { rank: 5, name: 'शिव भक्त अनिल', city: 'उज्जैन', count: '6,34,567', avatar: 'SA', emoji: '5️⃣' },
];

type ActiveTab = 'write' | 'stats' | 'leaderboard';

type Props = NativeStackScreenProps<any, 'RamNaam'>;

const RamNaamScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedNaam, setSelectedNaam] = useState<NaamOption>(NAAM_OPTIONS[0]);
  const [count, setCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(12847);
  const [activeTab, setActiveTab] = useState<ActiveTab>('write');
  const [streak] = useState<number>(7);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

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

  const handleNaamPress = (): void => {
    Vibration.vibrate(30);
    const newCount = count + 1;
    setCount(newCount);
    setTodayCount(t => t + 1);
    setTotalCount(t => t + 1);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, naam: selectedNaam.naam }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1200);
  };

  const milestones = [108, 1008, 5000, 11000, 51000, 100000, 500000, 1000000];
  const nextMilestone = milestones.find(m => m > totalCount) ?? 1000000;
  const progress = Math.min((totalCount / nextMilestone) * 100, 100);

  const weekDays = ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'];
  const weekHeights = [40, 65, 45, 85, 70, 90, 60];

  return (
    <View style={styles.container}>
      <SpiritualHeader
        title="राम नाम बैंक"
        titleHindi="Ram Naam Bank"
        showBack
        navigation={navigation}
      />

      {/* Tab Bar */}
      <View style={styles.tabs}>
        {(['write', 'stats', 'leaderboard'] as ActiveTab[]).map(tab => (
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

        {/* ── NAAM WRITING TAB ───────────────────────── */}
        {activeTab === 'write' && (
          <View style={styles.writeTab}>
            <View style={styles.naamSelector}>
              <Text style={styles.naamSelectorLabel}>नाम चुनें</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.naamScroll}>
                {NAAM_OPTIONS.map((n, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setSelectedNaam(n); setCount(0); }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={selectedNaam.naam === n.naam ? n.gradient : ['#FFF3E0', '#FFF3E0']}
                      style={styles.naamChip}
                    >
                      <Text style={[styles.naamChipText, selectedNaam.naam === n.naam && styles.naamChipTextActive]}>
                        {n.naam}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pressArea}>
              {floatingTexts.map(t => (
                <Animated.Text
                  key={t.id}
                  style={[styles.floatingText, { opacity: glowAnim }]}
                >
                  {t.naam}
                </Animated.Text>
              ))}

              <TouchableOpacity onPress={handleNaamPress} activeOpacity={0.9}>
                <Animated.View style={[styles.naamButton, { transform: [{ scale: scaleAnim }, { translateY: floatAnim }] }]}>
                  <LinearGradient
                    colors={selectedNaam.gradient}
                    style={styles.naamButtonGrad}
                  >
                    <Animated.View style={[styles.naamGlowRing, {
                      opacity: glowAnim,
                      borderColor: selectedNaam.color,
                    }]} />
                    <Text style={styles.naamMain}>{selectedNaam.naam}</Text>
                    <Text style={styles.naamSub}>{selectedNaam.transliteration}</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>

              <Text style={styles.tapHint}>👆 स्पर्श करें - नाम जपें</Text>
            </View>

            <View style={styles.counters}>
              <LinearGradient colors={['#FFF3E0', '#FFF8F0']} style={styles.countCard}>
                <Text style={styles.countValue}>{count.toLocaleString()}</Text>
                <Text style={styles.countLabel}>इस सत्र में</Text>
              </LinearGradient>
              <LinearGradient colors={[Colors.saffronDark, Colors.saffron]} style={styles.countCardMain}>
                <Text style={styles.countValueMain}>{todayCount.toLocaleString()}</Text>
                <Text style={styles.countLabelMain}>आज का जाप</Text>
              </LinearGradient>
              <LinearGradient colors={['#FFF3E0', '#FFF8F0']} style={styles.countCard}>
                <Text style={styles.countValue}>{totalCount.toLocaleString()}</Text>
                <Text style={styles.countLabel}>कुल जाप</Text>
              </LinearGradient>
            </View>

            <View style={[styles.milestoneCard, { marginHorizontal: Spacing.md }]}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneLabel}>🎯 अगला लक्ष्य: {nextMilestone.toLocaleString()} जाप</Text>
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

            <LinearGradient colors={Colors.gradientCrimson} style={styles.streakBanner}>
              <Text style={styles.streakIcon}>🔥</Text>
              <View>
                <Text style={styles.streakTitle}>{streak} दिन की लगातार साधना!</Text>
                <Text style={styles.streakSub}>कल भी जाप करें और स्ट्रीक बनाए रखें</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── STATS TAB ──────────────────────────────── */}
        {activeTab === 'stats' && (
          <View style={styles.statsTab}>
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>इस सप्ताह का जाप</Text>
              <View style={styles.chartBars}>
                {weekDays.map((day, i) => {
                  const h = weekHeights[i];
                  const isToday = i === 6;
                  return (
                    <View key={i} style={styles.chartBarCol}>
                      <LinearGradient
                        colors={isToday ? [Colors.saffron, Colors.gold] : ['#FFCCBC', '#FFAB91']}
                        style={[styles.chartBar, { height: h * 1.2 }]}
                      />
                      <Text style={[styles.chartDayLabel, isToday && styles.chartDayLabelActive]}>{day}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.pointsCard}>
              <LinearGradient colors={Colors.gradientGold} style={styles.pointsGrad}>
                <Text style={styles.pointsIcon}>✨</Text>
                <View>
                  <Text style={styles.pointsValue}>2,847</Text>
                  <Text style={styles.pointsLabel}>आध्यात्मिक अंक</Text>
                </View>
                <Text style={styles.pointsRank}>रैंक #247</Text>
              </LinearGradient>
            </View>

            <Text style={styles.achieveTitle}>उपलब्धियां</Text>
            <View style={styles.achieveGrid}>
              {([
                { icon: '🌸', title: '108 जाप', done: true },
                { icon: '🪔', title: '1008 जाप', done: true },
                { icon: '🏆', title: '11000 जाप', done: false },
                { icon: '⭐', title: '7 दिन स्ट्रीक', done: true },
                { icon: '🕉️', title: 'ॐ साधक', done: false },
                { icon: '🎯', title: 'प्रथम पूर्णिमा', done: true },
              ] as Array<{ icon: string; title: string; done: boolean }>).map((a, i) => (
                <View key={i} style={[styles.achieveBadge, !a.done && styles.achieveBadgeLocked]}>
                  <Text style={{ fontSize: 28, opacity: a.done ? 1 : 0.3 }}>{a.icon}</Text>
                  <Text style={[styles.achieveName, !a.done && styles.achieveNameLocked]}>{a.title}</Text>
                  {a.done && <Text style={styles.achieveDone}>✓</Text>}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── LEADERBOARD TAB ────────────────────────── */}
        {activeTab === 'leaderboard' && (
          <View style={styles.leaderboardTab}>
            <LinearGradient colors={Colors.gradientCrimson} style={styles.leaderboardHeader}>
              <Text style={styles.lbHeaderTitle}>🏆 जाप लीडरबोर्ड</Text>
              <Text style={styles.lbHeaderSub}>सर्वश्रेष्ठ राम भक्त</Text>
            </LinearGradient>

            <View style={styles.lbFilterRow}>
              {['आज', 'इस सप्ताह', 'सर्वकालिक'].map((f, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.lbFilter, i === 2 && styles.lbFilterActive]}
                >
                  <Text style={[styles.lbFilterText, i === 2 && styles.lbFilterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {LEADERBOARD.map((item, i) => (
              <View key={i} style={[styles.lbItem, i < 3 && styles.lbItemTop]}>
                <Text style={styles.lbRankEmoji}>{item.emoji}</Text>
                <LinearGradient
                  colors={
                    i === 0 ? [Colors.gold, Colors.amberLight] :
                    i === 1 ? ['#B0BEC5', '#90A4AE'] :
                    i === 2 ? ['#A1887F', '#8D6E63'] :
                    Colors.gradientSaffron
                  }
                  style={styles.lbAvatar}
                >
                  <Text style={styles.lbAvatarText}>{item.avatar}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lbName}>{item.name}</Text>
                  <Text style={styles.lbCity}>📍 {item.city}</Text>
                </View>
                <View style={styles.lbCountBadge}>
                  <Text style={styles.lbCount}>{item.count}</Text>
                  <Text style={styles.lbCountLabel}>जाप</Text>
                </View>
              </View>
            ))}

            <View style={styles.myRank}>
              <Text style={styles.myRankLabel}>आपकी रैंक: </Text>
              <Text style={styles.myRankValue}>#247 • {totalCount.toLocaleString()} जाप</Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: 20 },

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
  naamSelector: { backgroundColor: Colors.white, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  naamSelectorLabel: { fontSize: Typography.xs, color: Colors.brownLight, fontWeight: '700', paddingHorizontal: Spacing.md, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  naamScroll: { paddingHorizontal: Spacing.md, gap: 8 },
  naamChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.full },
  naamChipText: { color: Colors.brownMid, fontSize: Typography.base, fontWeight: '700' },
  naamChipTextActive: { color: Colors.white },

  pressArea: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    position: 'relative',
  },
  floatingText: {
    position: 'absolute',
    top: 20,
    color: Colors.saffron,
    fontSize: Typography.xxl,
    fontWeight: '900',
    opacity: 0.6,
  },
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

  counters: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: 10, alignItems: 'center' },
  countCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.divider },
  countCardMain: { flex: 1.3, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', ...Shadow.gold },
  countValue: { fontSize: Typography.xl, fontWeight: '900', color: Colors.saffron },
  countValueMain: { fontSize: Typography.xxl, fontWeight: '900', color: Colors.white },
  countLabel: { fontSize: 11, color: Colors.brownLight, marginTop: 2 },
  countLabelMain: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  milestoneCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 10,
    ...Shadow.card,
  },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milestoneLabel: { fontSize: Typography.sm, color: Colors.darkText, fontWeight: '600' },
  milestonePercent: { fontSize: Typography.base, color: Colors.saffron, fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: Colors.creamDark, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },

  streakBanner: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIcon: { fontSize: 36 },
  streakTitle: { color: Colors.goldLight, fontSize: Typography.base, fontWeight: '800' },
  streakSub: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.xs, marginTop: 2 },

  statsTab: { padding: Spacing.md, gap: 16 },
  chartSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.card,
  },
  chartTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.darkText, marginBottom: 16 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 },
  chartBarCol: { alignItems: 'center', gap: 6, flex: 1 },
  chartBar: { width: '70%', borderRadius: 4 },
  chartDayLabel: { fontSize: 11, color: Colors.brownLight, fontWeight: '500' },
  chartDayLabelActive: { color: Colors.saffron, fontWeight: '700' },
  pointsCard: { borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.gold },
  pointsGrad: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: Spacing.lg },
  pointsIcon: { fontSize: 36 },
  pointsValue: { fontSize: Typography.xxl, fontWeight: '900', color: Colors.white },
  pointsLabel: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.8)' },
  pointsRank: { marginLeft: 'auto', color: Colors.white, fontWeight: '700', fontSize: Typography.base },
  achieveTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.darkText },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveBadge: {
    width: (width - Spacing.md * 2 - 20) / 3,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    ...Shadow.gold,
  },
  achieveBadgeLocked: { borderColor: Colors.divider, ...Shadow.card },
  achieveName: { fontSize: 10, fontWeight: '700', color: Colors.darkText, textAlign: 'center' },
  achieveNameLocked: { color: Colors.brownLight },
  achieveDone: { color: Colors.success, fontWeight: '800', fontSize: 14 },

  leaderboardTab: { paddingBottom: 20 },
  leaderboardHeader: { padding: Spacing.xl, alignItems: 'center', gap: 6 },
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
    flex: 1, paddingVertical: 8, alignItems: 'center',
    borderRadius: Radius.full, backgroundColor: Colors.creamDeep,
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
  lbAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  lbAvatarText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
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
});

export default RamNaamScreen;
