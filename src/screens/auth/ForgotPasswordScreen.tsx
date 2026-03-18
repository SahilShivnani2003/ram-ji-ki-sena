import React, { useState, useRef, useEffect } from 'react';
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
  TextInput,
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

type Props = NativeStackScreenProps<RootParamList, 'forgotPassword'>;

type Step = 'phone' | 'otp' | 'reset' | 'success';

// ── Validation ────────────────────────────────────────────────────────────────
const validate = {
  phone: (v: string) => {
    if (!v) return 'Mobile number is required';
    if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit number';
    return '';
  },
  otp: (v: string) => {
    if (!v || v.length < 6) return 'Enter the 6-digit OTP';
    return '';
  },
  password: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Minimum 8 characters';
    return '';
  },
  confirmPassword: (v: string, password: string) => {
    if (!v) return 'Please confirm your password';
    if (v !== password) return 'Passwords do not match';
    return '';
  },
};

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS: Step[] = ['phone', 'otp', 'reset'];
const STEP_LABELS = ['Mobile', 'Verify', 'Reset'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [errors, setErrors] = useState({
    phone: '',
    otp: '',
    password: '',
    confirmPass: '',
  });

  const otpRefs = useRef<Array<TextInput | null>>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Resend countdown
  useEffect(() => {
    if (step !== 'otp') return;
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const animateTransition = (cb: () => void) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      cb();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // ── OTP handlers ─────────────────────────────────────────────────────────
  const handleOtpChange = (val: string, index: number) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = cleaned;
    setOtp(next);
    if (cleaned && index < 5) otpRefs.current[index + 1]?.focus();
    if (!cleaned && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Step handlers ─────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const err = validate.phone(phone);
    if (err) {
      setErrors(e => ({ ...e, phone: err }));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      console.log('Otp sent dummy call');
    }, 500);
    setLoading(false);
    animateTransition(() => setStep('otp'));
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    const err = validate.otp(otpStr);
    if (err) {
      setErrors(e => ({ ...e, otp: err }));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      console.log('Verify otp dummy call');
    }, 500);
    setLoading(false);
    animateTransition(() => setStep('reset'));
  };

  const handleResetPassword = async () => {
    const passErr = validate.password(password);
    const confirmErr = validate.confirmPassword(confirmPass, password);
    if (passErr || confirmErr) {
      setErrors(e => ({ ...e, password: passErr, confirmPass: confirmErr }));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      console.log('Reset password dummy call');
    }, 500);
    setLoading(false);
    animateTransition(() => setStep('success'));
    Animated.spring(successAnim, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const currentStepIndex = STEPS.indexOf(step as any);

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

      {/* Top band */}
      <LinearGradient
        colors={Colors.gradientRam as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBand}
      />

      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() =>
          step === 'phone'
            ? navigation.goBack()
            : animateTransition(() => {
                if (step === 'otp') setStep('phone');
                else if (step === 'reset') setStep('otp');
              })
        }
      >
        <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        <Text style={styles.backText}>Back</Text>
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
          <View style={styles.header}>
            <Text style={styles.lockIcon}>🔐</Text>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              {step === 'phone' && 'Enter your registered mobile number'}
              {step === 'otp' && `OTP sent to +91 ${phone}`}
              {step === 'reset' && 'Create a new strong password'}
              {step === 'success' && 'Password updated successfully'}
            </Text>
          </View>

          {/* ── Step indicator ── */}
          {step !== 'success' && (
            <View style={styles.stepRow}>
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        i <= currentStepIndex && styles.stepDotActive,
                        i < currentStepIndex && styles.stepDotDone,
                      ]}
                    >
                      {i < currentStepIndex ? (
                        <Ionicons
                          name="checkmark"
                          size={11}
                          color={Colors.textLight}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.stepNum,
                            i <= currentStepIndex && styles.stepNumActive,
                          ]}
                        >
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        i <= currentStepIndex && styles.stepLabelActive,
                      ]}
                    >
                      {STEP_LABELS[i]}
                    </Text>
                  </View>
                  {i < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        i < currentStepIndex && styles.stepLineActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          )}

          {/* ── Card ── */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* STEP 1 — Phone */}
            {step === 'phone' && (
              <>
                <Field
                  label="Mobile Number"
                  icon="call-outline"
                  placeholder="Enter 10-digit mobile number"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={t => {
                    const c = t.replace(/\D/g, '').slice(0, 10);
                    setPhone(c);
                    if (errors.phone)
                      setErrors(e => ({ ...e, phone: validate.phone(c) }));
                  }}
                  error={errors.phone}
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />
                <TouchableOpacity
                  style={styles.btnWrap}
                  onPress={handleSendOtp}
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
                      <Text style={styles.btnText}>Send OTP →</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2 — OTP */}
            {step === 'otp' && (
              <>
                <Text style={styles.otpHint}>Enter the 6-digit code</Text>
                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={r => {
                        otpRefs.current[i] = r;
                      }}
                      style={[styles.otpBox, !!digit && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={v => handleOtpChange(v, i)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(nativeEvent.key, i)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      selectionColor={Colors.primary}
                      cursorColor={Colors.primary}
                    />
                  ))}
                </View>
                {!!errors.otp && (
                  <View style={styles.otpError}>
                    <Ionicons
                      name="alert-circle"
                      size={11}
                      color={Colors.error}
                    />
                    <Text style={styles.errorText}>{errors.otp}</Text>
                  </View>
                )}
                <View style={styles.resendRow}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendTimer}>
                      Resend OTP in {resendTimer}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setResendTimer(30);
                        setOtp(['', '', '', '', '', '']);
                      }}
                    >
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.btnWrap}
                  onPress={handleVerifyOtp}
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
                      <Text style={styles.btnText}>Verify OTP →</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3 — Reset password */}
            {step === 'reset' && (
              <>
                <Field
                  label="New Password"
                  icon="lock-closed-outline"
                  placeholder="Min. 8 characters"
                  secureTextEntry={!showPass}
                  trailingIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
                  onTrailingPress={() => setShowPass(p => !p)}
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    if (errors.password)
                      setErrors(e => ({
                        ...e,
                        password: validate.password(t),
                      }));
                  }}
                  error={errors.password}
                  returnKeyType="next"
                />
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
                    if (errors.confirmPass)
                      setErrors(e => ({
                        ...e,
                        confirmPass: validate.confirmPassword(t, password),
                      }));
                  }}
                  error={errors.confirmPass}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <TouchableOpacity
                  style={styles.btnWrap}
                  onPress={handleResetPassword}
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
                      <Text style={styles.btnText}>Reset Password →</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 4 — Success */}
            {step === 'success' && (
              <Animated.View
                style={[
                  styles.successWrap,
                  { opacity: successAnim, transform: [{ scale: successAnim }] },
                ]}
              >
                <View style={styles.successCircle}>
                  <Ionicons
                    name="checkmark"
                    size={40}
                    color={Colors.textLight}
                  />
                </View>
                <Text style={styles.successTitle}>Password Reset!</Text>
                <Text style={styles.successSub}>
                  Your password has been updated.{'\n'}Please login with your
                  new password.
                </Text>
                <TouchableOpacity
                  style={styles.btnWrap}
                  onPress={() => navigation.navigate('login')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={Colors.gradientRam as string[]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btn}
                  >
                    <Text style={styles.btnText}>🙏 Back to Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
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

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: 4,
  },
  backText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Header
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  lockIcon: { fontSize: 48, marginBottom: Spacing.sm },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary, // dark brown (was textLight)
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary, // warm brown (was textMuted)
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 20,
  },

  // Step indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.border, // warm sand (was '#CC996633')
    marginBottom: 16,
  },
  stepLineActive: { backgroundColor: Colors.primary },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.saffronBg, // warm tint (was '#2D0D00')
    borderWidth: 1.5,
    borderColor: Colors.border, // warm sand (was '#CC996644')
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '33', // soft saffron tint
  },
  stepDotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepNum: { fontSize: 11, color: Colors.textMuted, fontWeight: '700' },
  stepNumActive: { color: Colors.primary },
  stepLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    letterSpacing: 1,
    fontWeight: '600',
  },
  stepLabelActive: { color: Colors.primary }, // saffron (was primaryLight)

  // Card
  card: {
    backgroundColor: Colors.cardBg, // white (was '#2D0D00')
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border, // warm sand (was '#CC996633')
    padding: Spacing.xxl,
    ...Shadow.lg,
  },

  // OTP
  otpHint: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary, // warm brown (was textMuted)
    letterSpacing: 1,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border, // warm sand (was '#CC996644')
    backgroundColor: Colors.saffronBg, // warm tint (was '#1A0A00')
    textAlign: 'center',
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary, // dark brown (was textLight)
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '22', // very soft saffron (was '#3D1500')
  },
  otpError: {
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

  resendRow: { alignItems: 'center', marginBottom: Spacing.lg },
  resendTimer: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  resendLink: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary, // saffron (was primaryLight)
    fontWeight: '700',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.lg,
  },
  successTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: '700',
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
});
