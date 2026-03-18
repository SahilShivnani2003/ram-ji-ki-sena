import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useI18n } from '../../i18n';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme';
import {
  SectionHeader,
  Badge,
  LiveBadge,
  StarRating,
  PrimaryButton,
  OmSymbol,
} from '../../components';
import {
  MANDIRS,
  KATHA_EVENTS,
  DOHAS,
  RAM_NAAM_LEADERBOARD,
} from '../../data/staticData';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { RootTabParamList } from '../../navigation/TabNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../../navigation/AppNavigator';

// ── Types ─────────────────────────────────────────────────────────────────────
type HomeProps = NativeBottomTabScreenProps<RootTabParamList, 'Home'>;

// ── Deity config ──────────────────────────────────────────────────────────────
export interface IDeity {
  id: string;
  name: string;
  nameHi: string;
  mantra: string;
  mantraHi: string;
  icon: string;
  color: string;
  gradient: string[];
}

export const DEITIES: IDeity[] = [
  {
    id: 'ram',
    name: 'Shri Ram',
    nameHi: 'श्री राम',
    mantra: 'Jai Shri Ram',
    mantraHi: 'जय श्री राम',
    icon: '🏹',
    color: Colors.primary,
    gradient: [Colors.primary, Colors.secondary],
  },
  {
    id: 'krishna',
    name: 'Shri Krishna',
    nameHi: 'श्री कृष्ण',
    mantra: 'Hare Krishna',
    mantraHi: 'हरे कृष्ण',
    icon: '🪈',
    color: '#1565C0',
    gradient: ['#1565C0', '#0D47A1'],
  },
  {
    id: 'radha',
    name: 'Radha Rani',
    nameHi: 'राधा रानी',
    mantra: 'Radhe Radhe',
    mantraHi: 'राधे राधे',
    icon: '🌸',
    color: '#C2185B',
    gradient: ['#C2185B', '#880E4F'],
  },
  {
    id: 'shiva',
    name: 'Har Har Mahadev',
    nameHi: 'हर हर महादेव',
    mantra: 'Om Namah Shivay',
    mantraHi: 'ॐ नमः शिवाय',
    icon: '🔱',
    color: '#6A1B9A',
    gradient: ['#6A1B9A', '#4A148C'],
  },
  {
    id: 'hanuman',
    name: 'Bajrang Bali',
    nameHi: 'बजरंग बली',
    mantra: 'Jai Hanuman',
    mantraHi: 'जय हनुमान',
    icon: '🌟',
    color: '#E65100',
    gradient: ['#E65100', '#BF360C'],
  },
];

// ── Quick links ───────────────────────────────────────────────────────────────
interface IQuickLink {
  icon: string;
  label: string;
  screen: keyof RootTabParamList;
  bg: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }: HomeProps) => {
  const { t, isHindi } = useI18n();
  const [selectedDeity, setSelectedDeity] = useState<IDeity>(DEITIES[0]);
  const [ramNaamCount, setRamNaamCount] = useState(1250);
  const [tapAnim] = useState(new Animated.Value(1));
  const currentDoha = DOHAS[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.morning;
    if (hour < 17) return t.afternoon;
    return t.evening;
  };

  const handleRamNaamTap = () => {
    setRamNaamCount(prev => prev + 1);
    Animated.sequence([
      Animated.timing(tapAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(tapAnim, {
        toValue: 1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const quickLinks: IQuickLink[] = [
    { icon: 'person', label: t.bookPandit, screen: 'Pandits', bg: '#FFF3E0' },
    { icon: 'cart', label: t.orderSamagri, screen: 'Community', bg: '#E8F5E9' },
    {
      icon: 'play-circle',
      label: t.liveDarshan,
      screen: 'Mandirs',
      bg: '#E3F2FD',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={selectedDeity.color}
      />

      {/* ── Header ───────────────────────────────────────── */}
      <LinearGradient
        colors={selectedDeity.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()} 🙏</Text>
            <Text style={styles.ramText}>
              {isHindi ? selectedDeity.mantraHi : selectedDeity.mantra}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.omCircle}
            onPress={() =>
              navigation
                .getParent<NativeStackNavigationProp<RootParamList>>()
                .navigate('profile')
            }
          >
            <OmSymbol size={22} color={Colors.goldLight} />
          </TouchableOpacity>
        </View>

        {/* Marquee */}
        <View style={styles.marqueeBox}>
          <Text style={styles.marqueeIcon}>📢</Text>
          <Text style={styles.marqueeText} numberOfLines={1}>
            {isHindi
              ? 'राम नवमी पर सभी मंदिरों में विशेष आरती | रजिस्टर करें'
              : 'Special Aarti at all temples on Ram Navami | Register Now'}
          </Text>
        </View>
      </LinearGradient>

      {/* ── Deity Selector ────────────────────────────────── */}
      <View style={styles.deitySection}>
        <Text style={styles.deitySectionLabel}>Choose Your Deity</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deityScroll}
        >
          {DEITIES.map(deity => {
            const isSelected = deity.id === selectedDeity.id;
            return (
              <TouchableOpacity
                key={deity.id}
                onPress={() => setSelectedDeity(deity)}
                activeOpacity={0.8}
                style={styles.deityItemWrap}
              >
                <View
                  style={[
                    styles.deityCircle,
                    isSelected && {
                      borderColor: deity.color,
                      borderWidth: 2.5,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.deityActiveBg,
                        { backgroundColor: deity.color + '18' },
                      ]}
                    />
                  )}
                  <Text style={styles.deityIcon}>{deity.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.deityName,
                    isSelected && { color: deity.color, fontWeight: '700' },
                  ]}
                >
                  {isHindi ? deity.nameHi : deity.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Doha of the Day ──────────────────────────────── */}
      <View style={styles.dohaCard}>
        <LinearGradient
          colors={[Colors.darkBg, '#3D1A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dohaGradient}
        >
          <View style={styles.dohaHeader}>
            <OmSymbol size={16} color={Colors.gold} />
            <Text style={styles.dohaLabel}>{t.dohanOfDay}</Text>
            <OmSymbol size={16} color={Colors.gold} />
          </View>
          <Text style={styles.dohaText}>{currentDoha.text}</Text>
          <Text style={styles.dohaMeaning}>
            {isHindi ? currentDoha.meaningHi : currentDoha.meaning}
          </Text>
          <Text style={styles.dohaSource}>
            — {isHindi ? currentDoha.sourceHi : currentDoha.source}
          </Text>
        </LinearGradient>
      </View>

      {/* ── Quick Links ──────────────────────────────────── */}
      <SectionHeader title={t.quickLinks} />
      <View style={styles.quickLinksRow}>
        {quickLinks.map((link, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.quickLinkCard, { backgroundColor: link.bg }]}
            onPress={() => navigation.navigate(link.screen)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.quickLinkIconWrap,
                { backgroundColor: selectedDeity.color + '20' },
              ]}
            >
              <Ionicons
                name={link.icon as any}
                size={22}
                color={selectedDeity.color}
              />
            </View>
            <Text style={styles.quickLinkLabel}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Nam Lekhan ───────────────────────────────────── */}
      <SectionHeader title={t.ramNaamBank} />
      <View style={styles.namLekhanCard}>
        {/* Counts row */}
        <View style={styles.ramNaamTop}>
          <View style={styles.ramNaamCountBox}>
            <Text style={styles.ramNaamLabel}>{t.yourCount}</Text>
            <Text
              style={[styles.ramNaamNumber, { color: selectedDeity.color }]}
            >
              {ramNaamCount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.ramNaamDivider} />
          <View style={styles.ramNaamCountBox}>
            <Text style={styles.ramNaamLabel}>{t.totalCount}</Text>
            <Text style={styles.ramNaamNumberGold}>1.25 Cr</Text>
          </View>
        </View>

        {/* Tap button */}
        <Animated.View style={{ transform: [{ scale: tapAnim }] }}>
          <TouchableOpacity
            style={[styles.ramNaamTapBtn, { borderColor: selectedDeity.color }]}
            onPress={handleRamNaamTap}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[selectedDeity.color + '15', selectedDeity.color + '08']}
              style={styles.tapBtnGradient}
            >
              <Text style={styles.ramNaamBtnIcon}>{selectedDeity.icon}</Text>
              <Text
                style={[styles.ramNaamBtnText, { color: selectedDeity.color }]}
              >
                {isHindi ? selectedDeity.mantraHi : selectedDeity.mantra}
              </Text>
              <Text style={styles.ramNaamBtnSub}>{t.tapToWrite}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Open Full Nam Lekhan */}
        <TouchableOpacity
          style={[
            styles.namLekhanFullBtn,
            { backgroundColor: selectedDeity.color },
          ]}
          onPress={() =>
            navigation
              .getParent<NativeStackNavigationProp<RootParamList>>()
              .navigate('namLekhan', { deity: selectedDeity })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={16} color={Colors.textLight} />
          <Text style={styles.namLekhanFullBtnText}>
            {isHindi ? 'नाम लेखन शुरू करें' : 'Start Nam Lekhan'}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textLight} />
        </TouchableOpacity>

        {/* Leaderboard */}
        <View style={styles.leaderboardMini}>
          {RAM_NAAM_LEADERBOARD.slice(0, 3).map((item, idx) => (
            <View key={item.rank} style={styles.leaderRow}>
              <Text
                style={[
                  styles.leaderRank,
                  idx === 0 && { color: Colors.gold },
                  idx === 1 && { color: '#9E9E9E' },
                  idx === 2 && { color: '#CD7F32' },
                ]}
              >
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </Text>
              <Text style={styles.leaderName}>
                {isHindi ? item.nameHi : item.name}
              </Text>
              <Text
                style={[styles.leaderCount, { color: selectedDeity.color }]}
              >
                {item.count.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Today's Live Katha ───────────────────────────── */}
      <SectionHeader
        title={t.todayKatha}
        onSeeAll={() => navigation.navigate('Katha')}
        seeAllLabel={t.seeAll}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {KATHA_EVENTS.map(event => (
          <TouchableOpacity
            key={event.id}
            style={styles.kathaCard}
            onPress={() => navigation.navigate('Katha')}
            activeOpacity={0.85}
          >
            <View style={styles.kathaCardHeader}>
              <Text style={styles.kathaIcon}>{event.image}</Text>
              {event.isLive && <LiveBadge />}
            </View>
            <Text style={styles.kathaTitle} numberOfLines={2}>
              {isHindi ? event.titleHi : event.title}
            </Text>
            <Text style={styles.kathaVachak}>
              🎤 {isHindi ? event.kathavachakHi : event.kathavachak}
            </Text>
            <Text style={styles.kathaMeta}>
              📍 {isHindi ? event.venueHi : event.venue}
            </Text>
            <Text style={styles.kathaMeta}>
              📅 {isHindi ? event.dateHi : event.date}
            </Text>
            <View style={styles.kathaFooter}>
              <Badge
                label={event.isFree ? t.free : t.paid}
                bgColor={event.isFree ? Colors.tulsi : Colors.primary}
              />
              <PrimaryButton
                label={event.isLive ? t.watchNow : t.registerFree}
                onPress={() => Alert.alert('🙏', 'Jai Shri Ram!')}
                small
                style={{ marginLeft: Spacing.sm }}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Nearby Mandirs ───────────────────────────────── */}
      <SectionHeader
        title={t.nearbyMandirs}
        onSeeAll={() => navigation.navigate('Mandirs')}
        seeAllLabel={t.seeAll}
      />
      {MANDIRS.slice(0, 3).map(mandir => (
        <TouchableOpacity
          key={mandir.id}
          style={styles.mandirListCard}
          onPress={() => navigation.navigate('Mandirs')}
          activeOpacity={0.8}
        >
          <Text style={styles.mandirListIcon}>{mandir.image}</Text>
          <View style={styles.mandirListInfo}>
            <Text style={styles.mandirListName} numberOfLines={1}>
              {isHindi ? mandir.nameHi : mandir.name}
            </Text>
            <Text style={styles.mandirListCity}>
              📍 {isHindi ? mandir.cityHi : mandir.city}
            </Text>
            <StarRating rating={mandir.rating} />
          </View>
          <View style={styles.mandirListRight}>
            <Text style={styles.mandirListDist}>
              {mandir.distance} {t.km}
            </Text>
            <Badge
              label={mandir.isOpen ? t.openNow : t.closed}
              bgColor={mandir.isOpen ? Colors.tulsi : Colors.error}
              small
            />
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 90 }} />
    </ScrollView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greetingText: { color: 'rgba(255,255,255,0.85)', fontSize: Fonts.sizes.sm },
  ramText: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  omCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  marqueeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  marqueeIcon: { fontSize: 13, marginRight: Spacing.xs },
  marqueeText: {
    color: Colors.goldLight,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    flex: 1,
  },

  // Deity selector
  deitySection: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  deitySectionLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  deityScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  deityItemWrap: { alignItems: 'center', gap: 6 },
  deityCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.saffronBg,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  deityActiveBg: {
    position: 'absolute',
    inset: 0,
  },
  deityIcon: { fontSize: 28 },
  deityName: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 68,
  },

  // Doha
  dohaCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  dohaGradient: { padding: Spacing.xl },
  dohaHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  dohaLabel: {
    color: Colors.goldLight,
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
  dohaText: {
    color: Colors.goldLight,
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.sm,
  },
  dohaMeaning: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Fonts.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  dohaSource: {
    color: Colors.gold,
    fontSize: Fonts.sizes.xs,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontWeight: '600',
  },

  // Quick Links
  quickLinksRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  quickLinkCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    ...Shadow.sm,
  },
  quickLinkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkLabel: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Nam Lekhan card
  namLekhanCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  ramNaamTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  ramNaamCountBox: { alignItems: 'center' },
  ramNaamLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  ramNaamNumber: { fontSize: Fonts.sizes.xxl, fontWeight: '900' },
  ramNaamNumberGold: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '900',
    color: Colors.goldDark,
  },
  ramNaamDivider: { width: 1, backgroundColor: Colors.border },

  ramNaamTapBtn: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  tapBtnGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  ramNaamBtnIcon: { fontSize: 44, marginBottom: Spacing.xs },
  ramNaamBtnText: { fontSize: Fonts.sizes.xl, fontWeight: '900' },
  ramNaamBtnSub: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },

  namLekhanFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  namLekhanFullBtnText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  leaderboardMini: {},
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderRank: { width: 32, fontSize: 16 },
  leaderName: { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.textPrimary },
  leaderCount: { fontSize: Fonts.sizes.sm, fontWeight: '700' },

  // Katha
  horizontalScroll: { paddingHorizontal: Spacing.lg },
  kathaCard: {
    width: 240,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  kathaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  kathaIcon: { fontSize: 32 },
  kathaTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  kathaVachak: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  kathaMeta: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  kathaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },

  // Mandirs
  mandirListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  mandirListIcon: { fontSize: 36, marginRight: Spacing.md },
  mandirListInfo: { flex: 1 },
  mandirListName: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mandirListCity: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  mandirListRight: { alignItems: 'flex-end', gap: 6 },
  mandirListDist: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default HomeScreen;
