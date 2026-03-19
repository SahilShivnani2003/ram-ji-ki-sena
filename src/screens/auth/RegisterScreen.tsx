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
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme/index';
import Field from '../../components/ui/InputField';
import { RootParamList } from '../../navigation/AppNavigator';
import { authAPI } from '../../service/apis/authServices';
import { useAuthStore } from '../../store/useAuthore';

type Props = NativeStackScreenProps<RootParamList, 'register'>;
type Step = 'personal' | 'account' | 'success';

// ── Validation ────────────────────────────────────────────────────────────────
const validate = {
    name: (v: string) => {
        if (!v.trim()) return 'Full name is required';
        if (v.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
    },
    username: (v: string) => {
        if (!v.trim()) return 'Username is required';
        if (v.length < 4) return 'Minimum 4 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Letters, numbers and underscores only';
        return '';
    },
    phone: (v: string) => {
        if (!v) return 'Mobile number is required';
        if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit number';
        return '';
    },
    city: (v: string) => (!v.trim() ? 'City is required' : ''),
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
const getStrength = (pass: string): number => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
};
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', Colors.error, Colors.warning, Colors.gold, Colors.success];

// ── Step indicator ────────────────────────────────────────────────────────────
const StepDots = ({ current }: { current: Step }) => {
    const steps: Step[] = ['personal', 'account'];
    return (
        <View style={dotStyles.row}>
            {steps.map((s, i) => {
                const done =
                    (s === 'personal' && (current === 'account' || current === 'success')) ||
                    (s === 'account' && current === 'success');
                const active = s === current;
                return (
                    <React.Fragment key={s}>
                        {/* dot */}
                        {done ? (
                            <LinearGradient
                                colors={Colors.gradientRam as string[]}
                                style={dotStyles.dotDone}
                            >
                                <Ionicons name="checkmark" size={10} color={Colors.textLight} />
                            </LinearGradient>
                        ) : (
                            <View style={[dotStyles.dot, active && dotStyles.dotActive]}>
                                <Text style={[dotStyles.dotNum, active && dotStyles.dotNumActive]}>
                                    {i + 1}
                                </Text>
                            </View>
                        )}
                        {/* connector */}
                        {i < steps.length - 1 && (
                            <View style={[dotStyles.line, done && dotStyles.lineDone]} />
                        )}
                    </React.Fragment>
                );
            })}
        </View>
    );
};
const dotStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.cardBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotActive: { borderColor: Colors.primary, borderWidth: 2 },
    dotDone: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotNum: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
    dotNumActive: { color: Colors.primary },
    line: { width: 40, height: 1.5, backgroundColor: Colors.border },
    lineDone: { backgroundColor: Colors.primary },
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }: Props) {
    const { login } = useAuthStore();
    const [step, setStep] = useState<Step>('personal');

    // Step 1 fields
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');

    // Step 2 fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        name: '',
        username: '',
        phone: '',
        city: '',
        email: '',
        password: '',
        confirmPass: '',
        agree: '',
    });
    const [touched, setTouched] = useState({
        name: false,
        username: false,
        phone: false,
        city: false,
        email: false,
        password: false,
        confirmPass: false,
    });

    // Animations
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const successAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // ── Animated helpers ──────────────────────────────────────────────────────
    const animateTransition = (cb: () => void, direction: 'forward' | 'back' = 'forward') => {
        const outTo = direction === 'forward' ? -40 : 40;
        const inFrom = direction === 'forward' ? 40 : -40;
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: outTo, duration: 160, useNativeDriver: true }),
        ]).start(() => {
            cb();
            slideAnim.setValue(inFrom);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        });
    };

    const animateProgress = (toValue: number) =>
        Animated.timing(progressAnim, { toValue, duration: 400, useNativeDriver: false }).start();

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['33%', '66%', '100%'],
    });

    const passwordStrength = getStrength(password);

    // ── Step 1 submit ─────────────────────────────────────────────────────────
    const handleNextStep = () => {
        const newErrors = {
            name: validate.name(name),
            username: validate.username(username),
            phone: validate.phone(phone),
            city: validate.city(city),
        };
        setErrors(e => ({ ...e, ...newErrors }));
        setTouched(t => ({ ...t, name: true, username: true, phone: true, city: true }));
        if (Object.values(newErrors).some(Boolean)) return;
        animateTransition(() => setStep('account'));
        animateProgress(1);
    };

    // ── Step 2 submit ─────────────────────────────────────────────────────────
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
        try {
            const payload = {
                username,
                name,
                city,
                password,
                contact: phone,
                ...(email ? { email } : {}),
            };
            const response = await authAPI.register(payload);

            if (!response.data?.success) {
                Alert.alert(
                    'Registration Failed',
                    response.data?.error || 'Something went wrong. Please try again.',
                );
                return;
            }

            login(response.data?.user, response.data?.token);
            animateTransition(() => setStep('success'));
            animateProgress(2);
            Animated.spring(successAnim, {
                toValue: 1,
                tension: 60,
                friction: 6,
                useNativeDriver: true,
            }).start();
        } catch (error: any) {
            const msg = error?.response?.data?.message ?? 'Something went wrong. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Back handler ──────────────────────────────────────────────────────────
    const handleBack = () => {
        if (step === 'personal') {
            navigation.goBack();
        } else if (step === 'account') {
            animateTransition(() => setStep('personal'), 'back');
            animateProgress(0);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Warm gradient background */}
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

            {/* Animated progress bar */}
            {step !== 'success' && (
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                        <LinearGradient
                            colors={Colors.gradientRam as string[]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </View>
            )}

            {/* Back button */}
            {step !== 'success' && (
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
                    <Text style={styles.backText}>{step === 'personal' ? 'Sign In' : 'Back'}</Text>
                </TouchableOpacity>
            )}

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
                            {/* Step dots */}
                            <View style={{ marginTop: Spacing.md }}>
                                <StepDots current={step} />
                            </View>
                        </View>
                    )}

                    {/* ── Animated Card ── */}
                    <Animated.View
                        style={[
                            styles.card,
                            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                        ]}
                    >
                        {/* ════ STEP 1 — Personal ════ */}
                        {step === 'personal' && (
                            <>
                                {/* Full Name */}
                                <Field
                                    label="Full Name"
                                    icon="person-outline"
                                    placeholder="As per Aadhaar / preferred name"
                                    autoCapitalize="words"
                                    value={name}
                                    onChangeText={v => {
                                        setName(v);
                                        if (touched.name)
                                            setErrors(e => ({ ...e, name: validate.name(v) }));
                                    }}
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, name: true }));
                                        setErrors(e => ({ ...e, name: validate.name(name) }));
                                    }}
                                    error={touched.name ? errors.name : ''}
                                    returnKeyType="next"
                                />

                                {/* Username */}
                                <Field
                                    label="Username"
                                    icon="at-outline"
                                    placeholder="Choose a unique username"
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={v => {
                                        const cleaned = v.toLowerCase().replace(/\s/g, '');
                                        setUsername(cleaned);
                                        if (touched.username)
                                            setErrors(e => ({
                                                ...e,
                                                username: validate.username(cleaned),
                                            }));
                                    }}
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, username: true }));
                                        setErrors(e => ({
                                            ...e,
                                            username: validate.username(username),
                                        }));
                                    }}
                                    error={touched.username ? errors.username : ''}
                                    returnKeyType="next"
                                />
                                {!errors.username && username.length >= 4 && (
                                    <Text style={styles.hintText}>
                                        ✓ Username available for login
                                    </Text>
                                )}

                                {/* Phone */}
                                <Field
                                    label="Mobile Number"
                                    icon="call-outline"
                                    placeholder="10-digit mobile number"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={v => {
                                        const c = v.replace(/\D/g, '').slice(0, 10);
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

                                {/* City */}
                                <Field
                                    label="City / Town"
                                    icon="location-outline"
                                    placeholder="Your city or town"
                                    autoCapitalize="words"
                                    value={city}
                                    onChangeText={v => {
                                        setCity(v);
                                        if (touched.city)
                                            setErrors(e => ({ ...e, city: validate.city(v) }));
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
                                    onPress={handleNextStep}
                                    activeOpacity={0.85}
                                    style={{ marginTop: Spacing.sm }}
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

                        {/* ════ STEP 2 — Account ════ */}
                        {step === 'account' && (
                            <>
                                {/* Email (optional) */}
                                <Field
                                    label="Email (Optional)"
                                    icon="mail-outline"
                                    placeholder="your@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={v => {
                                        setEmail(v.trim());
                                        if (touched.email)
                                            setErrors(e => ({
                                                ...e,
                                                email: validate.email(v.trim()),
                                            }));
                                    }}
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, email: true }));
                                        setErrors(e => ({ ...e, email: validate.email(email) }));
                                    }}
                                    error={touched.email ? errors.email : ''}
                                    returnKeyType="next"
                                />

                                {/* Password */}
                                <Field
                                    label="Password"
                                    icon="lock-closed-outline"
                                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                                    secureTextEntry={!showPass}
                                    trailingIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
                                    onTrailingPress={() => setShowPass(p => !p)}
                                    value={password}
                                    onChangeText={v => {
                                        setPassword(v);
                                        if (touched.password)
                                            setErrors(e => ({
                                                ...e,
                                                password: validate.password(v),
                                            }));
                                        // Also re-validate confirm if already touched
                                        if (touched.confirmPass)
                                            setErrors(e => ({
                                                ...e,
                                                confirmPass: validate.confirmPassword(
                                                    confirmPass,
                                                    v,
                                                ),
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
                                                                    ? STRENGTH_COLORS[
                                                                          passwordStrength
                                                                      ]
                                                                    : Colors.border,
                                                        },
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                        <Text
                                            style={[
                                                styles.strengthLabel,
                                                { color: STRENGTH_COLORS[passwordStrength] },
                                            ]}
                                        >
                                            {STRENGTH_LABELS[passwordStrength]}
                                        </Text>
                                    </View>
                                )}

                                {/* Confirm Password */}
                                <Field
                                    label="Confirm Password"
                                    icon="shield-checkmark-outline"
                                    placeholder="Repeat your password"
                                    secureTextEntry={!showConfirm}
                                    trailingIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                                    onTrailingPress={() => setShowConfirm(p => !p)}
                                    value={confirmPass}
                                    onChangeText={v => {
                                        setConfirmPass(v);
                                        if (touched.confirmPass)
                                            setErrors(e => ({
                                                ...e,
                                                confirmPass: validate.confirmPassword(v, password),
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

                                {/* Match indicator */}
                                {confirmPass.length > 0 && (
                                    <Text
                                        style={[
                                            styles.matchText,
                                            {
                                                color:
                                                    password === confirmPass
                                                        ? Colors.success
                                                        : Colors.error,
                                            },
                                        ]}
                                    >
                                        {password === confirmPass
                                            ? '✓ Passwords match'
                                            : '✗ Passwords do not match'}
                                    </Text>
                                )}

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
                                        <Text style={styles.agreeErrorText}>{errors.agree}</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={handleRegister}
                                    disabled={loading}
                                    activeOpacity={0.85}
                                    style={{ marginTop: Spacing.sm }}
                                >
                                    <LinearGradient
                                        colors={
                                            loading
                                                ? [Colors.primaryDark, Colors.primaryDark]
                                                : (Colors.gradientRam as string[])
                                        }
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

                        {/* ════ SUCCESS ════ */}
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
                                    Welcome, {name.split(' ')[0]} 🙏
                                </Text>
                                <Text style={styles.successSub}>
                                    Your account has been created.{'\n'}Begin your spiritual
                                    journey.
                                </Text>

                                {/* Summary pill */}
                                <View style={styles.summaryBox}>
                                    <View style={styles.summaryRow}>
                                        <Ionicons
                                            name="person-outline"
                                            size={13}
                                            color={Colors.textMuted}
                                        />
                                        <Text style={styles.summaryText}>{username}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Ionicons
                                            name="call-outline"
                                            size={13}
                                            color={Colors.textMuted}
                                        />
                                        <Text style={styles.summaryText}>+91 {phone}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Ionicons
                                            name="location-outline"
                                            size={13}
                                            color={Colors.textMuted}
                                        />
                                        <Text style={styles.summaryText}>{city}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => navigation.replace('main', { screen: 'Home' })}
                                    activeOpacity={0.85}
                                    style={{ width: '100%', marginTop: Spacing.xl }}
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

                    {/* ── Login link ── */}
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

    // Progress bar
    progressTrack: { height: 3, backgroundColor: Colors.border },
    progressFill: { height: 3, overflow: 'hidden' },

    // Back button
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        gap: 2,
        alignSelf: 'flex-start',
    },
    backText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '600' },

    scroll: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
    },

    // Header
    header: { alignItems: 'center', marginBottom: Spacing.xxl },
    headerIcon: { fontSize: 44, marginBottom: Spacing.sm },
    title: {
        fontSize: Fonts.sizes.xxl,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        letterSpacing: 0.3,
    },

    // Card
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.xxl,
        ...Shadow.lg,
    },

    // Hint
    hintText: {
        fontSize: 10,
        color: Colors.success,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.xs,
        letterSpacing: 0.2,
        fontWeight: '600',
    },

    // Password strength
    strengthWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.md,
    },
    strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: Fonts.sizes.xs, fontWeight: '700', minWidth: 40 },

    // Match
    matchText: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -Spacing.sm,
        marginBottom: Spacing.sm,
    },

    // Terms
    agreeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: Colors.borderDark,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    agreeText: {
        flex: 1,
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    agreeLink: { color: Colors.primary, fontWeight: '700' },
    agreeError: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: Spacing.sm,
    },
    agreeErrorText: { fontSize: Fonts.sizes.xs, color: Colors.error, fontWeight: '600' },

    // Button
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
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
        ...Shadow.lg,
    },
    successIcon: { fontSize: 42 },
    successTitle: {
        fontSize: Fonts.sizes.xxxl,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: Spacing.xs,
        letterSpacing: 1,
    },
    successName: {
        fontSize: Fonts.sizes.xl,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    successSub: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    summaryBox: {
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.lg,
        width: '100%',
        gap: Spacing.sm,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    summaryText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: '600' },

    // Bottom
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    bottomText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
    bottomLink: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '700' },
});
