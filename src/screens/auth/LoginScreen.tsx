// ─── Sanatan Seva Platform – Login Screen ────────────────────────────────────

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius, Typography, Shadow, SacredSymbols } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAlert } from '../../context/AlertContext';
import { useUserStore } from '../../store/userStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<any, 'Login'>;

// ─── Component ────────────────────────────────────────────────────────────────

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const passwordRef = useRef<TextInput>(null);

  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const initLekhan = useUserStore((s) => s.initLekhanFromUser);
  const { error: showError } = useAlert();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 100, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      showError('उपयोगकर्ता नाम आवश्यक है', 'कृपया अपना username दर्ज करें');
      return;
    }
    if (!trimmedPassword) {
      showError('पासवर्ड आवश्यक है', 'कृपया अपना पासवर्ड दर्ज करें');
      return;
    }

    const result = await login({ username: trimmedUsername, password: trimmedPassword });

    if (result.success) {
      initLekhan();
      // Navigator will auto-redirect via auth state
    } else {
      showError('लॉगिन विफल', result.message ?? 'username या password गलत है');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.crimsonDark} />

      {/* Hero Header */}
      <LinearGradient
        colors={['#7F0000', '#B71C1C', '#C62828', '#E65100']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerBgOm}>{SacredSymbols.om}</Text>
        <Animated.View
          style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoOm}>{SacredSymbols.om}</Text>
          </View>
          <Text style={styles.appName}>सनातन सेवा</Text>
          <Text style={styles.appSubtitle}>Sanatan Seva Platform</Text>

          <View style={styles.jaiRamBadge}>
            <Text style={styles.jaiRamText}>🚩 जय श्री राम 🚩</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.cardTitle}>🙏 प्रवेश करें</Text>
            <Text style={styles.cardSubtitle}>अपनी आध्यात्मिक यात्रा जारी रखें</Text>

            {/* Username Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>👤 उपयोगकर्ता नाम</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="अपना username दर्ज करें"
                  placeholderTextColor={Colors.brownLight}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒 पासवर्ड</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.inputPassword]}
                  placeholder="अपना पासवर्ड दर्ज करें"
                  placeholderTextColor={Colors.brownLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((p) => !p)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
              <Text style={styles.forgotText}>पासवर्ड भूल गए?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
              style={styles.loginBtnWrapper}
            >
              <LinearGradient
                colors={[Colors.saffronDark, Colors.saffron, Colors.saffronLight]}
                style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.loginBtnText}>🚩 लॉगिन करें</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{SacredSymbols.om}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerRow}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerText}>नया खाता नहीं है? </Text>
              <Text style={styles.registerLink}>अभी पंजीकरण करें →</Text>
            </TouchableOpacity>

            {/* Continue as Guest */}
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.navigate('Main')}
              activeOpacity={0.8}
            >
              <Text style={styles.guestBtnText}>बिना लॉगिन के देखें</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 50,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerBgOm: {
    position: 'absolute',
    fontSize: 180,
    color: 'rgba(255,255,255,0.04)',
    fontWeight: '900',
    top: -20,
    right: -20,
  },
  headerContent: { alignItems: 'center', gap: 8 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(249,168,37,0.2)',
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoOm: { fontSize: 36, color: Colors.gold },
  appName: {
    fontSize: Typography.xxl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },
  jaiRamBadge: {
    backgroundColor: 'rgba(249,168,37,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(249,168,37,0.4)',
    marginTop: 4,
  },
  jaiRamText: {
    color: Colors.goldLight,
    fontSize: Typography.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  keyboardView: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xl, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.dark,
    gap: 4,
    marginTop: -20,
  },
  cardTitle: {
    fontSize: Typography.xl,
    fontWeight: '900',
    color: Colors.darkText,
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: Typography.sm,
    color: Colors.brownLight,
    textAlign: 'center',
    marginBottom: Spacing.md,
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
  inputPassword: { paddingRight: 40 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  eyeIcon: { fontSize: 18 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.sm },
  forgotText: { fontSize: Typography.sm, color: Colors.saffron, fontWeight: '600' },

  loginBtnWrapper: { marginTop: Spacing.sm },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.gold,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: {
    color: Colors.white,
    fontSize: Typography.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText: { fontSize: 18, color: Colors.saffron },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  registerText: { fontSize: Typography.base, color: Colors.brownMid },
  registerLink: {
    fontSize: Typography.base,
    color: Colors.saffron,
    fontWeight: '700',
  },

  guestBtn: {
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  guestBtnText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
});

export default LoginScreen;
