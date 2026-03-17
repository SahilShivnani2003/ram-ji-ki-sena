import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import {useI18n} from '../i18n';
import {Colors, Fonts, Spacing, BorderRadius, Shadow} from '../theme';
import {
  SectionHeader,
  Badge,
  LiveBadge,
  StarRating,
  PrimaryButton,
  OmSymbol,
} from '../components';
import {
  MANDIRS,
  KATHA_EVENTS,
  DOHAS,
  RAM_NAAM_LEADERBOARD,
} from '../data/staticData';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {t, isHindi} = useI18n();
  const [ramNaamCount, setRamNaamCount] = useState(1250);
  const [tapAnim, setTapAnim] = useState(false);
  const currentDoha = DOHAS[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.morning;
    if (hour < 17) return t.afternoon;
    return t.evening;
  };

  const handleRamNaamTap = () => {
    setRamNaamCount(prev => prev + 1);
    setTapAnim(true);
    setTimeout(() => setTapAnim(false), 200);
  };

  const quickLinks = [
    {icon: '🙏', label: t.bookPandit, screen: 'Pandits'},
    {icon: '🛒', label: t.orderSamagri, screen: 'Community'},
    {icon: '📺', label: t.liveDarshan, screen: 'Mandirs'},
    {icon: '💛', label: t.donate, screen: 'Profile'},
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* ── Header ──────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingText}>{getGreeting()} 🙏</Text>
            <Text style={styles.ramText}>जय श्री राम</Text>
          </View>
          <TouchableOpacity
            style={styles.omCircle}
            onPress={() => navigation.navigate('Profile')}>
            <OmSymbol size={22} color={Colors.gold} />
          </TouchableOpacity>
        </View>

        {/* Marquee announcement */}
        <View style={styles.marqueeBox}>
          <Text style={styles.marqueeIcon}>📢</Text>
          <Text style={styles.marqueeText} numberOfLines={1}>
            {isHindi
              ? 'राम नवमी पर सभी मंदिरों में विशेष आरती | रजिस्टर करें'
              : 'Special Aarti at all temples on Ram Navami | Register Now'}
          </Text>
        </View>
      </View>

      {/* ── Doha of the Day ──────────────────────────────── */}
      <View style={styles.dohaCard}>
        <View style={styles.dohaHeader}>
          <OmSymbol size={18} color={Colors.gold} />
          <Text style={styles.dohaLabel}>{t.dohanOfDay}</Text>
          <OmSymbol size={18} color={Colors.gold} />
        </View>
        <Text style={styles.dohaText}>{currentDoha.text}</Text>
        <Text style={styles.dohaMeaning}>
          {isHindi ? currentDoha.meaningHi : currentDoha.meaning}
        </Text>
        <Text style={styles.dohaSource}>
          — {isHindi ? currentDoha.sourceHi : currentDoha.source}
        </Text>
      </View>

      {/* ── Quick Links ──────────────────────────────────── */}
      <SectionHeader title={t.quickLinks} />
      <View style={styles.quickLinksRow}>
        {quickLinks.map((link, i) => (
          <TouchableOpacity
            key={i}
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate(link.screen)}>
            <Text style={styles.quickLinkIcon}>{link.icon}</Text>
            <Text style={styles.quickLinkLabel}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Ram Naam Bank ─────────────────────────────────── */}
      <SectionHeader title={t.ramNaamBank} />
      <View style={styles.ramNaamCard}>
        <View style={styles.ramNaamTop}>
          <View style={styles.ramNaamCountBox}>
            <Text style={styles.ramNaamLabel}>{t.yourCount}</Text>
            <Text style={styles.ramNaamNumber}>{ramNaamCount.toLocaleString()}</Text>
          </View>
          <View style={styles.ramNaamDivider} />
          <View style={styles.ramNaamCountBox}>
            <Text style={styles.ramNaamLabel}>{t.totalCount}</Text>
            <Text style={styles.ramNaamNumberGold}>1.25 Cr</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.ramNaamTapBtn, tapAnim && styles.ramNaamTapBtnActive]}
          onPress={handleRamNaamTap}
          activeOpacity={0.8}>
          <Text style={styles.ramNaamBtnIcon}>🔱</Text>
          <Text style={styles.ramNaamBtnText}>
            {isHindi ? 'जय श्री राम' : 'Jai Shri Ram'}
          </Text>
          <Text style={styles.ramNaamBtnSub}>{t.tapToWrite}</Text>
        </TouchableOpacity>

        {/* Leaderboard preview */}
        <View style={styles.leaderboardMini}>
          {RAM_NAAM_LEADERBOARD.slice(0, 3).map(item => (
            <View key={item.rank} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>#{item.rank}</Text>
              <Text style={styles.leaderName}>
                {isHindi ? item.nameHi : item.name}
              </Text>
              <Text style={styles.leaderCount}>
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
        contentContainerStyle={styles.horizontalScroll}>
        {KATHA_EVENTS.map(event => (
          <TouchableOpacity
            key={event.id}
            style={styles.kathaCard}
            onPress={() => navigation.navigate('Katha')}>
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
                style={{marginLeft: Spacing.sm}}
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
          onPress={() => navigation.navigate('Mandirs')}>
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

      <View style={{height: 80}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},

  // Header
  header: {
    backgroundColor: Colors.primary,
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
  greetingText: {color: 'rgba(255,255,255,0.9)', fontSize: Fonts.sizes.sm},
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.goldLight,
  },
  marqueeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  marqueeIcon: {fontSize: 14, marginRight: Spacing.xs},
  marqueeText: {
    color: Colors.goldLight,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    flex: 1,
  },

  // Doha Card
  dohaCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.darkBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    ...Shadow.md,
  },
  dohaHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  dohaLabel: {
    color: Colors.goldLight,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: Spacing.sm,
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
    justifyContent: 'space-between',
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  quickLinkIcon: {fontSize: 26},
  quickLinkLabel: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  // Ram Naam Bank
  ramNaamCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  ramNaamTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  ramNaamCountBox: {alignItems: 'center'},
  ramNaamLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  ramNaamNumber: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '900',
    color: Colors.primary,
  },
  ramNaamNumberGold: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '900',
    color: Colors.goldDark,
  },
  ramNaamDivider: {width: 1, backgroundColor: Colors.border},
  ramNaamTapBtn: {
    backgroundColor: Colors.saffronBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  ramNaamTapBtnActive: {backgroundColor: Colors.primaryLight, borderStyle: 'solid'},
  ramNaamBtnIcon: {fontSize: 40, marginBottom: Spacing.xs},
  ramNaamBtnText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '900',
    color: Colors.primary,
  },
  ramNaamBtnSub: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  leaderboardMini: {marginTop: Spacing.sm},
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderRank: {
    width: 28,
    fontSize: Fonts.sizes.sm,
    color: Colors.gold,
    fontWeight: '800',
  },
  leaderName: {flex: 1, fontSize: Fonts.sizes.sm, color: Colors.textPrimary},
  leaderCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Katha Horizontal Cards
  horizontalScroll: {paddingHorizontal: Spacing.lg},
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
  kathaIcon: {fontSize: 32},
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

  // Mandir List Cards
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
  mandirListIcon: {fontSize: 36, marginRight: Spacing.md},
  mandirListInfo: {flex: 1},
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
  mandirListRight: {alignItems: 'flex-end', gap: 6},
  mandirListDist: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default HomeScreen;
