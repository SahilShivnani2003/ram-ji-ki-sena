import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {Colors, Fonts, Spacing, BorderRadius, Shadow} from '../theme';

// ─── GradientHeader ──────────────────────────────────────────────────────────
interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
}
export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  rightComponent,
}) => (
  <View style={styles.gradientHeader}>
    <View style={styles.headerLeft}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
    {rightComponent && <View>{rightComponent}</View>}
  </View>
);

// ─── SectionHeader ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onSeeAll,
  seeAllLabel = 'See All',
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAllText}>{seeAllLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  small?: boolean;
}
export const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.textLight,
  bgColor = Colors.primary,
  small = false,
}) => (
  <View style={[styles.badge, {backgroundColor: bgColor}, small && styles.badgeSmall]}>
    <Text style={[styles.badgeText, {color}, small && styles.badgeTextSmall]}>
      {label}
    </Text>
  </View>
);

// ─── StarRating ───────────────────────────────────────────────────────────────
interface StarRatingProps {
  rating: number;
  size?: number;
}
export const StarRating: React.FC<StarRatingProps> = ({rating, size = 12}) => {
  const stars = ['★', '★', '★', '★', '★'];
  return (
    <View style={styles.starRow}>
      {stars.map((star, i) => (
        <Text
          key={i}
          style={[
            styles.star,
            {fontSize: size, color: i < Math.floor(rating) ? Colors.gold : '#DDD'},
          ]}>
          {star}
        </Text>
      ))}
      <Text style={[styles.ratingText, {fontSize: size}]}>{rating.toFixed(1)}</Text>
    </View>
  );
};

// ─── ChipFilter ───────────────────────────────────────────────────────────────
interface ChipFilterProps {
  options: {key: string; label: string}[];
  selected: string;
  onSelect: (key: string) => void;
}
export const ChipFilter: React.FC<ChipFilterProps> = ({options, selected, onSelect}) => (
  <View style={styles.chipRow}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt.key}
        style={[styles.chip, selected === opt.key && styles.chipSelected]}
        onPress={() => onSelect(opt.key)}>
        <Text
          style={[styles.chipText, selected === opt.key && styles.chipTextSelected]}>
          {opt.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── LiveBadge ────────────────────────────────────────────────────────────────
export const LiveBadge: React.FC = () => (
  <View style={styles.liveBadge}>
    <View style={styles.liveDot} />
    <Text style={styles.liveText}>LIVE</Text>
  </View>
);

// ─── PrimaryButton ────────────────────────────────────────────────────────────
interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  outline?: boolean;
  small?: boolean;
}
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  outline = false,
  small = false,
}) => (
  <TouchableOpacity
    style={[
      styles.primaryBtn,
      small && styles.primaryBtnSmall,
      outline && styles.primaryBtnOutline,
      style,
    ]}
    onPress={onPress}
    activeOpacity={0.85}>
    <Text
      style={[
        styles.primaryBtnText,
        small && styles.primaryBtnTextSmall,
        outline && styles.primaryBtnTextOutline,
        textStyle,
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── OmSymbol ────────────────────────────────────────────────────────────────
export const OmSymbol: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.gold,
}) => (
  <Text style={{fontSize: size, color}}>ॐ</Text>
);

const styles = StyleSheet.create({
  gradientHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {flex: 1},
  headerTitle: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.xxl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Fonts.sizes.sm,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  sectionTitleRow: {flexDirection: 'row', alignItems: 'center'},
  sectionAccent: {
    width: 4,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeSmall: {paddingHorizontal: 6, paddingVertical: 2},
  badgeText: {fontSize: Fonts.sizes.xs, fontWeight: '700', letterSpacing: 0.5},
  badgeTextSmall: {fontSize: 9},
  starRow: {flexDirection: 'row', alignItems: 'center'},
  star: {marginRight: 1},
  ratingText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 3,
  },
  chipRow: {flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md},
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.saffronBg,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  chipText: {fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '600'},
  chipTextSelected: {color: Colors.textLight},
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  liveDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', marginRight: 4},
  liveText: {color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1},
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  primaryBtnSmall: {paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md},
  primaryBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  primaryBtnText: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryBtnTextSmall: {fontSize: Fonts.sizes.sm},
  primaryBtnTextOutline: {color: Colors.primary},
});
