import { useState, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing, BorderRadius, Fonts, Shadow } from '../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon: string;
  error?: string;
  trailingIcon?: string;
  onTrailingPress?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Field({
  label,
  icon,
  error,
  trailingIcon,
  onTrailingPress,
  value,
  onChangeText,
  ...rest
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevError = useRef<string | undefined>(undefined);

  // Shake on new error
  if (error && error !== prevError.current) {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -5,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }
  prevError.current = error;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(glowAnim, {
      toValue: 1,
      speed: 28,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(glowAnim, {
      toValue: 0,
      speed: 28,
      useNativeDriver: false,
    }).start();
  };

  // ── Light theme color interpolations ─────────────────────────────────────
  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? Colors.error : Colors.border, // idle  → warm sand border
      error ? Colors.error : Colors.primary, // focus → saffron
    ],
  });

  const bgColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.cardBg, Colors.saffronBg], // white → warm saffron tint
  });

  const iconColor = error
    ? Colors.error
    : focused
    ? Colors.primary
    : Colors.textMuted;

  return (
    <View style={styles.wrap}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input row */}
      <Animated.View
        style={[
          styles.row,
          { borderColor, backgroundColor: bgColor },
          focused && styles.rowFocused,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {/* Left icon */}
        <Ionicons
          name={icon as any}
          size={17}
          color={iconColor}
          style={styles.leftIcon}
        />

        {/* Divider */}
        <View
          style={[styles.iconDivider, focused && styles.iconDividerActive]}
        />

        {/* Text input */}
        <TextInput
          {...rest}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          cursorColor={Colors.primary}
          autoCorrect={false}
        />

        {/* Trailing icon */}
        {trailingIcon && (
          <TouchableOpacity
            onPress={onTrailingPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.trailing}
          >
            <Ionicons
              name={trailingIcon as any}
              size={17}
              color={focused ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error */}
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={11} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.textSecondary, // warm brown — readable on light bg
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    height: 54,
    paddingHorizontal: Spacing.md,
    ...Shadow.sm,
  },

  rowFocused: {
    ...Shadow.md,
  },

  leftIcon: {
    marginRight: Spacing.sm,
  },

  iconDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border, // warm sand divider
    marginRight: Spacing.md,
  },

  iconDividerActive: {
    backgroundColor: Colors.primaryLight, // saffron tint when focused
  },

  input: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary, // dark brown on white
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  trailing: {
    paddingLeft: Spacing.sm,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginLeft: 2,
  },

  errorText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.error,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
