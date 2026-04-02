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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useI18n } from '../../i18n';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme';
import {
    GradientHeader,
    ChipFilter,
    LiveBadge,
    PrimaryButton,
    SectionHeader,
    StarRating,
} from '../../components';
import { NativeBottomTabScreenProps } from '@react-navigation/bottom-tabs/unstable';
import { RootTabParamList } from '../../navigation/TabNavigator';
import { kathaVachakAPI } from '../../service/apis/kathaVachakServices';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigator';

type KathaProps = DrawerScreenProps<DrawerParamList, 'Katha'>;

// ── API Types ─────────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso: string): string => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const isKathaOngoing = (startDate: string, endDate: string | null): boolean => {
    const now = new Date();
    const start = new Date(startDate);
    if (endDate) {
        return now >= start && now <= new Date(endDate);
    }
    return now >= start;
};

const isUpcoming = (startDate: string): boolean => new Date(startDate) > new Date();

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

// ── KathaVachak Card ──────────────────────────────────────────────────────────
interface VachakCardProps {
    vachak: IKathaVachak;
    isHindi: boolean;
    t: any;
}

const KathaVachakCard: React.FC<VachakCardProps> = ({ vachak, isHindi, t }) => {
    const activeKatha = vachak.liveKathas.find(k => k.isActive);
    const ongoing = activeKatha
        ? isKathaOngoing(activeKatha.startDate, activeKatha.endDate)
        : false;
    const upcoming = activeKatha ? isUpcoming(activeKatha.startDate) : false;

    const handleWatch = () => {
        if (activeKatha?.liveLink) {
            Linking.openURL(activeKatha.liveLink).catch(() => {});
        }
    };

    const handleCall = () => {
        if (vachak.contact?.phone) {
            Linking.openURL(`tel:${vachak.contact.phone}`).catch(() => {});
        }
    };

    const handleWhatsApp = () => {
        if (vachak.contact?.whatsapp) {
            Linking.openURL(`https://wa.me/91${vachak.contact.whatsapp}`).catch(() => {});
        }
    };

    return (
        <TouchableOpacity style={styles.eventCard} activeOpacity={0.92}>
            {/* ── Card header ── */}
            <View style={styles.cardHeader}>
                {/* Photo */}
                <View style={styles.photoWrap}>
                    {vachak.photo ? (
                        <Image
                            source={{ uri: vachak.photo }}
                            style={styles.photo}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.photo, styles.photoFallback]}>
                            <Text style={{ fontSize: 36 }}>🎤</Text>
                        </View>
                    )}
                    {vachak.isLive && (
                        <View style={styles.liveOverlay}>
                            <LiveBadge />
                        </View>
                    )}
                </View>

                {/* Name + meta */}
                <View style={styles.cardHeaderInfo}>
                    <Text style={styles.vachakName} numberOfLines={2}>
                        {vachak.name}
                    </Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="book-outline" size={12} color={Colors.primary} />
                        <Text style={styles.specialization} numberOfLines={1}>
                            {vachak.specialization}
                        </Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.metaText}>{vachak.experience} yrs experience</Text>
                    </View>
                    {vachak.averageRating > 0 && (
                        <StarRating rating={vachak.averageRating} size={12} />
                    )}
                    {/* Status chip */}
                    <View
                        style={[
                            styles.statusChip,
                            {
                                backgroundColor: vachak.isLive
                                    ? '#FFEBEE'
                                    : ongoing
                                    ? '#E8F5E9'
                                    : '#FFF3E0',
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                {
                                    backgroundColor: vachak.isLive
                                        ? Colors.error
                                        : ongoing
                                        ? Colors.success
                                        : Colors.warning,
                                },
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: vachak.isLive
                                        ? Colors.error
                                        : ongoing
                                        ? Colors.success
                                        : Colors.warning,
                                },
                            ]}
                        >
                            {vachak.isLive
                                ? 'LIVE NOW'
                                : ongoing
                                ? 'ONGOING'
                                : upcoming
                                ? 'UPCOMING'
                                : 'ACTIVE'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Description ── */}
            {vachak.description ? (
                <Text style={styles.description} numberOfLines={3}>
                    {vachak.description}
                </Text>
            ) : null}

            {/* ── Active katha details ── */}
            {activeKatha && (
                <View style={styles.kathaDetailsBox}>
                    <Text style={styles.kathaDetailsTitle}>📿 {activeKatha.kathaType}</Text>

                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.detailLabel}>{isHindi ? 'स्थान:' : 'Venue:'}</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>
                            {[
                                activeKatha.addressLine1,
                                activeKatha.addressLine2,
                                activeKatha.city,
                                activeKatha.state,
                            ]
                                .filter(Boolean)
                                .join(', ')}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.detailLabel}>{isHindi ? 'तारीख:' : 'Start:'}</Text>
                        <Text style={styles.detailValue}>{formatDate(activeKatha.startDate)}</Text>
                    </View>

                    {activeKatha.endDate && (
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                            <Text style={styles.detailLabel}>{isHindi ? 'समाप्ति:' : 'End:'}</Text>
                            <Text style={styles.detailValue}>
                                {formatDate(activeKatha.endDate)}
                            </Text>
                        </View>
                    )}

                    {!activeKatha.endDate && (
                        <View style={styles.detailRow}>
                            <Ionicons name="infinite-outline" size={12} color={Colors.primary} />
                            <Text
                                style={[
                                    styles.detailValue,
                                    { color: Colors.primary, fontWeight: '700' },
                                ]}
                            >
                                {isHindi ? 'अभी चल रही है' : 'Ongoing Katha'}
                            </Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Ionicons name="pin-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.detailLabel}>Pincode:</Text>
                        <Text style={styles.detailValue}>{activeKatha.pincode}</Text>
                    </View>
                </View>
            )}

            {/* ── Contact actions ── */}
            <View style={styles.contactRow}>
                {vachak.contact?.phone ? (
                    <TouchableOpacity
                        style={styles.contactBtn}
                        onPress={handleCall}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="call-outline" size={14} color={Colors.primary} />
                        <Text style={styles.contactBtnText}>Call</Text>
                    </TouchableOpacity>
                ) : null}
                {vachak.contact?.whatsapp ? (
                    <TouchableOpacity
                        style={[styles.contactBtn, styles.contactBtnWa]}
                        onPress={handleWhatsApp}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                        <Text style={[styles.contactBtnText, { color: '#25D366' }]}>WhatsApp</Text>
                    </TouchableOpacity>
                ) : null}
                {/* Social icons */}
                <View style={styles.socialIcons}>
                    {vachak.socialMedia?.youtube ? (
                        <TouchableOpacity
                            onPress={() => Linking.openURL(vachak.socialMedia.youtube)}
                            style={styles.socialIcon}
                        >
                            <Ionicons name="logo-youtube" size={18} color="#FF0000" />
                        </TouchableOpacity>
                    ) : null}
                    {vachak.socialMedia?.instagram ? (
                        <TouchableOpacity
                            onPress={() => Linking.openURL(vachak.socialMedia.instagram)}
                            style={styles.socialIcon}
                        >
                            <Ionicons name="logo-instagram" size={18} color="#E1306C" />
                        </TouchableOpacity>
                    ) : null}
                    {vachak.socialMedia?.facebook ? (
                        <TouchableOpacity
                            onPress={() => Linking.openURL(vachak.socialMedia.facebook)}
                            style={styles.socialIcon}
                        >
                            <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* ── CTA ── */}
            {activeKatha && (
                <PrimaryButton
                    label={
                        vachak.isLive && activeKatha.liveLink
                            ? t.watchNow
                            : isHindi
                            ? 'और जानें'
                            : 'View Details'
                    }
                    onPress={vachak.isLive && activeKatha.liveLink ? handleWatch : () => {}}
                />
            )}
        </TouchableOpacity>
    );
};

// ── Vachak mini card (horizontal scroll) ─────────────────────────────────────
const VachakMiniCard: React.FC<{ vachak: IKathaVachak }> = ({ vachak }) => {
    const activeKatha = vachak.liveKathas.find(k => k.isActive);
    return (
        <TouchableOpacity style={styles.miniCard} activeOpacity={0.85}>
            {/* Photo */}
            {vachak.photo ? (
                <Image source={{ uri: vachak.photo }} style={styles.miniPhoto} resizeMode="cover" />
            ) : (
                <View style={[styles.miniPhoto, styles.photoFallback]}>
                    <Text style={{ fontSize: 32 }}>🎤</Text>
                </View>
            )}
            {vachak.isLive && (
                <View style={styles.miniLiveDot}>
                    <View style={styles.liveDot} />
                </View>
            )}
            <Text style={styles.miniName} numberOfLines={2}>
                {vachak.name}
            </Text>
            <Text style={styles.miniSpec} numberOfLines={1}>
                {vachak.specialization}
            </Text>
            <Text style={styles.miniExp}>{vachak.experience} yrs</Text>
            {vachak.averageRating > 0 && <StarRating rating={vachak.averageRating} size={10} />}
            {activeKatha && (
                <View style={styles.miniKathaBox}>
                    <Text style={styles.miniKathaLabel}>Katha:</Text>
                    <Text style={styles.miniKathaVal} numberOfLines={1}>
                        {activeKatha.kathaType}
                    </Text>
                    <Text style={styles.miniKathaLoc} numberOfLines={1}>
                        📍 {activeKatha.city}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const KathaScreen = ({ navigation }: KathaProps) => {
    const { t, isHindi } = useI18n();
    const [tab, setTab] = useState<'live' | 'ongoing' | 'upcoming'>('upcoming');
    const [kathaVachaks, setKathaVachaks] = useState<IKathaVachak[]>([]);
    const [loading, setLoading] = useState(true);

    const tabOptions = [
        { key: 'live', label: t.liveKatha ?? 'Live' },
        { key: 'ongoing', label: 'Ongoing' },
        { key: 'upcoming', label: t.upcomingKatha ?? 'Upcoming' },
    ];

    useEffect(() => {
        fetchKathaVachak();
    }, []);

    const fetchKathaVachak = async () => {
        try {
            const response = await kathaVachakAPI.getAll();
            if (response.data?.success) {
                setKathaVachaks(response.data.kathaVachaks as IKathaVachak[]);
            }
        } catch (error: any) {
            console.error('FETCH KATHA VACHAK ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Filter vachaks by tab ─────────────────────────────────────────────────
    const liveVachaks = kathaVachaks.filter(v => v.isLive);

    const ongoingVachaks = kathaVachaks.filter(v => {
        if (v.isLive) return false;
        return v.liveKathas.some(k => k.isActive && isKathaOngoing(k.startDate, k.endDate));
    });

    const upcomingVachaks = kathaVachaks.filter(v => {
        if (v.isLive) return false;
        return v.liveKathas.some(k => k.isActive && isUpcoming(k.startDate));
    });

    const tabMap: Record<string, IKathaVachak[]> = {
        live: liveVachaks,
        ongoing: ongoingVachaks,
        upcoming: upcomingVachaks,
    };

    const displayList = tabMap[tab] ?? [];

    const emptyMessages: Record<string, { icon: string; text: string }> = {
        live: { icon: '📺', text: isHindi ? 'अभी कोई लाइव कथा नहीं' : 'No live katha right now' },
        ongoing: {
            icon: '📿',
            text: isHindi ? 'अभी कोई चल रही कथा नहीं' : 'No ongoing kathas right now',
        },
        upcoming: {
            icon: '📅',
            text: isHindi ? 'कोई आगामी कथा नहीं' : 'No upcoming kathas scheduled',
        },
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <GradientHeader title={t.kathaEvents ?? 'Katha Events'} subtitle="📖 Ram Katha" navigation={navigation} />
            <ChipFilter options={tabOptions} selected={tab} onSelect={v => setTab(v as any)} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ── Tab counter pills ── */}
                <View style={styles.counterRow}>
                    {[
                        {
                            key: 'live',
                            count: liveVachaks.length,
                            label: 'Live',
                            color: Colors.error,
                        },
                        {
                            key: 'ongoing',
                            count: ongoingVachaks.length,
                            label: 'Ongoing',
                            color: Colors.success,
                        },
                        {
                            key: 'upcoming',
                            count: upcomingVachaks.length,
                            label: 'Upcoming',
                            color: Colors.primary,
                        },
                    ].map(c => (
                        <TouchableOpacity
                            key={c.key}
                            style={[styles.counterPill, { borderColor: c.color + '44' }]}
                            onPress={() => setTab(c.key as any)}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.counterNum, { color: c.color }]}>{c.count}</Text>
                            <Text style={styles.counterLabel}>{c.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── List ── */}
                {loading ? (
                    // Skeleton
                    [1, 2].map(i => (
                        <View key={i} style={[styles.eventCard, { gap: Spacing.sm }]}>
                            <View style={styles.cardHeader}>
                                <SkeletonBox
                                    style={{
                                        width: 90,
                                        height: 100,
                                        borderRadius: BorderRadius.md,
                                    }}
                                />
                                <View style={{ flex: 1, gap: 8, paddingLeft: Spacing.md }}>
                                    <SkeletonBox style={{ height: 16 }} />
                                    <SkeletonBox style={{ height: 12, width: '70%' }} />
                                    <SkeletonBox style={{ height: 12, width: '50%' }} />
                                </View>
                            </View>
                            <SkeletonBox style={{ height: 12 }} />
                            <SkeletonBox style={{ height: 12, width: '80%' }} />
                            <SkeletonBox style={{ height: 80, borderRadius: BorderRadius.md }} />
                        </View>
                    ))
                ) : displayList.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>{emptyMessages[tab].icon}</Text>
                        <Text style={styles.emptyText}>{emptyMessages[tab].text}</Text>
                        {kathaVachaks.length > 0 && (
                            <Text style={styles.emptySubText}>
                                {kathaVachaks.length} Katha Vachak
                                {kathaVachaks.length > 1 ? 's' : ''} registered
                            </Text>
                        )}
                    </View>
                ) : (
                    displayList.map(vachak => (
                        <KathaVachakCard key={vachak._id} vachak={vachak} isHindi={isHindi} t={t} />
                    ))
                )}

                {/* ── All Katha Vachaks (horizontal) ── */}
                <SectionHeader title={t.kathavachak ?? 'Katha Vachaks'} />

                {loading ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.miniScroll}
                    >
                        {[1, 2, 3].map(i => (
                            <View key={i} style={styles.miniCard}>
                                <SkeletonBox
                                    style={{
                                        width: '100%',
                                        height: 80,
                                        borderRadius: BorderRadius.md,
                                        marginBottom: 8,
                                    }}
                                />
                                <SkeletonBox style={{ height: 12, marginBottom: 5 }} />
                                <SkeletonBox style={{ height: 10, width: '70%' }} />
                            </View>
                        ))}
                    </ScrollView>
                ) : kathaVachaks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🎤</Text>
                        <Text style={styles.emptyText}>No Katha Vachaks registered yet</Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.miniScroll}
                    >
                        {kathaVachaks.map(v => (
                            <VachakMiniCard key={v._id} vachak={v} />
                        ))}
                    </ScrollView>
                )}

                <View style={{ height: 90 }} />
            </ScrollView>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Counter pills row
    counterRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    counterPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        backgroundColor: Colors.cardBg,
        borderRadius: 20,
        paddingVertical: Spacing.xs,
        borderWidth: 1.5,
    },
    counterNum: { fontSize: Fonts.sizes.lg, fontWeight: '800' },
    counterLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },

    // Event card
    eventCard: {
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.md,
    },
    cardHeader: { flexDirection: 'row', marginBottom: Spacing.md },
    photoWrap: { position: 'relative' },
    photo: {
        width: 90,
        height: 110,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.saffronBg,
        marginRight: Spacing.md,
    },
    photoFallback: { alignItems: 'center', justifyContent: 'center' },
    liveOverlay: { position: 'absolute', top: 6, left: 6 },
    cardHeaderInfo: { flex: 1, gap: 4 },

    vachakName: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    specialization: { fontSize: Fonts.sizes.xs, color: Colors.primary, fontWeight: '700', flex: 1 },
    metaText: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },

    // Status chip
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 10,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

    // Description
    description: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },

    // Katha details box
    kathaDetailsBox: {
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        gap: 5,
    },
    kathaDetailsTitle: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 6,
    },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5 },
    detailLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        fontWeight: '600',
        width: 52,
    },
    detailValue: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textPrimary,
        fontWeight: '700',
        flex: 1,
        lineHeight: 16,
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
    contactBtnWa: { borderColor: '#25D36644' },
    contactBtnText: { fontSize: Fonts.sizes.xs, fontWeight: '700', color: Colors.primary },
    socialIcons: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
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

    // Empty state
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xxxl,
        marginTop: Spacing.md,
    },
    emptyIcon: { fontSize: 56, marginBottom: Spacing.md },
    emptyText: { fontSize: Fonts.sizes.md, color: Colors.textMuted, textAlign: 'center' },
    emptySubText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.primary,
        marginTop: Spacing.sm,
        fontWeight: '600',
    },

    // Mini card (horizontal)
    miniScroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
    miniCard: {
        width: 150,
        backgroundColor: Colors.cardBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginRight: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
        position: 'relative',
    },
    miniPhoto: {
        width: '100%',
        height: 80,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.saffronBg,
        marginBottom: Spacing.sm,
    },
    miniLiveDot: { position: 'absolute', top: 10, right: 10 },
    liveDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.error,
        borderWidth: 2,
        borderColor: Colors.cardBg,
    },
    miniName: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '800',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 2,
    },
    miniSpec: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
    },
    miniExp: { fontSize: 10, color: Colors.textMuted, marginBottom: 4 },
    miniKathaBox: {
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.sm,
        padding: 6,
        marginTop: Spacing.xs,
        width: '100%',
    },
    miniKathaLabel: {
        fontSize: 9,
        color: Colors.textMuted,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    miniKathaVal: { fontSize: 10, color: Colors.primaryDark, fontWeight: '700', lineHeight: 14 },
    miniKathaLoc: { fontSize: 9, color: Colors.textMuted, marginTop: 1 },
});

export default KathaScreen;
