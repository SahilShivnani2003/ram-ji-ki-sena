import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow, SacredSymbols } from '../theme/colors';

// ─── Prop Types ──────────────────────────────────────────────────

interface SaffronButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
  small?: boolean;
  icon?: string;
}

interface CrimsonButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  icon?: string;
}

interface GoldOutlineButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

interface SpiritualBadgeProps {
  label: string;
  icon?: string;
  color?: string;
  bg?: string;
}

interface SacredCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glow?: boolean;
}

interface SectionHeaderProps {
  title: string;
  titleHindi?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface RatingStarsProps {
  rating: number;
  count?: number;
}

interface AvatarCircleProps {
  initials: string;
  size?: number;
  gradient?: string[];
}

interface StatCardProps {
  value: string;
  label: string;
  icon: string;
  color?: string;
}

interface MantraCardProps {
  mantra: string;
  source: string;
}

interface SpiritualInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  leftIcon?: string;
}

// ─── Saffron Primary Button ──────────────────────────────────────
export const SaffronButton: React.FC<SaffronButtonProps> = ({
  title,
  onPress,
  loading,
  style,
  small,
  icon,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
    <LinearGradient
      colors={[Colors.saffronDark, Colors.saffron, Colors.saffronLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.saffronBtn, small && styles.saffronBtnSmall, Shadow.gold]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={[styles.saffronBtnText, small && styles.saffronBtnTextSmall]}>
          {icon ? `${icon} ` : ''}{title}
        </Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

// ─── Crimson Secondary Button ────────────────────────────────────
export const CrimsonButton: React.FC<CrimsonButtonProps> = ({ title, onPress, style, icon }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
    <LinearGradient
      colors={Colors.gradientCrimson}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.crimsonBtn, Shadow.crimson]}
    >
      <Text style={styles.crimsonBtnText}>{icon ? `${icon} ` : ''}{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// ─── Gold Outline Button ─────────────────────────────────────────
export const GoldOutlineButton: React.FC<GoldOutlineButtonProps> = ({ title, onPress, style }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.goldOutlineBtn, style]}
  >
    <Text style={styles.goldOutlineBtnText}>{title}</Text>
  </TouchableOpacity>
);

// ─── Spiritual Badge ─────────────────────────────────────────────
export const SpiritualBadge: React.FC<SpiritualBadgeProps> = ({ label, icon, color, bg }) => (
  <View style={[styles.spiritualBadge, { backgroundColor: bg ?? Colors.creamDeep, borderColor: color ?? Colors.saffron }]}>
    {icon && <Text style={styles.badgeIcon}>{icon}</Text>}
    <Text style={[styles.badgeText, { color: color ?? Colors.saffron }]}>{label}</Text>
  </View>
);

// ─── Sacred Card ─────────────────────────────────────────────────
export const SacredCard: React.FC<SacredCardProps> = ({ children, style, onPress, glow }) => {
  const content = (
    <View style={[styles.sacredCard, glow ? Shadow.gold : undefined, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

// ─── Section Header ──────────────────────────────────────────────
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  titleHindi,
  actionLabel,
  onAction,
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <View style={styles.sectionFlag}>
        <Text style={styles.sectionFlagSymbol}>🚩</Text>
      </View>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {titleHindi && <Text style={styles.sectionTitleHindi}>{titleHindi}</Text>}
      </View>
    </View>
    {actionLabel && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.sectionAction}>{actionLabel} →</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Om Divider ──────────────────────────────────────────────────
export const OmDivider: React.FC = () => (
  <View style={styles.omDivider}>
    <View style={styles.omDividerLine} />
    <Text style={styles.omSymbol}>{SacredSymbols.om}</Text>
    <View style={styles.omDividerLine} />
  </View>
);

// ─── Rating Stars ────────────────────────────────────────────────
export const RatingStars: React.FC<RatingStarsProps> = ({ rating, count }) => (
  <View style={styles.ratingRow}>
    {Array(5).fill(0).map((_, i) => (
      <Text key={i} style={[styles.ratingStar, i < rating && styles.ratingStarFilled]}>★</Text>
    ))}
    {count !== undefined && <Text style={styles.ratingCount}>({count})</Text>}
  </View>
);

// ─── Avatar Circle ───────────────────────────────────────────────
export const AvatarCircle: React.FC<AvatarCircleProps> = ({
  initials,
  size = 52,
  gradient,
}) => (
  <LinearGradient
    colors={gradient ?? Colors.gradientSaffron}
    style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
  >
    <Text style={{ color: Colors.white, fontSize: size * 0.38, fontWeight: '800' }}>{initials}</Text>
  </LinearGradient>
);

// ─── Stat Card ───────────────────────────────────────────────────
export const StatCard: React.FC<StatCardProps> = ({ value, label, icon, color }) => (
  <View style={[styles.statCard, { borderTopColor: color ?? Colors.saffron }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color: color ?? Colors.saffron }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Mantra Quote Card ───────────────────────────────────────────
export const MantraCard: React.FC<MantraCardProps> = ({ mantra, source }) => (
  <View style={styles.mantraCard}>
    <Text style={styles.mantraOm}>{SacredSymbols.om}</Text>
    <Text style={styles.mantraText}>"{mantra}"</Text>
    <Text style={styles.mantraSource}>— {source}</Text>
  </View>
);

// ─── Input Field ─────────────────────────────────────────────────
export const SpiritualInput: React.FC<SpiritualInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType,
  leftIcon,
}) => (
  <View style={styles.inputWrapper}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={styles.inputContainer}>
      {leftIcon && <Text style={styles.inputLeftIcon}>{leftIcon}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        placeholder={placeholder}
        placeholderTextColor={Colors.brownLight}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Buttons
  saffronBtn: {
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saffronBtnSmall: {
    paddingVertical: 9,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  saffronBtnText: {
    color: Colors.white,
    fontSize: Typography.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  saffronBtnTextSmall: { fontSize: Typography.sm },
  crimsonBtn: {
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  crimsonBtnText: { color: Colors.goldLight, fontSize: Typography.md, fontWeight: '700' },
  goldOutlineBtn: {
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingVertical: 13,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  goldOutlineBtnText: { color: Colors.saffron, fontSize: Typography.md, fontWeight: '700' },

  // Badge
  spiritualBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeIcon: { fontSize: 12 },
  badgeText: { fontSize: Typography.xs, fontWeight: '700' },

  // Sacred Card
  sacredCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Shadow.card,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionFlag: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionFlagSymbol: { fontSize: 18 },
  sectionTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.darkText, letterSpacing: 0.2 },
  sectionTitleHindi: { fontSize: Typography.xs, color: Colors.saffron, fontWeight: '600', marginTop: 1 },
  sectionAction: { color: Colors.saffron, fontSize: Typography.sm, fontWeight: '700' },

  // Om Divider
  omDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  omDividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  omSymbol: { fontSize: 22, color: Colors.saffron },

  // Rating
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingStar: { fontSize: 13, color: Colors.divider },
  ratingStarFilled: { color: Colors.gold },
  ratingCount: { fontSize: 12, color: Colors.brownLight, marginLeft: 4 },

  // Stat Card
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderTopWidth: 3,
    ...Shadow.card,
  },
  statIcon: { fontSize: 22, marginBottom: 5 },
  statValue: { fontSize: Typography.xl, fontWeight: '900' },
  statLabel: { fontSize: 10, color: Colors.brownLight, textAlign: 'center', marginTop: 2 },

  // Mantra Card
  mantraCard: {
    backgroundColor: Colors.parchment,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: 8,
  },
  mantraOm: { fontSize: 30, color: Colors.saffron },
  mantraText: {
    fontSize: Typography.base,
    color: Colors.darkText,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  mantraSource: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },

  // Input
  inputWrapper: { marginBottom: Spacing.md },
  inputLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.darkText, marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
    gap: 8,
  },
  inputLeftIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: Typography.base, color: Colors.darkText },
  inputMulti: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
});
