import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
      Alert,
      Animated,
      Image,
      Linking,
      Platform,
      Pressable,
      ScrollView,
      Share,
      StatusBar,
      StyleSheet,
      Text,
      View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/AppNavigator';
import { BorderRadius, Colors, Fonts, Shadow, Spacing } from '../theme/index';
import type { IUserBooking } from '../types/IBooking';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';

interface StatusConfig {
      label: string;
      color: string;
      bg: string;
      border: string;
      message: string;
}

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
      pending: {
            label: 'Pending',
            color: Colors.goldDark,
            bg: Colors.saffronBg,
            border: Colors.goldLight,
            message: 'Waiting for the pandit to confirm your booking.',
      },
      confirmed: {
            label: 'Confirmed',
            color: Colors.tulsi,
            bg: '#E8F5E9',
            border: Colors.tulsiLight,
            message: 'Your pandit has confirmed and will arrive at the scheduled time.',
      },
      completed: {
            label: 'Completed',
            color: Colors.info,
            bg: '#E3F2FD',
            border: '#90CAF9',
            message: 'This pooja has been completed. May it bring you peace and prosperity.',
      },
      rejected: {
            label: 'Rejected',
            color: Colors.error,
            bg: '#FFEBEE',
            border: '#EF9A9A',
            message: 'The pandit could not accept this booking. You can book another pandit.',
      },
      cancelled: {
            label: 'Cancelled',
            color: Colors.textMuted,
            bg: '#F5EFEA',
            border: Colors.border,
            message: 'This booking was cancelled.',
      },
};

const STEPS = ['Requested', 'Confirmed', 'Completed'] as const;
const STEP_INDEX: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 1,
      completed: 2,
      rejected: -1,
      cancelled: -1,
};

const MONTHS_LONG = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const GRADIENT_SEGMENTS = 40;

/*                                   Helpers                                  */
const normalizeStatus = (status: string): BookingStatus => {
      const s = status.toLowerCase();
      return s in STATUS_CONFIG ? (s as BookingStatus) : 'pending';
};

const parseDate = (value: string): Date | null => {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
};

const formatLongDate = (value: string): string => {
      const d = parseDate(value);
      if (!d) return value;
      return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const formatShortDate = (value: string): string => {
      const d = parseDate(value);
      if (!d) return value;
      return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

const formatINR = (amount: number): string => {
      const [int, dec] = amount.toFixed(2).split('.');
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3);
      const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
      return `₹${grouped}${dec === '00' ? '' : `.${dec}`}`;
};

const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const getInitials = (name: string): string =>
      name
            .replace(/^pt\.?\s*/i, '')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w.charAt(0).toUpperCase())
            .join('');

const hexToRgb = (hex: string): [number, number, number] => {
      const h = hex.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const mixHex = (from: string, to: string, t: number): string => {
      const a = hexToRgb(from);
      const b = hexToRgb(to);
      const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
      return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const openUrl = async (url: string, failMessage: string): Promise<void> => {
      try {
            const supported = await Linking.canOpenURL(url);
            if (!supported) throw new Error('unsupported');
            await Linking.openURL(url);
      } catch {
            Alert.alert('Something went wrong', failMessage);
      }
};

const digitsOnly = (s: string): string => s.replace(/[^\d]/g, '');

/** Dependency-free horizontal gradient (no linear-gradient package needed). */
const GradientBar = memo(({ from, to }: { from: string; to: string }) => (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.gradientRow}>
                  {Array.from({ length: GRADIENT_SEGMENTS }, (_, i) => (
                        <View
                              key={i}
                              style={{ flex: 1, backgroundColor: mixHex(from, to, i / (GRADIENT_SEGMENTS - 1)) }}
                        />
                  ))}
            </View>
      </View>
));

/** Fade + rise, once, staggered by `order`. */
const Reveal = ({ order, children }: { order: number; children: React.ReactNode }) => {
      const v = useRef(new Animated.Value(0)).current;
      useEffect(() => {
            Animated.timing(v, {
                  toValue: 1,
                  duration: 420,
                  delay: 120 + order * 90,
                  useNativeDriver: true,
            }).start();
      }, [v, order]);
      return (
            <Animated.View
                  style={{
                        opacity: v,
                        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
                  }}
            >
                  {children}
            </Animated.View>
      );
};

interface SectionProps {
      emoji: string;
      title: string;
      tint: string;
      borderColor: string;
      children: React.ReactNode;
}

const Section = ({ emoji, title, tint, borderColor, children }: SectionProps) => (
      <View style={[styles.section, { backgroundColor: tint, borderColor }]}>
            <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: Colors.cardBg, borderColor }]}>
                        <Text style={styles.sectionEmoji}>{emoji}</Text>
                  </View>
                  <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
      </View>
);

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
      <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={[styles.rowValue, strong && styles.rowValueStrong]} numberOfLines={2}>
                  {value}
            </Text>
      </View>
);

interface PillButtonProps {
      label: string;
      emoji?: string;
      bg: string;
      fg: string;
      border?: string;
      onPress: () => void;
      disabled?: boolean;
}

const PillButton = memo(({ label, emoji, bg, fg, border, onPress, disabled }: PillButtonProps) => (
      <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                  styles.pill,
                  { backgroundColor: bg, borderColor: border ?? bg },
                  pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
                  disabled && { opacity: 0.4 },
            ]}
      >
            {emoji ? <Text style={styles.pillEmoji}>{emoji}</Text> : null}
            <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
      </Pressable>
));

const StatusStepper = ({ status }: { status: BookingStatus }) => {
      const idx = STEP_INDEX[status];

      if (idx === -1) {
            const cfg = STATUS_CONFIG[status];
            return (
                  <View style={[styles.terminal, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                        <Text style={[styles.terminalText, { color: cfg.color }]}>{cfg.message}</Text>
                  </View>
            );
      }

      return (
            <View style={styles.stepper}>
                  {STEPS.map((label, i) => {
                        const done = i < idx || status === 'completed';
                        const current = i === idx && status !== 'completed';
                        return (
                              <React.Fragment key={label}>
                                    {i > 0 && (
                                          <View
                                                style={[
                                                      styles.stepLine,
                                                      { backgroundColor: i <= idx ? Colors.primary : Colors.border },
                                                ]}
                                          />
                                    )}
                                    <View style={styles.stepNode}>
                                          <View
                                                style={[
                                                      styles.stepDot,
                                                      done && styles.stepDotDone,
                                                      current && styles.stepDotCurrent,
                                                ]}
                                          >
                                                {done ? <Text style={styles.stepCheck}>✓</Text> : null}
                                                {current ? <View style={styles.stepInner} /> : null}
                                          </View>
                                          <Text style={[styles.stepLabel, (done || current) && styles.stepLabelActive]}>{label}</Text>
                                    </View>
                              </React.Fragment>
                        );
                  })}
            </View>
      );
};
type Props = NativeStackScreenProps<RootParamList, 'BookingDetail'>;
const BookingDetailsScreen = ({ navigation, route }: Props) => {
      const { booking,
            onClose,
            onPressProfile,
            onCancelBooking, } = route.params;
      const status = normalizeStatus(booking.status);
      const cfg = STATUS_CONFIG[status];
      const { pandit, location, requirements } = booking;

      const [gFrom = Colors.primary, gTo = Colors.secondary] = Colors.gradientRam;

      const isPaid = booking.payment.status.toLowerCase() === 'paid';
      const canCancel = status === 'pending' || status === 'confirmed';
      const canReview = status === 'completed' && !booking.isReviewed;

      const fullAddress = useMemo(
            () =>
                  [location.address, location.landmark, location.city, location.state, location.pincode]
                        .filter((p) => p.trim().length > 0)
                        .join(', '),
            [location],
      );

      const handleCall = () => void openUrl(`tel:${pandit.contact.phone}`, 'Could not open the phone dialer.');
      const handleWhatsApp = () =>
            void openUrl(
                  `https://wa.me/${digitsOnly(pandit.contact.whatsapp || pandit.contact.phone)}`,
                  'Could not open WhatsApp.',
            );
      const handleEmail = () => void openUrl(`mailto:${pandit.contact.email}`, 'Could not open your email app.');
      const handleMap = () =>
            void openUrl(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
                  'Could not open maps.',
            );

      const handleShare = async (): Promise<void> => {
            try {
                  await Share.share({
                        message:
                              `${booking.poojaType} with ${pandit.name}\n` +
                              `${formatLongDate(booking.poojaDate)}, ${booking.poojaTime}\n` +
                              `${fullAddress}\nBooking ID: ${booking._id}`,
                  });
            } catch {
                  /* user dismissed the sheet */
            }
      };

      const handleCancel = (): void => {
            Alert.alert('Cancel this booking?', `${booking.poojaType} on ${formatShortDate(booking.poojaDate)}.`, [
                  { text: 'Keep booking', style: 'cancel' },
                  {
                        text: 'Cancel booking',
                        style: 'destructive',
                        onPress: () => onCancelBooking?.(booking._id),
                  },
            ]);
      };

      return (
            <View style={styles.screen}>
                  <StatusBar barStyle="light-content" backgroundColor={gFrom} />

                  <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        bounces
                  >
                        {/* ---------------------------- Header / hero --------------------------- */}
                        <View style={styles.header}>
                              <GradientBar from={gFrom} to={gTo} />
                              <Text style={styles.headerWatermark}>ॐ</Text>

                              <View style={styles.headerTop}>
                                    <Text style={styles.headerTitle}>Booking Details</Text>
                                    <View style={styles.headerActions}>
                                          <Pressable
                                                onPress={() => void handleShare()}
                                                accessibilityRole="button"
                                                accessibilityLabel="Share booking"
                                                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                                          >
                                                <Text style={styles.iconBtnText}>⤴</Text>
                                          </Pressable>
                                          <Pressable
                                                onPress={onClose}
                                                accessibilityRole="button"
                                                accessibilityLabel="Close"
                                                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                                          >
                                                <Text style={styles.iconBtnText}>✕</Text>
                                          </Pressable>
                                    </View>
                              </View>

                              <Text style={styles.heroPooja} numberOfLines={2}>
                                    {booking.poojaType}
                              </Text>
                              <Text style={styles.heroWhen}>
                                    {formatLongDate(booking.poojaDate)}
                              </Text>
                              <Text style={styles.heroTime}>
                                    {booking.poojaTime}
                                    {booking.duration ? `  ·  ${booking.duration}` : ''}
                              </Text>
                        </View>

                        <View style={styles.body}>
                              {/* ------------------------------ Status ------------------------------ */}
                              <Reveal order={0}>
                                    <View style={[styles.statusCard, Shadow.md]}>
                                          <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                                                <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                                                <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                                          </View>
                                          <StatusStepper status={status} />
                                          {STEP_INDEX[status] !== -1 && <Text style={styles.statusMessage}>{cfg.message}</Text>}
                                    </View>
                              </Reveal>

                              {/* ------------------------------ Pandit ------------------------------ */}
                              <Reveal order={1}>
                                    <Section
                                          emoji="🙏"
                                          title="Your pandit"
                                          tint={Colors.saffronBg}
                                          borderColor={Colors.border}
                                    >
                                          <View style={styles.panditRow}>
                                                {pandit.photo ? (
                                                      <Image source={{ uri: pandit.photo }} style={styles.avatar} />
                                                ) : (
                                                      <View style={[styles.avatar, styles.avatarFallback]}>
                                                            <Text style={styles.avatarInitials}>{getInitials(pandit.name) || '🙏'}</Text>
                                                      </View>
                                                )}
                                                <View style={styles.panditInfo}>
                                                      <Text style={styles.panditName} numberOfLines={1}>
                                                            {pandit.name}
                                                      </Text>
                                                      <View style={styles.ratingPill}>
                                                            <Text style={styles.ratingText}>⭐ {pandit.averageRating.toFixed(1)}</Text>
                                                      </View>
                                                      <Text style={styles.panditMeta} numberOfLines={1}>
                                                            📞 {pandit.contact.phone}
                                                      </Text>
                                                      <Text style={styles.panditMeta} numberOfLines={1}>
                                                            📍 {pandit.location.city}, {pandit.location.state}
                                                      </Text>
                                                </View>
                                          </View>

                                          <View style={styles.btnRow}>
                                                <PillButton
                                                      label="Profile"
                                                      emoji="👤"
                                                      bg={Colors.primary}
                                                      fg={Colors.textLight}
                                                      onPress={() => onPressProfile?.(pandit._id)}
                                                      disabled={!onPressProfile}
                                                />
                                                <PillButton
                                                      label="Call"
                                                      emoji="📞"
                                                      bg={Colors.tulsi}
                                                      fg={Colors.textLight}
                                                      onPress={handleCall}
                                                      disabled={!pandit.contact.phone}
                                                />
                                          </View>
                                          <View style={[styles.btnRow, { marginTop: Spacing.sm }]}>
                                                <PillButton
                                                      label="WhatsApp"
                                                      emoji="💬"
                                                      bg={Colors.cardBg}
                                                      fg={Colors.tulsi}
                                                      border={Colors.tulsiLight}
                                                      onPress={handleWhatsApp}
                                                      disabled={!pandit.contact.whatsapp && !pandit.contact.phone}
                                                />
                                                <PillButton
                                                      label="Email"
                                                      emoji="✉️"
                                                      bg={Colors.cardBg}
                                                      fg={Colors.secondary}
                                                      border={Colors.border}
                                                      onPress={handleEmail}
                                                      disabled={!pandit.contact.email}
                                                />
                                          </View>
                                    </Section>
                              </Reveal>

                              {/* --------------------------- Pooja details -------------------------- */}
                              <Reveal order={2}>
                                    <Section emoji="🪔" title="Pooja details" tint="#FFFDF5" borderColor={Colors.goldLight}>
                                          <Row label="Pooja type" value={booking.poojaType} strong />
                                          <Row label="Date" value={formatLongDate(booking.poojaDate)} />
                                          <Row label="Time" value={booking.poojaTime} />
                                          {booking.duration ? <Row label="Duration" value={booking.duration} /> : null}
                                          <Row label="Language" value={requirements.language || '—'} />
                                          <Row label="People attending" value={String(requirements.numberOfPeople)} />
                                          <Row label="Samagri" value={requirements.samagriNeeded ? 'Pandit brings it' : 'Not needed'} />

                                          {requirements.specialInstructions.trim().length > 0 && (
                                                <View style={styles.note}>
                                                      <Text style={styles.noteLabel}>Your instructions</Text>
                                                      <Text style={styles.noteText}>{requirements.specialInstructions}</Text>
                                                </View>
                                          )}
                                    </Section>
                              </Reveal>

                              {/* ------------------------------ Payment ----------------------------- */}
                              {/* <Reveal order={3}>
                                    <Section emoji="₹" title="Payment" tint="#F3F9FF" borderColor="#BBDEFB">
                                          <Row label="Pooja fee" value={formatINR(booking.price)} />
                                          <Row label="Platform fee" value={formatINR(booking.platformFee)} />
                                          <View style={styles.dashed} />
                                          <View style={styles.totalRow}>
                                                <View>
                                                      <Text style={styles.totalLabel}>Total amount</Text>
                                                      <View
                                                            style={[
                                                                  styles.payPill,
                                                                  { backgroundColor: isPaid ? '#E8F5E9' : Colors.saffronBg },
                                                            ]}
                                                      >
                                                            <Text style={[styles.payText, { color: isPaid ? Colors.tulsi : Colors.goldDark }]}>
                                                                  {capitalize(booking.payment.status)}
                                                            </Text>
                                                      </View>
                                                </View>
                                                <Text style={styles.totalValue}>{formatINR(booking.totalAmount)}</Text>
                                          </View>
                                    </Section>
                              </Reveal> */}

                              {/* ------------------------------ Location ---------------------------- */}
                              <Reveal order={4}>
                                    <Section emoji="📍" title="Pooja location" tint="#F1FBF2" borderColor={Colors.tulsiLight}>
                                          <Text style={styles.addressMain}>{location.address}</Text>
                                          {location.landmark.trim().length > 0 && (
                                                <Text style={styles.addressSub}>Landmark: {location.landmark}</Text>
                                          )}
                                          <Text style={styles.addressSub}>
                                                {location.city}, {location.state} {location.pincode}
                                          </Text>
                                          <View style={{ marginTop: Spacing.md }}>
                                                <PillButton
                                                      label="Open in Maps"
                                                      emoji="🗺️"
                                                      bg={Colors.cardBg}
                                                      fg={Colors.tulsi}
                                                      border={Colors.tulsiLight}
                                                      onPress={handleMap}
                                                />
                                          </View>
                                    </Section>
                              </Reveal>

                              {/* ---------------------------- Booking info -------------------------- */}
                              <Reveal order={5}>
                                    <View style={styles.infoCard}>
                                          <Text style={styles.infoTitle}>Booking info</Text>
                                          <Text style={styles.infoLine} selectable>
                                                <Text style={styles.infoKey}>ID: </Text>
                                                {booking._id}
                                          </Text>
                                          <Text style={styles.infoLine}>
                                                <Text style={styles.infoKey}>Booked on: </Text>
                                                {formatShortDate(booking.createdAt)}
                                          </Text>
                                          <Text style={styles.infoLine}>
                                                <Text style={styles.infoKey}>Last updated: </Text>
                                                {formatShortDate(booking.updatedAt)}
                                          </Text>
                                    </View>
                              </Reveal>
                        </View>
                  </ScrollView>

                  {/* ------------------------------ Bottom bar ----------------------------- */}
                  <View style={styles.bottomBar}>
                        {canCancel && (
                              <PillButton
                                    label="Cancel booking"
                                    bg={Colors.cardBg}
                                    fg={Colors.error}
                                    border={Colors.error}
                                    onPress={handleCancel}
                              />
                        )}
                        {canReview && (
                              <PillButton
                                    label="Rate pandit"
                                    emoji="⭐"
                                    bg={Colors.goldLight}
                                    fg={Colors.textPrimary}
                                    border={Colors.gold}
                                    onPress={() => console.log('')}
                              />
                        )}
                        {/* <PillButton label="Close" bg={Colors.textPrimary} fg={Colors.textLight} onPress={onClose} /> */}
                  </View>
            </View>
      );
};

export default BookingDetailsScreen;


const styles = StyleSheet.create({
      screen: { flex: 1, backgroundColor: Colors.background },
      scrollContent: { paddingBottom: 130 },

      /* header */
      header: {
            paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.sm,
            paddingHorizontal: Spacing.xxl,
            paddingBottom: Spacing.section + Spacing.xl,
            borderBottomLeftRadius: BorderRadius.xl,
            borderBottomRightRadius: BorderRadius.xl,
            overflow: 'hidden',
            backgroundColor: Colors.primary,
      },
      gradientRow: { flex: 1, flexDirection: 'row' },
      headerWatermark: {
            position: 'absolute',
            right: -10,
            bottom: -40,
            fontSize: 170,
            color: Colors.textLight,
            opacity: 0.12,
      },
      headerTop: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: Spacing.xl,
      },
      headerTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textLight },
      headerActions: { flexDirection: 'row', gap: Spacing.sm },
      iconBtn: {
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.22)',
      },
      iconBtnText: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textLight },
      heroPooja: {
            fontSize: Fonts.sizes.hero,
            lineHeight: 42,
            fontWeight: '800',
            color: Colors.textLight,
      },
      heroWhen: {
            marginTop: Spacing.sm,
            fontSize: Fonts.sizes.lg,
            fontWeight: '600',
            color: Colors.goldLight,
      },
      heroTime: { marginTop: 2, fontSize: Fonts.sizes.md, color: Colors.textLight, opacity: 0.9 },

      /* body */
      body: { paddingHorizontal: Spacing.lg, marginTop: -Spacing.xxl, gap: Spacing.lg },

      /* status */
      statusCard: {
            backgroundColor: Colors.cardBg,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: Spacing.xl,
            alignItems: 'center',
      },
      statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderRadius: BorderRadius.full,
            borderWidth: 1.5,
      },
      statusDot: { width: 8, height: 8, borderRadius: 4 },
      statusBadgeText: { fontSize: Fonts.sizes.lg, fontWeight: '800' },
      statusMessage: {
            marginTop: Spacing.md,
            fontSize: Fonts.sizes.md,
            lineHeight: 20,
            color: Colors.textSecondary,
            textAlign: 'center',
      },

      stepper: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: Spacing.xl,
            paddingHorizontal: Spacing.sm,
      },
      stepNode: { alignItems: 'center', width: 70 },
      stepLine: { flex: 1, height: 3, borderRadius: 2, marginTop: 11 },
      stepDot: {
            width: 26,
            height: 26,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.cardBg,
            borderWidth: 2,
            borderColor: Colors.border,
      },
      stepDotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      stepDotCurrent: { borderColor: Colors.primary },
      stepInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
      stepCheck: { fontSize: Fonts.sizes.sm, fontWeight: '900', color: Colors.textLight },
      stepLabel: {
            marginTop: Spacing.xs + 2,
            fontSize: Fonts.sizes.sm,
            fontWeight: '600',
            color: Colors.textMuted,
      },
      stepLabelActive: { color: Colors.textPrimary, fontWeight: '800' },
      terminal: {
            marginTop: Spacing.lg,
            padding: Spacing.md,
            borderRadius: BorderRadius.md,
            borderWidth: 1,
            width: '100%',
      },
      terminalText: { fontSize: Fonts.sizes.md, lineHeight: 20, textAlign: 'center', fontWeight: '600' },

      /* sections */
      section: {
            borderRadius: BorderRadius.xl,
            borderWidth: 1.5,
            padding: Spacing.xl,
      },
      sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
      sectionIcon: {
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
      },
      sectionEmoji: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
      sectionTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },

      row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: Spacing.lg,
            paddingVertical: Spacing.sm,
      },
      rowLabel: { fontSize: Fonts.sizes.md + 1, fontWeight: '700', color: Colors.textSecondary },
      rowValue: {
            flex: 1,
            textAlign: 'right',
            fontSize: Fonts.sizes.md + 1,
            fontWeight: '600',
            color: Colors.textPrimary,
      },
      rowValueStrong: { fontWeight: '800', color: Colors.primaryDark },

      note: {
            marginTop: Spacing.md,
            padding: Spacing.md,
            borderRadius: BorderRadius.md,
            backgroundColor: Colors.saffronBg,
            borderLeftWidth: 4,
            borderLeftColor: Colors.gold,
      },
      noteLabel: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.goldDark },
      noteText: { marginTop: 2, fontSize: Fonts.sizes.md, lineHeight: 20, color: Colors.textSecondary },

      /* pandit */
      panditRow: { flexDirection: 'row', alignItems: 'center' },
      avatar: {
            width: 84,
            height: 84,
            borderRadius: BorderRadius.lg,
            borderWidth: 3,
            borderColor: Colors.gold,
            backgroundColor: Colors.cardBg,
      },
      avatarFallback: { alignItems: 'center', justifyContent: 'center' },
      avatarInitials: { fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.primaryDark },
      panditInfo: { flex: 1, marginLeft: Spacing.lg, gap: 3 },
      panditName: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },
      ratingPill: {
            alignSelf: 'flex-start',
            paddingHorizontal: Spacing.sm,
            paddingVertical: 2,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.cardBg,
            borderWidth: 1,
            borderColor: Colors.goldLight,
      },
      ratingText: { fontSize: Fonts.sizes.sm + 1, fontWeight: '800', color: Colors.goldDark },
      panditMeta: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },

      btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
      pill: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: Spacing.md + 1,
            borderRadius: BorderRadius.full,
            borderWidth: 1.5,
      },
      pillEmoji: { fontSize: Fonts.sizes.md + 1 },
      pillText: { fontSize: Fonts.sizes.md + 1, fontWeight: '800' },

      /* payment */
      dashed: {
            marginVertical: Spacing.md,
            height: 0,
            borderTopWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: '#90CAF9',
      },
      totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      totalLabel: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
      totalValue: { fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.tulsi },
      payPill: {
            alignSelf: 'flex-start',
            marginTop: Spacing.xs + 2,
            paddingHorizontal: Spacing.md,
            paddingVertical: 3,
            borderRadius: BorderRadius.full,
      },
      payText: { fontSize: Fonts.sizes.sm, fontWeight: '800' },

      /* location */
      addressMain: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
      addressSub: { marginTop: 3, fontSize: Fonts.sizes.md, color: Colors.textSecondary },

      /* info */
      infoCard: {
            borderRadius: BorderRadius.lg,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.cardBg,
            padding: Spacing.lg,
            gap: 4,
      },
      infoTitle: {
            marginBottom: Spacing.xs,
            fontSize: Fonts.sizes.md,
            fontWeight: '800',
            color: Colors.textMuted,
      },
      infoLine: { fontSize: Fonts.sizes.sm + 1, color: Colors.textSecondary },
      infoKey: { fontWeight: '800', color: Colors.textPrimary },

      /* bottom bar */
      bottomBar: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.lg,
            backgroundColor: Colors.cardBg,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            ...Shadow.lg,
      },
});