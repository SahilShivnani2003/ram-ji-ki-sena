import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  ImageBackground,
  ScrollView,
  Platform,
  Vibration,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import Sound from 'react-native-sound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/AppNavigator';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../theme/index';
import { DEITIES, IDeity } from '../screens/tabs/HomeScreen';

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<RootParamList, 'namLekhan'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Default wallpapers ────────────────────────────────────────────────────────
// These are placeholder URIs — replace with actual bundled assets
const DEFAULT_WALLPAPERS = [
  { id: 'saffron', label: 'Saffron', gradient: ['#FF6B00', '#8B0000'] },
  { id: 'night', label: 'Night', gradient: ['#1A0A00', '#3D1A00'] },
  { id: 'lotus', label: 'Lotus', gradient: ['#E75480', '#4A148C'] },
  { id: 'sky', label: 'Sky', gradient: ['#0277BD', '#01579B'] },
  { id: 'forest', label: 'Forest', gradient: ['#1B5E20', '#0D3B10'] },
];

// ── Tap ripple component ──────────────────────────────────────────────────────
const TapRipple: React.FC<{
  x: number;
  y: number;
  color: string;
  onDone: () => void;
}> = ({ x, y, color, onDone }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// ── Floating mantra text ──────────────────────────────────────────────────────
interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  anim: Animated.Value;
  opacity: Animated.Value;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NamLekhanScreen({ navigation, route }: Props) {
  const initialDeity = route.params?.deity ?? DEITIES[0];

  const [deity, setDeity] = useState<IDeity>(initialDeity);
  const [count, setCount] = useState(0);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [wallpaperGradient, setWallpaperGradient] = useState(
    DEFAULT_WALLPAPERS[0].gradient,
  );
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [showDeityPicker, setShowDeityPicker] = useState(false);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ id: string; x: number; y: number }>
  >([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const btnScale = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const [headerVisible, setHeaderVisible] = useState(true);
  // ── Sound setup ───────────────────────────────────────────────────────────
  // Uses react-native-sound. Place 'bell.mp3' in android/app/src/main/res/raw/
  // and ios/<AppName>/bell.mp3
  const soundRef = useRef<Sound | null>(null);

  useEffect(() => {
    Sound.setCategory('Playback');
    soundRef.current = new Sound('shiv.mp3', Sound.MAIN_BUNDLE, err => {
      if (err) console.log('Sound load error:', err);
    });
    return () => {
      soundRef.current?.release();
    };
  }, []);

  const playSound = useCallback(() => {
    if (!soundOn || !soundRef.current) return;
    soundRef.current.stop(() => {
      soundRef.current?.play();
    });
  }, [soundOn]);

  // ── Auto-hide header on tap ───────────────────────────────────────────────
  const headerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHeader = () => {
    if (headerTimer.current) clearTimeout(headerTimer.current);
    if (!headerVisible) {
      setHeaderVisible(true);
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    headerTimer.current = setTimeout(() => {
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setHeaderVisible(false));
    }, 3000);
  };

  // ── Main tap handler ──────────────────────────────────────────────────────
  const handleTap = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;

    // Increment
    setCount(c => c + 1);

    // Sound
    playSound();

    // Vibration
    if (vibrationOn) Vibration.vibrate(30);

    // Button bounce
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 180,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Count pulse
    Animated.sequence([
      Animated.timing(countAnim, {
        toValue: 1.2,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(countAnim, {
        toValue: 1,
        tension: 180,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple
    const rippleId = `${Date.now()}`;
    setRipples(r => [...r, { id: rippleId, x: locationX, y: locationY }]);

    // Floating text
    const textId = `txt_${Date.now()}`;
    const floatY = new Animated.Value(0);
    const floatOpacity = new Animated.Value(1);
    const newText: FloatingText = {
      id: textId,
      x: locationX - 40,
      y: locationY - 20,
      text: deity.mantraHi,
      anim: floatY,
      opacity: floatOpacity,
    };
    setFloatingTexts(t => [...t, newText]);
    Animated.parallel([
      Animated.timing(floatY, {
        toValue: -80,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(floatOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFloatingTexts(t => t.filter(ft => ft.id !== textId));
    });

    showHeader();
  };

  // ── Wallpaper picker ──────────────────────────────────────────────────────
  const pickCustomWallpaper = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.assets?.[0]?.uri) {
      setWallpaper(result.assets[0].uri);
      setShowWallpaperPicker(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    Alert.alert('Reset Count?', `Current count: ${count.toLocaleString()}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setCount(0) },
    ]);
  };

  // ── Background ────────────────────────────────────────────────────────────
  const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (wallpaper) {
      return (
        <ImageBackground
          source={{ uri: wallpaper }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          <View style={styles.wallpaperOverlay} />
          {children}
        </ImageBackground>
      );
    }
    return (
      <LinearGradient
        colors={wallpaperGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      >
        {children}
      </LinearGradient>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <BackgroundWrapper>
        {/* Mandala overlay */}
        <View style={styles.mandalaOverlay} pointerEvents="none">
          {[160, 130, 100, 70].map((r, i) => (
            <View
              key={i}
              style={[
                styles.mandalaRing,
                {
                  width: r * 2,
                  height: r * 2,
                  borderRadius: r,
                  borderColor: 'rgba(255,255,255,0.06)',
                },
              ]}
            />
          ))}
        </View>

        {/* ── Header (auto-hides) ── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerDeityName}>
              {deity.icon} {deity.nameHi}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => setSoundOn(s => !s)}
            >
              <Ionicons
                name={soundOn ? 'volume-high' : 'volume-mute'}
                size={20}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => setVibrationOn(v => !v)}
            >
              <Ionicons
                name={vibrationOn ? 'phone-portrait' : 'phone-portrait-outline'}
                size={20}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleReset}>
              <Ionicons
                name="refresh"
                size={20}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Count display ── */}
        <View style={styles.countWrap} pointerEvents="none">
          <Animated.Text
            style={[styles.countNumber, { transform: [{ scale: countAnim }] }]}
          >
            {count.toLocaleString()}
          </Animated.Text>
          <Text style={styles.countLabel}>{deity.mantraHi}</Text>
        </View>

        {/* ── Tap zone ── */}
        <TouchableOpacity
          style={styles.tapZone}
          onPress={handleTap}
          activeOpacity={1}
        >
          {/* Ripples */}
          {ripples.map(r => (
            <TapRipple
              key={r.id}
              x={r.x}
              y={r.y}
              color={deity.color + '55'}
              onDone={() =>
                setRipples(prev => prev.filter(rp => rp.id !== r.id))
              }
            />
          ))}

          {/* Floating mantra texts */}
          {floatingTexts.map(ft => (
            <Animated.Text
              key={ft.id}
              pointerEvents="none"
              style={[
                styles.floatingText,
                {
                  left: ft.x,
                  top: ft.y,
                  opacity: ft.opacity,
                  transform: [{ translateY: ft.anim }],
                },
              ]}
            >
              {ft.text}
            </Animated.Text>
          ))}

          {/* Central tap button */}
          <Animated.View
            style={[styles.tapBtnWrap, { transform: [{ scale: btnScale }] }]}
          >
            <View
              style={[
                styles.tapBtnOuter,
                { borderColor: 'rgba(255,255,255,0.25)' },
              ]}
            >
              <View
                style={[
                  styles.tapBtnInner,
                  { backgroundColor: 'rgba(255,255,255,0.12)' },
                ]}
              >
                <Text style={styles.tapBtnIcon}>{deity.icon}</Text>
                <Text style={styles.tapBtnMantra}>{deity.mantraHi}</Text>
                <Text style={styles.tapBtnHint}>Tap to chant</Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* ── Bottom toolbar ── */}
        <Animated.View style={[styles.toolbar, { opacity: headerOpacity }]}>
          {/* Deity picker */}
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => setShowDeityPicker(p => !p)}
          >
            <Text style={styles.toolbarBtnIcon}>{deity.icon}</Text>
            <Text style={styles.toolbarBtnLabel}>Deity</Text>
          </TouchableOpacity>

          {/* Wallpaper picker */}
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => setShowWallpaperPicker(p => !p)}
          >
            <Ionicons
              name="image-outline"
              size={22}
              color="rgba(255,255,255,0.85)"
            />
            <Text style={styles.toolbarBtnLabel}>Wallpaper</Text>
          </TouchableOpacity>

          {/* Sound toggle */}
          <TouchableOpacity
            style={[styles.toolbarBtn, soundOn && styles.toolbarBtnActive]}
            onPress={() => setSoundOn(s => !s)}
          >
            <Ionicons
              name={soundOn ? 'musical-notes' : 'musical-notes-outline'}
              size={22}
              color={soundOn ? Colors.gold : 'rgba(255,255,255,0.85)'}
            />
            <Text
              style={[
                styles.toolbarBtnLabel,
                soundOn && { color: Colors.gold },
              ]}
            >
              Sound
            </Text>
          </TouchableOpacity>

          {/* Vibration toggle */}
          <TouchableOpacity
            style={[styles.toolbarBtn, vibrationOn && styles.toolbarBtnActive]}
            onPress={() => setVibrationOn(v => !v)}
          >
            <Ionicons
              name="pulse-outline"
              size={22}
              color={vibrationOn ? Colors.gold : 'rgba(255,255,255,0.85)'}
            />
            <Text
              style={[
                styles.toolbarBtnLabel,
                vibrationOn && { color: Colors.gold },
              ]}
            >
              Vibrate
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Deity Picker Sheet ── */}
        {showDeityPicker && (
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Choose Deity</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.deityPickerScroll}
            >
              {DEITIES.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[
                    styles.deityPickerItem,
                    d.id === deity.id && styles.deityPickerItemActive,
                  ]}
                  onPress={() => {
                    setDeity(d);
                    setShowDeityPicker(false);
                  }}
                >
                  <Text style={styles.deityPickerIcon}>{d.icon}</Text>
                  <Text style={styles.deityPickerName}>{d.nameHi}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Wallpaper Picker Sheet ── */}
        {showWallpaperPicker && (
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Choose Wallpaper</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.wallpaperPickerScroll}
            >
              {/* Custom upload option */}
              <TouchableOpacity
                style={styles.wallpaperOption}
                onPress={pickCustomWallpaper}
              >
                <View style={[styles.wallpaperThumb, styles.wallpaperUpload]}>
                  <Ionicons
                    name="add"
                    size={28}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
                <Text style={styles.wallpaperLabel}>Upload</Text>
              </TouchableOpacity>

              {/* Default gradients */}
              {DEFAULT_WALLPAPERS.map(wp => (
                <TouchableOpacity
                  key={wp.id}
                  style={styles.wallpaperOption}
                  onPress={() => {
                    setWallpaper(null);
                    setWallpaperGradient(wp.gradient);
                    setShowWallpaperPicker(false);
                  }}
                >
                  <LinearGradient
                    colors={wp.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.wallpaperThumb}
                  />
                  <Text style={styles.wallpaperLabel}>{wp.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </BackgroundWrapper>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A0A00' },
  wallpaperOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Mandala rings
  mandalaOverlay: {
    position: 'absolute',
    top: SCREEN_H * 0.3,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaRing: {
    position: 'absolute',
    borderWidth: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerDeityName: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerRight: { flexDirection: 'row', gap: 6 },

  // Count
  countWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 110,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  countNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 4 },
  },
  countLabel: {
    fontSize: Fonts.sizes.lg,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: -4,
  },

  // Tap zone
  tapZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapBtnWrap: { alignItems: 'center', justifyContent: 'center' },
  tapBtnOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapBtnInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tapBtnIcon: { fontSize: 56 },
  tapBtnMantra: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tapBtnHint: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },

  // Floating text
  floatingText: {
    position: 'absolute',
    fontSize: Fonts.sizes.md,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
    pointerEvents: 'none',
  },

  // Bottom toolbar
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  toolbarBtn: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
  },
  toolbarBtnActive: {},
  toolbarBtnIcon: { fontSize: 22 },
  toolbarBtnLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },

  // Picker sheets
  pickerSheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20,8,0,0.96)',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    ...Shadow.lg,
  },
  pickerTitle: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },

  // Deity picker
  deityPickerScroll: { paddingHorizontal: Spacing.lg },
  deityPickerItem: {
    alignItems: 'center',
    gap: 6,
    marginRight: Spacing.lg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  deityPickerItemActive: {
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  deityPickerIcon: { fontSize: 36 },
  deityPickerName: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },

  // Wallpaper picker
  wallpaperPickerScroll: { paddingHorizontal: Spacing.lg },
  wallpaperOption: {
    alignItems: 'center',
    gap: 6,
    marginRight: Spacing.md,
  },
  wallpaperThumb: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  wallpaperUpload: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});
