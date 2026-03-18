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
import Ionicons from 'react-native-vector-icons/Ionicons';
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

type Props = NativeStackScreenProps<RootParamList, 'register'>;

type Step = 'personal' | 'account' | 'success';

// ── Validation ────────────────────────────────────────────────────────────────
const validate = {
  name: (v: string) => {
    if (!v.trim()) return 'Full name is required';
    if (v.trim().length < 3) return 'Name must be at least 3 characters';
    return '';
  },
  phone: (v: string) => {
    if (!v) return 'Mobile number is required';
    if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit number';
    return '';
  },
  city: (v: string) => {
    if (!v.trim()) return 'City is required';
    return '';
  },
  email: (v: string) => {
    if (!v) return ''; // optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email';
    return '';
  },
  password: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Minimum 8 characters';
    if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter';
    if (!/[0-9]/.test(v)) return 'Include at least one number';
    return '';
  },
  confirmPassword: (v: string, pass: string) => {
    if (!v) return 'Please confirm your password';
    if (v !== pass) return 'Passwords do not match';
    return '';
  },
};

// ── Password strength ─────────────────────────────────────────────────────────
const getStrength = (pass: string) => {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = [
  '',
  Colors.error,
  Colors.warning,
  Colors.gold,
  Colors.success,
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('personal');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    city: '',
    email: '',
    password: '',
    confirmPass: '',
    agree: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    city: false,
    email: false,
    password: false,
    confirmPass: false,
  });

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (
    cb: () => void,
    direction: 'forward' | 'back' = 'forward',
  ) => {
    const outTo = direction === 'forward' ? -40 : 40;
    const inFrom = direction === 'forward' ? 40 : -40;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: outTo,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      cb();
      slideAnim.setValue(inFrom);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const animateProgress = (toValue: number) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const handleNextStep = () => {
    const newErrors = {
      name: validate.name(name),
      phone: validate.phone(phone),
      city: validate.city(city),
    };
    setErrors(e => ({ ...e, ...newErrors }));
    setTouched(t => ({ ...t, name: true, phone: true, city: true }));
    if (Object.values(newErrors).some(Boolean)) return;
    animateTransition(() => setStep('account'));
    animateProgress(1);
  };

  const handleRegister = async () => {
    const newErrors = {
      email: validate.email(email),
      password: validate.password(password),
      confirmPass: validate.confirmPassword(confirmPass, password),
      agree: agreed ? '' : 'Please accept the terms to continue',
    };
    setErrors(e => ({ ...e, ...newErrors }));
    setTouched(t => ({ ...t, email: true, password: true, confirmPass: true }));
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setTimeout(() => {
      console.log('Register dummy call');
    }, 600);
    setLoading(false);
    animateTransition(() => setStep('success'));
    animateProgress(2);
    Animated.spring(successAnim, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['33%', '66%', '100%'],
  });

  const passwordStrength = getStrength(password);

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

      {/* Progress bar */}
      {step !== 'success' && (
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      )}

      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (step === 'personal') navigation.goBack();
          else if (step === 'account') {
            animateTransition(() => setStep('personal'), 'back');
            animateProgress(0);
          }
        }}
      >
        <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        <Text style={styles.backText}>
          {step === 'personal' ? 'Login' : 'Back'}
        </Text>
      </TouchableOpacity>

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
          {step !== 'success' && (
            <View style={styles.header}>
              <Text style={styles.headerIcon}>🙏</Text>
              <Text style={styles.title}>
                {step === 'personal' ? 'Join the Sangha' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 'personal'
                  ? 'Step 1 of 2 — Personal details'
                  : 'Step 2 of 2 — Account credentials'}
              </Text>
            </View>
          )}

          {/* ── Card ── */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* STEP 1 — Personal */}
            {step === 'personal' && (
              <>
                <Field
                  label="Full Name"
                  icon="person-outline"
                  placeholder="As per Aadhaar / preferred name"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={t => {
                    setName(t);
                    if (touched.name)
                      setErrors(e => ({ ...e, name: validate.name(t) }));
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, name: true }));
                    setErrors(e => ({ ...e, name: validate.name(name) }));
                  }}
                  error={touched.name ? errors.name : ''}
                  returnKeyType="next"
                />
                <Field
                  label="Mobile Number"
                  icon="call-outline"
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={t => {
                    const c = t.replace(/\D/g, '').slice(0, 10);
                    setPhone(c);
                    if (touched.phone)
                      setErrors(e => ({ ...e, phone: validate.phone(c) }));
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, phone: true }));
                    setErrors(e => ({ ...e, phone: validate.phone(phone) }));
                  }}
                  error={touched.phone ? errors.phone : ''}
                  maxLength={10}
                  returnKeyType="next"
                />
                <Field
                  label="City / Town"
                  icon="location-outline"
                  placeholder="Your city or town"
                  autoCapitalize="words"
                  value={city}
                  onChangeText={t => {
                    setCity(t);
                    if (touched.city)
                      setErrors(e => ({ ...e, city: validate.city(t) }));
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, city: true }));
                    setErrors(e => ({ ...e, city: validate.city(city) }));
                  }}
                  error={touched.city ? errors.city : ''}
                  returnKeyType="done"
                  onSubmitEditing={handleNextStep}
                />
                <TouchableOpacity
                  style={styles.btnWrap}
                  onPress={handleNextStep}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={Colors.gradientRam as string[]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>Continue →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2 — Account */}
            {step === 'account' && (
              <>
                <Field
                  label="Email (Optional)"
                  icon="mail-outline"
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    if (touched.email)
                      setErrors(e => ({ ...e, email: validate.email(t) }));
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, email: true }));
                    setErrors(e => ({ ...e, email: validate.email(email) }));
                  }}
                  error={touched.email ? errors.email : ''}
                  returnKeyType="next"
                />
                <Field
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  secureTextEntry={!showPass}
                  trailingIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
                  onTrailingPress={() => setShowPass(p => !p)}
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    if (touched.password)
                      setErrors(e => ({
                        ...e,
                        password: validate.password(t),
                      }));
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, password: true }));
                    setErrors(e => ({
                      ...e,
                      password: validate.password(password),
                    }));
                  }}
                  error={touched.password ? errors.password : ''}
                  returnKeyType="next"
                />

                {/* Password strength meter */}
                {password.length > 0 && (
                  <View style={styles.strengthWrap}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map(i => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                i <= passwordStrength
                                  ? strengthColor[passwordStrength]
                                  : Colors.border, // light theme: border instead of dark tint
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.strengthLabel,
                        { color: strengthColor[passwordStrength] },
                      ]}
                    >
                      {strengthLabel[passwordStrength]}
                    </Text>
                  </View>
                )}

                <Field
                  label="Confirm Password"
                  icon="shield-checkmark-outline"
                  placeholder="Repeat your password"
                  secureTextEntry={!showConfirm}
                  trailingIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  onTrailingPress={() => setShowConfirm(p => !p)}
                  value={confirmPass}
                  onChangeText={t => {
                    setConfirmPass(t);
                    if (touched.confirmPass)
                      setErrors(e => ({
                        ...e,
                        confirmPass: validate.confirmPassword(t, password),
                      }));
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, confirmPass: true }));
                    setErrors(e => ({
                      ...e,
                      confirmPass: validate.confirmPassword(
                        confirmPass,
                        password,
                      ),
                    }));
                  }}
                  error={touched.confirmPass ? errors.confirmPass : ''}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />

                {/* Terms checkbox */}
                <TouchableOpacity
                  style={styles.agreeRow}
                  onPress={() => {
                    setAgreed(a => !a);
                    setErrors(e => ({ ...e, agree: '' }));
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.checkbox, agreed && styles.checkboxChecked]}
                  >
                    {agreed && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={Colors.textLight}
                      />
                    )}
                  </View>
                  <Text style={styles.agreeText}>
                    I agree to the{' '}
                    <Text style={styles.agreeLink}>Terms of Service</Text> &{' '}
                    <Text style={styles.agreeLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
                {!!errors.agree && (
                  <View style={styles.agreeError}>
                    <Ionicons
                      name="alert-circle"
                      size={11}
                      color={Colors.error}
                    />
                    <Text style={styles.errorText}>{errors.agree}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.btnWrap}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={Colors.gradientRam as string[]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btn}
                  >
                    {loading ? (
                      <ActivityIndicator
                        color={Colors.textLight}
                        size="small"
                      />
                    ) : (
                      <Text style={styles.btnText}>🙏 Create Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* SUCCESS ── */}
            {step === 'success' && (
              <Animated.View
                style={[
                  styles.successWrap,
                  { opacity: successAnim, transform: [{ scale: successAnim }] },
                ]}
              >
                <LinearGradient
                  colors={Colors.gradientRam as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.successCircle}
                >
                  <Text style={styles.successIcon}>🪔</Text>
                </LinearGradient>
                <Text style={styles.successTitle}>Jai Shri Ram!</Text>
                <Text style={styles.successName}>
                  Welcome, {name.split(' ')[0]}
                </Text>
                <Text style={styles.successSub}>
                  Your account has been created.{'\n'}Begin your spiritual
                  journey.
                </Text>
                <TouchableOpacity
                  style={styles.btnWrap}
                  onPress={() =>
                    navigation.navigate('main', { screen: 'Home' })
                  }
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={Colors.gradientRam as string[]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>Enter the Sangha →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          {/* Login link */}
          {step !== 'success' && (
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already a devotee? </Text>
              <TouchableOpacity onPress={() => navigation.replace('login')}>
                <Text style={styles.bottomLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
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

  progressTrack: { height: 2, backgroundColor: Colors.border },
  progressFill: { height: 2, backgroundColor: Colors.primary },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: 4,
  },
  backText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  headerIcon: { fontSize: 44, marginBottom: Spacing.sm },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary, // dark brown (was textLight)
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary, // warm brown (was textMuted)
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: Colors.cardBg, // white (was '#2D0D00')
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border, // warm sand (was '#CC996633')
    padding: Spacing.xxl,
    ...Shadow.lg,
  },

  // Strength meter
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: Fonts.sizes.xs, fontWeight: '700', minWidth: 40 },

  // Terms
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderDark, // stronger border (was '#CC996644')
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  agreeText: {
    flex: 1,
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary, // warm brown (was textMuted)
    lineHeight: 18,
  },
  agreeLink: { color: Colors.primary, fontWeight: '700' }, // saffron (was primaryLight)
  agreeError: {
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

  // Button
  btnWrap: { marginTop: Spacing.sm },
  btn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  btnText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Success
  successWrap: { alignItems: 'center', paddingVertical: Spacing.lg },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.lg,
  },
  successIcon: { fontSize: 40 },
  successTitle: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '700',
    color: Colors.primary, // saffron (was gold — better on light bg)
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  successName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '600',
    color: Colors.textPrimary, // dark brown (was textLight)
    marginBottom: Spacing.sm,
  },
  successSub: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary, // warm brown (was textMuted)
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },

  // Bottom
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
