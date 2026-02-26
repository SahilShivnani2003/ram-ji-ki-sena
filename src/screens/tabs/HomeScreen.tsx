import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SpiritualHeader from '../../components/SpiritualHeader';
import { SaffronButton, MantraCard, SectionHeader, OmDivider } from '../../components/UIComponents';
import { Colors, Radius, Typography, SacredSymbols, Spacing, Shadow } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────

interface Mantra {
  mantra: string;
  source: string;
}

interface Feature {
  icon: string;
  title: string;
  titleEn: string;
  desc: string;
  nav: string;
}

interface UpcomingKatha {
  title: string;
  kathavachak: string;
  date: string;
  city: string;
  type: string;
  emoji: string;
}

interface CommunityPost {
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  emoji: string;
}

// ─── Data ────────────────────────────────────────────────────────

const MANTRAS: Mantra[] = [
  { mantra: 'राम नाम मणि दीप धरु जीहँ देहरीं द्वार।', source: 'गोस्वामी तुलसीदास जी' },
  { mantra: 'कलियुग केवल नाम अधारा। सुमिर सुमिर नर उतरहिं पारा।', source: 'रामचरितमानस' },
  { mantra: 'हरे राम हरे राम, राम राम हरे हरे। हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।', source: 'महामंत्र' },
];

const FEATURES: Feature[] = [
  { icon: '📝', title: 'राम नाम लेखन', titleEn: 'Ram Naam Lekhan', desc: 'लिखित जाप करें और गिनती रखें', nav: 'RamNaam' },
  { icon: '🛕', title: 'मंदिर डायरेक्टरी', titleEn: 'Mandir Directory', desc: 'भारत के सभी मंदिर खोजें', nav: 'Mandirs' },
  { icon: '🎤', title: 'कथावाचक', titleEn: 'Kathavachak', desc: 'प्रसिद्ध कथावाचकों की जानकारी', nav: 'Kathavachak' },
  { icon: '🙏', title: 'पंडित बुकिंग', titleEn: 'Pandit Booking', desc: 'पूजा के लिए पंडित बुक करें', nav: 'Pandit' },
  { icon: '🪔', title: 'कथा इवेंट्स', titleEn: 'Katha Events', desc: 'आसपास की कथाएं देखें', nav: 'Katha' },
  { icon: '🌸', title: 'पूजन सामग्री', titleEn: 'Pooja Samagri', desc: 'घर बैठे सामग्री मंगाएं', nav: 'Samagri' },
  { icon: '💬', title: 'सामुदायिक फीड', titleEn: 'Community Feed', desc: 'भक्तों से जुड़ें', nav: 'Community' },
  { icon: '✍️', title: 'सहायता मंच', titleEn: 'Helping Forum', desc: 'धार्मिक सहायता प्राप्त करें', nav: 'Help' },
];

const UPCOMING_KATHA: UpcomingKatha[] = [
  { title: 'श्रीमद्भागवत कथा', kathavachak: 'धीरेन्द्र शास्त्री जी', date: 'मार्च 15-21', city: 'छतरपुर, MP', type: 'ऑफलाइन', emoji: '🎤' },
  { title: 'राम कथा', kathavachak: 'मोरारी बापू', date: 'मार्च 25-31', city: 'वडोदरा, Gujarat', type: 'लाइव', emoji: '🔴' },
  { title: 'सुंदरकांड पाठ', kathavachak: 'जया किशोरी जी', date: 'अप्रैल 5', city: 'ऑनलाइन', type: 'ऑनलाइन', emoji: '💻' },
];

const COMMUNITY_POSTS: CommunityPost[] = [
  { user: 'राम भक्त', avatar: 'RB', content: 'आज सुबह अयोध्या में भव्य आरती हुई 🙏 जय श्री राम!', time: '2 घंटे पहले', likes: 234, emoji: '🛕' },
  { user: 'कृष्ण सेविका', avatar: 'KS', content: 'हमारे मोहल्ले में कल भंडारा है, सभी का स्वागत है 🍛 राधे राधे!', time: '4 घंटे पहले', likes: 156, emoji: '🍛' },
];

// ─── Sub-components ───────────────────────────────────────────────

interface FeatureCardProps {
  item: Feature;
  onPress: (nav: string) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.featureCard}
    onPress={() => onPress(item.nav)}
    activeOpacity={0.85}
  >
    <LinearGradient
      colors={[Colors.creamDeep, Colors.parchment]}
      style={styles.featureIconBox}
    >
      <Text style={{ fontSize: 26 }}>{item.icon}</Text>
    </LinearGradient>
    <Text style={styles.featureTitle}>{item.title}</Text>
    <Text style={styles.featureTitleEn}>{item.titleEn}</Text>
    <Text style={styles.featureDesc}>{item.desc}</Text>
  </TouchableOpacity>
);

interface KathaCardProps {
  item: UpcomingKatha;
  onPress: () => void;
}

const KathaCard: React.FC<KathaCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.kathaCard} onPress={onPress} activeOpacity={0.88}>
    <LinearGradient colors={Colors.gradientCrimson} style={styles.kathaCardHeader}>
      <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
      <View style={styles.kathaTypeBadge}>
        <Text style={styles.kathaTypeText}>{item.type}</Text>
      </View>
    </LinearGradient>
    <View style={styles.kathaCardBody}>
      <Text style={styles.kathaTitle}>{item.title}</Text>
      <Text style={styles.kathaKathavachak}>🎤 {item.kathavachak}</Text>
      <Text style={styles.kathaMeta}>📅 {item.date}</Text>
      <Text style={styles.kathaMeta}>📍 {item.city}</Text>
    </View>
  </TouchableOpacity>
);

// Local GoldOutlineButton for hero
interface GoldOutlineButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

const GoldOutlineButton: React.FC<GoldOutlineButtonProps> = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
    <View style={gStyles.btn}>
      <Text style={gStyles.text}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const gStyles = StyleSheet.create({
  btn: {
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: 15,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  text: { color: Colors.goldLight, fontSize: Typography.md, fontWeight: '700' },
});

// ─── Screen ───────────────────────────────────────────────────────

type Props = NativeStackScreenProps<any, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [mantraIdx, setMantraIdx] = useState<number>(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
    ]).start();

    const interval = setInterval(() => {
      setMantraIdx(i => (i + 1) % MANTRAS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim]);

  const navigate = (screen: string): void => {
    try { navigation.navigate(screen); } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <SpiritualHeader showLogo navigation={navigation} showSearch />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── HERO SECTION ──────────────────────────── */}
        <LinearGradient
          colors={['#7F0000', '#B71C1C', '#C62828', '#E65100']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroBgOm}>{SacredSymbols.om}</Text>
          <Text style={styles.heroBgLotus}>🪷</Text>

          <Animated.View
            style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.jaiRamBadge}>
              <Text style={styles.jaiRamLeft}>🚩</Text>
              <Text style={styles.jaiRamText}>जय श्री राम</Text>
              <Text style={styles.jaiRamRight}>🚩</Text>
            </View>

            <Text style={styles.heroTitle}>सनातन सेवा मंच</Text>
            <Text style={styles.heroSubtitle}>एक परिवार, असीम आध्यात्मिक यात्रा</Text>
            <Text style={styles.heroEn}>One Sanatan Family · Infinite Spiritual Journey</Text>

            <View style={styles.heroStats}>
              {([
                { val: '5,000+', label: 'मंदिर' },
                { val: '10L+', label: 'भक्त' },
                { val: '500+', label: 'पंडित' },
                { val: '200+', label: 'कथाएं' },
              ] as Array<{ val: string; label: string }>).map((s, i) => (
                <View key={i} style={styles.heroStatItem}>
                  <Text style={styles.heroStatVal}>{s.val}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                  {i < 3 && <View style={styles.heroStatDiv} />}
                </View>
              ))}
            </View>

            <View style={styles.heroCTA}>
              <SaffronButton
                title="अभी शुरू करें"
                icon={SacredSymbols.pray}
                onPress={() => navigate('RamNaam')}
                style={{ flex: 1 }}
              />
              <GoldOutlineButton
                title="लॉगिन करें"
                onPress={() => navigate('Login')}
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── ROTATING MANTRA ───────────────────────── */}
        <View style={styles.mantraSection}>
          <MantraCard
            mantra={MANTRAS[mantraIdx].mantra}
            source={MANTRAS[mantraIdx].source}
          />
          <View style={styles.mantraDots}>
            {MANTRAS.map((_, i) => (
              <View key={i} style={[styles.mantraDot, i === mantraIdx && styles.mantraDotActive]} />
            ))}
          </View>
        </View>

        {/* ── FEATURES GRID ─────────────────────────── */}
        <View style={styles.featuresSection}>
          <SectionHeader title="सेवाएं" titleHindi="Explore Features" />
          <View style={styles.featuresGrid}>
            {FEATURES.map((feat, i) => (
              <FeatureCard key={i} item={feat} onPress={navigate} />
            ))}
          </View>
        </View>

        <OmDivider />

        {/* ── UPCOMING KATHA ────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="आगामी कथाएं"
            titleHindi="Upcoming Katha Events"
            actionLabel="सभी देखें"
            onAction={() => navigate('Katha')}
          />
          <FlatList
            data={UPCOMING_KATHA}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kathaList}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <KathaCard item={item} onPress={() => navigate('Katha')} />
            )}
          />
        </View>

        <OmDivider />

        {/* ── QUICK ACTIONS ─────────────────────────── */}
        <View style={[styles.section, styles.sectionPad]}>
          <SectionHeader title="त्वरित सेवाएं" titleHindi="Quick Actions" />
          <View style={styles.quickGrid}>
            {([
              { icon: '🛕', label: 'नजदीकी मंदिर', nav: 'Mandirs' },
              { icon: '🙏', label: 'पंडित बुक करें', nav: 'Pandit' },
              { icon: '🪔', label: 'लाइव दर्शन', nav: 'Katha' },
              { icon: '🌸', label: 'पूजा सामग्री', nav: 'Samagri' },
              { icon: '💝', label: 'दान करें', nav: 'Donation' },
              { icon: '🆘', label: 'सहायता', nav: 'Help' },
            ] as Array<{ icon: string; label: string; nav: string }>).map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickCard}
                onPress={() => navigate(q.nav)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#FFF8F0', '#FFF3E0']} style={styles.quickCardInner}>
                  <Text style={{ fontSize: 28 }}>{q.icon}</Text>
                  <Text style={styles.quickLabel}>{q.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── COMMUNITY FEED PREVIEW ────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="समुदाय फीड"
            titleHindi="Community Updates"
            actionLabel="सभी देखें"
            onAction={() => navigate('Community')}
          />
          {COMMUNITY_POSTS.map((post, i) => (
            <View key={i} style={styles.postCard}>
              <View style={styles.postHeader}>
                <LinearGradient
                  colors={Colors.gradientSaffron}
                  style={styles.postAvatar}
                >
                  <Text style={styles.postAvatarText}>{post.avatar}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postUser}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                <Text style={{ fontSize: 20 }}>{post.emoji}</Text>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction}>
                  <Text style={styles.postActionText}>🙏 {post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                  <Text style={styles.postActionText}>💬 टिप्पणी</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                  <Text style={styles.postActionText}>↗ शेयर</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ── FOOTER CTA ────────────────────────────── */}
        <LinearGradient colors={Colors.gradientSunrise} style={styles.footerCTA}>
          <Text style={styles.footerOm}>{SacredSymbols.om}</Text>
          <Text style={styles.footerTitle}>राम नाम का लिखित जाप करें</Text>
          <Text style={styles.footerSub}>आज से ही अपनी आध्यात्मिक यात्रा शुरू करें</Text>
          <TouchableOpacity
            style={styles.footerBtn}
            onPress={() => navigate('RamNaam')}
            activeOpacity={0.85}
          >
            <Text style={styles.footerBtnText}>✍️ राम नाम लिखना शुरू करें</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  hero: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
  },
  heroBgOm: {
    position: 'absolute',
    right: -10,
    top: -10,
    fontSize: 160,
    color: 'rgba(255,255,255,0.04)',
    fontWeight: '900',
  },
  heroBgLotus: {
    position: 'absolute',
    left: -10,
    bottom: 10,
    fontSize: 100,
    opacity: 0.07,
  },
  heroContent: { gap: 14 },
  jaiRamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(249,168,37,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(249,168,37,0.4)',
  },
  jaiRamLeft: { fontSize: 14 },
  jaiRamRight: { fontSize: 14 },
  jaiRamText: {
    color: Colors.goldLight,
    fontSize: Typography.md,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: Typography.xxxl,
    fontWeight: '900',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: Colors.goldLight,
    fontSize: Typography.lg,
    fontWeight: '700',
  },
  heroEn: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: Typography.sm,
    fontStyle: 'italic',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  heroStatItem: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  heroStatVal: { color: Colors.goldLight, fontSize: Typography.lg, fontWeight: '900', marginRight: 2 },
  heroStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2 },
  heroStatDiv: { position: 'absolute', right: 0, width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroCTA: { flexDirection: 'row', gap: 12 },

  mantraSection: { padding: Spacing.md, gap: 10 },
  mantraDots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  mantraDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.divider },
  mantraDotActive: { backgroundColor: Colors.saffron, width: 18 },

  featuresSection: { paddingVertical: Spacing.md },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  featureCard: {
    width: (width - Spacing.md * 2 - 30) / 4,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.card,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureTitle: { fontSize: 10, fontWeight: '800', color: Colors.darkText, textAlign: 'center' },
  featureTitleEn: { fontSize: 8.5, color: Colors.saffron, fontWeight: '600', textAlign: 'center' },
  featureDesc: { fontSize: 8, color: Colors.brownLight, textAlign: 'center', marginTop: 2, lineHeight: 11 },

  section: { paddingVertical: Spacing.md },
  sectionPad: { paddingHorizontal: Spacing.md },

  kathaList: { paddingHorizontal: Spacing.md, gap: 12 },
  kathaCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.card,
  },
  kathaCardHeader: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.sm,
  },
  kathaTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  kathaTypeText: { color: Colors.white, fontSize: 10, fontWeight: '600' },
  kathaCardBody: { padding: Spacing.sm },
  kathaTitle: { fontSize: Typography.sm, fontWeight: '800', color: Colors.darkText, marginBottom: 4 },
  kathaKathavachak: { fontSize: 11, color: Colors.saffron, fontWeight: '600', marginBottom: 2 },
  kathaMeta: { fontSize: 11, color: Colors.brownLight },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: (width - Spacing.md * 2 - 20) / 3,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.card,
  },
  quickCardInner: { padding: Spacing.md, alignItems: 'center', gap: 6 },
  quickLabel: { fontSize: 11, fontWeight: '700', color: Colors.darkText, textAlign: 'center' },

  postCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.card,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  postUser: { fontSize: Typography.sm, fontWeight: '700', color: Colors.darkText },
  postTime: { fontSize: 11, color: Colors.brownLight },
  postContent: { fontSize: Typography.sm, color: Colors.brownMid, lineHeight: 20, marginBottom: 10 },
  postActions: { flexDirection: 'row', gap: 14, borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 8 },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postActionText: { fontSize: 12, color: Colors.brownMid, fontWeight: '600' },

  footerCTA: {
    margin: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 10,
    ...Shadow.crimson,
  },
  footerOm: { fontSize: 36, color: Colors.goldLight },
  footerTitle: { fontSize: Typography.xl, fontWeight: '900', color: Colors.white, textAlign: 'center' },
  footerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  footerBtn: {
    backgroundColor: Colors.white,
    paddingVertical: 13,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    marginTop: 6,
  },
  footerBtnText: { color: Colors.saffron, fontSize: Typography.md, fontWeight: '800' },
});

export default HomeScreen;
