import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Animated,
    Image,
    ActivityIndicator,
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
import { DOHAS, RAM_NAAM_LEADERBOARD } from '../../data/staticData';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { RootTabParamList } from '../../navigation/TabNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../../navigation/AppNavigator';
import { authAPI } from '../../service/apis/authServices';
import { kathaVachakAPI } from '../../service/apis/kathaVachakServices';
import { mandirAPI } from '../../service/apis/mandirServices';

// ── Types ─────────────────────────────────────────────────────────────────────
type HomeProps = NativeBottomTabScreenProps<RootTabParamList, 'Home'>;

// ── API Response Types ────────────────────────────────────────────────────────
interface IUser {
    _id: string;
    username: string;
    name: string;
    city: string;
    contact: string;
    rank: number;
    currCount: number;
    totalCount: number;
    mala: number;
    role: string;
    dailyCounts: { date: string; count: number; _id: string }[];
}

interface IMandir {
    _id: string;
    name: string;
    description: string;
    history: string;
    photos: string[];
    averageRating: number;
    createdAt: string;
    festivals: any[];
    location: {
        address: string;
        city: string;
        state: string;
    };
    timing: {
        opening: string;
        closing: string;
        aarti: string[];
    };
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    deity: {
        main: string;
        others: string[];
    };
    facilities: {
        parking: boolean;
        prasad: boolean;
        accommodation: boolean;
        wheelchairAccessible: boolean;
        restrooms: boolean;
        drinkingWater: boolean;
    };
    visitInfo: {
        bestTimeToVisit: string;
        dressCode: string;
        entryFee: string;
        photographyAllowed: boolean;
    };
    socialMedia: {
        facebook: string;
        instagram: string;
        youtube: string;
        twitter: string;
    };
    nearbyAttractions: any[];
}

interface ILiveKatha {
    _id: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    startDate: string;
    endDate: string | null;
    liveLink: string;
    kathaType: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface IKathaVachak {
    _id: string;
    id: string;
    name: string;
    photo: string;
    experience: number;
    specialization: string;
    description: string;
    isLive: boolean;
    averageRating: number;
    reviews: any[];
    liveKathas: ILiveKatha[];
    contact: {
        phone: string;
        email: string;
        whatsapp: string;
    };
    socialMedia: {
        facebook: string;
        instagram: string;
        youtube: string;
        twitter: string;
    };
    photos: string[];
    createdAt: string;
    updatedAt: string;
}

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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert "HH:MM" 24h string to "H:MM AM/PM" */
const formatTime = (t: string): string => {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr ?? '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m} ${ampm}`;
};

/** Check if mandir is currently open based on opening/closing times */
const isMandirOpen = (opening: string, closing: string): boolean => {
    if (!opening || !closing) return false;
    const now = new Date();
    const [oh, om] = opening.split(':').map(Number);
    const [ch, cm] = closing.split(':').map(Number);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const openMins = oh * 60 + om;
    const closeMins = ch * 60 + cm;
    return nowMins >= openMins && nowMins <= closeMins;
};

/** Format ISO date to readable string */
const formatDate = (iso: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SkeletonBox = ({ style }: { style?: any }) => {
    const anim = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ]),
        ).start();
    }, []);
    return (
        <Animated.View
            style={[{ backgroundColor: Colors.border, borderRadius: 8, opacity: anim }, style]}
        />
    );
};

// ── Component ─────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }: HomeProps) => {
    const { t, isHindi } = useI18n();
    const [selectedDeity, setSelectedDeity] = useState<IDeity>(DEITIES[0]);
    const currentDoha = DOHAS[0];

    // API state
    const [user, setUser] = useState<IUser | null>(null);
    const [kathaVachaks, setKathaVachaks] = useState<IKathaVachak[]>([]);
    const [mandirs, setMandirs] = useState<IMandir[]>([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingKatha, setLoadingKatha] = useState(true);
    const [loadingMandir, setLoadingMandir] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t.morning;
        if (hour < 17) return t.afternoon;
        return t.evening;
    };

    useEffect(() => {
        fetchMe();
        fetchKathaVachak();
        fetchMandir();
    }, []);

    const fetchMe = async () => {
        try {
            const response = await authAPI.me();
            if (response.data?.success) {
                setUser(response.data.user as IUser);
            }
        } catch (error: any) {
            console.error('FETCH USER ERROR:', error);
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchKathaVachak = async () => {
        try {
            const response = await kathaVachakAPI.getAll();
            if (response.data?.success) {
                setKathaVachaks(response.data.kathaVachaks as IKathaVachak[]);
            }
        } catch (error: any) {
            console.error('FETCH KATHA VACHAK ERROR:', error);
        } finally {
            setLoadingKatha(false);
        }
    };

    const fetchMandir = async () => {
        try {
            const response = await mandirAPI.getAll();
            if (response.data?.success) {
                setMandirs(response.data.mandirs as IMandir[]);
            }
        } catch (error: any) {
            console.error('FETCH MANDIR ERROR:', error);
        } finally {
            setLoadingMandir(false);
        }
    };

    const quickLinks = [
        {
            icon: 'person',
            label: t.bookPandit,
            screen: 'Pandits' as keyof RootTabParamList,
            bg: '#FFF3E0',
        },
        {
            icon: 'cart',
            label: t.orderSamagri,
            screen: 'Community' as keyof RootTabParamList,
            bg: '#E8F5E9',
        },
        {
            icon: 'play-circle',
            label: t.liveDarshan,
            screen: 'Mandirs' as keyof RootTabParamList,
            bg: '#E3F2FD',
        },
    ];

    // ── Derived user stats ────────────────────────────────────────────────────
    const todayCount = user?.currCount ?? 0;
    const totalCount = user?.totalCount ?? 0;
    const malaCount = user?.mala ?? 0;
    const userRank = user?.rank ?? 0;
    const firstName = user?.name?.split(' ')[0] ?? '';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[0]}
        >
            <StatusBar barStyle="light-content" backgroundColor={selectedDeity.color} />

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <LinearGradient
                colors={selectedDeity.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greetingText}>
                            {getGreeting()}
                            {firstName ? `, ${firstName}` : ''} 🙏
                        </Text>
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

                {/* User stats strip */}
                {!loadingUser && user && (
                    <View style={styles.statsStrip}>
                        <View style={styles.statStripItem}>
                            <Text style={styles.statStripVal}>{todayCount.toLocaleString()}</Text>
                            <Text style={styles.statStripLabel}>Today</Text>
                        </View>
                        <View style={styles.statStripDivider} />
                        <View style={styles.statStripItem}>
                            <Text style={styles.statStripVal}>{totalCount.toLocaleString()}</Text>
                            <Text style={styles.statStripLabel}>Total Naam</Text>
                        </View>
                        <View style={styles.statStripDivider} />
                        <View style={styles.statStripItem}>
                            <Text style={styles.statStripVal}>{malaCount.toFixed(2)}</Text>
                            <Text style={styles.statStripLabel}>Mala</Text>
                        </View>
                        <View style={styles.statStripDivider} />
                        <View style={styles.statStripItem}>
                            <Text style={styles.statStripVal}>#{userRank}</Text>
                            <Text style={styles.statStripLabel}>Rank</Text>
                        </View>
                    </View>
                )}
                {loadingUser && (
                    <SkeletonBox
                        style={{ height: 52, marginTop: Spacing.sm, borderRadius: BorderRadius.md }}
                    />
                )}

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

            {/* ── Deity Selector ──────────────────────────────────────────────── */}
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

            {/* ── Doha of the Day ─────────────────────────────────────────────── */}
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

            {/* ── Quick Links ─────────────────────────────────────────────────── */}
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

            {/* ── Nam Lekhan ──────────────────────────────────────────────────── */}
            <SectionHeader title={t.ramNaamBank} />
            <View style={styles.namLekhanCard}>
                <TouchableOpacity
                    style={[styles.namLekhanFullBtn, { backgroundColor: selectedDeity.color }]}
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
                            <Text style={[styles.leaderCount, { color: selectedDeity.color }]}>
                                {item.count.toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* ── Live Katha Vachaks ──────────────────────────────────────────── */}
            <SectionHeader
                title={t.todayKatha}
                onSeeAll={() => navigation.navigate('Katha')}
                seeAllLabel={t.seeAll}
            />

            {loadingKatha ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {[1, 2].map(i => (
                        <View key={i} style={styles.kathaCard}>
                            <SkeletonBox style={{ height: 80, marginBottom: Spacing.sm }} />
                            <SkeletonBox style={{ height: 14, marginBottom: 6 }} />
                            <SkeletonBox style={{ height: 12, width: '60%' }} />
                        </View>
                    ))}
                </ScrollView>
            ) : kathaVachaks.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyIcon}>🎤</Text>
                    <Text style={styles.emptyText}>No Katha Vachaks available right now</Text>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {kathaVachaks.map(vachak => {
                        const activeKatha = vachak.liveKathas.find(k => k.isActive);
                        return (
                            <TouchableOpacity
                                key={vachak._id}
                                style={styles.kathaCard}
                                onPress={() => navigation.navigate('Katha')}
                                activeOpacity={0.85}
                            >
                                {/* Photo */}
                                <View style={styles.kathaPhotoWrap}>
                                    {vachak.photo ? (
                                        <Image
                                            source={{ uri: vachak.photo }}
                                            style={styles.kathaPhoto}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View
                                            style={[styles.kathaPhoto, styles.kathaPhotoFallback]}
                                        >
                                            <Text style={{ fontSize: 32 }}>🎤</Text>
                                        </View>
                                    )}
                                    {vachak.isLive && (
                                        <View style={styles.liveBadgeOverlay}>
                                            <LiveBadge />
                                        </View>
                                    )}
                                </View>

                                {/* Info */}
                                <Text style={styles.kathaTitle} numberOfLines={1}>
                                    {vachak.name}
                                </Text>
                                <Text style={styles.kathaSpecialization} numberOfLines={1}>
                                    📿 {vachak.specialization}
                                </Text>
                                <Text style={styles.kathaMeta}>
                                    ⏳ {vachak.experience} yrs experience
                                </Text>

                                {/* Active katha location */}
                                {activeKatha && (
                                    <>
                                        <Text style={styles.kathaMeta} numberOfLines={1}>
                                            📍 {activeKatha.city}, {activeKatha.state}
                                        </Text>
                                        <Text style={styles.kathaMeta}>
                                            📅 {formatDate(activeKatha.startDate)}
                                            {activeKatha.endDate
                                                ? ` – ${formatDate(activeKatha.endDate)}`
                                                : ' (Ongoing)'}
                                        </Text>
                                    </>
                                )}

                                {/* Rating */}
                                {vachak.averageRating > 0 && (
                                    <StarRating rating={vachak.averageRating} />
                                )}

                                <View style={styles.kathaFooter}>
                                    <Badge
                                        label={vachak.isLive ? 'LIVE' : 'Upcoming'}
                                        bgColor={vachak.isLive ? Colors.error : Colors.primary}
                                    />
                                    <PrimaryButton
                                        label={vachak.isLive ? t.watchNow : 'View'}
                                        onPress={() => navigation.navigate('Katha')}
                                        small
                                        style={{ marginLeft: Spacing.sm }}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {/* ── Nearby Mandirs ──────────────────────────────────────────────── */}
            <SectionHeader
                title={t.nearbyMandirs}
                onSeeAll={() => navigation.navigate('Mandirs')}
                seeAllLabel={t.seeAll}
            />

            {loadingMandir ? (
                [1, 2, 3].map(i => (
                    <View key={i} style={[styles.mandirListCard, { gap: Spacing.sm }]}>
                        <SkeletonBox style={{ width: 52, height: 52, borderRadius: 10 }} />
                        <View style={{ flex: 1, gap: 6 }}>
                            <SkeletonBox style={{ height: 14 }} />
                            <SkeletonBox style={{ height: 11, width: '60%' }} />
                        </View>
                    </View>
                ))
            ) : mandirs.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyIcon}>🛕</Text>
                    <Text style={styles.emptyText}>No mandirs found nearby</Text>
                </View>
            ) : (
                mandirs.slice(0, 3).map(mandir => {
                    const isOpen = isMandirOpen(mandir.timing?.opening, mandir.timing?.closing);
                    const coverPhoto = mandir.photos?.[0];
                    const nextAarti = mandir.timing?.aarti?.[0];

                    return (
                        <TouchableOpacity
                            key={mandir._id}
                            style={styles.mandirListCard}
                            onPress={() => navigation.navigate('Mandirs')}
                            activeOpacity={0.8}
                        >
                            {/* Cover photo or fallback */}
                            {coverPhoto ? (
                                <Image
                                    source={{ uri: coverPhoto }}
                                    style={styles.mandirThumb}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.mandirThumb, styles.mandirThumbFallback]}>
                                    <Text style={{ fontSize: 28 }}>🛕</Text>
                                </View>
                            )}

                            <View style={styles.mandirListInfo}>
                                <Text style={styles.mandirListName} numberOfLines={1}>
                                    {mandir.name}
                                </Text>
                                <Text style={styles.mandirListCity} numberOfLines={1}>
                                    📍 {mandir.location?.city}, {mandir.location?.state}
                                </Text>
                                <Text style={styles.mandirDeity} numberOfLines={1}>
                                    🙏 {mandir.deity?.main}
                                </Text>
                                {nextAarti && (
                                    <Text style={styles.mandirAarti}>🔔 Aarti: {nextAarti}</Text>
                                )}
                                {mandir.averageRating > 0 && (
                                    <StarRating rating={mandir.averageRating} />
                                )}
                            </View>

                            <View style={styles.mandirListRight}>
                                <Badge
                                    label={isOpen ? t.openNow : t.closed}
                                    bgColor={isOpen ? Colors.tulsi : Colors.error}
                                    small
                                />
                                {mandir.facilities?.parking && (
                                    <View style={styles.facilityChip}>
                                        <Ionicons
                                            name="car-outline"
                                            size={10}
                                            color={Colors.textMuted}
                                        />
                                        <Text style={styles.facilityText}>Parking</Text>
                                    </View>
                                )}
                                {mandir.visitInfo?.entryFee?.toLowerCase().includes('free') && (
                                    <View
                                        style={[
                                            styles.facilityChip,
                                            {
                                                backgroundColor: '#E8F5E9',
                                                borderColor: Colors.tulsiLight,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[styles.facilityText, { color: Colors.tulsi }]}
                                        >
                                            Free Entry
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })
            )}

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

    // User stats strip
    statsStrip: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    statStripItem: { flex: 1, alignItems: 'center' },
    statStripVal: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textLight },
    statStripLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 1,
        letterSpacing: 0.5,
    },
    statStripDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

    marqueeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    marqueeIcon: { fontSize: 13, marginRight: Spacing.xs },
    marqueeText: { color: Colors.goldLight, fontSize: Fonts.sizes.xs, fontWeight: '600', flex: 1 },

    // Deity selector
    deitySection: { paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
    deitySectionLabel: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    deityScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
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
    deityActiveBg: { position: 'absolute', inset: 0 },
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

    // Nam Lekhan
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

    // Katha cards (from API)
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
    kathaPhotoWrap: { position: 'relative', marginBottom: Spacing.sm },
    kathaPhoto: {
        width: '100%',
        height: 110,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.saffronBg,
    },
    kathaPhotoFallback: { alignItems: 'center', justifyContent: 'center' },
    liveBadgeOverlay: { position: 'absolute', top: 6, right: 6 },
    kathaTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 3,
    },
    kathaSpecialization: {
        fontSize: Fonts.sizes.sm,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: 3,
    },
    kathaMeta: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 2 },
    kathaFooter: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },

    // Mandir cards (from API)
    mandirListCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    mandirThumb: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.saffronBg,
        marginRight: Spacing.md,
    },
    mandirThumbFallback: { alignItems: 'center', justifyContent: 'center' },
    mandirListInfo: { flex: 1 },
    mandirListName: {
        fontSize: Fonts.sizes.md,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    mandirListCity: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 2 },
    mandirDeity: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 2,
    },
    mandirAarti: {
        fontSize: Fonts.sizes.xs,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: 3,
    },
    mandirListRight: { alignItems: 'flex-end', gap: 5, marginLeft: Spacing.sm },
    facilityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.saffronBg,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    facilityText: { fontSize: 9, color: Colors.textMuted, fontWeight: '600' },

    // Empty state
    emptyBox: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        marginHorizontal: Spacing.lg,
    },
    emptyIcon: { fontSize: 40, marginBottom: Spacing.sm },
    emptyText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, textAlign: 'center' },
});

export default HomeScreen;
