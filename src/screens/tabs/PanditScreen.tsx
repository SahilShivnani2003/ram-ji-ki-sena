import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Linking,
    Animated,
    TextInput,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useI18n } from '../../i18n';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme';
import { GradientHeader, Badge, StarRating, PrimaryButton, SectionHeader } from '../../components';
import { POOJA_TYPES } from '../../data/staticData';
import { panditAPI } from '../../service/apis/panditServices';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigator';

type panditProps = DrawerScreenProps<DrawerParamList, 'Pandit'>;
// ── API Types ─────────────────────────────────────────────────────────────────
interface IPandit {
    _id: string;
    username: string;
    name: string;
    photo: string;
    photos: string[];
    experience: number;
    specialization: string[];
    languages: string[];
    averageRating: number;
    totalBookings: number;
    completedBookings: number;
    isVerified: boolean;
    isActive: boolean;
    about?: string;
    description?: string;
    qualification?: string;
    services: any[];
    contact: {
        phone: string;
        email: string;
        whatsapp?: string;
    };
    location: {
        city: string;
        state: string;
        address?: string;
    };
    availability: {
        workingDays: string[];
    };
    createdAt: string;
    updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Thursday"

const isAvailableToday = (workingDays: string[]): boolean =>
    workingDays.map(d => d.toLowerCase()).includes(TODAY.toLowerCase());

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

// ── Pandit Card ───────────────────────────────────────────────────────────────
const PanditCard = ({
    pandit,
    t,
    isHindi,
    selectedPooja,
}: {
    pandit: IPandit;
    t: any;
    isHindi: boolean;
    selectedPooja: string | null;
}) => {
    const [expanded, setExpanded] = useState(false);
    const available = isAvailableToday(pandit.availability?.workingDays ?? []);

    const handleCall = () =>
        pandit.contact?.phone && Linking.openURL(`tel:${pandit.contact.phone}`).catch(() => {});

    const handleWhatsApp = () => {
        const num = pandit.contact?.whatsapp ?? pandit.contact?.phone;
        num && Linking.openURL(`https://wa.me/91${num}`).catch(() => {});
    };

    const handleBook = () =>
        Alert.alert(
            '🙏 ' + (isHindi ? 'बुकिंग की पुष्टि' : 'Booking Confirmed'),
            isHindi
                ? `${pandit.name} के साथ बुकिंग हो गई!`
                : `Booking request sent to ${pandit.name}!`,
        );

    return (
        <View style={styles.panditCard}>
            {/* ── Header ── */}
            <View style={styles.panditHeader}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    {pandit.photo ? (
                        <Image
                            source={{ uri: pandit.photo }}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarFallback]}>
                            <Text style={{ fontSize: 32 }}>🧑‍🦳</Text>
                        </View>
                    )}
                    {pandit.isVerified && (
                        <View style={styles.verifiedDot}>
                            <Ionicons name="checkmark" size={9} color="#FFF" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.panditInfo}>
                    <Text style={styles.panditName}>{pandit.name}</Text>
                    <Text style={styles.panditUsername}>@{pandit.username}</Text>
                    <Text style={styles.panditCity}>
                        📍 {pandit.location?.city}, {pandit.location?.state}
                    </Text>
                    {pandit.averageRating > 0 ? (
                        <StarRating rating={pandit.averageRating} />
                    ) : (
                        <Text style={styles.noRating}>No ratings yet</Text>
                    )}
                </View>

                {/* Right column */}
                <View style={styles.panditRight}>
                    <Badge
                        label={
                            available ? t.availableToday ?? 'Available' : t.closed ?? 'Off Today'
                        }
                        bgColor={available ? Colors.tulsi : Colors.textMuted}
                        small
                    />
                    <Text style={styles.panditExp}>
                        {pandit.experience} {t.years ?? 'yrs'}
                    </Text>
                    {pandit.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="shield-checkmark" size={11} color={Colors.primary} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ── Qualification ── */}
            {!!pandit.qualification && (
                <View style={styles.qualRow}>
                    <Ionicons name="school-outline" size={13} color={Colors.gold} />
                    <Text style={styles.qualText}>{pandit.qualification}</Text>
                </View>
            )}

            {/* ── Specializations ── */}
            {pandit.specialization?.length > 0 && (
                <View style={styles.specRow}>
                    {pandit.specialization.map((spec, i) => (
                        <Badge
                            key={i}
                            label={spec}
                            bgColor={Colors.saffronBg}
                            color={Colors.primaryDark}
                            small
                        />
                    ))}
                </View>
            )}

            {/* ── Languages ── */}
            {pandit.languages?.length > 0 && (
                <View style={styles.langRow}>
                    <Ionicons name="language-outline" size={13} color={Colors.textMuted} />
                    <Text style={styles.langLabel}>{isHindi ? 'भाषाएं:' : 'Languages:'}</Text>
                    <Text style={styles.langText}>{pandit.languages.join(' • ')}</Text>
                </View>
            )}

            {/* ── Stats row ── */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{pandit.totalBookings}</Text>
                    <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{pandit.completedBookings}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {pandit.availability?.workingDays?.length ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>Days/Week</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text
                        style={[
                            styles.statValue,
                            { color: pandit.isActive ? Colors.success : Colors.error },
                        ]}
                    >
                        {pandit.isActive ? 'Active' : 'Inactive'}
                    </Text>
                    <Text style={styles.statLabel}>Status</Text>
                </View>
            </View>

            {/* ── Expanded section ── */}
            {expanded && (
                <>
                    {/* About / Description */}
                    {!!(pandit.about || pandit.description) && (
                        <View style={styles.aboutBox}>
                            <Text style={styles.aboutTitle}>About</Text>
                            <Text style={styles.aboutText}>
                                {pandit.about || pandit.description}
                            </Text>
                        </View>
                    )}

                    {/* Working days */}
                    {pandit.availability?.workingDays?.length > 0 && (
                        <View style={styles.daysBox}>
                            <Text style={styles.daysTitle}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={12}
                                    color={Colors.textMuted}
                                />{' '}
                                Available Days
                            </Text>
                            <View style={styles.daysRow}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                                    const fullDay = [
                                        'Monday',
                                        'Tuesday',
                                        'Wednesday',
                                        'Thursday',
                                        'Friday',
                                        'Saturday',
                                        'Sunday',
                                    ][i];
                                    const active = pandit.availability.workingDays
                                        .map(wd => wd.toLowerCase())
                                        .includes(fullDay.toLowerCase());
                                    return (
                                        <View
                                            key={d}
                                            style={[styles.dayChip, active && styles.dayChipActive]}
                                        >
                                            <Text
                                                style={[
                                                    styles.dayText,
                                                    active && styles.dayTextActive,
                                                ]}
                                            >
                                                {d}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Gallery photo */}
                    {pandit.photos?.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.galleryScroll}
                        >
                            {pandit.photos.map((url, i) => (
                                <Image
                                    key={i}
                                    source={{ uri: url }}
                                    style={styles.galleryImg}
                                    resizeMode="cover"
                                />
                            ))}
                        </ScrollView>
                    )}

                    {/* Address */}
                    {!!pandit.location?.address && (
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                            <Text style={styles.addressText}>{pandit.location.address}</Text>
                        </View>
                    )}

                    {/* Contact row */}
                    <View style={styles.contactRow}>
                        {!!pandit.contact?.phone && (
                            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                                <Ionicons name="call-outline" size={14} color={Colors.primary} />
                                <Text style={styles.contactBtnText}>Call</Text>
                            </TouchableOpacity>
                        )}
                        {!!(pandit.contact?.whatsapp ?? pandit.contact?.phone) && (
                            <TouchableOpacity
                                style={[styles.contactBtn, styles.contactBtnWa]}
                                onPress={handleWhatsApp}
                            >
                                <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                                <Text style={[styles.contactBtnText, { color: '#25D366' }]}>
                                    WhatsApp
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </>
            )}

            {/* ── Footer ── */}
            <View style={styles.panditFooter}>
                <TouchableOpacity
                    style={styles.expandBtn}
                    onPress={() => setExpanded(e => !e)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={Colors.textMuted}
                    />
                    <Text style={styles.expandText}>{expanded ? 'Less' : 'More'}</Text>
                </TouchableOpacity>

                <PrimaryButton
                    label={t.bookNow ?? 'Book Now'}
                    onPress={handleBook}
                    style={styles.bookBtn}
                />
            </View>
        </View>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const PanditScreen  = ({navigation}: panditProps) => {
    const { t, isHindi } = useI18n();
    const [selectedPooja, setSelectedPooja] = useState<string | null>(null);
    const [pandits, setPandits] = useState<IPandit[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPandit();
    }, []);

    const fetchPandit = async () => {
        try {
            const response = await panditAPI.getAll();
            if (response.data?.success) {
                setPandits(response.data.pandits as IPandit[]);
            }
        } catch (error: any) {
            console.error('FETCH PANDIT LISTING ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = pandits.filter(p => {
        const matchSearch =
            !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
            p.specialization?.some(s => s.toLowerCase().includes(search.toLowerCase()));

        const matchPooja =
            !selectedPooja ||
            p.specialization?.some(s => s.toLowerCase().includes(selectedPooja.toLowerCase()));

        return matchSearch && matchPooja && p.isActive;
    });

    // ── Stats ─────────────────────────────────────────────────────────────────
    const availableCount = pandits.filter(p =>
        isAvailableToday(p.availability?.workingDays ?? []),
    ).length;
    const verifiedCount = pandits.filter(p => p.isVerified).length;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <GradientHeader
                title={t.panditsNearYou ?? 'Pandits Near You'}
                subtitle="🙏 Pandit Booking"
                navigation={navigation}
            />

            {/* Search bar */}
            <View style={styles.searchContainer}>
                <Ionicons
                    name="search-outline"
                    size={18}
                    color={Colors.textMuted}
                    style={{ marginRight: Spacing.sm }}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, city, specialization…"
                    placeholderTextColor={Colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ── Stats pills ── */}
                {!loading && (
                    <View style={styles.statsStrip}>
                        <View style={styles.stripStat}>
                            <Text style={styles.stripNum}>{pandits.length}</Text>
                            <Text style={styles.stripLabel}>Total</Text>
                        </View>
                        <View style={styles.stripDivider} />
                        <View style={styles.stripStat}>
                            <Text style={[styles.stripNum, { color: Colors.success }]}>
                                {availableCount}
                            </Text>
                            <Text style={styles.stripLabel}>Available Today</Text>
                        </View>
                        <View style={styles.stripDivider} />
                        <View style={styles.stripStat}>
                            <Text style={[styles.stripNum, { color: Colors.primary }]}>
                                {verifiedCount}
                            </Text>
                            <Text style={styles.stripLabel}>Verified</Text>
                        </View>
                    </View>
                )}

                {/* ── Pooja type selector ── */}
                <SectionHeader title={t.selectPooja ?? 'Select Pooja'} />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.poojaScroll}
                >
                    {POOJA_TYPES.map(p => (
                        <TouchableOpacity
                            key={p.id}
                            style={[
                                styles.poojaChip,
                                selectedPooja === p.id && styles.poojaChipSelected,
                            ]}
                            onPress={() => setSelectedPooja(selectedPooja === p.id ? null : p.id)}
                        >
                            <Text style={styles.poojaChipIcon}>{p.icon}</Text>
                            <Text
                                style={[
                                    styles.poojaChipText,
                                    selectedPooja === p.id && styles.poojaChipTextSelected,
                                ]}
                            >
                                {isHindi ? p.nameHi : p.name}
                            </Text>
                            <Text
                                style={[
                                    styles.poojaChipPrice,
                                    selectedPooja === p.id && styles.poojaChipPriceSelected,
                                ]}
                            >
                                ₹{p.priceFrom}+
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── Pandit list ── */}
                <SectionHeader title={`${t.panditsNearYou ?? 'Pandits'} (${filtered.length})`} />

                {loading ? (
                    [1, 2, 3].map(i => (
                        <View key={i} style={[styles.panditCard, { gap: Spacing.sm }]}>
                            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                                <SkeletonBox style={{ width: 72, height: 72, borderRadius: 36 }} />
                                <View style={{ flex: 1, gap: 8 }}>
                                    <SkeletonBox style={{ height: 16 }} />
                                    <SkeletonBox style={{ height: 12, width: '60%' }} />
                                    <SkeletonBox style={{ height: 12, width: '40%' }} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                <SkeletonBox style={{ height: 24, width: 80, borderRadius: 12 }} />
                                <SkeletonBox style={{ height: 24, width: 80, borderRadius: 12 }} />
                            </View>
                            <SkeletonBox style={{ height: 42, borderRadius: BorderRadius.md }} />
                        </View>
                    ))
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🙏</Text>
                        <Text style={styles.emptyText}>
                            {search || selectedPooja
                                ? 'No pandits match your search'
                                : 'No pandits available right now'}
                        </Text>
                        {(search || selectedPooja) && (
                            <TouchableOpacity
                                style={styles.clearBtn}
                                onPress={() => {
                                    setSearch('');
                                    setSelectedPooja(null);
                                }}
                            >
                                <Text style={styles.clearBtnText}>Clear filters</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filtered.map(p => (
                        <PanditCard
                            key={p._id}
                            pandit={p}
                            t={t}
                            isHindi={isHindi}
                            selectedPooja={selectedPooja}
                        />
                    ))
                )}

                <View style={{ height: 90 }} />
            </ScrollView>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBg,
        margin: Spacing.lg,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: Fonts.sizes.md,
        color: Colors.textPrimary,
    },

    // Stats strip
    statsStrip: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.sm,
        ...Shadow.sm,
    },
    stripStat: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    stripNum: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.primary },
    stripLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginTop: 1 },
    stripDivider: { width: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },

    // Pooja chips
    poojaScroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    poojaChip: {
        width: 110,
        backgroundColor: Colors.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginRight: Spacing.sm,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    poojaChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.saffronBg },
    poojaChipIcon: { fontSize: 28, marginBottom: 4 },
    poojaChipText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textPrimary,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 2,
    },
    poojaChipTextSelected: { color: Colors.primaryDark },
    poojaChipPrice: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
    poojaChipPriceSelected: { color: Colors.primary },

    // Pandit card
    panditCard: {
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.md,
    },
    panditHeader: { flexDirection: 'row', marginBottom: Spacing.md },
    avatarWrap: { position: 'relative', marginRight: Spacing.md },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.saffronBg,
    },
    avatarFallback: { alignItems: 'center', justifyContent: 'center' },
    verifiedDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    panditInfo: { flex: 1 },
    panditName: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 1,
    },
    panditUsername: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        letterSpacing: 0.3,
        marginBottom: 3,
    },
    panditCity: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 4 },
    noRating: { fontSize: 10, color: Colors.textMuted, fontStyle: 'italic' },
    panditRight: { alignItems: 'flex-end', gap: 5 },
    panditExp: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '700' },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.saffronBg,
        borderRadius: 8,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    verifiedText: { fontSize: 9, color: Colors.primary, fontWeight: '700' },

    // Qualification
    qualRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: Spacing.sm,
    },
    qualText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.gold,
        fontWeight: '700',
        flex: 1,
    },

    // Specializations
    specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },

    // Languages
    langRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: Spacing.sm,
    },
    langLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, fontWeight: '700' },
    langText: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontWeight: '600', flex: 1 },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
    },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm },
    statValue: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.textPrimary },
    statLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginTop: 1 },
    statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 6 },

    // About box
    aboutBox: {
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    aboutTitle: {
        fontSize: Fonts.sizes.xs,
        color: Colors.primary,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    aboutText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
    },

    // Working days
    daysBox: { marginBottom: Spacing.md },
    daysTitle: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    daysRow: { flexDirection: 'row', gap: 4 },
    dayChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.cardBg,
    },
    dayChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    dayText: { fontSize: 9, fontWeight: '700', color: Colors.textMuted },
    dayTextActive: { color: '#FFF' },

    // Gallery
    galleryScroll: { gap: Spacing.sm, marginBottom: Spacing.md },
    galleryImg: {
        width: 120,
        height: 90,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.saffronBg,
    },

    // Address
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 5,
        marginBottom: Spacing.md,
    },
    addressText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        flex: 1,
        lineHeight: 16,
    },

    // Contact
    contactRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
        flexWrap: 'wrap',
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: 5,
        backgroundColor: Colors.saffronBg,
    },
    contactBtnWa: { borderColor: '#25D36644' },
    contactBtnText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
        color: Colors.primary,
    },

    // Footer
    panditFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.md,
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    expandText: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, fontWeight: '600' },
    bookBtn: { flex: 1 },

    // Empty
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxxl,
        marginHorizontal: Spacing.lg,
    },
    emptyIcon: { fontSize: 52, marginBottom: Spacing.md },
    emptyText: {
        fontSize: Fonts.sizes.md,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    clearBtn: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    clearBtnText: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '700' },
});

export default PanditScreen;
