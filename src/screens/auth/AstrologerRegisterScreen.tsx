import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
      ActivityIndicator,
      Alert,
      Keyboard,
      KeyboardAvoidingView,
      LayoutChangeEvent,
      Platform,
      Pressable,
      ScrollView,
      StatusBar,
      StyleSheet,
      Text,
      TextInput,
      TextInputProps,
      useWindowDimensions,
      View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BorderRadius, Colors, Fonts, Shadow, Spacing } from '../../theme/index';
import { IRegisterAstrologer } from '../../types/IRegisterAstrologer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../../navigation/AppNavigator';
import { astrologerApi } from '../../service/apis/astroServices';

type AstrologerRegisterScreenProps = NativeStackScreenProps<RootParamList, 'AstrologerRegister'>;

// interface AstrologerRegisterScreenProps {
//       /** Reject with an Error to show its message to the user. */
//       onSubmit: (payload: IRegisterAstrologer) => Promise<void>;
//       onPressLogin: () => void;
//       onBack?: () => void;
// }

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface FormState {
      name: string;
      username: string;
      phone: string;
      email: string;
      city: string;
      state: string;
      experience: string;
      fee: string;
      specialties: string[];
      languages: string[];
      education: string;
      tagline: string;
      bio: string;
      password: string;
      confirm: string;
}

type InputKey =
      | 'name'
      | 'username'
      | 'phone'
      | 'email'
      | 'city'
      | 'state'
      | 'experience'
      | 'fee'
      | 'education'
      | 'tagline'
      | 'bio'
      | 'password'
      | 'confirm';

type ErrorKey = Exclude<InputKey, 'education' | 'tagline' | 'bio'> | 'specialties';
type Errors = Partial<Record<ErrorKey, string>>;
type SectionKey = 'personal' | 'expertise' | 'security';


const SPECIALTIES: ReadonlyArray<string> = [
      'Vedic Astrology',
      'Tarot Card Reading',
      'Kundli Milan (Horoscope Matching)',
      'Vastu Shastra',
      'Numerology',
      'Palmistry',
      'Prashna Kundli (Question Horoscope)',
      'Gemology (Gemstone Consultancy)',
];

const LANGUAGES: ReadonlyArray<string> = [
      'Hindi',
      'English',
      'Sanskrit',
      'Marathi',
      'Gujarati',
      'Bengali',
      'Tamil',
      'Telugu',
      'Punjabi',
];

const INPUT_ORDER: ReadonlyArray<InputKey> = [
      'name',
      'username',
      'phone',
      'email',
      'city',
      'state',
      'experience',
      'fee',
      'education',
      'tagline',
      'bio',
      'password',
      'confirm',
];

const ERROR_ORDER: ReadonlyArray<ErrorKey> = [
      'name',
      'username',
      'phone',
      'email',
      'city',
      'state',
      'experience',
      'fee',
      'specialties',
      'password',
      'confirm',
];

const ERROR_SECTION: Record<ErrorKey, SectionKey> = {
      name: 'personal',
      username: 'personal',
      phone: 'personal',
      email: 'personal',
      city: 'expertise',
      state: 'expertise',
      experience: 'expertise',
      fee: 'expertise',
      specialties: 'expertise',
      password: 'security',
      confirm: 'security',
};

const INITIAL_FORM: FormState = {
      name: '',
      username: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      experience: '5',
      fee: '501',
      specialties: ['Vedic Astrology'],
      languages: ['Hindi', 'English'],
      education: '',
      tagline: '',
      bio: '',
      password: '',
      confirm: '',
};

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const MAX_TAGLINE = 80;
const MAX_BIO = 500;
const TWO_COLUMN_MIN_WIDTH = 400;

const validate = (f: FormState): Errors => {
      const e: Errors = {};

      if (f.name.trim().length < 3) e.name = 'Enter your full name';
      if (f.username && !USERNAME_RE.test(f.username)) {
            e.username = '3–20 letters, numbers, _ or .';
      }
      if (!PHONE_RE.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';
      if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) {
            e.email = 'Enter a valid email address';
      }

      if (!f.city.trim()) e.city = 'City is required';
      if (!f.state.trim()) e.state = 'State is required';

      const exp = Number(f.experience);
      if (f.experience === '' || Number.isNaN(exp) || exp < 0 || exp > 70) {
            e.experience = 'Enter 0–70 years';
      }
      const fee = Number(f.fee);
      if (f.fee === '' || Number.isNaN(fee) || fee < 1) {
            e.fee = 'Enter your fee per session';
      }

      if (f.specialties.length === 0) e.specialties = 'Select at least one specialty';

      if (f.password.length < 6) e.password = 'Use at least 6 characters';
      if (f.confirm !== f.password || f.confirm === '') {
            e.confirm = 'Passwords do not match';
      }
      return e;
};

interface Strength {
      level: 0 | 1 | 2 | 3 | 4;
      label: string;
      color: string;
}

const getStrength = (pw: string): Strength => {
      if (pw.length === 0) return { level: 0, label: '', color: Colors.border };
      let points = 0;
      if (pw.length >= 6) points += 1;
      if (pw.length >= 10) points += 1;
      if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) points += 1;
      if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) points += 1;
      const level = Math.max(1, Math.min(4, points)) as 1 | 2 | 3 | 4;
      const map: Record<1 | 2 | 3 | 4, { label: string; color: string }> = {
            1: { label: 'Weak', color: Colors.error },
            2: { label: 'Fair', color: Colors.warning },
            3: { label: 'Good', color: Colors.gold },
            4: { label: 'Strong', color: Colors.success },
      };
      return { level, ...map[level] };
};

const digitsOnly = (s: string, max: number): string => s.replace(/\D/g, '').slice(0, max);

const SectionHeader = ({ icon, title }: { icon: IconName; title: string }) => (
      <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
                  <Ionicons name={icon} size={18} color={Colors.goldDark} />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionRule} />
      </View>
);

interface FieldProps {
      label: string;
      error?: string;
      children: React.ReactNode;
      half?: boolean;
}

const Field = ({ label, error, children, half }: FieldProps) => (
      <View style={[styles.field, half && styles.half]}>
            <Text style={styles.label}>{label}</Text>
            {children}
            {error ? (
                  <View style={styles.errorRow} accessibilityLiveRegion="polite">
                        <Ionicons name="alert-circle-outline" size={13} color={Colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                  </View>
            ) : null}
      </View>
);

interface TextFieldProps {
      value: string;
      onChangeText: (t: string) => void;
      placeholder: string;
      accessibilityLabel: string;
      hasError?: boolean;
      multiline?: boolean;
      maxLength?: number;
      keyboardType?: 'default' | 'number-pad' | 'phone-pad' | 'email-address';
      autoCapitalize?: 'none' | 'words' | 'sentences';
      autoComplete?: TextInputProps['autoComplete'];
      textContentType?: TextInputProps['textContentType'];
      secureTextEntry?: boolean;
      returnKeyType?: 'next' | 'done';
      onSubmitEditing?: () => void;
      inputRef?: (r: TextInput | null) => void;
      prefix?: string;
      suffix?: string;
      right?: React.ReactNode;
}

const TextField = ({
      value,
      onChangeText,
      placeholder,
      accessibilityLabel,
      hasError,
      multiline,
      maxLength,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      autoComplete,
      textContentType,
      secureTextEntry,
      returnKeyType = 'next',
      onSubmitEditing,
      inputRef,
      prefix,
      suffix,
      right,
}: TextFieldProps) => {
      const [focused, setFocused] = useState(false);
      return (
            <View
                  style={[
                        styles.inputBox,
                        multiline && styles.inputBoxMultiline,
                        focused && styles.inputBoxFocused,
                        hasError && styles.inputBoxError,
                  ]}
            >
                  {prefix ? <Text style={styles.adornment}>{prefix}</Text> : null}
                  <TextInput
                        ref={inputRef}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.textMuted}
                        accessibilityLabel={accessibilityLabel}
                        multiline={multiline}
                        maxLength={maxLength}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        autoComplete={autoComplete}
                        textContentType={textContentType}
                        secureTextEntry={secureTextEntry}
                        autoCorrect={false}
                        returnKeyType={multiline ? 'default' : returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                        blurOnSubmit={!onSubmitEditing}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        textAlignVertical={multiline ? 'top' : 'center'}
                        style={[styles.input, multiline && styles.inputMultiline]}
                  />
                  {suffix ? <Text style={styles.adornment}>{suffix}</Text> : null}
                  {right}
            </View>
      );
};

const SpecialtyTile = ({
      label,
      selected,
      onPress,
}: {
      label: string;
      selected: boolean;
      onPress: () => void;
}) => (
      <Pressable
            onPress={onPress}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={label}
            style={({ pressed }) => [
                  styles.tile,
                  selected && styles.tileSelected,
                  pressed && { opacity: 0.85 },
            ]}
      >
            <Text style={[styles.tileText, selected && styles.tileTextSelected]}>{label}</Text>
            {selected ? (
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primaryDark} />
            ) : null}
      </Pressable>
);

const LanguageChip = ({
      label,
      selected,
      onPress,
}: {
      label: string;
      selected: boolean;
      onPress: () => void;
}) => (
      <Pressable
            onPress={onPress}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [
                  styles.chip,
                  selected && styles.chipSelected,
                  pressed && { opacity: 0.85 },
            ]}
      >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
      </Pressable>
);

const PasswordMeter = ({ password }: { password: string }) => {
      const s = getStrength(password);
      if (s.level === 0) return null;
      return (
            <View style={styles.meterWrap} accessibilityLabel={`Password strength ${s.label}`}>
                  <View style={styles.meterBars}>
                        {[1, 2, 3, 4].map(i => (
                              <View
                                    key={i}
                                    style={[
                                          styles.meterBar,
                                          { backgroundColor: i <= s.level ? s.color : Colors.border },
                                    ]}
                              />
                        ))}
                  </View>
                  <Text style={[styles.meterLabel, { color: s.color }]}>{s.label}</Text>
            </View>
      );
};

interface StepTrackerProps {
      steps: ReadonlyArray<{ label: string; done: boolean }>;
}

const StepTracker = ({ steps }: StepTrackerProps) => {
      const doneCount = steps.filter(s => s.done).length;
      return (
            <View style={styles.tracker} accessibilityLabel={`${doneCount} of ${steps.length} sections complete`}>
                  <View style={styles.trackerBars}>
                        {steps.map(s => (
                              <View key={s.label} style={styles.trackerItem}>
                                    <View style={[styles.trackerBar, s.done && styles.trackerBarDone]} />
                                    <View style={styles.trackerLabelRow}>
                                          {s.done ? (
                                                <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                                          ) : null}
                                          <Text style={[styles.trackerLabel, s.done && styles.trackerLabelDone]}>
                                                {s.label}
                                          </Text>
                                    </View>
                              </View>
                        ))}
                  </View>
            </View>
      );
};

export default function AstrologerRegisterScreen({ navigation }: AstrologerRegisterScreenProps) {
      const { width } = useWindowDimensions();
      const twoCol = width >= TWO_COLUMN_MIN_WIDTH;

      const [form, setForm] = useState<FormState>(INITIAL_FORM);
      const [errors, setErrors] = useState<Errors>({});
      const [submitted, setSubmitted] = useState(false);
      const [submitting, setSubmitting] = useState(false);
      const [showPassword, setShowPassword] = useState(false);

      const scrollRef = useRef<ScrollView>(null);
      const cardY = useRef(0);
      const sectionY = useRef<Record<SectionKey, number>>({
            personal: 0,
            expertise: 0,
            security: 0,
      });
      const inputRefs = useRef<Record<InputKey, TextInput | null>>({
            name: null,
            username: null,
            phone: null,
            email: null,
            city: null,
            state: null,
            experience: null,
            fee: null,
            education: null,
            tagline: null,
            bio: null,
            password: null,
            confirm: null,
      });

      // After the first submit attempt, keep errors in sync while the user fixes them.
      useEffect(() => {
            if (submitted) setErrors(validate(form));
      }, [form, submitted]);

      const onSubmit = async (data: any) => {
            try {
                  const response = await astrologerApi.register(data);
                  if (response.data?.success) { navigation.replace('login'); }
                  Alert.alert(
                        'Registration Submitted',
                        "Your profile is under review. We'll notify you soon!",
                        [{ text: 'OK', onPress: () => navigation.replace('login') }],
                  );
            } catch (error: any) {
                  Alert.alert('Error',
                        error?.response?.data?.message ?? 'Registration failed. Please try again later.',);
            }
      };

      const onPressLogin = () => {
            navigation.goBack();
      };

      const onBack = () => { navigation.goBack(); }

      const update = useCallback(
            <K extends keyof FormState>(key: K, value: FormState[K]) => {
                  setForm(prev => ({ ...prev, [key]: value }));
            },
            [],
      );

      const toggleIn = useCallback(
            (key: 'specialties' | 'languages', item: string) => {
                  setForm(prev => {
                        const list = prev[key];
                        return {
                              ...prev,
                              [key]: list.includes(item) ? list.filter(i => i !== item) : [...list, item],
                        };
                  });
            },
            [],
      );

      const setRef = (key: InputKey) => (r: TextInput | null) => {
            inputRefs.current[key] = r;
      };

      const focusAfter = (key: InputKey) => () => {
            const next = INPUT_ORDER[INPUT_ORDER.indexOf(key) + 1];
            if (next) inputRefs.current[next]?.focus();
      };

      const onSectionLayout = (key: SectionKey) => (e: LayoutChangeEvent) => {
            sectionY.current[key] = e.nativeEvent.layout.y;
      };

      const steps = useMemo(
            () => [
                  {
                        label: 'Personal',
                        done: form.name.trim().length >= 3 && PHONE_RE.test(form.phone),
                  },
                  {
                        label: 'Expertise',
                        done:
                              form.city.trim().length > 0 &&
                              form.state.trim().length > 0 &&
                              form.specialties.length > 0 &&
                              form.experience !== '' &&
                              Number(form.fee) >= 1,
                  },
                  {
                        label: 'Security',
                        done: form.password.length >= 6 && form.password === form.confirm,
                  },
            ],
            [form],
      );

      const handleSubmit = useCallback(async () => {
            if (submitting) return;
            Keyboard.dismiss();
            setSubmitted(true);

            const found = validate(form);
            setErrors(found);

            const first = ERROR_ORDER.find(k => found[k]);
            if (first) {
                  const y = cardY.current + sectionY.current[ERROR_SECTION[first]];
                  scrollRef.current?.scrollTo({ y: Math.max(0, y - Spacing.md), animated: true });
                  if (first !== 'specialties') {
                        setTimeout(() => inputRefs.current[first]?.focus(), 350);
                  }
                  return;
            }

            const payload: IRegisterAstrologer = {
                  name: form.name.trim(),
                  username: form.username || undefined,
                  phone: form.phone,
                  email: form.email.trim() || undefined,
                  city: form.city.trim(),
                  state: form.state.trim(),
                  experience: Number(form.experience),
                  consultationFee: Number(form.fee),
                  specialties: form.specialties,
                  languages: form.languages,
                  education: form.education.trim(),
                  tagline: form.tagline.trim(),
                  bio: form.bio.trim(),
                  password: form.password,
            };

            setSubmitting(true);
            try {
                  await onSubmit(payload);
            } catch (err) {
                  const message =
                        err instanceof Error ? err.message : 'Please check your details and try again.';
                  Alert.alert("Couldn't register", message);
            } finally {
                  setSubmitting(false);
            }
      }, [form, onSubmit, submitting]);

      const eyeButton = (
            <Pressable
                  onPress={() => setShowPassword(v => !v)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide passwords' : 'Show passwords'}
            >
                  <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={Colors.textMuted}
                  />
            </Pressable>
      );

      const rowStyle = twoCol ? styles.row : undefined;

      return (
            <View style={styles.root}>
                  <StatusBar barStyle="light-content" backgroundColor={Colors.darkBg} />

                  <KeyboardAvoidingView
                        style={styles.flex}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  >
                        <ScrollView
                              ref={scrollRef}
                              keyboardShouldPersistTaps="handled"
                              showsVerticalScrollIndicator={false}
                              contentContainerStyle={styles.scrollContent}
                        >
                              {/* ------------------------------- Hero ------------------------------- */}
                              <LinearGradient
                                    colors={Colors.gradientDark as string[]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.hero}
                              >
                                    <View style={styles.heroGlow} />
                                    <Text style={styles.heroWatermark}>ॐ</Text>

                                    {onBack ? (
                                          <Pressable
                                                onPress={onBack}
                                                accessibilityRole="button"
                                                accessibilityLabel="Go back"
                                                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
                                          >
                                                <Ionicons name="chevron-back" size={22} color={Colors.textLight} />
                                          </Pressable>
                                    ) : null}

                                    <Text style={styles.heroTitle}>Register as an Astrologer</Text>
                                    <Text style={styles.heroSub}>
                                          Create your profile and start guiding families with kundli, muhurat and more.
                                    </Text>
                              </LinearGradient>

                              {/* -------------------------------- Card ------------------------------ */}
                              <View
                                    style={styles.card}
                                    onLayout={(e: LayoutChangeEvent) => {
                                          cardY.current = e.nativeEvent.layout.y;
                                    }}
                              >
                                    <StepTracker steps={steps} />

                                    {/* ---------------------- 1. Personal details ---------------------- */}
                                    <View onLayout={onSectionLayout('personal')}>
                                          <SectionHeader icon="person-outline" title="1. Personal details" />

                                          <View style={rowStyle}>
                                                <Field label="Full Name *" error={errors.name} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('name')}
                                                            value={form.name}
                                                            onChangeText={t => update('name', t)}
                                                            placeholder="Ex. Pt. Radheshyam Shastri"
                                                            accessibilityLabel="Full name"
                                                            hasError={Boolean(errors.name)}
                                                            autoCapitalize="words"
                                                            autoComplete="name"
                                                            textContentType="name"
                                                            onSubmitEditing={focusAfter('name')}
                                                      />
                                                </Field>
                                                <Field label="Username (optional)" error={errors.username} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('username')}
                                                            value={form.username}
                                                            onChangeText={t =>
                                                                  update('username', t.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20))
                                                            }
                                                            placeholder="E.g. astro_radheshyam"
                                                            accessibilityLabel="Username"
                                                            hasError={Boolean(errors.username)}
                                                            autoCapitalize="none"
                                                            autoComplete="username"
                                                            textContentType="username"
                                                            onSubmitEditing={focusAfter('username')}
                                                      />
                                                </Field>
                                          </View>

                                          <View style={rowStyle}>
                                                <Field label="Mobile Number (WhatsApp) *" error={errors.phone} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('phone')}
                                                            value={form.phone}
                                                            onChangeText={t => update('phone', digitsOnly(t, 10))}
                                                            placeholder="10-digit phone number"
                                                            accessibilityLabel="Mobile number"
                                                            hasError={Boolean(errors.phone)}
                                                            keyboardType="phone-pad"
                                                            maxLength={10}
                                                            prefix="+91"
                                                            autoComplete="tel"
                                                            textContentType="telephoneNumber"
                                                            onSubmitEditing={focusAfter('phone')}
                                                      />
                                                </Field>
                                                <Field label="Email (optional)" error={errors.email} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('email')}
                                                            value={form.email}
                                                            onChangeText={t => update('email', t)}
                                                            placeholder="shastri@example.com"
                                                            accessibilityLabel="Email"
                                                            hasError={Boolean(errors.email)}
                                                            keyboardType="email-address"
                                                            autoCapitalize="none"
                                                            autoComplete="email"
                                                            textContentType="emailAddress"
                                                            onSubmitEditing={focusAfter('email')}
                                                      />
                                                </Field>
                                          </View>
                                    </View>

                                    {/* ------------------- 2. Location & expertise --------------------- */}
                                    <View onLayout={onSectionLayout('expertise')}>
                                          <SectionHeader icon="location-outline" title="2. Location & expertise" />

                                          <View style={rowStyle}>
                                                <Field label="City *" error={errors.city} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('city')}
                                                            value={form.city}
                                                            onChangeText={t => update('city', t)}
                                                            placeholder="For example, Bhopal"
                                                            accessibilityLabel="City"
                                                            hasError={Boolean(errors.city)}
                                                            autoCapitalize="words"
                                                            onSubmitEditing={focusAfter('city')}
                                                      />
                                                </Field>
                                                <Field label="State *" error={errors.state} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('state')}
                                                            value={form.state}
                                                            onChangeText={t => update('state', t)}
                                                            placeholder="Ex. Madhya Pradesh"
                                                            accessibilityLabel="State"
                                                            hasError={Boolean(errors.state)}
                                                            autoCapitalize="words"
                                                            onSubmitEditing={focusAfter('state')}
                                                      />
                                                </Field>
                                          </View>

                                          <View style={rowStyle}>
                                                <Field label="Experience (in years) *" error={errors.experience} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('experience')}
                                                            value={form.experience}
                                                            onChangeText={t => update('experience', digitsOnly(t, 2))}
                                                            placeholder="e.g. 5"
                                                            accessibilityLabel="Experience in years"
                                                            hasError={Boolean(errors.experience)}
                                                            keyboardType="number-pad"
                                                            maxLength={2}
                                                            suffix="yrs"
                                                            onSubmitEditing={focusAfter('experience')}
                                                      />
                                                </Field>
                                                <Field
                                                      label="Consultation Fee (₹ per session) *"
                                                      error={errors.fee}
                                                      half={twoCol}
                                                >
                                                      <TextField
                                                            inputRef={setRef('fee')}
                                                            value={form.fee}
                                                            onChangeText={t => update('fee', digitsOnly(t, 6))}
                                                            placeholder="e.g. 501"
                                                            accessibilityLabel="Consultation fee per session in rupees"
                                                            hasError={Boolean(errors.fee)}
                                                            keyboardType="number-pad"
                                                            maxLength={6}
                                                            prefix="₹"
                                                            onSubmitEditing={focusAfter('fee')}
                                                      />
                                                </Field>
                                          </View>

                                          <Field label="Your Specialties (Select one or more) *" error={errors.specialties}>
                                                <View style={styles.tileGrid}>
                                                      {SPECIALTIES.map(s => (
                                                            <View key={s} style={twoCol ? styles.tileCell : styles.tileCellFull}>
                                                                  <SpecialtyTile
                                                                        label={s}
                                                                        selected={form.specialties.includes(s)}
                                                                        onPress={() => toggleIn('specialties', s)}
                                                                  />
                                                            </View>
                                                      ))}
                                                </View>
                                          </Field>

                                          <Field label="Languages">
                                                <View style={styles.chipWrap}>
                                                      {LANGUAGES.map(l => (
                                                            <LanguageChip
                                                                  key={l}
                                                                  label={l}
                                                                  selected={form.languages.includes(l)}
                                                                  onPress={() => toggleIn('languages', l)}
                                                            />
                                                      ))}
                                                </View>
                                          </Field>

                                          <Field label="Education/Degree (Qualifications)">
                                                <TextField
                                                      inputRef={setRef('education')}
                                                      value={form.education}
                                                      onChangeText={t => update('education', t)}
                                                      placeholder="Ex. Astrologer Visharad, B.A. Sanskrit"
                                                      accessibilityLabel="Education or degree"
                                                      autoCapitalize="words"
                                                      onSubmitEditing={focusAfter('education')}
                                                />
                                          </Field>

                                          <Field label="Short Slogan (Tagline)">
                                                <TextField
                                                      inputRef={setRef('tagline')}
                                                      value={form.tagline}
                                                      onChangeText={t => update('tagline', t)}
                                                      placeholder="For example, accurate horoscope and marriage analysis for 15 years."
                                                      accessibilityLabel="Short tagline"
                                                      maxLength={MAX_TAGLINE}
                                                      onSubmitEditing={focusAfter('tagline')}
                                                />
                                                <Text style={styles.counter}>
                                                      {form.tagline.length}/{MAX_TAGLINE}
                                                </Text>
                                          </Field>

                                          <Field label="Detailed information about yourself (Bio / About)">
                                                <TextField
                                                      inputRef={setRef('bio')}
                                                      value={form.bio}
                                                      onChangeText={t => update('bio', t)}
                                                      placeholder="Please elaborate on your experience, knowledge and consulting style..."
                                                      accessibilityLabel="Bio"
                                                      multiline
                                                      maxLength={MAX_BIO}
                                                />
                                                <Text style={styles.counter}>
                                                      {form.bio.length}/{MAX_BIO}
                                                </Text>
                                          </Field>
                                    </View>

                                    {/* ---------------------- 3. Security & password ------------------- */}
                                    <View onLayout={onSectionLayout('security')}>
                                          <SectionHeader icon="lock-closed-outline" title="3. Security and password" />

                                          <View style={rowStyle}>
                                                <Field label="Password *" error={errors.password} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('password')}
                                                            value={form.password}
                                                            onChangeText={t => update('password', t)}
                                                            placeholder="At least 6 characters"
                                                            accessibilityLabel="Password"
                                                            hasError={Boolean(errors.password)}
                                                            secureTextEntry={!showPassword}
                                                            autoCapitalize="none"
                                                            autoComplete="password-new"
                                                            textContentType="newPassword"
                                                            onSubmitEditing={focusAfter('password')}
                                                            right={eyeButton}
                                                      />
                                                      <PasswordMeter password={form.password} />
                                                </Field>
                                                <Field label="Confirm Password *" error={errors.confirm} half={twoCol}>
                                                      <TextField
                                                            inputRef={setRef('confirm')}
                                                            value={form.confirm}
                                                            onChangeText={t => update('confirm', t)}
                                                            placeholder="re-enter password"
                                                            accessibilityLabel="Confirm password"
                                                            hasError={Boolean(errors.confirm)}
                                                            secureTextEntry={!showPassword}
                                                            autoCapitalize="none"
                                                            autoComplete="password-new"
                                                            textContentType="newPassword"
                                                            returnKeyType="done"
                                                            onSubmitEditing={() => void handleSubmit()}
                                                      />
                                                </Field>
                                          </View>
                                    </View>

                                    {/* ------------------------------ Submit ----------------------------- */}
                                    <Pressable
                                          onPress={() => void handleSubmit()}
                                          disabled={submitting}
                                          accessibilityRole="button"
                                          accessibilityLabel="Complete registration"
                                          accessibilityState={{ disabled: submitting, busy: submitting }}
                                          style={({ pressed }) => [
                                                styles.submitWrap,
                                                pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 },
                                                submitting && { opacity: 0.8 },
                                          ]}
                                    >
                                          <LinearGradient
                                                colors={[Colors.goldLight, Colors.gold, Colors.goldDark] as string[]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.submit}
                                          >
                                                {submitting ? (
                                                      <ActivityIndicator color={Colors.textPrimary} />
                                                ) : (
                                                      <>
                                                            <Text style={styles.submitText}>Complete Registration</Text>
                                                            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
                                                      </>
                                                )}
                                          </LinearGradient>
                                    </Pressable>

                                    <View style={styles.footer}>
                                          <Text style={styles.footerText}>Already registered? </Text>
                                          <Pressable
                                                onPress={onPressLogin}
                                                hitSlop={10}
                                                accessibilityRole="link"
                                                accessibilityLabel="Login here"
                                          >
                                                <Text style={styles.footerLink}>Login here</Text>
                                          </Pressable>
                                    </View>
                              </View>
                        </ScrollView>
                  </KeyboardAvoidingView>
            </View>
      );
}

const styles = StyleSheet.create({
      root: { flex: 1, backgroundColor: Colors.darkBg },
      flex: { flex: 1 },
      scrollContent: { flexGrow: 1 },

      /* hero */
      hero: {
            paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.lg,
            paddingHorizontal: Spacing.xxl,
            paddingBottom: Spacing.section + Spacing.xl,
            overflow: 'hidden',
      },
      heroGlow: {
            position: 'absolute',
            right: -70,
            top: -60,
            width: 230,
            height: 230,
            borderRadius: 115,
            backgroundColor: Colors.primary,
            opacity: 0.28,
      },
      heroWatermark: {
            position: 'absolute',
            right: 14,
            bottom: -34,
            fontSize: 130,
            color: Colors.gold,
            opacity: 0.14,
      },
      backBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.14)',
            marginBottom: Spacing.lg,
      },
      heroTitle: {
            fontSize: Fonts.sizes.xxxl,
            lineHeight: 34,
            fontWeight: '800',
            color: Colors.textLight,
      },
      heroSub: {
            marginTop: Spacing.sm,
            maxWidth: 320,
            fontSize: Fonts.sizes.md,
            lineHeight: 20,
            color: Colors.goldLight,
      },

      /* card */
      card: {
            flexGrow: 1,
            marginTop: -Spacing.xl,
            backgroundColor: Colors.background,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            paddingHorizontal: Spacing.xxl,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.section,
      },

      /* tracker */
      tracker: { marginBottom: Spacing.xl },
      trackerBars: { flexDirection: 'row', gap: Spacing.sm },
      trackerItem: { flex: 1 },
      trackerBar: {
            height: 5,
            borderRadius: 3,
            backgroundColor: Colors.border,
      },
      trackerBarDone: { backgroundColor: Colors.primary },
      trackerLabelRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: Spacing.xs + 2,
      },
      trackerLabel: { fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.textMuted },
      trackerLabelDone: { color: Colors.textPrimary, fontWeight: '800' },

      /* sections */
      sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
            marginTop: Spacing.lg,
            marginBottom: Spacing.lg,
      },
      sectionIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      sectionTitle: {
            fontSize: Fonts.sizes.lg,
            fontWeight: '900',
            letterSpacing: 0.8,
            color: Colors.primaryDark,
            textTransform: 'uppercase',
      },
      sectionRule: { flex: 1, height: 1, backgroundColor: Colors.border },

      /* fields */
      row: { flexDirection: 'row', gap: Spacing.lg },
      half: { flex: 1 },
      field: { marginBottom: Spacing.lg },
      label: {
            marginBottom: Spacing.sm - 1,
            fontSize: Fonts.sizes.md,
            fontWeight: '700',
            color: Colors.textPrimary,
      },
      errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs + 1 },
      errorText: { flexShrink: 1, fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.error },

      inputBox: {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
      },
      inputBoxMultiline: { minHeight: 120, alignItems: 'flex-start', paddingTop: Spacing.xs },
      inputBoxFocused: { borderColor: Colors.primary, backgroundColor: Colors.cardBg },
      inputBoxError: { borderColor: Colors.error, backgroundColor: '#FFF6F5' },
      input: {
            flex: 1,
            paddingVertical: Platform.OS === 'ios' ? Spacing.md + 2 : Spacing.sm,
            fontSize: Fonts.sizes.md + 1,
            fontWeight: '600',
            color: Colors.textPrimary,
      },
      inputMultiline: { minHeight: 108, paddingTop: Spacing.md },
      adornment: { fontSize: Fonts.sizes.md + 1, fontWeight: '800', color: Colors.textSecondary },
      counter: {
            marginTop: Spacing.xs,
            alignSelf: 'flex-end',
            fontSize: Fonts.sizes.xs + 1,
            color: Colors.textMuted,
      },

      /* specialties */
      tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
      tileCell: { width: '48.5%', marginBottom: Spacing.sm + 2 },
      tileCellFull: { width: '100%', marginBottom: Spacing.sm + 2 },
      tile: {
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 2,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
      },
      tileSelected: {
            borderColor: Colors.gold,
            backgroundColor: 'rgba(245, 215, 110, 0.32)',
      },
      tileText: { flex: 1, fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
      tileTextSelected: { color: Colors.primaryDark, fontWeight: '800' },

      /* languages */
      chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
      chip: {
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 1,
            borderRadius: BorderRadius.full,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
      },
      chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      chipText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
      chipTextSelected: { color: Colors.textLight },

      /* password meter */
      meterWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
      meterBars: { flex: 1, flexDirection: 'row', gap: 4 },
      meterBar: { flex: 1, height: 4, borderRadius: 2 },
      meterLabel: { minWidth: 48, textAlign: 'right', fontSize: Fonts.sizes.sm, fontWeight: '800' },

      /* submit */
      submitWrap: {
            marginTop: Spacing.xxl,
            borderRadius: BorderRadius.lg,
            ...Shadow.md,
            shadowColor: Colors.gold,
            shadowOpacity: 0.45,
      },
      submit: {
            minHeight: 58,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.xl,
            borderRadius: BorderRadius.lg,
      },
      submitText: { fontSize: Fonts.sizes.lg + 1, fontWeight: '800', color: Colors.textPrimary },

      footer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: Spacing.xxl,
      },
      footerText: { fontSize: Fonts.sizes.md, color: Colors.textSecondary },
      footerLink: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.primaryDark },
});