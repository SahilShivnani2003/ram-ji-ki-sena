// ─── Sanatan Seva Platform – Register Screen ─────────────────────────────────

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Colors,
  Spacing,
  Radius,
  Typography,
  Shadow,
  SacredSymbols,
} from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAlert } from '../../context/AlertContext';
import { useUserStore } from '../../store/userStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<any, 'Register'>;

const SPIRITUAL_INTERESTS = [
  { key: 'bhajan', label: 'भजन', icon: '🎵' },
  { key: 'katha', label: 'कथा', icon: '📖' },
  { key: 'pooja', label: 'पूजा', icon: '🪔' },
  { key: 'seva', label: 'सेवा', icon: '🙏' },
  { key: 'mandir', label: 'मंदिर', icon: '🛕' },
  { key: 'yoga', label: 'ध्यान', icon: '🧘' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    contact: '',
    city: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Refs for keyboard navigation
  const usernameRef = useRef<TextInput>(null);
  const contactRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const initLekhan = useUserStore((s) => s.initLekhanFromUser);
  const { error: showError, success: showSuccess } = useAlert();

  const updateField = (key: keyof typeof form) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const validate = (): boolean => {
    if (!form.name.trim()) {
      showError('नाम आवश्यक है', 'कृपया अपना पूरा नाम दर्ज करें');
      return false;
    }
    if (!form.username.trim() || form.username.trim().length < 3) {
      showError('username आवश्यक है', 'username कम से कम 3 अक्षर का होना चाहिए');
      return false;
    }
    if (!/^\d{10}$/.test(form.contact.trim())) {
      showError('मोबाइल नंबर गलत है', 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
      return false;
    }
    if (!form.city.trim()) {
      showError('शहर आवश्यक है', 'कृपया अपना शहर दर्ज करें');
      return false;
    }
    if (form.password.length < 6) {
      showError('पासवर्ड बहुत छोटा है', 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      showError('पासवर्ड मेल नहीं खाते', 'दोनों पासवर्ड एक समान होने चाहिए');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const result = await register({
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      contact: form.contact.trim(),
      city: form.city.trim(),
      password: form.password,
    });

    if (result.success) {
      initLekhan();
      showSuccess('जय श्री राम! 🙏', 'आपका पंजीकरण सफल हुआ');
    } else {
      showError('पंजीकरण विफल', result.message ?? 'कृपया पुनः प्रयास करें');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.crimsonDark} />

      {/* Header */}
      <LinearGradient
        colors={['#7F0000', '#B71C1C', '#C62828']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerBgOm}>{SacredSymbols.om}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.logoOm}>{SacredSymbols.om}</Text>
          <Text style={styles.headerTitle}>नया खाता बनाएं</Text>
          <Text style={styles.headerSub}>Join Sanatan Seva Family</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Name */}
            <InputField
              label="🌸 पूरा नाम"
              placeholder="अपना पूरा नाम दर्ज करें"
              value={form.name}
              onChangeText={updateField('name')}
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              editable={!isLoading}
            />

            {/* Username */}
            <InputField
              ref={usernameRef}
              label="👤 उपयोगकर्ता नाम"
              placeholder="username बनाएं (अक्षर व संख्या)"
              value={form.username}
              onChangeText={updateField('username')}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => contactRef.current?.focus()}
              editable={!isLoading}
            />

            {/* Mobile */}
            <InputField
              ref={contactRef}
              label="📱 मोबाइल नंबर"
              placeholder="10 अंकों का मोबाइल नंबर"
              value={form.contact}
              onChangeText={updateField('contact')}
              keyboardType="phone-pad"
              returnKeyType="next"
              maxLength={10}
              onSubmitEditing={() => cityRef.current?.focus()}
              editable={!isLoading}
            />

            {/* City */}
            <InputField
              ref={cityRef}
              label="🏙️ शहर"
              placeholder="अपना शहर दर्ज करें"
              value={form.city}
              onChangeText={updateField('city')}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!isLoading}
            />

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 पासवर्ड</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="पासवर्ड बनाएं (न्यूनतम 6 अक्षर)"
                  placeholderTextColor={Colors.brownLight}
                  value={form.password}
                  onChangeText={updateField('password')}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((p) => !p)}
                  activeOpacity={0.7}
                >
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <InputField
              ref={confirmRef}
              label="🔒 पासवर्ड दोबारा दर्ज करें"
              placeholder="पासवर्ड फिर से दर्ज करें"
              value={form.confirmPassword}
              onChangeText={updateField('confirmPassword')}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              editable={!isLoading}
            />

            {/* Spiritual Interests */}
            <View style={styles.interestSection}>
              <Text style={styles.label}>🌸 आध्यात्मिक रुचियां (वैकल्पिक)</Text>
              <View style={styles.interestGrid}>
                {SPIRITUAL_INTERESTS.map((item) => {
                  const selected = selectedInterests.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => toggleInterest(item.key)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          selected
                            ? [Colors.saffronDark, Colors.saffron]
                            : ['#FFF3E0', '#FFF3E0']
                        }
                        style={styles.interestChip}
                      >
                        <Text style={styles.interestIcon}>{item.icon}</Text>
                        <Text
                          style={[
                            styles.interestLabel,
                            selected && styles.interestLabelActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isLoading}
              style={{ marginTop: Spacing.sm }}
            >
              <LinearGradient
                colors={[Colors.saffronDark, Colors.saffron, Colors.saffronLight]}
                style={[styles.registerBtn, isLoading && { opacity: 0.7 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.registerBtnText}>
                    🙏 पंजीकरण करें
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginRow}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginText}>पहले से खाता है? </Text>
              <Text style={styles.loginLink}>लॉगिन करें →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Input Field Helper Component ────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  returnKeyType?: 'next' | 'done';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  maxLength?: number;
  onSubmitEditing?: () => void;
  editable?: boolean;
}

const InputField = React.forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      secureTextEntry,
      keyboardType = 'default',
      returnKeyType = 'next',
      autoCapitalize = 'words',
      maxLength,
      onSubmitEditing,
      editable = true,
    },
    ref
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.brownLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
        />
      </View>
    </View>
  )
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: Spacing.xl,
    overflow: 'hidden',
  },
  headerBgOm: {
    position: 'absolute',
    fontSize: 140,
    color: 'rgba(255,255,255,0.04)',
    fontWeight: '900',
    right: -10,
    top: 0,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backIcon: { color: Colors.white, fontSize: 20 },
  headerContent: { alignItems: 'center', gap: 4 },
  logoOm: { fontSize: 36, color: Colors.gold },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  headerSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)' },

  scroll: { padding: Spacing.md, paddingBottom: 50 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.dark,
    gap: 2,
    marginTop: -10,
  },

  inputGroup: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.darkText,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: Radius.md,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.darkText,
    paddingVertical: 0,
  },
  eyeBtn: { position: 'absolute', right: 14 },

  interestSection: { marginBottom: Spacing.md },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
  },
  interestIcon: { fontSize: 15 },
  interestLabel: {
    fontSize: Typography.sm,
    color: Colors.brownMid,
    fontWeight: '600',
  },
  interestLabelActive: { color: Colors.white },

  registerBtn: {
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.gold,
  },
  registerBtnText: {
    color: Colors.white,
    fontSize: Typography.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  loginText: { fontSize: Typography.base, color: Colors.brownMid },
  loginLink: {
    fontSize: Typography.base,
    color: Colors.saffron,
    fontWeight: '700',
  },
});

export default RegisterScreen;
