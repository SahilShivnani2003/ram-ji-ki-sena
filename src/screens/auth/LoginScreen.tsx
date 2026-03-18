import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../theme/index';
import Field from '../../components/ui/InputField';
import { RootParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootParamList, 'login'>;

// ── Validation ────────────────────────────────────────────────────────────────
const validate = {
  phone: (v: string) => {
    if (!v) return 'Mobile number is required';
    if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit mobile number';
    return '';
  },
  password: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    return '';
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ phone: '', password: '' });
  const [touched, setTouched] = useState({ phone: false, password: false });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (touched.phone) {
      setErrors(e => ({ ...e, phone: validate.phone(cleaned) }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (touched.password) {
      setErrors(e => ({ ...e, password: validate.password(text) }));
    }
  };

  const handlePhoneBlur = () => {
    setTouched(t => ({ ...t, phone: true }));
    setErrors(e => ({ ...e, phone: validate.phone(phone) }));
  };

  const handlePasswordBlur = () => {
    setTouched(t => ({ ...t, password: true }));
    setErrors(e => ({ ...e, password: validate.password(password) }));
  };

  const handleLogin = async () => {
    setTouched({ phone: true, password: true });
    const phoneErr = validate.phone(phone);
    const passwordErr = validate.password(password);
    setErrors({ phone: phoneErr, password: passwordErr });

    if (phoneErr || passwordErr) return;

    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    try {
      setTimeout(() => {
        console.log('Dummy Api call');
      }, 500);
      navigation.replace('main', { screen: 'Home' });
    } catch (err) {
      setErrors(e => ({ ...e, phone: 'Login failed. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Light warm background */}
      <LinearGradient
        colors={[Colors.background, Colors.saffronBg, Colors.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top saffron band */}
      <LinearGradient
        colors={Colors.gradientRam as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBand}
      />

      {/* Corner ornaments */}
      <Text style={[styles.ornament, styles.ornTL]}>✦</Text>
      <Text style={[styles.ornament, styles.ornTR]}>✦</Text>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.diya}>🪔</Text>
            <Text style={styles.om}>ॐ</Text>
            <Text style={styles.appName}>AARADHANA</Text>
            <Text style={styles.tagline}>श्री राम जय राम जय जय राम</Text>
            <View style={styles.headerDivider} />
          </View>

          {/* ── Form Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>SIGN IN</Text>

            <Field
              label="Mobile Number"
              icon="call-outline"
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={handlePhoneChange}
              onBlur={handlePhoneBlur}
              error={touched.phone ? errors.phone : ''}
              maxLength={10}
              returnKeyType="next"
            />

            <Field
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter your password"
              secureTextEntry={!showPass}
              trailingIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              onTrailingPress={() => setShowPass(p => !p)}
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={handlePasswordBlur}
              error={touched.password ? errors.password : ''}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('forgotPassword')}
              style={styles.forgotWrap}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    loading
                      ? [Colors.primaryDark, Colors.primaryDark]
                      : (Colors.gradientRam as string[])
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtn}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.textLight} size="small" />
                  ) : (
                    <Text style={styles.loginBtnText}>🙏 JAI SHRI RAM</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* OR divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* Social login */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Text style={styles.socialBtnText}>G Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Text style={styles.socialBtnText}>✆ OTP</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>New devotee? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('register')}>
              <Text style={styles.bottomLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom saffron band */}
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
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  topBand: { height: 3, width: '100%' },
  bottomBand: { height: 3, width: '100%' },

  ornament: {
    position: 'absolute',
    color: Colors.primary,
    opacity: 0.25,
    fontSize: 16,
  },
  ornTL: { top: 16, left: 20 },
  ornTR: { top: 16, right: 20 },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xl,
  },

  // ── Header ──
  header: { alignItems: 'center', marginBottom: Spacing.xxxl },
  diya: { fontSize: 56, marginBottom: 4 },
  om: {
    fontSize: 48,
    color: Colors.primary, // saffron on light bg (was gold on dark)
    fontWeight: '700',
    lineHeight: 56,
    textShadowColor: Colors.primaryLight,
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  appName: {
    fontSize: Fonts.sizes.xl,
    color: Colors.textPrimary, // dark brown (was white)
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 4,
  },
  tagline: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary, // warm brown muted (was textMuted)
    letterSpacing: 1.5,
    marginTop: 4,
  },
  headerDivider: {
    width: 60,
    height: 1.5,
    backgroundColor: Colors.primary, // saffron (was gold)
    opacity: 0.5,
    marginTop: Spacing.md,
    borderRadius: 2,
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.cardBg, // white (was dark maroon)
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border, // warm sand (was dark gold tint)
    padding: Spacing.xxl,
    ...Shadow.lg,
  },
  cardTitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary, // saffron (was primaryLight)
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: Spacing.xl,
  },

  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  forgotText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary, // warm brown (was textMuted)
    letterSpacing: 0.5,
  },

  // ── Login button ──
  loginBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  loginBtnText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    fontWeight: '700',
    letterSpacing: 3,
  },

  // ── OR divider ──
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
  },

  // ── Social ──
  socialRow: { flexDirection: 'row', gap: Spacing.sm },
  socialBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border, // warm sand (was dark gold tint)
    backgroundColor: Colors.saffronBg, // warm tint (was darkBg)
    alignItems: 'center',
  },
  socialBtnText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary, // warm brown (was textMuted)
    letterSpacing: 1,
    fontWeight: '600',
  },

  // ── Bottom ──
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  bottomText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  bottomLink: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary, // saffron (was primaryLight)
    fontWeight: '700',
  },
});
