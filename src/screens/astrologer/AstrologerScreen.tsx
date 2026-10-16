import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
      ActivityIndicator,
      Animated,
      FlatList,
      Image,
      ListRenderItem,
      Modal,
      Platform,
      Pressable,
      RefreshControl,
      ScrollView,
      StatusBar,
      StyleSheet,
      Text,
      TextInput,
      useWindowDimensions,
      View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BorderRadius, Colors, Fonts, Shadow, Spacing, } from '../../theme/index';
import type { AstrologerAvailabilityStatus, IAstrologer, } from '../../types/IAstrologer';
import { astrologerApi } from '../../service/apis/astroServices';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigator';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../../navigation/AppNavigator';

type AstrologersProps = DrawerScreenProps<DrawerParamList, 'Astrologer'>;

const initialData: IAstrologer[] = [{
      _id: "6acbdca0a3cfe4304d70038b",
      username: "brijesh_ayodhya",
      password: "$2a$10$NcHNuxz6E//l2prceY5aGuH2306WrODnQr1AoPc/GoWe5Z2U0igRW",
      name: "पं. बृजेश तिवारी (Pt. Brijesh Tiwary)",
      tagline: "अयोध्या धाम - कालसर्प, मांगलिक व पितृ दोष निवारण",
      photo: "",
      photos: [],
      about: "काशी विश्वनाथ विद्यापीठ से शिक्षित। अयोध्या धाम में निरंतर 22 वर्षों से वैदिक अनुष्ठान, ग्रह शांति व महामृत्युंजय जप के विशेषज्ञ।",
      contact: {
            phone: "9876543214",
            email: "brijesh@ayodhyadivyadarshan.org",
            whatsapp: "9876543214"
      },
      location: {
            address: "Ramkot, Ayodhya",
            city: "Ayodhya",
            state: "Uttar Pradesh"
      },
      experience: 22,
      specialties: [
            "Vedic Astrology",
            "Kundli Milan",
            "Dosh Nivaran",
            "Prashna Kundali"
      ],
      languages: [
            "Hindi",
            "Awadhi",
            "Sanskrit"
      ],
      qualifications: "वेदाचार्य, काशी विश्वनाथ संस्कृत परिषद",
      fee: 501,
      feePerMinute: 15,
      services: [
            {
                  title: "दोष विचार व शांति उपाय (Dosh Analysis)",
                  price: 501,
                  duration: "30 mins",
                  type: "Call",
                  description: "कालसर्प, शनि साढ़ेसाती, व पितृ दोष निवारण के सरल वैदिक उपाय",
                  _id: "6acbdca0a3cfe4304d70038c"
            }
      ],
      reviews: [
            {
                  userName: "Kishan Lal",
                  rating: 5,
                  comment: "तिवारी जी की वाणी में अद्भुत शांति है। सारे संशय दूर हो गए।",
                  topic: "Kundli Dosh",
                  _id: "6acbdca0a3cfe4304d70038d",
                  createdAt: "2026-10-11T18:59:44.741Z"
            }
      ],
      averageRating: 5,
      totalConsultations: 2100,
      isVerified: true,
      isActive: true,
      availabilityStatus: "online",
      createdAt: "2026-10-11T18:59:44.743Z",
      updatedAt: "2026-10-11T18:59:44.743Z",
      __v: 0
}]

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type SortKey = 'rating' | 'experience' | 'feeLow' | 'feeHigh';

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const SORT_OPTIONS: ReadonlyArray<{ key: SortKey; label: string }> = [
      { key: 'rating', label: 'Top Rating' },
      { key: 'experience', label: 'Most Experienced' },
      { key: 'feeLow', label: 'Fee: Low to High' },
      { key: 'feeHigh', label: 'Fee: High to Low' },
];

const AVAILABILITY: Record<AstrologerAvailabilityStatus, { label: string; color: string }> = {
      online: { label: 'AVAILABLE', color: Colors.success },
      busy: { label: 'BUSY', color: Colors.warning },
      offline: { label: 'OFFLINE', color: Colors.textMuted },
};

const SPECIALTY_EMOJI: ReadonlyArray<{ match: string; emoji: string }> = [
      { match: 'vedic', emoji: '🕉️' },
      { match: 'tarot', emoji: '🃏' },
      { match: 'kundli', emoji: '📜' },
      { match: 'vastu', emoji: '🏠' },
      { match: 'numerolog', emoji: '🔢' },
      { match: 'palm', emoji: '✋' },
      { match: 'gem', emoji: '💎' },
      { match: 'prashna', emoji: '❓' },
];

const GAP = Spacing.lg;
const WIDE_MIN_WIDTH = 720;
const SKELETON_COUNT = 3;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const formatINR = (amount: number): string => {
      const [int] = amount.toFixed(2).split('.');
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3);
      const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
      return `₹${grouped}`;
};

const emojiFor = (specialty: string): string => {
      const s = specialty.toLowerCase();
      return SPECIALTY_EMOJI.find(e => s.includes(e.match))?.emoji ?? '✨';
};

const experienceLabel = (years: number): string =>
      years < 1 ? 'New astrologer' : `${years}+ yrs experience`;

const locationLabel = (a: IAstrologer): string =>
      [a.location.city, a.location.state].filter(Boolean).join(', ');

const sortAstrologers = (list: IAstrologer[], key: SortKey): IAstrologer[] => {
      const sorted = [...list];
      switch (key) {
            case 'experience':
                  return sorted.sort((a, b) => b.experience - a.experience || b.averageRating - a.averageRating);
            case 'feeLow':
                  return sorted.sort((a, b) => a.fee - b.fee || b.averageRating - a.averageRating);
            case 'feeHigh':
                  return sorted.sort((a, b) => b.fee - a.fee || b.averageRating - a.averageRating);
            case 'rating':
            default:
                  return sorted.sort(
                        (a, b) => b.averageRating - a.averageRating || b.totalConsultations - a.totalConsultations,
                  );
      }
};

/*                               Small components                             */
const Portrait = memo(({ photo }: { photo: string }) => {
      const [failed, setFailed] = useState(false);
      if (photo && !failed) {
            return <Image source={{ uri: photo }} style={styles.portrait} onError={() => setFailed(true)} />;
      }
      return (
            <View style={styles.orbWrap}>
                  <Text style={styles.orb}>🔮</Text>
            </View>
      );
});

interface AstrologerCardProps {
      astrologer: IAstrologer;
      onPress: (a: IAstrologer) => void;
      onGetAdvice: (a: IAstrologer) => void;
}

const AstrologerCard = memo(({ astrologer: a, onPress, onGetAdvice }: AstrologerCardProps) => {
      const [dark0 = Colors.darkBg, dark1 = Colors.darkBg] = Colors.gradientDark;
      const [gold0 = Colors.goldLight, gold1 = Colors.gold] = Colors.gradientGold;
      const status = AVAILABILITY[a.availabilityStatus];
      const primary = a.specialties[0] ?? 'Astrologer';
      const tags = a.specialties.slice(0, 2);
      const extra = a.specialties.length - tags.length;
      const location = locationLabel(a);

      const scale = useRef(new Animated.Value(1)).current;
      const pressTo = (v: number): void => {
            Animated.spring(scale, { toValue: v, useNativeDriver: true, friction: 7, tension: 160 }).start();
      };

      return (
            <Animated.View style={[styles.cardOuter, { transform: [{ scale }] }]}>
                  <Pressable
                        onPress={() => onPress(a)}
                        onPressIn={() => pressTo(0.985)}
                        onPressOut={() => pressTo(1)}
                        accessibilityRole="button"
                        accessibilityLabel={`${a.name}, ${primary}, rated ${a.averageRating.toFixed(1)}, ${experienceLabel(
                              a.experience,
                        )}, ${formatINR(a.fee)} per session, ${status.label.toLowerCase()}`}
                        style={styles.card}
                  >
                        {/* ------------------------------ Dark top ------------------------------ */}
                        <LinearGradient
                              colors={[dark0, dark1] as string[]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.cardTop}
                        >
                              <View style={styles.cardTopRow}>
                                    <View style={styles.statusPill}>
                                          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                                          <Text style={styles.statusText}>{status.label}</Text>
                                    </View>
                                    {a.isVerified ? (
                                          <View style={styles.certified}>
                                                <Ionicons name="shield-checkmark" size={13} color={Colors.textLight} />
                                                <Text style={styles.certifiedText}>Certified</Text>
                                          </View>
                                    ) : null}
                              </View>

                              <View style={styles.cardCenter}>
                                    <Portrait photo={a.photo} />
                                    <Text style={styles.cardSpecialty} numberOfLines={1}>
                                          {primary}
                                    </Text>
                              </View>

                              <View style={styles.cardNameRow}>
                                    <View style={styles.flex}>
                                          <Text style={styles.cardName} numberOfLines={1}>
                                                {a.name}
                                          </Text>
                                          {a.tagline ? (
                                                <Text style={styles.cardTagline} numberOfLines={1}>
                                                      {a.tagline}
                                                </Text>
                                          ) : null}
                                    </View>
                                    <View style={styles.rating}>
                                          <Ionicons name="star" size={13} color={Colors.darkBg} />
                                          <Text style={styles.ratingText}>{a.averageRating.toFixed(1)}</Text>
                                    </View>
                              </View>
                        </LinearGradient>

                        {/* ------------------------------ White body ---------------------------- */}
                        <View style={styles.cardBody}>
                              <View style={styles.metaRow}>
                                    {location ? (
                                          <View style={styles.locationWrap}>
                                                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                                                <Text style={styles.locationText} numberOfLines={1}>
                                                      {location}
                                                </Text>
                                          </View>
                                    ) : (
                                          <View style={styles.flex} />
                                    )}
                                    <View style={styles.expChip}>
                                          <Ionicons name="ribbon-outline" size={14} color={Colors.goldDark} />
                                          <Text style={styles.expText}>{experienceLabel(a.experience)}</Text>
                                    </View>
                              </View>

                              {tags.length > 0 ? (
                                    <View style={styles.tagRow}>
                                          {tags.map(t => (
                                                <View key={t} style={styles.tag}>
                                                      <Text style={styles.tagText} numberOfLines={1}>
                                                            {t}
                                                      </Text>
                                                </View>
                                          ))}
                                          {extra > 0 ? (
                                                <View style={[styles.tag, styles.tagMore]}>
                                                      <Text style={[styles.tagText, { color: Colors.textSecondary }]}>+ {extra}</Text>
                                                </View>
                                          ) : null}
                                    </View>
                              ) : null}

                              {a.languages.length > 0 ? (
                                    <Text style={styles.languages} numberOfLines={2}>
                                          <Text style={styles.languagesKey}>Languages: </Text>
                                          {a.languages.join(', ')}
                                    </Text>
                              ) : null}

                              <View style={styles.divider} />

                              <View style={styles.feeRow}>
                                    <View>
                                          <Text style={styles.feeLabel}>CONSULTANCY FEE</Text>
                                          <View style={styles.feeValueRow}>
                                                <Text style={styles.feeValue}>{formatINR(a.fee)}</Text>
                                                <Text style={styles.feeUnit}> /session</Text>
                                          </View>
                                    </View>
                                    <Pressable
                                          onPress={() => onGetAdvice(a)}
                                          accessibilityRole="button"
                                          accessibilityLabel={`Get advice from ${a.name}`}
                                          style={({ pressed }) => [styles.adviceWrap, pressed && { opacity: 0.88 }]}
                                    >
                                          <LinearGradient
                                                colors={[gold0, gold1] as string[]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.advice}
                                          >
                                                <Text style={styles.adviceText}>Get advice</Text>
                                                <Ionicons name="chevron-forward" size={16} color={Colors.textPrimary} />
                                          </LinearGradient>
                                    </Pressable>
                              </View>
                        </View>
                  </Pressable>
            </Animated.View>
      );
});

const SkeletonCard = () => {
      const pulse = useRef(new Animated.Value(0.45)).current;
      useEffect(() => {
            const loop = Animated.loop(
                  Animated.sequence([
                        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
                        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
                  ]),
            );
            loop.start();
            return () => loop.stop();
      }, [pulse]);
      return (
            <Animated.View style={[styles.card, { opacity: pulse }]}>
                  <View style={[styles.cardTop, { backgroundColor: Colors.darkBg, minHeight: 230 }]} />
                  <View style={[styles.cardBody, { gap: Spacing.md }]}>
                        <View style={[styles.skel, { height: 14, width: '70%' }]} />
                        <View style={[styles.skel, { height: 14, width: '50%' }]} />
                        <View style={[styles.skel, { height: 40, width: '100%' }]} />
                  </View>
            </Animated.View>
      );
};

/* ------------------------------- Sort sheet -------------------------------- */

const SortSheet = ({
      visible,
      value,
      onSelect,
      onClose,
}: {
      visible: boolean;
      value: SortKey;
      onSelect: (k: SortKey) => void;
      onClose: () => void;
}) => (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.sheetBackdrop}>
                  <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sort options" />
                  <View style={styles.sheet}>
                        <View style={styles.grabber} />
                        <Text style={styles.sheetTitle}>Sort by</Text>
                        {SORT_OPTIONS.map(o => {
                              const active = o.key === value;
                              return (
                                    <Pressable
                                          key={o.key}
                                          onPress={() => {
                                                onSelect(o.key);
                                                onClose();
                                          }}
                                          accessibilityRole="radio"
                                          accessibilityState={{ selected: active }}
                                          style={({ pressed }) => [styles.sheetRow, active && styles.sheetRowActive, pressed && { opacity: 0.85 }]}
                                    >
                                          <Text style={[styles.sheetRowText, active && styles.sheetRowTextActive]}>{o.label}</Text>
                                          {active ? <Ionicons name="checkmark-circle" size={22} color={Colors.primary} /> : null}
                                    </Pressable>
                              );
                        })}
                  </View>
            </View>
      </Modal>
);

/* ----------------------------- List header (hero) --------------------------- */

interface ListHeaderProps {
      wide: boolean;
      query: string;
      city: string;
      sort: SortKey;
      specialty: string | null;
      specialtyOptions: ReadonlyArray<string>;
      resultCount: number;
      onQuery: (t: string) => void;
      onCity: (t: string) => void;
      onSpecialty: (s: string | null) => void;
      onOpenSort: () => void;
      onPressJoin?: () => void;
}

const ListHeader = ({
      wide,
      query,
      city,
      sort,
      specialty,
      specialtyOptions,
      resultCount,
      onQuery,
      onCity,
      onSpecialty,
      onOpenSort,
      onPressJoin,
}: ListHeaderProps) => {
      const [dark0 = Colors.darkBg, dark1 = Colors.darkBg] = Colors.gradientDark;
      const sortLabel = SORT_OPTIONS.find(o => o.key === sort)?.label ?? 'Sort';

      return (
            <View>
                  {/* -------------------------------- Hero -------------------------------- */}
                  <LinearGradient
                        colors={[dark0, dark1, Colors.background] as string[]}
                        locations={[0, 0.55, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.hero}
                  >
                        <View style={styles.badge}>
                              <Ionicons name="sparkles-outline" size={15} color={Colors.goldLight} />
                              <Text style={styles.badgeText}>Vedic astrology and tarot card consultation</Text>
                        </View>
                        <Text style={styles.heroTitle}>
                              Clear guidance, <Text style={styles.heroTitleAccent}>bright future</Text>
                        </Text>
                        <Text style={styles.heroSub}>
                              Get personalized consultation from experienced astrologers and certified tarot card readers
                              on horoscope, career, marriage, Vastu and every important question of life.
                        </Text>
                  </LinearGradient>

                  {/* ----------------------------- Search card ---------------------------- */}
                  <View style={styles.searchCard}>
                        <View style={wide ? styles.searchRowWide : undefined}>
                              <View style={[styles.inputBox, wide && styles.flex2]}>
                                    <Ionicons name="search-outline" size={19} color={Colors.textMuted} />
                                    <TextInput
                                          value={query}
                                          onChangeText={onQuery}
                                          placeholder="Astrologer's name, method or problem…"
                                          placeholderTextColor={Colors.textMuted}
                                          returnKeyType="search"
                                          autoCorrect={false}
                                          accessibilityLabel="Search astrologers"
                                          style={styles.input}
                                    />
                                    {query.length > 0 ? (
                                          <Pressable
                                                onPress={() => onQuery('')}
                                                hitSlop={10}
                                                accessibilityRole="button"
                                                accessibilityLabel="Clear search"
                                          >
                                                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                                          </Pressable>
                                    ) : null}
                              </View>

                              <View style={[styles.inlineRow, wide && styles.flex2]}>
                                    <View style={[styles.inputBox, styles.flex]}>
                                          <Ionicons name="location-outline" size={19} color={Colors.textMuted} />
                                          <TextInput
                                                value={city}
                                                onChangeText={onCity}
                                                placeholder="City (e.g. Bhopal)"
                                                placeholderTextColor={Colors.textMuted}
                                                autoCorrect={false}
                                                accessibilityLabel="Filter by city"
                                                style={styles.input}
                                          />
                                    </View>
                                    <Pressable
                                          onPress={onOpenSort}
                                          accessibilityRole="button"
                                          accessibilityLabel={`Sort by ${sortLabel}`}
                                          style={({ pressed }) => [styles.sortBtn, pressed && { opacity: 0.85 }]}
                                    >
                                          <Ionicons name="swap-vertical-outline" size={17} color={Colors.primaryDark} />
                                          <Text style={styles.sortText} numberOfLines={1}>
                                                {sortLabel}
                                          </Text>
                                          <Ionicons name="chevron-down" size={15} color={Colors.textSecondary} />
                                    </Pressable>
                              </View>
                        </View>

                        <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              keyboardShouldPersistTaps="handled"
                              contentContainerStyle={styles.chipRow}
                        >
                              <Pressable
                                    onPress={() => onSpecialty(null)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: specialty === null }}
                                    style={[styles.chip, specialty === null && styles.chipActive]}
                              >
                                    <Text style={[styles.chipText, specialty === null && styles.chipTextActive]}>All</Text>
                              </Pressable>
                              {specialtyOptions.map(s => {
                                    const active = specialty === s;
                                    return (
                                          <Pressable
                                                key={s}
                                                onPress={() => onSpecialty(active ? null : s)}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: active }}
                                                style={[styles.chip, active && styles.chipActive]}
                                          >
                                                <Text style={styles.chipEmoji}>{emojiFor(s)}</Text>
                                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
                                          </Pressable>
                                    );
                              })}
                        </ScrollView>
                  </View>

                  {/* --------------------------- Section heading -------------------------- */}
                  <View style={[styles.sectionHead, wide && styles.sectionHeadWide]}>
                        <View style={styles.flex}>
                              <View style={styles.sectionTitleRow}>
                                    <Text style={styles.sectionTitle}>Expert Astrologers and Card Readers</Text>
                                    <View style={styles.countPill}>
                                          <Text style={styles.countText}>{resultCount} available</Text>
                                    </View>
                              </View>
                              <Text style={styles.sectionSub}>
                                    Choose an experienced specialist as per your choice and book a consultation directly
                                    online or over the phone.
                              </Text>
                        </View>
                        {onPressJoin ? (
                              <Pressable
                                    onPress={onPressJoin}
                                    accessibilityRole="button"
                                    accessibilityLabel="Join as an astrologer"
                                    style={({ pressed }) => [styles.joinBtn, pressed && { opacity: 0.85 }]}
                              >
                                    <Text style={styles.joinText}>Join as an Astrologer</Text>
                                    <Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} />
                              </Pressable>
                        ) : null}
                  </View>
            </View>
      );
};


export default function AstrologersScreen({ navigation }: AstrologersProps) {
      const [astrologers, setAstrologers] = useState<IAstrologer[]>(initialData);
      const [isLoading, setIsLoading] = useState(false);
      const [isRefreshing, setIsRefreshing] = useState(false);
      const [errorMessage, setErrorMessage] = useState(null);

      const { width } = useWindowDimensions();
      const wide = width >= WIDE_MIN_WIDTH;
      const numColumns = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
      const contentWidth = width - Spacing.lg * 2;
      const cardWidth = Math.floor((contentWidth - GAP * (numColumns - 1)) / numColumns);

      const [query, setQuery] = useState('');
      const [city, setCity] = useState('');
      const [specialty, setSpecialty] = useState<string | null>(null);
      const [sort, setSort] = useState<SortKey>('rating');
      const [sortOpen, setSortOpen] = useState(false);

      const active = useMemo(() => astrologers.filter(a => a.isActive), [astrologers]);
      const rootNav = navigation.getParent<NativeStackNavigationProp<RootParamList>>();

      useEffect(() => {
            fetchAstrologers();
      }, []);

      const fetchAstrologers = async () => {
            try {
                  setIsLoading(true);
                  const response = await astrologerApi.getAstrologers();
                  setAstrologers(response.astrologers);
            } finally {
                  setIsLoading(false);
            }
      }

      // specialty chips come from the data, most common first
      const specialtyOptions = useMemo(() => {
            const counts = new Map<string, number>();
            active.forEach(a => a.specialties.forEach(s => counts.set(s, (counts.get(s) ?? 0) + 1)));
            return [...counts.entries()]
                  .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
                  .map(([s]) => s);
      }, [active]);

      const results = useMemo(() => {
            const q = query.trim().toLowerCase();
            const c = city.trim().toLowerCase();
            const filtered = active.filter(a => {
                  if (specialty && !a.specialties.includes(specialty)) return false;
                  if (c && !`${a.location.city} ${a.location.state}`.toLowerCase().includes(c)) return false;
                  if (q) {
                        const haystack = [a.name, a.tagline, a.qualifications, ...a.specialties, ...a.languages]
                              .join(' ')
                              .toLowerCase();
                        if (!haystack.includes(q)) return false;
                  }
                  return true;
            });
            return sortAstrologers(filtered, sort);
      }, [active, query, city, specialty, sort]);

      const clearFilters = useCallback(() => {
            setQuery('');
            setCity('');
            setSpecialty(null);
      }, []);
      const onRefresh = () => {
            try {
                  setIsRefreshing(true);
                  fetchAstrologers();
            } finally {
                  setIsRefreshing(false);
            }
      }
      const onRetry = () => { }
      const onPressAstrologer = (data: any) => {
            rootNav.navigate('AstroDetail', { astrologer: data });
      }
      const onPressGetAdvice = (data: any) => { }
      const onPressJoin = () => { }

      const handleAdvice = useCallback(
            (a: IAstrologer) => (onPressGetAdvice ?? onPressAstrologer)(a),
            [onPressGetAdvice, onPressAstrologer],
      );

      const renderItem: ListRenderItem<IAstrologer> = useCallback(
            ({ item }) => (
                  <View style={numColumns === 1 ? styles.itemSingle : { width: cardWidth, marginBottom: GAP }}>
                        <AstrologerCard astrologer={item} onPress={() => onPressAstrologer(item)} onGetAdvice={() => handleAdvice(item)} />
                  </View>
            ),
            [numColumns, cardWidth, onPressAstrologer, handleAdvice],
      );

      const showSkeleton = isLoading && active.length === 0;
      const showError = !isLoading && active.length === 0 && Boolean(errorMessage);
      const filtersActive = query.trim() !== '' || city.trim() !== '' || specialty !== null;

      const header = (
            <ListHeader
                  wide={wide}
                  query={query}
                  city={city}
                  sort={sort}
                  specialty={specialty}
                  specialtyOptions={specialtyOptions}
                  resultCount={results.length}
                  onQuery={setQuery}
                  onCity={setCity}
                  onSpecialty={setSpecialty}
                  onOpenSort={() => setSortOpen(true)}
                  onPressJoin={onPressJoin}
            />
      );

      let empty: React.ReactElement | null = null;
      if (showSkeleton) {
            empty = (
                  <View style={styles.skeletonWrap}>
                        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                              <SkeletonCard key={i} />
                        ))}
                  </View>
            );
      } else if (showError) {
            empty = (
                  <View style={styles.emptyWrap}>
                        <Ionicons name="cloud-offline-outline" size={44} color={Colors.textMuted} />
                        <Text style={styles.emptyTitle}>Couldn't load astrologers</Text>
                        <Text style={styles.emptySub}>{errorMessage}</Text>
                        {onRetry ? (
                              <Pressable
                                    onPress={onRetry}
                                    accessibilityRole="button"
                                    style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
                              >
                                    <Text style={styles.primaryBtnText}>Try again</Text>
                              </Pressable>
                        ) : null}
                  </View>
            );
      } else {
            empty = (
                  <View style={styles.emptyWrap}>
                        <Text style={styles.emptyEmoji}>🔮</Text>
                        <Text style={styles.emptyTitle}>
                              {filtersActive ? 'No astrologers match your search' : 'No astrologers available yet'}
                        </Text>
                        <Text style={styles.emptySub}>
                              {filtersActive
                                    ? 'Try a different name, city or specialty.'
                                    : 'Check back soon – new astrologers join every week.'}
                        </Text>
                        {filtersActive ? (
                              <Pressable
                                    onPress={clearFilters}
                                    accessibilityRole="button"
                                    style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
                              >
                                    <Text style={styles.primaryBtnText}>Clear filters</Text>
                              </Pressable>
                        ) : null}
                  </View>
            );
      }

      return (
            <View style={styles.root}>
                  <StatusBar barStyle="light-content" backgroundColor={Colors.darkBg} />

                  <FlatList<IAstrologer>
                        key={numColumns}
                        data={showSkeleton ? [] : results}
                        keyExtractor={a => a._id}
                        renderItem={renderItem}
                        numColumns={numColumns}
                        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
                        ListHeaderComponent={header}
                        ListEmptyComponent={empty}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        refreshControl={
                              onRefresh ? (
                                    <RefreshControl
                                          refreshing={isRefreshing}
                                          onRefresh={onRefresh}
                                          tintColor={Colors.primary}
                                          colors={[Colors.primary]}
                                          progressViewOffset={Platform.OS === 'android' ? 60 : 0}
                                    />
                              ) : undefined
                        }
                  />

                  {isLoading && active.length > 0 ? (
                        <View style={styles.floatingSpinner} pointerEvents="none">
                              <ActivityIndicator color={Colors.primary} />
                        </View>
                  ) : null}

                  <SortSheet visible={sortOpen} value={sort} onSelect={setSort} onClose={() => setSortOpen(false)} />
            </View>
      );
}

const styles = StyleSheet.create({
      root: { flex: 1, backgroundColor: Colors.background },
      flex: { flex: 1 },
      flex2: { flex: 2 },
      listContent: { paddingBottom: Spacing.section + Spacing.xxl },
      columnWrapper: { paddingHorizontal: Spacing.lg, gap: GAP },
      itemSingle: { marginHorizontal: Spacing.lg, marginBottom: GAP },
      floatingSpinner: {
            position: 'absolute',
            top: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.sm,
            alignSelf: 'center',
      },

      /* hero */
      hero: {
            alignItems: 'center',
            paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.xl,
            paddingHorizontal: Spacing.xxl,
            paddingBottom: Spacing.section + Spacing.section,
      },
      badge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderRadius: BorderRadius.full,
            borderWidth: 1,
            borderColor: Colors.goldDark,
            backgroundColor: 'rgba(212,175,55,0.12)',
            maxWidth: '100%',
      },
      badgeText: {
            flexShrink: 1,
            fontSize: Fonts.sizes.xs + 1,
            fontWeight: '800',
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: Colors.goldLight,
            textAlign: 'center',
      },
      heroTitle: {
            marginTop: Spacing.xl,
            fontSize: 36,
            lineHeight: 42,
            fontWeight: '800',
            color: Colors.textLight,
            textAlign: 'center',
      },
      heroTitleAccent: { color: Colors.goldLight },
      heroSub: {
            marginTop: Spacing.md,
            maxWidth: 560,
            fontSize: Fonts.sizes.md + 1,
            lineHeight: 22,
            color: Colors.goldLight,
            opacity: 0.9,
            textAlign: 'center',
      },

      /* search card */
      searchCard: {
            marginTop: -(Spacing.section + Spacing.xl),
            marginHorizontal: Spacing.lg,
            padding: Spacing.lg,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.cardBg,
            ...Shadow.lg,
      },
      searchRowWide: { flexDirection: 'row', gap: Spacing.md },
      inlineRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
      inputBox: {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
      },
      input: {
            flex: 1,
            paddingVertical: Platform.OS === 'ios' ? Spacing.md + 2 : Spacing.sm,
            fontSize: Fonts.sizes.md + 1,
            fontWeight: '600',
            color: Colors.textPrimary,
      },
      sortBtn: {
            minHeight: 52,
            maxWidth: 170,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: Spacing.md,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
      },
      sortText: { flexShrink: 1, fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textPrimary },

      chipRow: { gap: Spacing.sm, paddingTop: Spacing.lg, paddingRight: Spacing.lg },
      chip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 1,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary, ...Shadow.sm, shadowColor: Colors.primary },
      chipEmoji: { fontSize: Fonts.sizes.md },
      chipText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
      chipTextActive: { color: Colors.textLight, fontWeight: '800' },

      /* section heading */
      sectionHead: {
            marginTop: Spacing.xxxl,
            marginBottom: Spacing.xl,
            marginHorizontal: Spacing.lg,
            gap: Spacing.lg,
      },
      sectionHeadWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      sectionTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
      sectionTitle: { flexShrink: 1, fontSize: Fonts.sizes.xxl, lineHeight: 28, fontWeight: '800', color: Colors.textPrimary },
      countPill: {
            paddingHorizontal: Spacing.md,
            paddingVertical: 3,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.goldLight,
      },
      countText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.goldDark },
      sectionSub: { marginTop: Spacing.sm, fontSize: Fonts.sizes.md, lineHeight: 20, color: Colors.textSecondary },
      joinBtn: {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.goldLight,
            backgroundColor: Colors.saffronBg,
      },
      joinText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.primaryDark },

      /* card */
      cardOuter: { flexGrow: 1 },
      card: {
            flexGrow: 1,
            borderRadius: BorderRadius.xl,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.cardBg,
            ...Shadow.md,
      },
      cardTop: { padding: Spacing.lg, paddingBottom: Spacing.lg + 2 },
      cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      statusPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
            borderRadius: BorderRadius.full,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.22)',
            backgroundColor: 'rgba(0,0,0,0.28)',
      },
      statusDot: { width: 9, height: 9, borderRadius: 5 },
      statusText: { fontSize: Fonts.sizes.xs + 1, fontWeight: '800', letterSpacing: 0.8, color: Colors.textLight },
      certified: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.tulsi,
      },
      certifiedText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.textLight },
      cardCenter: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.lg },
      orbWrap: { height: 64, alignItems: 'center', justifyContent: 'center' },
      orb: { fontSize: 52 },
      portrait: {
            width: 76,
            height: 76,
            borderRadius: 38,
            borderWidth: 2.5,
            borderColor: Colors.gold,
            backgroundColor: Colors.darkBg,
      },
      cardSpecialty: {
            marginTop: Spacing.sm,
            fontSize: Fonts.sizes.md,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: Colors.textMuted,
      },
      cardNameRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md },
      cardName: { fontSize: Fonts.sizes.xl + 2, fontWeight: '800', color: Colors.textLight },
      cardTagline: { marginTop: 2, fontSize: Fonts.sizes.sm + 1, fontWeight: '600', color: Colors.goldLight },
      rating: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.gold,
      },
      ratingText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.darkBg },

      cardBody: { padding: Spacing.lg, gap: Spacing.md },
      metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
      locationWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
      locationText: { flexShrink: 1, fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.textSecondary },
      expChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
            borderRadius: BorderRadius.md,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.goldLight,
      },
      expText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.goldDark },
      tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
      tag: {
            maxWidth: '100%',
            paddingHorizontal: Spacing.md,
            paddingVertical: 4,
            borderRadius: BorderRadius.sm,
            backgroundColor: '#E8F0FE',
            borderWidth: 1,
            borderColor: '#C7D8F8',
      },
      tagMore: { backgroundColor: Colors.cardBg, borderColor: Colors.border },
      tagText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.info },
      languages: { fontSize: Fonts.sizes.sm + 1, lineHeight: 18, color: Colors.textSecondary },
      languagesKey: { fontWeight: '800', color: Colors.textPrimary },
      divider: { height: 1, backgroundColor: Colors.saffronBg },
      feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
      feeLabel: { fontSize: Fonts.sizes.xs + 1, fontWeight: '800', letterSpacing: 0.8, color: Colors.textMuted },
      feeValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
      feeValue: { fontSize: Fonts.sizes.xxl + 2, fontWeight: '800', color: Colors.primaryDark },
      feeUnit: { fontSize: Fonts.sizes.sm + 1, color: Colors.textMuted },
      adviceWrap: { borderRadius: BorderRadius.lg, ...Shadow.sm, shadowColor: Colors.gold },
      advice: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.md + 1,
            borderRadius: BorderRadius.lg,
      },
      adviceText: { fontSize: Fonts.sizes.md + 1, fontWeight: '800', color: Colors.textPrimary },

      /* skeleton / empty */
      skeletonWrap: { paddingHorizontal: Spacing.lg, gap: GAP },
      skel: { borderRadius: BorderRadius.sm, backgroundColor: Colors.border },
      emptyWrap: { alignItems: 'center', paddingHorizontal: Spacing.xxxl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, gap: Spacing.sm },
      emptyEmoji: { fontSize: 52 },
      emptyTitle: { marginTop: Spacing.sm, fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
      emptySub: { fontSize: Fonts.sizes.md, lineHeight: 20, color: Colors.textMuted, textAlign: 'center' },
      primaryBtn: {
            marginTop: Spacing.md,
            paddingHorizontal: Spacing.xxl,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.primary,
            ...Shadow.sm,
      },
      primaryBtnText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textLight },

      /* sort sheet */
      sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,10,0,0.5)' },
      sheet: {
            padding: Spacing.xxl,
            paddingTop: Spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xxl,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            backgroundColor: Colors.cardBg,
            ...Shadow.lg,
      },
      grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: Colors.border, marginBottom: Spacing.lg },
      sheetTitle: { marginBottom: Spacing.md, fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },
      sheetRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: Spacing.md + 2,
            paddingHorizontal: Spacing.lg,
            borderRadius: BorderRadius.md,
      },
      sheetRowActive: { backgroundColor: Colors.saffronBg },
      sheetRowText: { fontSize: Fonts.sizes.lg, fontWeight: '600', color: Colors.textSecondary },
      sheetRowTextActive: { fontWeight: '800', color: Colors.textPrimary },
});