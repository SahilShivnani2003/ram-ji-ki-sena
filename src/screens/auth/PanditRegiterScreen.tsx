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
import { panditAPI } from '../../service/apis/panditServices';

type Props = NativeStackScreenProps<RootParamList, 'panditRegister'>;

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormState {
    fullName: string;
    username: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    experience: string;
    specialization: string;
    languages: string;
    password: string;
    confirmPassword: string;
}

interface ErrorState {
    fullName: string;
    username: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    experience: string;
    specialization: string;
    languages: string;
    password: string;
    confirmPassword: string;
}

// ── Validation ────────────────────────────────────────────────────────────────
const validate = {
    fullName: (v: string) => {
        if (!v.trim()) return 'Full name is required';
        if (v.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
    },
    username: (v: string) => {
        if (!v.trim()) return 'Username is required';
        if (v.length < 4) return 'Username must be at least 4 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers and underscores';
        return '';
    },
    phone: (v: string) => {
        if (!v) return 'Phone number is required';
        if (!/^\d{10}$/.test(v)) return 'Enter a valid 10-digit mobile number';
        return '';
    },
    email: (v: string) => {
        if (!v) return '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
        return '';
    },
    city: (v: string) => (!v.trim() ? 'City is required' : ''),
    state: (v: string) => (!v.trim() ? 'State is required' : ''),
    experience: (v: string) => {
        if (!v) return 'Experience is required';
        if (isNaN(Number(v)) || Number(v) < 0) return 'Enter valid years';
        return '';
    },
    specialization: (v: string) => (!v.trim() ? 'At least one specialization is required' : ''),
    languages: (v: string) => (!v.trim() ? 'At least one language is required' : ''),
    password: (v: string) => {
        if (!v) return 'Password is required';
        if (v.length < 8) return 'Minimum 8 characters';
        if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter';
        if (!/[0-9]/.test(v)) return 'Include at least one number';
        return '';
    },
    confirmPassword: (v: string, password: string) => {
        if (!v) return 'Please confirm your password';
        if (v !== password) return 'Passwords do not match';
        return '';
    },
};

const INITIAL_FORM: FormState = {
    fullName: '',
    username: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    experience: '',
    specialization: '',
    languages: '',
    password: '',
    confirmPassword: '',
};

const INITIAL_ERRORS: ErrorState = {
    fullName: '',
    username: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    experience: '',
    specialization: '',
    languages: '',
    password: '',
    confirmPassword: '',
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <View style={sectionStyles.row}>
        <LinearGradient
            colors={[Colors.primary, Colors.secondary] as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={sectionStyles.iconWrap}
        >
            <Text style={sectionStyles.icon}>{icon}</Text>
        </LinearGradient>
        <Text style={sectionStyles.title}>{title}</Text>
        <View style={sectionStyles.line} />
    </View>
);

const sectionStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: { fontSize: 14 },
    title: {
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    line: { flex: 1, height: 1, backgroundColor: Colors.border },
});

// ── Password strength ─────────────────────────────────────────────────────────
const getStrength = (p: string): { level: number; label: string; color: string } => {
    if (!p) return { level: 0, label: '', color: Colors.border };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    if (score <= 1) return { level: score, label: 'Weak', color: Colors.error };
    if (score === 2) return { level: score, label: 'Fair', color: Colors.warning };
    if (score === 3) return { level: score, label: 'Good', color: '#8BC34A' };
    return { level: score, label: 'Strong', color: Colors.success };
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function PanditRegisterScreen({ navigation }: Props) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<ErrorState>(INITIAL_ERRORS);
    const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
        fullName: false,
        username: false,
        phone: false,
        email: false,
        city: false,
        state: false,
        experience: false,
        specialization: false,
        languages: false,
        password: false,
        confirmPassword: false,
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const btnScale = useRef(new Animated.Value(1)).current;
    const strength = getStrength(form.password);

    // ── Field updater ─────────────────────────────────────────────────────────
    const setField = (key: keyof FormState, value: string) => {
        setForm(f => ({ ...f, [key]: value }));
        if (touched[key]) validateField(key, value);
    };

    const touchField = (key: keyof FormState) => {
        setTouched(t => ({ ...t, [key]: true }));
        validateField(key, form[key]);
    };

    const validateField = (key: keyof FormState, value: string) => {
        let err = '';
        switch (key) {
            case 'fullName':
                err = validate.fullName(value);
                break;
            case 'username':
                err = validate.username(value);
                break;
            case 'phone':
                err = validate.phone(value);
                break;
            case 'email':
                err = validate.email(value);
                break;
            case 'city':
                err = validate.city(value);
                break;
            case 'state':
                err = validate.state(value);
                break;
            case 'experience':
                err = validate.experience(value);
                break;
            case 'specialization':
                err = validate.specialization(value);
                break;
            case 'languages':
                err = validate.languages(value);
                break;
            case 'password':
                err = validate.password(value);
                break;
            case 'confirmPassword':
                err = validate.confirmPassword(value, form.password);
                break;
        }
        setErrors(e => ({ ...e, [key]: err }));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleRegister = async () => {
        // Touch all fields
        const allTouched = Object.keys(touched).reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Record<keyof FormState, boolean>,
        );
        setTouched(allTouched);

        // Run all validations
        const newErrors: ErrorState = {
            fullName: validate.fullName(form.fullName),
            username: validate.username(form.username),
            phone: validate.phone(form.phone),
            email: validate.email(form.email),
            city: validate.city(form.city),
            state: validate.state(form.state),
            experience: validate.experience(form.experience),
            specialization: validate.specialization(form.specialization),
            languages: validate.languages(form.languages),
            password: validate.password(form.password),
            confirmPassword: validate.confirmPassword(form.confirmPassword, form.password),
        };
        setErrors(newErrors);

        const hasError = Object.values(newErrors).some(e => !!e);
        if (hasError) {
            Alert.alert('Incomplete Form', 'Please fix the errors before submitting.');
            return;
        }

        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
            Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        setLoading(true);
        try {
            // TODO: call your panditAPI.register(payload)
            const payload = {
                full_name: form.fullName,
                username: form.username,
                phone: form.phone,
                email: form.email || undefined,
                city: form.city,
                state: form.state,
                experience_years: Number(form.experience),
                specializations: form.specialization
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                languages: form.languages
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                password: form.password,
            };
            console.log('PANDIT REGISTER PAYLOAD:', payload);
            const response = await panditAPI.register(payload);
            if (response.data?.success) { navigation.replace('login'); }
            Alert.alert(
                'Registration Submitted',
                "Your profile is under review. We'll notify you soon!",
                [{ text: 'OK', onPress: () => navigation.replace('login') }],
            );
        } catch (error: any) {
            Alert.alert(
                'Error',
                error?.response?.data?.message ?? 'Registration failed. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

            {/* Warm background */}
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

            {/* Header */}
            <LinearGradient
                colors={[Colors.secondary, Colors.primary] as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerEmoji}>🔱</Text>
                        <View>
                            <Text style={styles.headerTitle}>Pandit Registration</Text>
                            <Text style={styles.headerSub}>Join the Aaradhana family</Text>
                        </View>
                    </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressWrap}>
                    <LinearGradient
                        colors={[Colors.gold, Colors.primaryLight] as string[]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.progressFill}
                    />
                </View>
                <Text style={styles.progressLabel}>
                    Complete your profile to start accepting bookings
                </Text>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ══ BASIC INFORMATION ══ */}
                    <View style={styles.card}>
                        <SectionHeader icon="👤" title="Basic Information" />

                        {/* Full Name + Username */}
                        <View style={styles.row2}>
                            <View style={styles.halfField}>
                                <Field
                                    label="Full Name"
                                    icon="person-outline"
                                    placeholder="Pandit Shri..."
                                    value={form.fullName}
                                    onChangeText={v => setField('fullName', v)}
                                    onBlur={() => touchField('fullName')}
                                    error={touched.fullName ? errors.fullName : ''}
                                    returnKeyType="next"
                                />
                            </View>
                            <View style={styles.halfField}>
                                <Field
                                    label="Username"
                                    icon="at-outline"
                                    placeholder="panditji123"
                                    value={form.username}
                                    onChangeText={v =>
                                        setField('username', v.toLowerCase().replace(/\s/g, ''))
                                    }
                                    onBlur={() => touchField('username')}
                                    error={touched.username ? errors.username : ''}
                                    returnKeyType="next"
                                    autoCapitalize="none"
                                />
                                {!errors.username && form.username.length >= 4 && (
                                    <Text style={styles.hintText}>✓ Unique username for login</Text>
                                )}
                                {!touched.username && !form.username && (
                                    <Text style={styles.hintText}>Unique username for login</Text>
                                )}
                            </View>
                        </View>

                        {/* Phone + Email */}
                        <View style={styles.row2}>
                            <View style={styles.halfField}>
                                <Field
                                    label="Phone Number"
                                    icon="call-outline"
                                    placeholder="10 digit mobile number"
                                    keyboardType="phone-pad"
                                    value={form.phone}
                                    onChangeText={v =>
                                        setField('phone', v.replace(/\D/g, '').slice(0, 10))
                                    }
                                    onBlur={() => touchField('phone')}
                                    error={touched.phone ? errors.phone : ''}
                                    maxLength={10}
                                    returnKeyType="next"
                                />
                            </View>
                            <View style={styles.halfField}>
                                <Field
                                    label="Email (Optional)"
                                    icon="mail-outline"
                                    placeholder="your.email@example.com"
                                    keyboardType="email-address"
                                    value={form.email}
                                    onChangeText={v => setField('email', v.trim())}
                                    onBlur={() => touchField('email')}
                                    error={touched.email ? errors.email : ''}
                                    returnKeyType="next"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    </View>

                    {/* ══ LOCATION ══ */}
                    <View style={styles.card}>
                        <SectionHeader icon="📍" title="Location" />

                        <View style={styles.row2}>
                            <View style={styles.halfField}>
                                <Field
                                    label="City"
                                    icon="business-outline"
                                    placeholder="Your city"
                                    value={form.city}
                                    onChangeText={v => setField('city', v)}
                                    onBlur={() => touchField('city')}
                                    error={touched.city ? errors.city : ''}
                                    returnKeyType="next"
                                />
                            </View>
                            <View style={styles.halfField}>
                                <Field
                                    label="State"
                                    icon="map-outline"
                                    placeholder="Your state"
                                    value={form.state}
                                    onChangeText={v => setField('state', v)}
                                    onBlur={() => touchField('state')}
                                    error={touched.state ? errors.state : ''}
                                    returnKeyType="next"
                                />
                            </View>
                        </View>
                    </View>

                    {/* ══ PROFESSIONAL DETAILS ══ */}
                    <View style={styles.card}>
                        <SectionHeader icon="🏛️" title="Professional Details" />

                        {/* Experience */}
                        <Field
                            label="Experience (Years)"
                            icon="time-outline"
                            placeholder="Years of experience"
                            keyboardType="numeric"
                            value={form.experience}
                            onChangeText={v => setField('experience', v.replace(/\D/g, ''))}
                            onBlur={() => touchField('experience')}
                            error={touched.experience ? errors.experience : ''}
                            returnKeyType="next"
                            maxLength={2}
                        />

                        {/* Specialization */}
                        <Field
                            label="Specialization"
                            icon="star-outline"
                            placeholder="e.g., Vedic Rituals, Marriage, Griha Pravesh (comma separated)"
                            value={form.specialization}
                            onChangeText={v => setField('specialization', v)}
                            onBlur={() => touchField('specialization')}
                            error={touched.specialization ? errors.specialization : ''}
                            returnKeyType="next"
                        />
                        <Text style={styles.fieldHint}>
                            Separate multiple specializations with commas
                        </Text>

                        {/* Specialization quick-pick chips */}
                        <View style={styles.chipsRow}>
                            {[
                                'Satyanarayan',
                                'Griha Pravesh',
                                'Vivah',
                                'Havan',
                                'Navratri',
                                'Mundan',
                                'Katha',
                            ].map(tag => {
                                const selected = form.specialization
                                    .split(',')
                                    .map(s => s.trim().toLowerCase())
                                    .includes(tag.toLowerCase());
                                return (
                                    <TouchableOpacity
                                        key={tag}
                                        activeOpacity={0.75}
                                        onPress={() => {
                                            const arr = form.specialization
                                                .split(',')
                                                .map(s => s.trim())
                                                .filter(Boolean);
                                            const idx = arr.findIndex(
                                                s => s.toLowerCase() === tag.toLowerCase(),
                                            );
                                            if (idx >= 0) arr.splice(idx, 1);
                                            else arr.push(tag);
                                            setField('specialization', arr.join(', '));
                                        }}
                                    >
                                        {selected ? (
                                            <LinearGradient
                                                colors={
                                                    [Colors.primary, Colors.secondary] as string[]
                                                }
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.chipActive}
                                            >
                                                <Text style={styles.chipTextActive}>✓ {tag}</Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.chip}>
                                                <Text style={styles.chipText}>{tag}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Languages */}
                        <Field
                            label="Languages"
                            icon="language-outline"
                            placeholder="e.g., Hindi, Sanskrit, English (comma separated)"
                            value={form.languages}
                            onChangeText={v => setField('languages', v)}
                            onBlur={() => touchField('languages')}
                            error={touched.languages ? errors.languages : ''}
                            returnKeyType="next"
                        />
                        <Text style={styles.fieldHint}>
                            Separate multiple languages with commas
                        </Text>

                        {/* Language quick-pick chips */}
                        <View style={styles.chipsRow}>
                            {['Hindi', 'Sanskrit', 'English', 'Bengali', 'Marathi', 'Tamil'].map(
                                lang => {
                                    const selected = form.languages
                                        .split(',')
                                        .map(s => s.trim().toLowerCase())
                                        .includes(lang.toLowerCase());
                                    return (
                                        <TouchableOpacity
                                            key={lang}
                                            activeOpacity={0.75}
                                            onPress={() => {
                                                const arr = form.languages
                                                    .split(',')
                                                    .map(s => s.trim())
                                                    .filter(Boolean);
                                                const idx = arr.findIndex(
                                                    s => s.toLowerCase() === lang.toLowerCase(),
                                                );
                                                if (idx >= 0) arr.splice(idx, 1);
                                                else arr.push(lang);
                                                setField('languages', arr.join(', '));
                                            }}
                                        >
                                            {selected ? (
                                                <LinearGradient
                                                    colors={
                                                        [
                                                            Colors.primary,
                                                            Colors.secondary,
                                                        ] as string[]
                                                    }
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    style={styles.chipActive}
                                                >
                                                    <Text style={styles.chipTextActive}>
                                                        ✓ {lang}
                                                    </Text>
                                                </LinearGradient>
                                            ) : (
                                                <View style={styles.chip}>
                                                    <Text style={styles.chipText}>{lang}</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                },
                            )}
                        </View>
                    </View>

                    {/* ══ SECURITY ══ */}
                    <View style={styles.card}>
                        <SectionHeader icon="🔐" title="Security" />

                        <Field
                            label="Password"
                            icon="lock-closed-outline"
                            placeholder="Create a strong password"
                            secureTextEntry={!showPass}
                            trailingIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
                            onTrailingPress={() => setShowPass(p => !p)}
                            value={form.password}
                            onChangeText={v => setField('password', v)}
                            onBlur={() => touchField('password')}
                            error={touched.password ? errors.password : ''}
                            returnKeyType="next"
                        />

                        {/* Password strength meter */}
                        {form.password.length > 0 && (
                            <View style={styles.strengthWrap}>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3, 4].map(i => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.strengthBar,
                                                {
                                                    backgroundColor:
                                                        i <= strength.level
                                                            ? strength.color
                                                            : Colors.border,
                                                },
                                            ]}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                    {strength.label}
                                </Text>
                            </View>
                        )}

                        <Field
                            label="Confirm Password"
                            icon="lock-closed-outline"
                            placeholder="Re-enter password"
                            secureTextEntry={!showConfirmPass}
                            trailingIcon={showConfirmPass ? 'eye-off-outline' : 'eye-outline'}
                            onTrailingPress={() => setShowConfirmPass(p => !p)}
                            value={form.confirmPassword}
                            onChangeText={v => setField('confirmPassword', v)}
                            onBlur={() => touchField('confirmPassword')}
                            error={touched.confirmPassword ? errors.confirmPassword : ''}
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                        />

                        {/* Match indicator */}
                        {form.confirmPassword.length > 0 && (
                            <Text
                                style={[
                                    styles.matchText,
                                    {
                                        color:
                                            form.password === form.confirmPassword
                                                ? Colors.success
                                                : Colors.error,
                                    },
                                ]}
                            >
                                {form.password === form.confirmPassword
                                    ? '✓ Passwords match'
                                    : '✗ Passwords do not match'}
                            </Text>
                        )}
                    </View>

                    {/* ══ TERMS ══ */}
                    <View style={styles.termsWrap}>
                        <Text style={styles.termsText}>
                            By registering, you agree to Aaradhana's{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>. Your profile will
                            be reviewed before activation.
                        </Text>
                    </View>

                    {/* ══ REGISTER BUTTON ══ */}
                    <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                        <TouchableOpacity
                            onPress={handleRegister}
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
                                style={styles.registerBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator color={Colors.textLight} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.registerBtnEmoji}>🔱</Text>
                                        <Text style={styles.registerBtnText}>
                                            REGISTER AS PANDIT
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Login link */}
                    <View style={styles.bottomRow}>
                        <Text style={styles.bottomText}>Already registered? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('login')}>
                            <Text style={styles.bottomLink}>Sign In</Text>
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

    // Header
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: { fontSize: 18, color: Colors.textLight, lineHeight: 22 },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    headerEmoji: { fontSize: 28 },
    headerTitle: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '700',
        color: Colors.textLight,
        letterSpacing: 0.3,
    },
    headerSub: { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
    progressWrap: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
    },
    progressFill: { height: '100%', width: '100%', borderRadius: 2 },
    progressLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.3 },

    // Scroll
    scroll: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xxxl,
        gap: Spacing.lg,
    },

    // Cards
    card: {
        backgroundColor: Colors.cardBg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.xl,
        ...Shadow.md,
    },

    // 2-column row
    row2: { flexDirection: 'row', gap: Spacing.md },
    halfField: { flex: 1 },

    hintText: {
        fontSize: 10,
        color: Colors.textMuted,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.xs,
        letterSpacing: 0.2,
    },

    // Field hint
    fieldHint: {
        fontSize: 10,
        color: Colors.textMuted,
        marginTop: -Spacing.xs,
        marginBottom: Spacing.md,
        letterSpacing: 0.2,
    },

    // Quick-pick chips
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    chip: {
        borderRadius: 20,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 5,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.saffronBg,
    },
    chipActive: {
        borderRadius: 20,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 5,
    },
    chipText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
    chipTextActive: { fontSize: 11, color: Colors.textLight, fontWeight: '700' },

    // Password strength
    strengthWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: -Spacing.xs,
        marginBottom: Spacing.md,
    },
    strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 44 },

    // Match
    matchText: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -Spacing.sm,
        marginBottom: Spacing.xs,
    },

    // Terms
    termsWrap: {
        backgroundColor: Colors.saffronBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 3,
        borderLeftColor: Colors.gold,
        padding: Spacing.md,
    },
    termsText: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textSecondary,
        lineHeight: 18,
        textAlign: 'center',
    },
    termsLink: { color: Colors.primary, fontWeight: '700' },

    // Register button
    registerBtn: {
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        ...Shadow.lg,
    },
    registerBtnEmoji: { fontSize: 16 },
    registerBtnText: {
        fontSize: Fonts.sizes.md,
        color: Colors.textLight,
        fontWeight: '700',
        letterSpacing: 3,
    },

    // Bottom
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    bottomText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
    bottomLink: { fontSize: Fonts.sizes.sm, color: Colors.primary, fontWeight: '700' },
});
