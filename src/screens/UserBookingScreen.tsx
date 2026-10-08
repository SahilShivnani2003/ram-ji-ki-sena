import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
      Alert,
      Animated,
      FlatList,
      Image,
      Linking,
      ListRenderItem,
      Platform,
      Pressable,
      RefreshControl,
      ScrollView,
      StatusBar,
      StyleSheet,
      Text,
      View,
} from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/AppNavigator';

import { BorderRadius, Colors, Fonts, Shadow, Spacing } from '../theme/index';
import { IUserBooking, IUserBookingPandit } from '../types/IBooking';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import { bookingAPI } from '../service/apis/bookingServices';

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

/** `IUserBooking.pandit` is an id string; the list API usually populates it. */

export type IUserBookingView = Omit<IUserBooking, 'pandit'> & {
      pandit: IUserBookingPandit;
};

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';
type FilterKey = 'all' | BookingStatus;

interface StatusConfig {
      label: string;
      emoji: string;
      color: string;
      bg: string;
      border: string;
}

const FILTERS: ReadonlyArray<{ key: FilterKey; label: string }> = [
      { key: 'all', label: 'All' },
      { key: 'pending', label: 'Pending' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'completed', label: 'Completed' },
      { key: 'rejected', label: 'Rejected' },
      { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
      pending: {
            label: 'Pending',
            emoji: '⏳',
            color: Colors.goldDark,
            bg: Colors.saffronBg,
            border: Colors.goldLight,
      },
      confirmed: {
            label: 'Confirmed',
            emoji: '✅',
            color: Colors.tulsi,
            bg: '#E8F5E9',
            border: Colors.tulsiLight,
      },
      completed: {
            label: 'Completed',
            emoji: '🪔',
            color: Colors.info,
            bg: '#E3F2FD',
            border: '#90CAF9',
      },
      rejected: {
            label: 'Rejected',
            emoji: '✕',
            color: Colors.error,
            bg: '#FFEBEE',
            border: '#EF9A9A',
      },
      cancelled: {
            label: 'Cancelled',
            emoji: '⊘',
            color: Colors.textMuted,
            bg: '#F5EFEA',
            border: Colors.border,
      },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86_400_000;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const normalizeStatus = (status: string): BookingStatus => {
      const s = status.toLowerCase();
      return s in STATUS_CONFIG ? (s as BookingStatus) : 'pending';
};

const getInitials = (name: string): string =>
      name
            .replace(/^pt\.?\s*/i, '')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w.charAt(0).toUpperCase())
            .join('');

const formatINR = (amount: number): string => {
      const [int, dec] = amount.toFixed(2).split('.');
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3);
      const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
      return `₹ ${grouped}${dec === '00' ? '' : `.${dec}`}`;
};

const parseDate = (value: string): Date | null => {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value: string): string => {
      const d = parseDate(value);
      if (!d) return value;
      return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const startOfDay = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const getDaysLeft = (value: string): number | null => {
      const d = parseDate(value);
      if (!d) return null;
      return Math.round((startOfDay(d) - startOfDay(new Date())) / DAY_MS);
};

const daysLeftLabel = (days: number): string => {
      if (days === 0) return 'Today';
      if (days === 1) return 'Tomorrow';
      return `In ${days} days`;
};

const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* -------------------------------------------------------------------------- */
/*                               Small components                             */
/* -------------------------------------------------------------------------- */

const StatusBadge = memo(({ status }: { status: BookingStatus }) => {
      const cfg = STATUS_CONFIG[status];
      return (
            <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                  <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
      );
});

interface FilterChipProps {
      label: string;
      count: number;
      active: boolean;
      onPress: () => void;
}

const FilterChip = memo(({ label, count, active, onPress }: FilterChipProps) => (
      <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${label}, ${count} bookings`}
            style={({ pressed }) => [
                  styles.chip,
                  active && styles.chipActive,
                  pressed && !active && { opacity: 0.7 },
            ]}
      >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            {count > 0 && (
                  <View style={[styles.chipCount, active && styles.chipCountActive]}>
                        <Text style={[styles.chipCountText, active && { color: Colors.primaryDark }]}>{count}</Text>
                  </View>
            )}
      </Pressable>
));

interface ActionButtonProps {
      label: string;
      emoji?: string;
      variant: 'primary' | 'success' | 'outline' | 'gold';
      onPress: () => void;
      disabled?: boolean;
}

const ActionButton = memo(({ label, emoji, variant, onPress, disabled }: ActionButtonProps) => {
      const v = BUTTON_VARIANTS[variant];
      return (
            <Pressable
                  onPress={onPress}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ disabled }}
                  style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: v.bg, borderColor: v.border },
                        pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
                        disabled && { opacity: 0.4 },
                  ]}
            >
                  {emoji ? <Text style={styles.actionEmoji}>{emoji}</Text> : null}
                  <Text style={[styles.actionText, { color: v.text }]}>{label}</Text>
            </Pressable>
      );
});

const BUTTON_VARIANTS: Record<ActionButtonProps['variant'], { bg: string; border: string; text: string }> = {
      primary: { bg: Colors.primary, border: Colors.primary, text: Colors.textLight },
      success: { bg: Colors.tulsi, border: Colors.tulsi, text: Colors.textLight },
      outline: { bg: Colors.cardBg, border: Colors.error, text: Colors.error },
      gold: { bg: Colors.goldLight, border: Colors.gold, text: Colors.textPrimary },
};

/* ---------------------------- Next pooja highlight ------------------------- */

const NextPoojaCard = memo(({ booking, onPress }: { booking: IUserBookingView; onPress: () => void }) => {
      const days = getDaysLeft(booking.poojaDate);
      const pandit = booking.pandit;
      return (
            <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel={`Next pooja: ${booking.poojaType} with ${pandit.name}`}
                  style={({ pressed }) => [styles.nextCard, pressed && { opacity: 0.92 }]}
            >
                  <Text style={styles.nextWatermark}>ॐ</Text>
                  <View style={styles.nextLeft}>
                        <Text style={styles.nextEyebrow}>Your next pooja</Text>
                        <Text style={styles.nextTitle} numberOfLines={1}>
                              {booking.poojaType}
                        </Text>
                        <Text style={styles.nextSub} numberOfLines={1}>
                              {pandit.name} · {booking.poojaTime}
                        </Text>
                  </View>
                  <View style={styles.nextRight}>
                        <Text style={styles.nextDays}>{days !== null ? daysLeftLabel(days) : '—'}</Text>
                        <Text style={styles.nextDate}>{formatDate(booking.poojaDate)}</Text>
                  </View>
            </Pressable>
      );
});

/* ------------------------------- Booking card ------------------------------ */

interface BookingCardProps {
      booking: IUserBookingView;
      index: number;
      onDetails: (b: IUserBookingView) => void;
      onCall: (b: IUserBookingView) => void;
      onCancel: (b: IUserBookingView) => void;
      onReview: (b: IUserBookingView) => void;
}

const BookingCard = memo(({ booking, index, onDetails, onCall, onCancel, onReview }: BookingCardProps) => {
      const status = normalizeStatus(booking.status);
      const cfg = STATUS_CONFIG[status];
      const pandit = booking.pandit;
      const isPaid = booking.payment.status.toLowerCase() === 'paid';

      // one-time staggered entrance for the first few cards
      const anim = useRef(new Animated.Value(0)).current;
      useEffect(() => {
            Animated.timing(anim, {
                  toValue: 1,
                  duration: 380,
                  delay: Math.min(index, 5) * 70,
                  useNativeDriver: true,
            }).start();
      }, [anim, index]);

      const canCancel = status === 'pending' || status === 'confirmed';
      const canReview = status === 'completed' && !booking.isReviewed;
      const canCall = Boolean(pandit.contact.phone) && (status === 'pending' || status === 'confirmed');

      return (
            <Animated.View
                  style={[
                        styles.card,
                        {
                              opacity: anim,
                              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
                        },
                  ]}
            >
                  <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />

                  <View style={styles.cardTop}>
                        {booking.pandit.photo ? (
                              <Image source={{ uri: booking.pandit.photo }} style={styles.avatar} />
                        ) : (
                              <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Text style={styles.avatarInitials}>{getInitials(pandit.name) || '🙏'}</Text>
                              </View>
                        )}

                        <View style={styles.cardInfo}>
                              <View style={styles.titleRow}>
                                    <Text style={styles.poojaTitle} numberOfLines={1}>
                                          {booking.poojaType}
                                    </Text>
                                    <StatusBadge status={status} />
                              </View>

                              <Text style={styles.panditName} numberOfLines={1}>
                                    {pandit.name}
                              </Text>

                              <View style={styles.metaWrap}>
                                    <View style={styles.metaItem}>
                                          <Text style={styles.metaIcon}>🗓️</Text>
                                          <Text style={styles.metaText}>
                                                {formatDate(booking.poojaDate)}, {booking.poojaTime}
                                          </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                          <Text style={styles.metaIcon}>📍</Text>
                                          <Text style={styles.metaText} numberOfLines={1}>
                                                {booking.location.city}
                                          </Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                          <Text style={styles.metaIcon}>👥</Text>
                                          <Text style={styles.metaText}>{booking.requirements.numberOfPeople}</Text>
                                    </View>
                                    {booking.requirements.samagriNeeded && (
                                          <View style={styles.metaItem}>
                                                <Text style={styles.metaIcon}>🪔</Text>
                                                <Text style={styles.metaText}>Samagri</Text>
                                          </View>
                                    )}
                              </View>
                        </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.priceRow}>
                        <View>
                              <Text style={styles.priceLabel}>Total amount</Text>
                              <Text style={styles.priceValue}>{formatINR(booking.totalAmount)}</Text>
                        </View>
                        <View
                              style={[
                                    styles.payPill,
                                    { backgroundColor: isPaid ? '#E8F5E9' : Colors.saffronBg },
                              ]}
                        >
                              <Text style={[styles.payText, { color: isPaid ? Colors.tulsi : Colors.goldDark }]}>
                                    Payment {capitalize(booking.payment.status)}
                              </Text>
                        </View>
                  </View>

                  <View style={styles.actionsRow}>
                        {canCancel && <ActionButton label="Cancel" variant="outline" onPress={() => onCancel(booking)} />}
                        {canReview && <ActionButton label="Rate" emoji="⭐" variant="gold" onPress={() => onReview(booking)} />}
                        {canCall && <ActionButton label="Call" emoji="📞" variant="success" onPress={() => onCall(booking)} />}
                        <ActionButton label="Details" variant="primary" onPress={() => onDetails(booking)} />
                  </View>
            </Animated.View>
      );
});

/* ------------------------------ Loading / empty ---------------------------- */

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
                  <View style={styles.cardTop}>
                        <View style={[styles.avatar, styles.skel]} />
                        <View style={[styles.cardInfo, { gap: Spacing.sm }]}>
                              <View style={[styles.skel, { height: 16, width: '60%' }]} />
                              <View style={[styles.skel, { height: 12, width: '40%' }]} />
                              <View style={[styles.skel, { height: 12, width: '80%' }]} />
                        </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={[styles.skel, { height: 36, width: '100%', borderRadius: BorderRadius.full }]} />
            </Animated.View>
      );
};

interface EmptyStateProps {
      filter: FilterKey;
      onExplore?: () => void;
}

const EmptyState = ({ filter, onExplore }: EmptyStateProps) => {
      const isAll = filter === 'all';
      return (
            <View style={styles.emptyWrap}>
                  <View style={styles.emptyDiya}>
                        <Text style={styles.emptyEmoji}>🪔</Text>
                  </View>
                  <Text style={styles.emptyTitle}>
                        {isAll ? 'No bookings yet' : `No ${STATUS_CONFIG[filter as BookingStatus].label.toLowerCase()} bookings`}
                  </Text>
                  <Text style={styles.emptySub}>
                        {isAll
                              ? 'Find a pandit for your next pooja and your bookings will show up here.'
                              : 'Bookings with this status will appear here.'}
                  </Text>
                  {isAll && onExplore && (
                        <View style={{ marginTop: Spacing.lg }}>
                              <ActionButton label="Find a pandit" variant="primary" onPress={onExplore} />
                        </View>
                  )}
            </View>
      );
};

const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
      <View style={styles.emptyWrap}>
            <View style={[styles.emptyDiya, { backgroundColor: '#FFEBEE' }]}>
                  <Text style={styles.emptyEmoji}>⚠️</Text>
            </View>
            <Text style={styles.emptyTitle}>Couldn't load your bookings</Text>
            <Text style={styles.emptySub}>{message}</Text>
            {onRetry && (
                  <View style={{ marginTop: Spacing.lg }}>
                        <ActionButton label="Try again" variant="primary" onPress={onRetry} />
                  </View>
            )}
      </View>
);

/* -------------------------------------------------------------------------- */
/*                                   Screen                                   */
/* -------------------------------------------------------------------------- */
type Props = DrawerScreenProps<DrawerParamList, 'Bookings'>;

const MyBookingsScreen = ({ navigation }: Props) => {
      const [bookings, setBookings] = useState<IUserBookingView[]>([]);
      const [filter, setFilter] = useState<FilterKey>('all');
      const [isLoading, setIsLoading] = useState<boolean>(false);
      const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
      const [errorMessage, setErrorMessage] = useState<string | null>(null);
      const rootNav = navigation.getParent<NativeStackNavigationProp<RootParamList>>();

      const onRefresh = () => { }
      const onRetry = () => { }
      const onPressDetails = (b: any) => {
            rootNav.navigate('BookingDetail', {
                  booking:b,
                  onClose: () => rootNav.goBack(),
                  onPressProfile: () => rootNav.goBack(),
                  onCancelBooking: () => onCancelBooking(b._id),
            });
      }
      const onPressCall = (b: any) => {
            const phoneNumber = b.pandit.contact.phone;
            Linking.openURL(`tel:${phoneNumber}`);
      }
      const onCancelBooking = async (id: any) => {
            const response = await bookingAPI.cancel(id);
            if (response.data?.success) {
                  Alert.alert('Booking cancelled', 'Your booking has been successfully cancelled.');
                  fetchBookings();
            }
      }
      const onPressReview = (b: any) => { }
      const onPressExplore = () => { }

      useEffect(() => {
            fetchBookings();
      }, []);

      const fetchBookings = async () => {
            try {
                  setIsLoading(true);
                  const response = await bookingAPI.myBookings();
                  setBookings(response.data?.bookings || []);
            } finally {
                  setIsLoading(false);
            }
      }

      const counts = useMemo(() => {
            const base: Record<FilterKey, number> = {
                  all: bookings.length,
                  pending: 0,
                  confirmed: 0,
                  completed: 0,
                  rejected: 0,
                  cancelled: 0,
            };
            bookings.forEach((b) => {
                  base[normalizeStatus(b.status)] += 1;
            });
            return base;
      }, [bookings]);

      const visible = useMemo(() => {
            const list = filter === 'all' ? bookings : bookings.filter((b) => normalizeStatus(b.status) === filter);
            return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }, [bookings, filter]);

      const nextPooja = useMemo<IUserBookingView | null>(() => {
            const upcoming = bookings
                  .filter((b) => {
                        const s = normalizeStatus(b.status);
                        const d = getDaysLeft(b.poojaDate);
                        return (s === 'pending' || s === 'confirmed') && d !== null && d >= 0;
                  })
                  .sort((a, b) => a.poojaDate.localeCompare(b.poojaDate));
            return upcoming[0] ?? null;
      }, [bookings]);

      const handleCall = useCallback(
            (b: IUserBookingView) => {
                  if (onPressCall) return onPressCall(b);
                  const phone = b.pandit.contact.phone;
                  if (phone) void Linking.openURL(`tel:${phone}`);
            },
            [onPressCall],
      );

      const handleCancel = useCallback(
            (b: IUserBookingView) => {
                  Alert.alert('Cancel this booking?', `${b.poojaType} on ${formatDate(b.poojaDate)} will be cancelled.`, [
                        { text: 'Keep booking', style: 'cancel' },
                        { text: 'Cancel booking', style: 'destructive', onPress: () => onCancelBooking?.(b._id) },
                  ]);
            },
            [onCancelBooking],
      );

      const handleDetails = useCallback((b: IUserBookingView) => onPressDetails?.(b), [onPressDetails]);
      const handleReview = useCallback((b: IUserBookingView) => onPressReview?.(b), [onPressReview]);

      const renderItem: ListRenderItem<IUserBookingView> = useCallback(
            ({ item, index }) => (
                  <BookingCard
                        booking={item}
                        index={index}
                        onDetails={handleDetails}
                        onCall={handleCall}
                        onCancel={handleCancel}
                        onReview={handleReview}
                  />
            ),
            [handleDetails, handleCall, handleCancel, handleReview],
      );

      const showNext = nextPooja !== null && (filter === 'all' || filter === 'pending' || filter === 'confirmed');

      return (
            <View style={styles.screen}>
                  <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

                  {/* Header */}
                  <View style={styles.header}>
                        <View style={styles.headerGlow} />
                        <Text style={styles.headerTitle}>My Bookings</Text>
                        <Text style={styles.headerSub}>Manage your pandit bookings</Text>
                  </View>

                  {/* Filters */}
                  <View style={styles.filterCard}>
                        <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.filterContent}
                        >
                              {FILTERS.map((f) => (
                                    <FilterChip
                                          key={f.key}
                                          label={f.label}
                                          count={counts[f.key]}
                                          active={filter === f.key}
                                          onPress={() => setFilter(f.key)}
                                    />
                              ))}
                        </ScrollView>
                  </View>

                  {/* Body */}
                  {isLoading ? (
                        <View style={styles.listContent}>
                              <SkeletonCard />
                              <SkeletonCard />
                              <SkeletonCard />
                        </View>
                  ) : errorMessage ? (
                        <ErrorState message={errorMessage} onRetry={onRetry} />
                  ) : (
                        <FlatList
                              data={visible}
                              keyExtractor={(item) => item._id}
                              renderItem={renderItem}
                              contentContainerStyle={styles.listContent}
                              showsVerticalScrollIndicator={false}
                              ListHeaderComponent={
                                    showNext && nextPooja ? (
                                          <NextPoojaCard booking={nextPooja} onPress={() => onPressDetails?.(nextPooja)} />
                                    ) : null
                              }
                              ListEmptyComponent={<EmptyState filter={filter} onExplore={onPressExplore} />}
                              refreshControl={
                                    onRefresh ? (
                                          <RefreshControl
                                                refreshing={isRefreshing}
                                                onRefresh={onRefresh}
                                                tintColor={Colors.primary}
                                                colors={[Colors.primary]}
                                          />
                                    ) : undefined
                              }
                        />
                  )}
            </View>
      );
};

export default MyBookingsScreen;

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
      screen: { flex: 1, backgroundColor: Colors.background },

      /* header */
      header: {
            backgroundColor: Colors.secondary,
            paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.lg,
            paddingHorizontal: Spacing.xxl,
            paddingBottom: Spacing.section + Spacing.sm,
            borderBottomLeftRadius: BorderRadius.xl,
            borderBottomRightRadius: BorderRadius.xl,
            overflow: 'hidden',
      },
      headerGlow: {
            position: 'absolute',
            right: -50,
            top: -40,
            width: 190,
            height: 190,
            borderRadius: 95,
            backgroundColor: Colors.primary,
            opacity: 0.35,
      },
      headerTitle: {
            fontSize: Fonts.sizes.xxxl,
            fontWeight: '800',
            color: Colors.textLight,
            letterSpacing: 0.2,
      },
      headerSub: {
            marginTop: Spacing.xs,
            fontSize: Fonts.sizes.md,
            color: Colors.goldLight,
      },

      /* filters */
      filterCard: {
            marginTop: -Spacing.xxl,
            marginHorizontal: Spacing.lg,
            backgroundColor: Colors.cardBg,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: Colors.border,
            ...Shadow.md,
      },
      filterContent: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.md,
            gap: Spacing.sm,
      },
      chip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 2,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.saffronBg,
      },
      chipActive: {
            backgroundColor: Colors.primary,
            ...Shadow.sm,
            shadowColor: Colors.primary,
            shadowOpacity: 0.35,
      },
      chipText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
      chipTextActive: { color: Colors.textLight },
      chipCount: {
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            paddingHorizontal: 5,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.border,
      },
      chipCountActive: { backgroundColor: Colors.textLight },
      chipCountText: { fontSize: Fonts.sizes.xs, fontWeight: '800', color: Colors.textSecondary },

      /* list */
      listContent: {
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.lg,
            paddingBottom: Spacing.section + Spacing.xxl,
      },

      /* next pooja */
      nextCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.darkBg,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: Colors.goldDark,
            ...Shadow.md,
      },
      nextWatermark: {
            position: 'absolute',
            right: -6,
            bottom: -34,
            fontSize: 110,
            color: Colors.gold,
            opacity: 0.12,
      },
      nextLeft: { flex: 1, paddingRight: Spacing.md },
      nextEyebrow: { fontSize: Fonts.sizes.sm, color: Colors.goldLight, fontWeight: '600' },
      nextTitle: {
            marginTop: Spacing.xs,
            fontSize: Fonts.sizes.xl,
            fontWeight: '800',
            color: Colors.textLight,
      },
      nextSub: { marginTop: 2, fontSize: Fonts.sizes.md, color: Colors.lotusLight },
      nextRight: { alignItems: 'flex-end' },
      nextDays: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.gold },
      nextDate: { marginTop: 2, fontSize: Fonts.sizes.sm, color: Colors.textMuted },

      /* card */
      card: {
            backgroundColor: Colors.cardBg,
            borderRadius: BorderRadius.lg,
            padding: Spacing.lg,
            paddingLeft: Spacing.lg + Spacing.xs,
            marginBottom: Spacing.lg,
            borderWidth: 1,
            borderColor: Colors.border,
            overflow: 'hidden',
            ...Shadow.sm,
      },
      cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
      cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
      avatar: {
            width: 72,
            height: 72,
            borderRadius: BorderRadius.lg,
            borderWidth: 2,
            borderColor: Colors.goldLight,
            backgroundColor: Colors.saffronBg,
      },
      avatarFallback: { alignItems: 'center', justifyContent: 'center' },
      avatarInitials: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.primaryDark },
      cardInfo: { flex: 1, marginLeft: Spacing.md },
      titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
      poojaTitle: {
            flexShrink: 1,
            fontSize: Fonts.sizes.lg,
            fontWeight: '800',
            color: Colors.textPrimary,
      },
      panditName: {
            marginTop: 2,
            fontSize: Fonts.sizes.md,
            fontWeight: '600',
            color: Colors.textSecondary,
      },
      metaWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm, gap: Spacing.sm },
      metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '100%' },
      metaIcon: { fontSize: Fonts.sizes.md },
      metaText: { fontSize: Fonts.sizes.sm + 1, color: Colors.textMuted, flexShrink: 1 },

      badge: {
            paddingHorizontal: Spacing.sm + 2,
            paddingVertical: 3,
            borderRadius: BorderRadius.full,
            borderWidth: 1,
      },
      badgeText: { fontSize: Fonts.sizes.xs + 1, fontWeight: '800', letterSpacing: 0.3 },

      divider: {
            height: 1,
            marginVertical: Spacing.md,
            backgroundColor: Colors.border,
            opacity: 0.7,
      },

      priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
      priceLabel: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
      priceValue: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.tulsi },
      payPill: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.xs + 2,
            borderRadius: BorderRadius.full,
      },
      payText: { fontSize: Fonts.sizes.sm, fontWeight: '700' },

      actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
      actionBtn: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: Spacing.sm + 3,
            borderRadius: BorderRadius.full,
            borderWidth: 1,
      },
      actionEmoji: { fontSize: Fonts.sizes.md },
      actionText: { fontSize: Fonts.sizes.md, fontWeight: '800' },

      /* skeleton */
      skel: { backgroundColor: Colors.border, borderRadius: BorderRadius.sm },

      /* empty / error */
      emptyWrap: {
            alignItems: 'center',
            paddingHorizontal: Spacing.xxxl,
            paddingTop: Spacing.section + Spacing.xxl,
      },
      emptyDiya: {
            width: 96,
            height: 96,
            borderRadius: 48,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      emptyEmoji: { fontSize: 44 },
      emptyTitle: {
            marginTop: Spacing.xl,
            fontSize: Fonts.sizes.xl,
            fontWeight: '800',
            color: Colors.textPrimary,
            textAlign: 'center',
      },
      emptySub: {
            marginTop: Spacing.sm,
            fontSize: Fonts.sizes.md,
            lineHeight: 21,
            color: Colors.textMuted,
            textAlign: 'center',
      },
});

/* -------------------------------------------------------------------------- */
/*              Demo data – delete once you pass real `bookings`              */
/* -------------------------------------------------------------------------- */

const inDays = (n: number): string => new Date(Date.now() + n * DAY_MS).toISOString();

const baseLocation = {
      address: '12, Arera Colony',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      pincode: '462016',
      landmark: 'Near Shiv Mandir',
};

const baseRequirements = {
      samagriNeeded: true,
      numberOfPeople: 6,
      specialInstructions: '',
      language: 'Hindi',
};
