import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Switch,
    Animated,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useI18n } from '../i18n';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../theme';
import { GradientHeader, Badge, OmSymbol, PrimaryButton } from '../components';
import { DOHAS, RAM_NAAM_LEADERBOARD } from '../data/staticData';
import { authAPI } from '../service/apis/authServices';
import { useAuthStore } from '../store/useAuthore';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/AppNavigator';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import { DrawerScreenProps } from '@react-navigation/drawer';

// ── API Type ──────────────────────────────────────────────────────────────────
interface IDailyCount {
    _id: string;
    date: string;
    count: number;
}

interface IUser {
    _id: string;
    username: string;
    name: string;
    city: string;
    contact: string;
    rank: number;
    currCount: number; // today's naam count
    totalCount: number; // all-time naam count
    mala: number; // totalCount / 108
    role: string;
    dailyCounts: IDailyCount[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Level thresholds based on totalCount */
const getLevel = (
    count: number,
): { label: string; labelHi: string; color: string; next: number } => {
    if (count >= 10000)
        return { label: 'Ram Bhakt', labelHi: 'राम भक्त', color: Colors.goldDark, next: 10000 };
    if (count >= 5000)
        return { label: 'MahaBhakt', labelHi: 'महाभक्त', color: Colors.primary, next: 10000 };
    if (count >= 1000)
        return { label: 'Sadhu', labelHi: 'साधु', color: Colors.secondary, next: 5000 };
    return { label: 'Bhakt', labelHi: 'भक्त', color: Colors.tulsi, next: 1000 };
};

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Get joined year from _id's embedded timestamp (MongoDB ObjectId) */
const getJoinedYear = (id: string): string => {
    try {
        const ts = parseInt(id.substring(0, 8), 16) * 1000;
        return new Date(ts).getFullYear().toString();
    } catch {
        return '2024';
    }
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ── Daily streak bar ──────────────────────────────────────────────────────────
const DailyActivity = ({ dailyCounts }: { dailyCounts: IDailyCount[] }) => {
    // Show last 7 days
    const last7 = [...dailyCounts].reverse().slice(0, 7).reverse();
    const maxCount = Math.max(...last7.map(d => d.count), 1);

    return (
        <View style={actStyles.wrap}>
            <Text style={actStyles.title}>Last 7 Days Activity</Text>
            <View style={actStyles.bars}>
                {last7.map((d, i) => (
                    <View key={d._id} style={actStyles.barWrap}>
                        <Text style={actStyles.barVal}>{d.count > 0 ? d.count : ''}</Text>
                        <LinearGradient
                            colors={
                                d.count > 0
                                    ? ([Colors.primary, Colors.primaryLight] as string[])
                                    : ([Colors.border, Colors.border] as string[])
                            }
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                            style={[
                                actStyles.bar,
                                { height: Math.max(6, (d.count / maxCount) * 56) },
                            ]}
                        />
                        <Text style={actStyles.barDate}>
                            {new Date(d.date)
                                .toLocaleDateString('en-IN', { weekday: 'short' })
                                .slice(0, 2)}
                        </Text>
                    </View>
                ))}
                {/* Pad if < 7 entries */}
                {Array.from({ length: Math.max(0, 7 - last7.length) }).map((_, i) => (
                    <View key={`pad-${i}`} style={actStyles.barWrap}>
                        <Text style={actStyles.barVal} />
                        <View
                            style={[actStyles.bar, { height: 6, backgroundColor: Colors.border }]}
                        />
                        <Text style={actStyles.barDate}>–</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const actStyles = StyleSheet.create({
    wrap: {
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    title: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
        color: Colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: Spacing.md,
    },
    bars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: Spacing.sm },
    barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
    barVal: { fontSize: 9, color: Colors.textMuted, minHeight: 12 },
    bar: { width: '100%', borderRadius: 4 },
    barDate: { fontSize: 9, color: Colors.textMuted },
});

type profileProps = DrawerScreenProps<DrawerParamList, 'Profile'>;

// ── Main Component ────────────────────────────────────────────────────────────
const ProfileScreen = ({ navigation }: profileProps) => {
    const { t, isHindi, language, setLanguage } = useI18n();
    const { logOut } = useAuthStore();
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMe();
    }, []);

    const fetchMe = async () => {
        try {
            const response = await authAPI.me();
            if (response.data?.success) {
                setUser(response.data.user as IUser);
            }
        } catch (error: any) {
            console.error('ERROR WHILE FETCHING USER:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const totalCount = user?.totalCount ?? 0;
    const currCount = user?.currCount ?? 0;
    const mala = user?.mala ?? 0;
    const rank = user?.rank ?? 0;
    const level = getLevel(totalCount);
    const progressPct = Math.min(100, Math.floor((totalCount / level.next) * 100));
    const remaining = Math.max(0, level.next - totalCount);
    const joinedYear = user ? getJoinedYear(user._id) : '—';
    const firstName = user?.name?.split(' ')[0] ?? '';

    const menuItems = [
        {
            icon: 'clipboard-outline',
            label: t.myBookings ?? 'My Bookings',
            onPress: () => Alert.alert('📋', 'My Bookings'),
        },
        {
            icon: 'heart-outline',
            label: t.myDonations ?? 'My Donations',
            onPress: () => Alert.alert('💛', 'My Donations'),
        },
        { icon: 'call-outline', label: `📞 ${user?.contact ?? '—'}`, onPress: () => {} },
        {
            icon: 'notifications-outline',
            label: t.notifications ?? 'Notifications',
            onPress: () =>
                navigation
                    .getParent<NativeStackNavigationProp<RootParamList>>()
                    ?.navigate('notifications'),
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            isHindi ? 'लॉगआउट' : 'Sign Out',
            isHindi ? 'क्या आप लॉगआउट करना चाहते हैं?' : 'Are you sure you want to sign out?',
            [
                { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
                {
                    text: isHindi ? 'हाँ' : 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                        logOut();
                        navigation.getParent<NativeStackNavigationProp<RootParamList>>().reset({
                            index: 0,
                            routes: [{ name: 'login' }],
                        });
                    },
                },
            ],
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

            {/* ── Hero Header ── */}
            <LinearGradient
                colors={[Colors.secondary, Colors.primary] as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                {/* Ornament */}
                <Text style={styles.omBg}>ॐ</Text>

                {loading ? (
                    <View style={{ alignItems: 'center', gap: Spacing.md }}>
                        <SkeletonBox style={{ width: 90, height: 90, borderRadius: 45 }} />
                        <SkeletonBox style={{ height: 20, width: 160, borderRadius: 10 }} />
                        <SkeletonBox style={{ height: 13, width: 100, borderRadius: 6 }} />
                    </View>
                ) : (
                    <> 
                        <TouchableOpacity
                            onPress={() => navigation.toggleDrawer()}
                            style={styles.iconBtn}
                        >
                            <Ionicons name="menu" size={22} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                        {/* Avatar circle */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarInitial}>
                                    {user?.name?.charAt(0)?.toUpperCase() ?? '🙏'}
                                </Text>
                            </View>
                            {/* Level badge */}
                            <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
                                <Text style={styles.levelBadgeText}>
                                    {isHindi ? level.labelHi : level.label}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.userName}>{user?.name ?? '—'}</Text>
                        <Text style={styles.userUsername}>@{user?.username ?? '—'}</Text>
                        <Text style={styles.userCity}>📍 {user?.city ?? '—'}</Text>
                        <Text style={styles.joinDate}>
                            {t.joinedSince ?? 'Since'} {joinedYear}
                        </Text>

                        {/* Rank pill */}
                        <View style={styles.rankPill}>
                            <Ionicons name="trophy-outline" size={13} color={Colors.gold} />
                            <Text style={styles.rankText}>Global Rank #{rank}</Text>
                        </View>
                    </>
                )}
            </LinearGradient>

            {/* ── Stats Card ── */}
            <View style={styles.statsCard}>
                {loading ? (
                    <View style={{ flexDirection: 'row', gap: Spacing.md, flex: 1 }}>
                        {[1, 2, 3, 4].map(i => (
                            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                                <SkeletonBox
                                    style={{ height: 24, width: '80%', borderRadius: 6 }}
                                />
                                <SkeletonBox
                                    style={{ height: 11, width: '60%', borderRadius: 4 }}
                                />
                            </View>
                        ))}
                    </View>
                ) : (
                    <>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{currCount.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Today</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{totalCount.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total Naam</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{mala.toFixed(2)}</Text>
                            <Text style={styles.statLabel}>Mala</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: Colors.gold }]}>#{rank}</Text>
                            <Text style={styles.statLabel}>Rank</Text>
                        </View>
                    </>
                )}
            </View>

            {/* ── Progress Card ── */}
            <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>
                        {t.level ?? 'Level'}: {isHindi ? level.labelHi : level.label}
                    </Text>
                    <Text style={styles.progressPercent}>{progressPct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.gold] as string[]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${progressPct}%` as any }]}
                    />
                </View>
                {remaining > 0 ? (
                    <Text style={styles.progressHint}>
                        {isHindi
                            ? `${remaining.toLocaleString()} राम नाम और → ${
                                  level.next >= 10000
                                      ? 'राम भक्त'
                                      : level.next >= 5000
                                      ? 'महाभक्त'
                                      : 'साधु'
                              } बनें`
                            : `${remaining.toLocaleString()} more Ram Naam → Become ${
                                  level.next >= 10000
                                      ? 'Ram Bhakt'
                                      : level.next >= 5000
                                      ? 'MahaBhakt'
                                      : 'Sadhu'
                              }`}
                    </Text>
                ) : (
                    <Text style={[styles.progressHint, { color: Colors.success }]}>
                        🎉{' '}
                        {isHindi ? 'आप उच्चतम स्तर पर हैं!' : 'You have reached the highest level!'}
                    </Text>
                )}
            </View>

            {/* ── Daily Activity ── */}
            {!loading && (user?.dailyCounts?.length ?? 0) > 0 && (
                <DailyActivity dailyCounts={user!.dailyCounts} />
            )}

            {/* ── Language Toggle ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.language ?? 'Language'}</Text>
                <View style={styles.langToggle}>
                    {[
                        { key: 'hi', label: 'हिन्दी' },
                        { key: 'en', label: 'English' },
                    ].map(l => (
                        <TouchableOpacity
                            key={l.key}
                            style={[styles.langBtn, language === l.key && styles.langBtnActive]}
                            onPress={() => setLanguage(l.key as 'hi' | 'en')}
                        >
                            {language === l.key ? (
                                <LinearGradient
                                    colors={Colors.gradientRam as string[]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.langBtnGradient}
                                >
                                    <Text style={styles.langBtnTextActive}>{l.label}</Text>
                                </LinearGradient>
                            ) : (
                                <Text style={styles.langBtnText}>{l.label}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ── Notifications Toggle ── */}
            <View style={styles.settingRow}>
                <View style={styles.settingIconWrap}>
                    <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.settingLabel}>{t.notifications ?? 'Notifications'}</Text>
                <Switch
                    value={notificationsOn}
                    onValueChange={setNotificationsOn}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={notificationsOn ? Colors.primary : '#FFF'}
                />
            </View>

            {/* ── Menu Items ── */}
            <View style={styles.menuCard}>
                {menuItems.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuIconWrap}>
                            <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Leaderboard ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {isHindi ? 'राम नाम लीडरबोर्ड' : 'Ram Naam Leaderboard'}
                </Text>
                {/* My rank highlight */}
                {user && (
                    <View style={styles.myRankRow}>
                        <Ionicons name="person-circle-outline" size={16} color={Colors.primary} />
                        <Text style={styles.myRankText}>
                            Your rank:{' '}
                            <Text style={{ color: Colors.primary, fontWeight: '800' }}>
                                #{rank}
                            </Text>{' '}
                            · Total Naam:{' '}
                            <Text style={{ color: Colors.primary, fontWeight: '800' }}>
                                {totalCount.toLocaleString()}
                            </Text>
                        </Text>
                    </View>
                )}
                <View style={styles.leaderCard}>
                    {RAM_NAAM_LEADERBOARD.map((item, idx) => (
                        <View
                            key={item.rank}
                            style={[
                                styles.leaderRow,
                                // Highlight row if it matches user rank
                                user?.rank === item.rank && styles.leaderRowHighlight,
                            ]}
                        >
                            <Text style={[styles.leaderRank, idx < 3 && styles.leaderRankTop]}>
                                {idx === 0
                                    ? '🥇'
                                    : idx === 1
                                    ? '�'
                                    : idx === 2
                                    ? '🥉'
                                    : `#${item.rank}`}
                            </Text>
                            <Text style={styles.leaderName}>
                                {isHindi ? item.nameHi : item.name}
                            </Text>
                            <Text style={styles.leaderCity}>
                                {isHindi ? item.cityHi : item.city}
                            </Text>
                            <Text style={styles.leaderCount}>{item.count.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* ── Donate Section ── */}
            <LinearGradient
                colors={[Colors.darkBg, '#3D1A00'] as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.donateSection}
            >
                <OmSymbol size={28} color={Colors.goldLight} />
                <Text style={styles.donateTitle}>{t.donateTitle ?? 'Donate'}</Text>
                <Text style={styles.donateDesc}>
                    {t.donateDesc ?? 'Support the cause of Dharma'}
                </Text>
                <View style={styles.donateAmounts}>
                    {[51, 101, 251, 501, 1001].map(amt => (
                        <TouchableOpacity
                            key={amt}
                            style={styles.donateAmtBtn}
                            onPress={() =>
                                Alert.alert(
                                    '🙏',
                                    isHindi
                                        ? `₹${amt} दान के लिए धन्यवाद!`
                                        : `Thank you for ₹${amt} donation!`,
                                )
                            }
                        >
                            <Text style={styles.donateAmtText}>₹{amt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            {/* ── Logout ── */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                <Text style={styles.logoutText}>{t.logout ?? 'Sign Out'}</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>🙏 जय श्री राम · Aaradhana v1.0.0</Text>

            <View style={{ height: 90 }} />
        </ScrollView>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        paddingTop: 56,
        paddingBottom: Spacing.xxxl,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0, // ← prevents icon from being squeezed by long mantra text
    },
    omBg: {
        position: 'absolute',
        bottom: -10,
        left: 10,
        fontSize: 80,
        color: 'rgba(255,255,255,0.05)',
        fontWeight: '900',
    },
    avatarContainer: { alignItems: 'center', marginBottom: Spacing.md },
    avatarCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.goldLight,
        marginBottom: 8,
    },
    avatarInitial: {
        fontSize: 42,
        fontWeight: '900',
        color: Colors.textLight,
    },
    levelBadge: {
        borderRadius: 14,
        paddingHorizontal: Spacing.md,
        paddingVertical: 3,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    levelBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.textLight,
        letterSpacing: 0.5,
    },
    userName: { color: Colors.textLight, fontSize: Fonts.sizes.xxl, fontWeight: '900' },
    userUsername: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: Fonts.sizes.xs,
        marginTop: 2,
        letterSpacing: 0.5,
    },
    userCity: { color: 'rgba(255,255,255,0.8)', fontSize: Fonts.sizes.sm, marginTop: 4 },
    joinDate: { color: Colors.goldLight, fontSize: Fonts.sizes.xs, marginTop: 2 },
    rankPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        marginTop: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    rankText: { fontSize: Fonts.sizes.xs, color: Colors.goldLight, fontWeight: '700' },

    // Stats card
    statsCard: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginTop: -Spacing.xl,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.lg,
    },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statValue: { fontSize: Fonts.sizes.xl, fontWeight: '900', color: Colors.primary },
    statLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', fontWeight: '600' },
    statDivider: { width: 1, backgroundColor: Colors.border },

    // Progress card
    progressCard: {
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    progressTitle: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textPrimary },
    progressPercent: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.primary },
    progressTrack: {
        height: 10,
        backgroundColor: Colors.saffronBg,
        borderRadius: 5,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    progressFill: { height: 10, borderRadius: 5 },
    progressHint: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },

    // Section
    section: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl },
    sectionTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },

    // Language toggle
    langToggle: {
        flexDirection: 'row',
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    langBtn: { flex: 1, borderRadius: BorderRadius.sm, overflow: 'hidden' },
    langBtnActive: {},
    langBtnGradient: { paddingVertical: Spacing.sm, alignItems: 'center' },
    langBtnText: {
        fontSize: Fonts.sizes.md,
        fontWeight: '700',
        color: Colors.textMuted,
        textAlign: 'center',
        paddingVertical: Spacing.sm,
    },
    langBtnTextActive: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textLight },

    // Notification row
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    settingIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: Colors.saffronBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    settingLabel: {
        flex: 1,
        fontSize: Fonts.sizes.md,
        fontWeight: '600',
        color: Colors.textPrimary,
    },

    // Menu card
    menuCard: {
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.saffronBg },
    menuIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: Colors.saffronBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    menuLabel: { flex: 1, fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.textPrimary },

    // Leaderboard
    myRankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    myRankText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, flex: 1 },
    leaderCard: {
        backgroundColor: Colors.cardBg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.sm,
    },
    leaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    leaderRowHighlight: { backgroundColor: Colors.saffronBg },
    leaderRank: { width: 36, fontSize: Fonts.sizes.md, color: Colors.textMuted, fontWeight: '700' },
    leaderRankTop: { color: Colors.gold },
    leaderName: { flex: 1, fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textPrimary },
    leaderCity: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginRight: Spacing.sm },
    leaderCount: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.primary },

    // Donate section
    donateSection: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.goldDark,
        ...Shadow.md,
    },
    donateTitle: {
        color: Colors.goldLight,
        fontSize: Fonts.sizes.xl,
        fontWeight: '900',
        marginTop: Spacing.sm,
    },
    donateDesc: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: Fonts.sizes.sm,
        textAlign: 'center',
        marginVertical: Spacing.md,
    },
    donateAmounts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    donateAmtBtn: {
        backgroundColor: Colors.goldDark,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
    },
    donateAmtText: { color: Colors.textLight, fontSize: Fonts.sizes.md, fontWeight: '800' },

    // Logout
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.cardBg,
    },
    logoutText: {
        fontSize: Fonts.sizes.md,
        fontWeight: '700',
        color: Colors.error,
        letterSpacing: 0.5,
    },

    versionText: {
        textAlign: 'center',
        marginTop: Spacing.lg,
        fontSize: 10,
        color: Colors.textMuted,
        letterSpacing: 0.5,
    },
});

export default ProfileScreen;
