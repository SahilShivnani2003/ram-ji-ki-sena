import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../theme';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ComingSoonScreenProps {
  title?: string; // feature name e.g. "Live Katha"
  description?: string; // one-liner about the feature
  icon?: string; // emoji icon
  onBack?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ComingSoonScreen({
  title = 'Coming Soon',
  description = 'We are preparing something sacred for you.',
  icon = '🕌',
  onBack,
}: ComingSoonScreenProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [notified, setNotified] = useState(false);
  const [focused, setFocused] = useState(false);

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const tickAnim = useRef(new Animated.Value(0)).current;

  // Rotating mandala
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // Pulsing glow on icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Ripple ring on notify
  const triggerRing = () => {
    ringAnim.setValue(0);
    Animated.timing(ringAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.6, 0.3, 0],
  });

  // ── Notify handler ────────────────────────────────────────────────────────
  const handleNotify = () => {
    if (!email) {
      setEmailError('Enter your mobile or email');
      return;
    }
    if (!/^\d{10}$/.test(email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid mobile number or email');
      return;
    }
    setEmailError('');
    triggerRing();
    Animated.spring(tickAnim, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setNotified(true);
  };

  // ── Feature highlights ────────────────────────────────────────────────────
  const features = [
    { icon: 'musical-notes-outline', text: 'Live Bhajans & Kirtans' },
    { icon: 'videocam-outline', text: 'HD Aarti Livestreams' },
    { icon: 'people-outline', text: 'Sangha Community' },
    { icon: 'calendar-outline', text: 'Festival Reminders' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBg} />

      <LinearGradient
        colors={[Colors.darkBg, '#2D0D00', Colors.darkBg]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top band */}
      <LinearGradient
        colors={Colors.gradientRam as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBand}
      />

      {/* Back */}
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={Colors.textMuted} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Rotating mandala bg */}
      <Animated.View
        style={[styles.mandalaWrap, { transform: [{ rotate: spin }] }]}
      >
        <View style={styles.mandalaSvgWrap}>
          {[140, 110, 80, 50].map((r, i) => (
            <View
              key={i}
              style={[
                styles.mandalaRing,
                {
                  width: r * 2,
                  height: r * 2,
                  borderRadius: r,
                  borderColor:
                    i % 2 === 0 ? Colors.gold + '22' : Colors.primary + '18',
                },
              ]}
            />
          ))}
          {/* Spokes */}
          {[0, 45, 90, 135].map(angle => (
            <View
              key={angle}
              style={[styles.spoke, { transform: [{ rotate: `${angle}deg` }] }]}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Icon with pulse + ring */}
        <View style={styles.iconWrap}>
          <Animated.View
            style={[
              styles.ringOuter,
              { transform: [{ scale: ringScale }], opacity: ringOpacity },
            ]}
          />
          <Animated.View
            style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}
          >
            <LinearGradient
              colors={Colors.gradientRam as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Text style={styles.iconEmoji}>{icon}</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Text */}
        <Text style={styles.comingSoonBadge}>COMING SOON</Text>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{description}</Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureDot}>
                <Ionicons
                  name={f.icon as any}
                  size={13}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Notify me */}
        <View style={styles.notifyCard}>
          {!notified ? (
            <>
              <Text style={styles.notifyTitle}>Get Notified</Text>
              <Text style={styles.notifySubtitle}>
                Be the first to know when it launches
              </Text>
              <View
                style={[
                  styles.notifyRow,
                  focused && styles.notifyRowFocused,
                  !!emailError && styles.notifyRowError,
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={16}
                  color={focused ? Colors.primary : Colors.textMuted}
                  style={styles.notifyIcon}
                />
                <TextInput
                  style={styles.notifyInput}
                  placeholder="Mobile number or email"
                  placeholderTextColor={Colors.textMuted + '88'}
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    setEmailError('');
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor={Colors.primary}
                  cursorColor={Colors.primary}
                />
              </View>
              {!!emailError && (
                <View style={styles.errorRow}>
                  <Ionicons
                    name="alert-circle"
                    size={11}
                    color={Colors.error}
                  />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={handleNotify}
                activeOpacity={0.85}
                style={styles.notifyBtnWrap}
              >
                <LinearGradient
                  colors={Colors.gradientRam as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.notifyBtn}
                >
                  <Ionicons
                    name="notifications"
                    size={15}
                    color={Colors.textLight}
                  />
                  <Text style={styles.notifyBtnText}>Notify Me</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <Animated.View
              style={[styles.successRow, { transform: [{ scale: tickAnim }] }]}
            >
              <View style={styles.successTick}>
                <Ionicons name="checkmark" size={22} color={Colors.textLight} />
              </View>
              <View>
                <Text style={styles.successTitle}>You're on the list!</Text>
                <Text style={styles.successSub}>
                  We'll notify you at launch 🙏
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* Bottom band */}
      <LinearGradient
        colors={[
          Colors.secondary,
          Colors.primary,
          Colors.gold,
          Colors.primary,
          Colors.secondary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomBand}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.darkBg },
  topBand: { height: 3, width: '100%' },
  bottomBand: { height: 3, width: '100%' },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: 4,
  },
  backText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },

  // Mandala background
  mandalaWrap: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaSvgWrap: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mandalaRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  spoke: {
    position: 'absolute',
    width: 280,
    height: 1,
    backgroundColor: Colors.gold + '14',
  },

  // Main content
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },

  // Icon
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  ringOuter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  iconCircle: { ...Shadow.lg },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 40 },

  // Text
  comingSoonBadge: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '700',
    color: Colors.textLight,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  divider: {
    width: 50,
    height: 1.5,
    backgroundColor: Colors.gold,
    opacity: 0.6,
    marginVertical: Spacing.md,
    borderRadius: 2,
  },
  description: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
    marginBottom: Spacing.xl,
  },

  // Feature list
  featureList: {
    width: '100%',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '18',
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Notify card
  notifyCard: {
    width: '100%',
    backgroundColor: '#2D0D00',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#CC996633',
    padding: Spacing.xl,
    ...Shadow.md,
  },
  notifyTitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    fontWeight: '700',
    marginBottom: 2,
  },
  notifySubtitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CC996644',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.darkBg,
    height: 48,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  notifyRowFocused: { borderColor: Colors.primary },
  notifyRowError: { borderColor: Colors.error },
  notifyIcon: { marginRight: Spacing.sm },
  notifyInput: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    fontWeight: '500',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.error,
    fontWeight: '600',
  },

  notifyBtnWrap: { marginTop: Spacing.xs },
  notifyBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  notifyBtnText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Success state
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  successTick: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  successTitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    fontWeight: '700',
  },
  successSub: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
