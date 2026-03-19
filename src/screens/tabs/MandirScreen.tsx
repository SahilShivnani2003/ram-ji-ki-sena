import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Image,
    Linking,
    Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useI18n } from '../../i18n';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme';
import { GradientHeader, Badge, StarRating, ChipFilter, PrimaryButton } from '../../components';
import { mandirAPI } from '../../service/apis/mandirServices';

// ── API Types ─────────────────────────────────────────────────────────────────
interface IMandir {
    _id: string;
    name: string;
    description: string;
    history: string;
    photos: string[];
    averageRating: number;
    createdAt: string;
    festivals: any[];
    nearbyAttractions: any[];
    location: {
        address: string;
        city: string;
        state: string;
    };
    timing: {
        opening: string; // "HH:MM" 24h
        closing: string; // "HH:MM" 24h
        aarti: string[]; // e.g. ["8:00 PM"]
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
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** "HH:MM" 24h → "H:MM AM/PM" */
const fmt24 = (t: string): string => {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr ?? '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m} ${ampm}`;
};

/** Check if open right now */
const checkOpen = (opening: string, closing: string): boolean => {
    if (!opening || !closing) return false;
    const now = new Date();
    const nowM = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = opening.split(':').map(Number);
    const [ch, cm] = closing.split(':').map(Number);
    return nowM >= oh * 60 + om && nowM <= ch * 60 + cm;
};

/** True if entryFee string contains "free" */
const isFreeEntry = (fee: string): boolean => !!fee && fee.toLowerCase().includes('free');

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

// ── Facility Chip ─────────────────────────────────────────────────────────────
const FacilityChip = ({
    icon,
    label,
    active,
}: {
    icon: string;
    label: string;
    active: boolean;
}) => {
    if (!active) return null;
    return (
        <View style={chipStyles.wrap}>
            <Ionicons name={icon as any} size={11} color={Colors.primary} />
            <Text style={chipStyles.label}>{label}</Text>
        </View>
    );
};

const chipStyles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.saffronBg,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    label: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600' },
});

// ── Mandir Card ───────────────────────────────────────────────────────────────
const MandirCard = ({ mandir, isHindi, t }: { mandir: IMandir; isHindi: boolean; t: any }) => {
    const [expanded, setExpanded] = useState(false);
    const isOpen = checkOpen(mandir.timing?.opening, mandir.timing?.closing);
    const coverPhoto = mandir.photos?.[0];
    const secondPhoto = mandir.photos?.[1];
    const freeEntry = isFreeEntry(mandir.visitInfo?.entryFee);

    const handleCall = () =>
        mandir.contact?.phone && Linking.openURL(`tel:${mandir.contact.phone}`).catch(() => {});

    const handleWebsite = () =>
        mandir.contact?.website && Linking.openURL(mandir.contact.website).catch(() => {});

    const handleDirections = () => {
        const q = encodeURIComponent(mandir.location?.address ?? mandir.name);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
    };

    const handleSocial = (url: string) => url && Linking.openURL(url).catch(() => {});

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => setExpanded(e => !e)}
        >
            {/* ── Cover Photo ── */}
            {coverPhoto ? (
                <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} resizeMode="cover" />
            ) : (
                <View style={[styles.coverPhoto, styles.coverPhotoFallback]}>
                    <Text style={{ fontSize: 48 }}>🛕</Text>
                </View>
            )}

            {/* Open/closed pill over photo */}
            <View style={[styles.openPill, { backgroundColor: isOpen ? '#2E7D32' : '#C62828' }]}>
                <View style={styles.openDot} />
                <Text style={styles.openPillText}>
                    {isOpen ? t.openNow ?? 'Open' : t.closed ?? 'Closed'}
                </Text>
            </View>

            {/* Free entry pill */}
            {freeEntry && (
                <View style={styles.freePill}>
                    <Text style={styles.freePillText}>Free Entry</Text>
                </View>
            )}

            <View style={styles.cardBody}>
                {/* ── Name + location ── */}
                <View style={styles.nameRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.mandirName} numberOfLines={2}>
                            {mandir.name}
                        </Text>
                        <Text style={styles.mandirCity} numberOfLines={1}>
                            📍 {mandir.location?.city}, {mandir.location?.state}
                        </Text>
                    </View>
                    {mandir.averageRating > 0 && (
                        <StarRating rating={mandir.averageRating} size={12} />
                    )}
                </View>

                {/* ── Deity ── */}
                <View style={styles.deityRow}>
                    <Ionicons name="flower-outline" size={13} color={Colors.primary} />
                    <Text style={styles.deityText}>
                        {mandir.deity?.main}
                        {mandir.deity?.others?.length > 0
                            ? ` · ${mandir.deity.others.join(', ')}`
                            : ''}
                    </Text>
                </View>

                {/* ── Timings ── */}
                <View style={styles.timingsRow}>
                    <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.timingText}>
                        {fmt24(mandir.timing?.opening)} – {fmt24(mandir.timing?.closing)}
                    </Text>
                    {mandir.timing?.aarti?.length > 0 && (
                        <Text style={styles.aartiText}>🪔 {mandir.timing.aarti[0]}</Text>
                    )}
                </View>

                {/* ── Facilities row ── */}
                <View style={styles.facilitiesRow}>
                    <FacilityChip
                        icon="car-outline"
                        label="Parking"
                        active={mandir.facilities?.parking}
                    />
                    <FacilityChip
                        icon="restaurant-outline"
                        label="Prasad"
                        active={mandir.facilities?.prasad}
                    />
                    <FacilityChip
                        icon="bed-outline"
                        label="Stay"
                        active={mandir.facilities?.accommodation}
                    />
                    <FacilityChip
                        icon="accessibility-outline"
                        label="Accessible"
                        active={mandir.facilities?.wheelchairAccessible}
                    />
                    <FacilityChip
                        icon="water-outline"
                        label="Water"
                        active={mandir.facilities?.drinkingWater}
                    />
                    <FacilityChip
                        icon="camera-outline"
                        label="Photos OK"
                        active={mandir.visitInfo?.photographyAllowed}
                    />
                </View>

                {/* ── Expanded section ── */}
                {expanded && (
                    <>
                        {/* Description */}
                        {!!mandir.description && (
                            <Text style={styles.description} numberOfLines={4}>
                                {mandir.description}
                            </Text>
                        )}

                        {/* Visit info box */}
                        <View style={styles.visitBox}>
                            {!!mandir.visitInfo?.bestTimeToVisit && (
                                <View style={styles.visitRow}>
                                    <Ionicons name="sunny-outline" size={12} color={Colors.gold} />
                                    <Text style={styles.visitLabel}>Best Time:</Text>
                                    <Text style={styles.visitValue}>
                                        {mandir.visitInfo.bestTimeToVisit}
                                    </Text>
                                </View>
                            )}
                            {!!mandir.visitInfo?.dressCode && (
                                <View style={styles.visitRow}>
                                    <Ionicons
                                        name="shirt-outline"
                                        size={12}
                                        color={Colors.textMuted}
                                    />
                                    <Text style={styles.visitLabel}>Dress Code:</Text>
                                    <Text style={styles.visitValue}>
                                        {mandir.visitInfo.dressCode}
                                    </Text>
                                </View>
                            )}
                            {!!mandir.visitInfo?.entryFee && (
                                <View style={styles.visitRow}>
                                    <Ionicons
                                        name="ticket-outline"
                                        size={12}
                                        color={Colors.textMuted}
                                    />
                                    <Text style={styles.visitLabel}>Entry Fee:</Text>
                                    <Text
                                        style={[
                                            styles.visitValue,
                                            freeEntry && {
                                                color: Colors.success,
                                                fontWeight: '700',
                                            },
                                        ]}
                                    >
                                        {mandir.visitInfo.entryFee}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Second photo */}
                        {secondPhoto && (
                            <Image
                                source={{ uri: secondPhoto }}
                                style={styles.secondPhoto}
                                resizeMode="cover"
                            />
                        )}

                        {/* Contact row */}
                        <View style={styles.contactRow}>
                            {!!mandir.contact?.phone && (
                                <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                                    <Ionicons
                                        name="call-outline"
                                        size={14}
                                        color={Colors.primary}
                                    />
                                    <Text style={styles.contactBtnText}>Call</Text>
                                </TouchableOpacity>
                            )}
                            {!!mandir.contact?.website && (
                                <TouchableOpacity style={styles.contactBtn} onPress={handleWebsite}>
                                    <Ionicons
                                        name="globe-outline"
                                        size={14}
                                        color={Colors.primary}
                                    />
                                    <Text style={styles.contactBtnText}>Website</Text>
                                </TouchableOpacity>
                            )}
                            {/* Social icons */}
                            <View style={styles.socialRow}>
                                {!!mandir.socialMedia?.youtube && (
                                    <TouchableOpacity
                                        style={styles.socialIcon}
                                        onPress={() => handleSocial(mandir.socialMedia.youtube)}
                                    >
                                        <Ionicons name="logo-youtube" size={16} color="#FF0000" />
                                    </TouchableOpacity>
                                )}
                                {!!mandir.socialMedia?.instagram && (
                                    <TouchableOpacity
                                        style={styles.socialIcon}
                                        onPress={() => handleSocial(mandir.socialMedia.instagram)}
                                    >
                                        <Ionicons name="logo-instagram" size={16} color="#E1306C" />
                                    </TouchableOpacity>
                                )}
                                {!!mandir.socialMedia?.facebook && (
                                    <TouchableOpacity
                                        style={styles.socialIcon}
                                        onPress={() => handleSocial(mandir.socialMedia.facebook)}
                                    >
                                        <Ionicons name="logo-facebook" size={16} color="#1877F2" />
                                    </TouchableOpacity>
                                )}
                                {!!mandir.socialMedia?.twitter && (
                                    <TouchableOpacity
                                        style={styles.socialIcon}
                                        onPress={() => handleSocial(mandir.socialMedia.twitter)}
                                    >
                                        <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </>
                )}

                {/* ── Action buttons ── */}
                <View style={styles.actionRow}>
                    <PrimaryButton
                        label={t.getDirections ?? 'Directions'}
                        onPress={handleDirections}
                        outline
                        small
                        style={{ flex: 1, marginRight: Spacing.sm }}
                    />
                    <PrimaryButton
                        label={expanded ? 'Show Less' : t.viewDetails ?? 'View Details'}
                        onPress={() => setExpanded(e => !e)}
                        small
                        style={{ flex: 1 }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const MandirScreen: React.FC = () => {
    const { t, isHindi } = useI18n();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [mandirs, setMandirs] = useState<IMandir[]>([]);
    const [loading, setLoading] = useState(true);

    const filterOptions = [
        { key: 'all', label: t.allFilter ?? 'All' },
        { key: 'open', label: t.nearbyFilter ?? 'Open Now' },
        { key: 'free', label: t.popularFilter ?? 'Free Entry' },
        { key: 'parking', label: 'Parking' },
    ];

    useEffect(() => {
        fetchMandir();
    }, []);

    const fetchMandir = async () => {
        try {
            const response = await mandirAPI.getAll();
            if (response.data?.success) {
                setMandirs(response.data.mandirs as IMandir[]);
            }
        } catch (error: any) {
            console.error('FETCH MANDIR ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Filter logic ──────────────────────────────────────────────────────────
    const filtered = mandirs.filter(m => {
        const name = m.name ?? '';
        const city = m.location?.city ?? '';
        const state = m.location?.state ?? '';
        const deity = m.deity?.main ?? '';

        const matchSearch =
            !search ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            city.toLowerCase().includes(search.toLowerCase()) ||
            state.toLowerCase().includes(search.toLowerCase()) ||
            deity.toLowerCase().includes(search.toLowerCase());

        const matchFilter =
            filter === 'all' ||
            (filter === 'open' && checkOpen(m.timing?.opening, m.timing?.closing)) ||
            (filter === 'free' && isFreeEntry(m.visitInfo?.entryFee)) ||
            (filter === 'parking' && m.facilities?.parking);

        return matchSearch && matchFilter;
    });

    // ── Stats bar counts ──────────────────────────────────────────────────────
    const openCount = mandirs.filter(m => checkOpen(m.timing?.opening, m.timing?.closing)).length;
    const freeCount = mandirs.filter(m => isFreeEntry(m.visitInfo?.entryFee)).length;
    const parkingCount = mandirs.filter(m => m.facilities?.parking).length;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <GradientHeader title={t.mandirDirectory ?? 'Mandirs'} subtitle="🛕 Temple Directory" />

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
                    placeholder={t.searchMandirs ?? 'Search by name, city, deity…'}
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

            {/* Stats pills */}
            {!loading && (
                <View style={styles.statsRow}>
                    <View style={styles.statPill}>
                        <Text style={styles.statNum}>{mandirs.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={[styles.statPill, { borderColor: '#4CAF5044' }]}>
                        <Text style={[styles.statNum, { color: Colors.success }]}>{openCount}</Text>
                        <Text style={styles.statLabel}>Open Now</Text>
                    </View>
                    <View style={[styles.statPill, { borderColor: Colors.goldLight }]}>
                        <Text style={[styles.statNum, { color: Colors.gold }]}>{freeCount}</Text>
                        <Text style={styles.statLabel}>Free Entry</Text>
                    </View>
                    <View style={[styles.statPill, { borderColor: Colors.border }]}>
                        <Text style={[styles.statNum, { color: Colors.textSecondary }]}>
                            {parkingCount}
                        </Text>
                        <Text style={styles.statLabel}>Parking</Text>
                    </View>
                </View>
            )}

            <ChipFilter options={filterOptions} selected={filter} onSelect={setFilter} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {loading ? (
                    // Skeleton cards
                    [1, 2, 3].map(i => (
                        <View key={i} style={styles.card}>
                            <SkeletonBox
                                style={{
                                    height: 160,
                                    borderRadius: BorderRadius.md,
                                    marginBottom: Spacing.md,
                                }}
                            />
                            <SkeletonBox style={{ height: 18, marginBottom: 8 }} />
                            <SkeletonBox style={{ height: 13, width: '60%', marginBottom: 8 }} />
                            <SkeletonBox style={{ height: 13, width: '40%', marginBottom: 12 }} />
                            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                                {[1, 2, 3].map(j => (
                                    <SkeletonBox
                                        key={j}
                                        style={{ height: 24, width: 64, borderRadius: 12 }}
                                    />
                                ))}
                            </View>
                            <SkeletonBox style={{ height: 38, borderRadius: BorderRadius.md }} />
                        </View>
                    ))
                ) : filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🛕</Text>
                        <Text style={styles.emptyText}>
                            {search
                                ? `No mandirs found for "${search}"`
                                : 'No mandirs match the selected filter'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setSearch('');
                                setFilter('all');
                            }}
                            style={styles.clearBtn}
                        >
                            <Text style={styles.clearBtnText}>Clear filters</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filtered.map(mandir => (
                        <MandirCard key={mandir._id} mandir={mandir} isHindi={isHindi} t={t} />
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

    // Stats row
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    statPill: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.cardBg,
        borderRadius: 12,
        paddingVertical: 6,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    statNum: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: Colors.primary,
    },
    statLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginTop: 1 },

    // Card
    card: {
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.md,
    },
    coverPhoto: {
        width: '100%',
        height: 160,
        backgroundColor: Colors.saffronBg,
    },
    coverPhotoFallback: { alignItems: 'center', justifyContent: 'center' },

    // Open pill (overlay on photo)
    openPill: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
    openPillText: { fontSize: 10, color: '#fff', fontWeight: '700', letterSpacing: 0.3 },

    // Free pill
    freePill: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: Colors.success,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    freePillText: { fontSize: 10, color: '#fff', fontWeight: '700' },

    cardBody: { padding: Spacing.lg },

    // Name row
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    mandirName: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: Colors.textPrimary,
        lineHeight: 22,
        marginBottom: 2,
    },
    mandirCity: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },

    // Deity
    deityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: Spacing.sm,
    },
    deityText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.primary,
        fontWeight: '700',
        flex: 1,
    },

    // Timings
    timingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    timingText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        fontWeight: '600',
        flex: 1,
    },
    aartiText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.primary,
        fontWeight: '700',
    },

    // Facilities
    facilitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginBottom: Spacing.md,
    },

    // Expanded: description
    description: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },

    // Visit info box
    visitBox: {
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 3,
        borderLeftColor: Colors.gold,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        gap: 5,
    },
    visitRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    visitLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        width: 68,
    },
    visitValue: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textPrimary,
        fontWeight: '700',
        flex: 1,
    },

    // Second photo
    secondPhoto: {
        width: '100%',
        height: 130,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },

    // Contact row
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    contactBtnText: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
        color: Colors.primary,
    },
    socialRow: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
    socialIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.saffronBg,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Actions
    actionRow: { flexDirection: 'row' },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxxl,
        marginHorizontal: Spacing.lg,
    },
    emptyIcon: { fontSize: 56, marginBottom: Spacing.md },
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

export default MandirScreen;
