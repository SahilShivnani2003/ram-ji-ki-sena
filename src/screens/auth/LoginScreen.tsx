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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme/index';
import Field from '../../components/ui/InputField';
import { RootParamList } from '../../navigation/AppNavigator';
import { authAPI } from '../../service/apis/authServices';
import { useAuthStore } from '../../store/useAuthore';
import { panditAPI } from '../../service/apis/panditServices';

type Props = NativeStackScreenProps<RootParamList, 'login'>;
type LoginFor = 'user' | 'pandit';

// ── Validation ────────────────────────────────────────────────────────────────
const validate = {
    phone: (v: string) => {
        if (!v) return 'Mobile number is required';
        if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit mobile number';
        return '';
    },
    usernameOrPhone: (v: string) => {
        if (!v) return 'Username or mobile number is required';
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
    const { login } = useAuthStore();

    // Role toggle
    const [loginFor, setLoginFor] = useState<LoginFor>('user');

    // USER flow: phone-only (forgot password fallback) OR username+password
    const [userMode, setUserMode] = useState<'password' | 'phone'>('password');

    // Shared fields
    const [usernameOrPhone, setUsernameOrPhone] = useState('');
    const [phone, setPhone] = useState(''); // user phone-only mode
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // Errors
    const [errors, setErrors] = useState({ identifier: '', phone: '', password: '' });
    const [touched, setTouched] = useState({ identifier: false, phone: false, password: false });

    const btnScale = useRef(new Animated.Value(1)).current;

    // ── Reset state on role switch ────────────────────────────────────────────
    const switchRole = (role: LoginFor) => {
        setLoginFor(role);
        setUserMode('password');
        setUsernameOrPhone('');
        setPhone('');
        setPassword('');
        setErrors({ identifier: '', phone: '', password: '' });
        setTouched({ identifier: false, phone: false, password: false });
    };

    // ── Field handlers ────────────────────────────────────────────────────────
    const handleIdentifierChange = (text: string) => {
        setUsernameOrPhone(text);
        if (touched.identifier) {
            setErrors(e => ({ ...e, identifier: validate.usernameOrPhone(text) }));
        }
    };

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

    // ── Animated press ────────────────────────────────────────────────────────
    const animatePress = () =>
        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
            Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

    // ── USER: phone-only login (forgot password fallback) ─────────────────────
    const handleUserPhoneLogin = async () => {
        setTouched(t => ({ ...t, phone: true }));
        const phoneErr = validate.phone(phone);
        setErrors(e => ({ ...e, phone: phoneErr }));
        if (phoneErr) return;

        animatePress();
        setLoading(true);
        try {
            const response = await authAPI.forgot({ contact: phone });
            if (response.data?.success) {
                login(response.data?.user, response.data?.token);
                navigation.replace('main', { screen: 'Home' });
            } else {
                setErrors(e => ({ ...e, phone: 'Login failed. Please try again.' }));
            }
        } catch {
            setErrors(e => ({ ...e, phone: 'Login failed. Please try again.' }));
        } finally {
            setLoading(false);
        }
    };

    // ── USER: username + password login ───────────────────────────────────────
    const handleUserPasswordLogin = async () => {
        setTouched({ identifier: true, phone: false, password: true });
        const identifierErr = validate.usernameOrPhone(usernameOrPhone);
        const passwordErr = validate.password(password);
        setErrors(e => ({ ...e, identifier: identifierErr, password: passwordErr }));
        if (identifierErr || passwordErr) return;

        animatePress();
        setLoading(true);
        try {
            const response = await authAPI.login({ username: usernameOrPhone, password });
            if (response.data?.success) {
                login(response.data?.user, response.data?.token);
                navigation.replace('main', { screen: 'Home' });
            } else {
                Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    // ── PANDIT: phone/username + password login ───────────────────────────────
    const handlePanditLogin = async () => {
        setTouched({ identifier: true, phone: false, password: true });
        const identifierErr = validate.usernameOrPhone(usernameOrPhone);
        const passwordErr = validate.password(password);
        setErrors(e => ({ ...e, identifier: identifierErr, password: passwordErr }));
        if (identifierErr || passwordErr) return;

        animatePress();
        setLoading(true);
        try {
            const response = await panditAPI.login({ username: usernameOrPhone, password });
            if (response.data?.success) {
                login(response.data?.pandit, response.data?.token);
                navigation.replace('main', { screen: 'Home' });
            } else {
                Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    // ── Unified submit ────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (loginFor === 'user') {
            return userMode === 'phone' ? handleUserPhoneLogin() : handleUserPasswordLogin();
        }
        return handlePanditLogin();
    };

    // ── Derived label helpers ─────────────────────────────────────────────────
    const btnLabel =
        loginFor === 'user' && userMode === 'phone' ? '🙏 SEND LOGIN LINK' : '🙏 JAI SHRI RAM';

    const identifierLabel = loginFor === 'pandit' ? 'Phone / Username' : 'Username';

    const identifierPlaceholder =
        loginFor === 'pandit' ? 'Enter mobile number or username' : 'Enter your username';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            {/* Warm background */}
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

                    {/* ── Role Selector ── */}
                    <View style={styles.roleCard}>
                        <Text style={styles.roleCardLabel}>LOGIN AS</Text>
                        <View style={styles.rolePill}>
                            {/* User tab */}
                            <TouchableOpacity
                                style={styles.roleTabWrap}
                                onPress={() => switchRole('user')}
                                activeOpacity={0.8}
                            >
                                {loginFor === 'user' ? (
                                    <LinearGradient
                                        colors={Colors.gradientRam as string[]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.roleTabActive}
                                    >
                                        <Text style={styles.roleTabEmoji}>🙏</Text>
                                        <Text style={styles.roleTabTextActive}>Devotee</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.roleTabInactive}>
                                        <Text style={styles.roleTabEmoji}>🙏</Text>
                                        <Text style={styles.roleTabTextInactive}>Devotee</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Pandit tab */}
                            <TouchableOpacity
                                style={styles.roleTabWrap}
                                onPress={() => switchRole('pandit')}
                                activeOpacity={0.8}
                            >
                                {loginFor === 'pandit' ? (
                                    <LinearGradient
                                        colors={Colors.gradientRam as string[]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.roleTabActive}
                                    >
                                        <Text style={styles.roleTabEmoji}>🔱</Text>
                                        <Text style={styles.roleTabTextActive}>Pandit Ji</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.roleTabInactive}>
                                        <Text style={styles.roleTabEmoji}>🔱</Text>
                                        <Text style={styles.roleTabTextInactive}>Pandit Ji</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Form Card ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            {loginFor === 'user'
                                ? userMode === 'password'
                                    ? 'SIGN IN'
                                    : 'SIGN IN WITH PHONE'
                                : 'PANDIT LOGIN'}
                        </Text>

                        {/* ── USER: phone-only mode ── */}
                        {loginFor === 'user' && userMode === 'phone' && (
                            <>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoBoxText}>
                                        📱 Enter your registered mobile number. We'll verify and log
                                        you in directly.
                                    </Text>
                                </View>
                                <Field
                                    label="Mobile Number"
                                    icon="call-outline"
                                    placeholder="Enter your 10-digit mobile number"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={handlePhoneChange}
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, phone: true }));
                                        setErrors(e => ({ ...e, phone: validate.phone(phone) }));
                                    }}
                                    error={touched.phone ? errors.phone : ''}
                                    maxLength={10}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSubmit}
                                />
                            </>
                        )}

                        {/* ── USER: username + password mode ── */}
                        {loginFor === 'user' && userMode === 'password' && (
                            <>
                                <Field
                                    label="Username"
                                    icon="person-outline"
                                    placeholder="Enter your username"
                                    value={usernameOrPhone}
                                    onChangeText={handleIdentifierChange}
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, identifier: true }));
                                        setErrors(e => ({
                                            ...e,
                                            identifier: validate.usernameOrPhone(usernameOrPhone),
                                        }));
                                    }}
                                    error={touched.identifier ? errors.identifier : ''}
                                    returnKeyType="next"
                                    autoCapitalize="none"
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
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, password: true }));
                                        setErrors(e => ({
                                            ...e,
                                            password: validate.password(password),
                                        }));
                                    }}
                                    error={touched.password ? errors.password : ''}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSubmit}
                                />
                                {/* Forgot password → switch to phone mode */}
                                <TouchableOpacity
                                    onPress={() => {
                                        setUserMode('phone');
                                        setErrors({ identifier: '', phone: '', password: '' });
                                        setTouched({
                                            identifier: false,
                                            phone: false,
                                            password: false,
                                        });
                                    }}
                                    style={styles.forgotWrap}
                                >
                                    <Text style={styles.forgotText}>
                                        Forgot Password? Login with phone →
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* ── PANDIT: phone/username + password ── */}
                        {loginFor === 'pandit' && (
                            <>
                                <Field
                                    label={identifierLabel}
                                    icon="person-outline"
                                    placeholder={identifierPlaceholder}
                                    value={usernameOrPhone}
                                    onChangeText={handleIdentifierChange}
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, identifier: true }));
                                        setErrors(e => ({
                                            ...e,
                                            identifier: validate.usernameOrPhone(usernameOrPhone),
                                        }));
                                    }}
                                    error={touched.identifier ? errors.identifier : ''}
                                    returnKeyType="next"
                                    autoCapitalize="none"
                                    keyboardType={
                                        /^\d+$/.test(usernameOrPhone) ? 'phone-pad' : 'default'
                                    }
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
                                    onBlur={() => {
                                        setTouched(t => ({ ...t, password: true }));
                                        setErrors(e => ({
                                            ...e,
                                            password: validate.password(password),
                                        }));
                                    }}
                                    error={touched.password ? errors.password : ''}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSubmit}
                                />
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('forgotPassword')}
                                    style={styles.forgotWrap}
                                >
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* ── Submit Button ── */}
                        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                            <TouchableOpacity
                                onPress={handleSubmit}
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
                                        <Text style={styles.loginBtnText}>{btnLabel}</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Back to username/password (phone mode only) */}
                        {loginFor === 'user' && userMode === 'phone' && (
                            <TouchableOpacity
                                onPress={() => {
                                    setUserMode('password');
                                    setErrors({ identifier: '', phone: '', password: '' });
                                    setTouched({
                                        identifier: false,
                                        phone: false,
                                        password: false,
                                    });
                                }}
                                style={styles.switchModeWrap}
                            >
                                <Text style={styles.switchModeText}>
                                    ← Back to username & password
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* OR divider — only on user password mode */}
                        {loginFor === 'user' && userMode === 'password' && (
                            <>
                                <View style={styles.orRow}>
                                    <View style={styles.orLine} />
                                    <Text style={styles.orText}>OR</Text>
                                    <View style={styles.orLine} />
                                </View>
                                <View style={styles.socialRow}>
                                    <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                                        <Text style={styles.socialBtnText}>G Google</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                                        <Text style={styles.socialBtnText}>✆ OTP</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                    {/* ── Bottom register link ── */}
                    {loginFor === 'user' && (
                        <View style={styles.bottomRow}>
                            <Text style={styles.bottomText}>New devotee? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('register')}>
                                <Text style={styles.bottomLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {loginFor === 'pandit' && (
                        <View style={styles.bottomRow}>
                            <Text style={styles.bottomText}>New pandit? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('panditRegister')}>
                                <Text style={styles.bottomLink}>Register Here</Text>
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

    ornament: { position: 'absolute', color: Colors.primary, opacity: 0.25, fontSize: 16 },
    ornTL: { top: 16, left: 20 },
    ornTR: { top: 16, right: 20 },

    scroll: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xxxl,
        paddingBottom: Spacing.xl,
    },

    // ── Header ──
    header: { alignItems: 'center', marginBottom: Spacing.xxl },
    diya: { fontSize: 56, marginBottom: 4 },
    om: {
        fontSize: 48,
        color: Colors.primary,
        fontWeight: '700',
        lineHeight: 56,
        textShadowColor: Colors.primaryLight,
        textShadowRadius: 8,
        textShadowOffset: { width: 0, height: 0 },
    },
    appName: {
        fontSize: Fonts.sizes.xl,
        color: Colors.textPrimary,
        fontWeight: '700',
        letterSpacing: 6,
        marginTop: 4,
    },
    tagline: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        letterSpacing: 1.5,
        marginTop: 4,
    },
    headerDivider: {
        width: 60,
        height: 1.5,
        backgroundColor: Colors.primary,
        opacity: 0.5,
        marginTop: Spacing.md,
        borderRadius: 2,
    },

    // ── Role selector card ──
    roleCard: {
        backgroundColor: Colors.cardBg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadow.sm,
    },
    roleCardLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        fontWeight: '700',
        letterSpacing: 3,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    rolePill: {
        flexDirection: 'row',
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 4,
        gap: 4,
    },
    roleTabWrap: { flex: 1 },
    roleTabActive: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.sm,
        ...Shadow.sm,
    },
    roleTabInactive: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.sm,
    },
    roleTabEmoji: { fontSize: 16 },
    roleTabTextActive: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.textLight,
        letterSpacing: 0.5,
    },
    roleTabTextInactive: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '600',
        color: Colors.textMuted,
        letterSpacing: 0.5,
    },

    // ── Form card ──
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.xxl,
        ...Shadow.lg,
    },
    cardTitle: {
        fontSize: Fonts.sizes.xs,
        color: Colors.primary,
        fontWeight: '700',
        letterSpacing: 4,
        marginBottom: Spacing.xl,
    },

    // Info box (phone-only mode)
    infoBox: {
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    infoBoxText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        lineHeight: 18,
    },

    // Forgot password
    forgotWrap: {
        alignSelf: 'flex-end',
        marginTop: -Spacing.xs,
        marginBottom: Spacing.lg,
    },
    forgotText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.primary,
        letterSpacing: 0.3,
        fontWeight: '600',
    },

    // Switch mode link (back to username/password)
    switchModeWrap: {
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    switchModeText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        fontWeight: '600',
        letterSpacing: 0.3,
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
    orText: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, letterSpacing: 2 },

    // ── Social ──
    socialRow: { flexDirection: 'row', gap: Spacing.sm },
    socialBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.saffronBg,
        alignItems: 'center',
    },
    socialBtnText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
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
        color: Colors.primary,
        fontWeight: '700',
    },
});
