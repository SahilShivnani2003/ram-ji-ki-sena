import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    StatusBar,
    ImageBackground,
    ScrollView,
    Platform,
    Vibration,
    Alert,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import Sound from 'react-native-sound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootParamList } from '../navigation/AppNavigator';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../theme/index';
import { DEITIES, IDeity } from '../screens/tabs/HomeScreen';
import { otherAPI } from '../service/apis/otherServices';
import { DrawerParamList } from '../navigation/DrawerNavigator';

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<DrawerParamList, 'Namlekhan'>;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Constants ─────────────────────────────────────────────────────────────────
const MALA_SIZE = 108;

const DEFAULT_WALLPAPERS = [
    { id: 'saffron', label: 'Saffron', gradient: ['#FF6B00', '#8B0000'] },
    { id: 'night', label: 'Night', gradient: ['#1A0A00', '#3D1A00'] },
    { id: 'lotus', label: 'Lotus', gradient: ['#E75480', '#4A148C'] },
    { id: 'sky', label: 'Sky', gradient: ['#0277BD', '#01579B'] },
    { id: 'forest', label: 'Forest', gradient: ['#1B5E20', '#0D3B10'] },
];

// ── Tap ripple ────────────────────────────────────────────────────────────────
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
            Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
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

// ── Floating text ─────────────────────────────────────────────────────────────
interface FloatingText {
    id: string;
    x: number;
    y: number;
    text: string;
    anim: Animated.Value;
    opacity: Animated.Value;
}

// ── Mala progress ring (SVG-free, CSS-like arc via border) ────────────────────
const MalaRing: React.FC<{ count: number; color: string }> = ({ count, color }) => {
    const progress = (count % MALA_SIZE) / MALA_SIZE;
    const malasDone = Math.floor(count / MALA_SIZE);
    const beadsTotal = 24;
    const beadsFilled = Math.round(progress * beadsTotal);

    return (
        <View style={ringStyles.wrap}>
            {/* Outer ring with beads */}
            <View style={ringStyles.ring}>
                {Array.from({ length: beadsTotal }).map((_, i) => {
                    const angle = (i / beadsTotal) * 2 * Math.PI - Math.PI / 2;
                    const r = 46;
                    const cx = 56 + r * Math.cos(angle) - 5;
                    const cy = 56 + r * Math.sin(angle) - 5;
                    return (
                        <View
                            key={i}
                            style={[
                                ringStyles.bead,
                                {
                                    left: cx,
                                    top: cy,
                                    backgroundColor:
                                        i < beadsFilled ? color : 'rgba(255,255,255,0.15)',
                                },
                            ]}
                        />
                    );
                })}
            </View>
            {/* Mala count in center */}
            <View style={ringStyles.center}>
                <Text style={[ringStyles.malaNum, { color }]}>{malasDone}</Text>
                <Text style={ringStyles.malaLabel}>माला</Text>
            </View>
        </View>
    );
};

const ringStyles = StyleSheet.create({
    wrap: {
        width: 112,
        height: 112,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring: { position: 'absolute', width: 112, height: 112 },
    bead: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
    center: { alignItems: 'center', justifyContent: 'center' },
    malaNum: { fontSize: 22, fontWeight: '900' },
    malaLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function NamLekhanScreen({ navigation, route }: Props) {
    const initialDeity = route.params?.deity ?? DEITIES[0];

    const [deity, setDeity] = useState<IDeity>(initialDeity);
    const [count, setCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0); // tracks last saved value
    const [wallpaper, setWallpaper] = useState<string | null>(null);
    const [wallpaperGradient, setWallpaperGradient] = useState(DEFAULT_WALLPAPERS[0].gradient);
    const [soundOn, setSoundOn] = useState(true);
    const [vibrationOn, setVibrationOn] = useState(true);
    const [showDeityPicker, setShowDeityPicker] = useState(false);
    const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
    const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number }>>([]);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false); // brief checkmark flash

    const btnScale = useRef(new Animated.Value(1)).current;
    const countAnim = useRef(new Animated.Value(1)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const savePulse = useRef(new Animated.Value(1)).current;
    const [headerVisible, setHeaderVisible] = useState(true);

    // ── Sound ─────────────────────────────────────────────────────────────────
    const soundRef = useRef<Sound | null>(null);

    useEffect(() => {
        let currentSound = 'ram.mp3'

        switch (deity.id){
            case 'ram':
                currentSound = 'ram.mp3'
                break;
            case 'krishna':
                currentSound = 'krishna.mp3'
                break;
            case 'radha':
                currentSound = 'radhe.mp3'
                break;
            case 'shiva':
                currentSound = 'shiv.mp3'
                break;
            case 'hanuman':
                currentSound = 'hanuman.mp3'
                break;
        }
        Sound.setCategory('Playback');
        soundRef.current = new Sound(currentSound, Sound.MAIN_BUNDLE, err => {
            if (err) console.log('Sound load error:', err);
        });
        return () => {
            soundRef.current?.release();
        };
    }, [deity]);

    const playSound = useCallback(() => {
        if (!soundOn || !soundRef.current) return;
        soundRef.current.stop(() => soundRef.current?.play());
    }, [soundOn]);

    // ── Derived stats ─────────────────────────────────────────────────────────
    const malaCount = count / MALA_SIZE;
    const beadsInMala = count % MALA_SIZE;
    const hasUnsaved = count !== savedCount;

    // ── Save logic ────────────────────────────────────────────────────────────
    const handleSave = useCallback(
        async (silent = false) => {
            if (saving) return;
            setSaving(true);
            try {
                const data = {
                    currentCount: count,
                    malaCount: parseFloat(malaCount.toFixed(4)),
                    totalCount: count,
                };
                const response = await otherAPI.lekhanSave(data);

                if (response.data?.success) {
                    setSavedCount(count);
                    // Pulse animation on save button
                    Animated.sequence([
                        Animated.timing(savePulse, {
                            toValue: 1.15,
                            duration: 120,
                            useNativeDriver: true,
                        }),
                        Animated.timing(savePulse, {
                            toValue: 1,
                            duration: 120,
                            useNativeDriver: true,
                        }),
                    ]).start();
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2000);
                    if (!silent)
                        Alert.alert(
                            '🙏 Saved!',
                            response.data?.message || 'Lekhan saved successfully.',
                        );
                } else {
                    if (!silent) Alert.alert('Save Failed', 'Could not save. Please try again.');
                }
            } catch (error: any) {
                console.error('ERROR WHILE SAVING THE LEKHAN:', error);
                if (!silent) Alert.alert('Error', 'Something went wrong while saving.');
            } finally {
                setSaving(false);
            }
        },
        [count, malaCount, saving],
    );

    // ── Back handler — mandatory save if unsaved changes ──────────────────────
    const handleBack = useCallback(() => {
        if (!hasUnsaved) {
            navigation.goBack();
            return;
        }
        Alert.alert(
            '💾 Save Before Leaving?',
            `You have ${count - savedCount} unsaved chants (${malaCount.toFixed(
                2,
            )} mala). Save before leaving?`,
            [
                {
                    text: 'Discard & Leave',
                    style: 'destructive',
                    onPress: () => navigation.goBack(),
                },
                {
                    text: 'Save & Leave',
                    onPress: async () => {
                        await handleSave(true);
                        navigation.goBack();
                    },
                },
                { text: 'Stay', style: 'cancel' },
            ],
        );
    }, [hasUnsaved, count, savedCount, malaCount, handleSave, navigation]);

    // ── Intercept hardware back (Android) ─────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            const unsubscribe = navigation.addListener('beforeRemove', e => {
                if (!hasUnsaved) return; // nothing to save, allow
                e.preventDefault(); // block the removal
                Alert.alert(
                    '💾 Save Before Leaving?',
                    `You have ${count - savedCount} unsaved chants. Save before leaving?`,
                    [
                        {
                            text: 'Discard & Leave',
                            style: 'destructive',
                            onPress: () => navigation.dispatch(e.data.action),
                        },
                        {
                            text: 'Save & Leave',
                            onPress: async () => {
                                await handleSave(true);
                                navigation.dispatch(e.data.action);
                            },
                        },
                        { text: 'Stay', style: 'cancel' },
                    ],
                );
            });
            return unsubscribe;
        }, [hasUnsaved, count, savedCount, handleSave, navigation]),
    );

    // ── Auto-hide header ──────────────────────────────────────────────────────
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

    // ── Tap handler ───────────────────────────────────────────────────────────
    const handleTap = (evt: any) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCount(c => c + 1);
        playSound();
        if (vibrationOn) Vibration.vibrate(30);

        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
            Animated.spring(btnScale, {
                toValue: 1,
                tension: 180,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.timing(countAnim, { toValue: 1.2, duration: 80, useNativeDriver: true }),
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
        const floatOp = new Animated.Value(1);
        setFloatingTexts(t => [
            ...t,
            {
                id: textId,
                x: locationX - 40,
                y: locationY - 20,
                text: deity.mantraHi,
                anim: floatY,
                opacity: floatOp,
            },
        ]);
        Animated.parallel([
            Animated.timing(floatY, { toValue: -80, duration: 900, useNativeDriver: true }),
            Animated.timing(floatOp, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]).start(() => setFloatingTexts(t => t.filter(ft => ft.id !== textId)));

        showHeader();
    };

    // ── Wallpaper picker ──────────────────────────────────────────────────────
    const pickCustomWallpaper = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        if (result.assets?.[0]?.uri) {
            setWallpaper(result.assets[0].uri);
            setShowWallpaperPicker(false);
        }
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        Alert.alert('Reset Count?', `Current count: ${count.toLocaleString()}`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                    setCount(0);
                    setSavedCount(0);
                },
            },
        ]);
    };

    // ── Background wrapper ────────────────────────────────────────────────────
    const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <BackgroundWrapper>
                {/* Mandala rings */}
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

                {/* ── Header ── */}
                <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
                        <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerDeityName}>
                            {deity.icon} {deity.nameHi}
                        </Text>
                        {/* Unsaved dot indicator */}
                        {hasUnsaved && (
                            <View style={styles.unsavedDot}>
                                <View style={styles.unsavedDotInner} />
                                <Text style={styles.unsavedDotText}>unsaved</Text>
                            </View>
                        )}
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
                            <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* ── Count + Mala ring ── */}
                <View style={styles.countArea} pointerEvents="none">
                    {/* Mala bead ring */}
                    <MalaRing count={count} color={deity.color} />

                    {/* Big count number */}
                    <Animated.Text
                        style={[styles.countNumber, { transform: [{ scale: countAnim }] }]}
                    >
                        {count.toLocaleString()}
                    </Animated.Text>
                    <Text style={styles.countLabel}>{deity.mantraHi}</Text>

                    {/* Bead progress in current mala */}
                    <Text style={styles.beadHint}>
                        {beadsInMala}/{MALA_SIZE} beads · {malaCount.toFixed(2)} mala
                    </Text>
                </View>

                {/* ── Tap zone ── */}
                <TouchableOpacity style={styles.tapZone} onPress={handleTap} activeOpacity={1}>
                    {ripples.map(r => (
                        <TapRipple
                            key={r.id}
                            x={r.x}
                            y={r.y}
                            color={deity.color + '55'}
                            onDone={() => setRipples(prev => prev.filter(rp => rp.id !== r.id))}
                        />
                    ))}
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
                            style={[styles.tapBtnOuter, { borderColor: 'rgba(255,255,255,0.25)' }]}
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

                {/* ── SAVE BUTTON (floating, always visible) ── */}
                <Animated.View style={[styles.saveBtnWrap, { transform: [{ scale: savePulse }] }]}>
                    <TouchableOpacity
                        style={[
                            styles.saveBtn,
                            saveSuccess && styles.saveBtnSuccess,
                            !hasUnsaved && styles.saveBtnDisabled,
                        ]}
                        onPress={() => handleSave(false)}
                        disabled={saving || !hasUnsaved}
                        activeOpacity={0.85}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : saveSuccess ? (
                            <>
                                <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                                <Text style={styles.saveBtnText}>Saved!</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={18}
                                    color={hasUnsaved ? '#FFF' : 'rgba(255,255,255,0.4)'}
                                />
                                <Text
                                    style={[
                                        styles.saveBtnText,
                                        !hasUnsaved && { color: 'rgba(255,255,255,0.4)' },
                                    ]}
                                >
                                    Save {hasUnsaved ? `(+${count - savedCount})` : ''}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Bottom toolbar ── */}
                <Animated.View style={[styles.toolbar, { opacity: headerOpacity }]}>
                    <TouchableOpacity
                        style={styles.toolbarBtn}
                        onPress={() => setShowDeityPicker(p => !p)}
                    >
                        <Text style={styles.toolbarBtnIcon}>{deity.icon}</Text>
                        <Text style={styles.toolbarBtnLabel}>Deity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.toolbarBtn}
                        onPress={() => setShowWallpaperPicker(p => !p)}
                    >
                        <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.85)" />
                        <Text style={styles.toolbarBtnLabel}>Wallpaper</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toolbarBtn, soundOn && styles.toolbarBtnActive]}
                        onPress={() => setSoundOn(s => !s)}
                    >
                        <Ionicons
                            name={soundOn ? 'musical-notes' : 'musical-notes-outline'}
                            size={22}
                            color={soundOn ? Colors.gold : 'rgba(255,255,255,0.85)'}
                        />
                        <Text style={[styles.toolbarBtnLabel, soundOn && { color: Colors.gold }]}>
                            Sound
                        </Text>
                    </TouchableOpacity>
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
                            style={[styles.toolbarBtnLabel, vibrationOn && { color: Colors.gold }]}
                        >
                            Vibrate
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Deity Picker Sheet ── */}
                {showDeityPicker && (
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHandle} />
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
                        <View style={styles.pickerHandle} />
                        <Text style={styles.pickerTitle}>Choose Wallpaper</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.wallpaperPickerScroll}
                        >
                            <TouchableOpacity
                                style={styles.wallpaperOption}
                                onPress={pickCustomWallpaper}
                            >
                                <View style={[styles.wallpaperThumb, styles.wallpaperUpload]}>
                                    <Ionicons name="add" size={28} color="rgba(255,255,255,0.7)" />
                                </View>
                                <Text style={styles.wallpaperLabel}>Upload</Text>
                            </TouchableOpacity>
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
    wallpaperOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },

    // Mandala
    mandalaOverlay: {
        position: 'absolute',
        top: SCREEN_H * 0.3,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mandalaRing: { position: 'absolute', borderWidth: 1 },

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
    headerCenter: { flex: 1, alignItems: 'center', gap: 3 },
    headerDeityName: {
        fontSize: Fonts.sizes.md,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '700',
        letterSpacing: 1,
    },
    unsavedDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    unsavedDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning },
    unsavedDotText: { fontSize: 9, color: Colors.warning, fontWeight: '600', letterSpacing: 0.5 },
    headerRight: { flexDirection: 'row', gap: 6 },

    // Count area
    countArea: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 120 : 100,
        alignSelf: 'center',
        alignItems: 'center',
        zIndex: 5,
        gap: 4,
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
    beadHint: {
        fontSize: Fonts.sizes.xs,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: 0.5,
        marginTop: 2,
    },

    // Tap zone
    tapZone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    tapBtnHint: { fontSize: Fonts.sizes.xs, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },

    // Floating mantra text
    floatingText: {
        position: 'absolute',
        fontSize: Fonts.sizes.md,
        fontWeight: '800',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowRadius: 4,
        textShadowOffset: { width: 0, height: 1 },
    },

    // ── Save Button ──────────────────────────────────────────────────────────
    saveBtnWrap: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 108 : 90,
        alignSelf: 'center',
        zIndex: 20,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: Colors.primary,
        borderRadius: 24,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
        ...Shadow.md,
    },
    saveBtnSuccess: { backgroundColor: Colors.success },
    saveBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    saveBtnText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

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
    toolbarBtn: { alignItems: 'center', gap: 3, paddingHorizontal: Spacing.sm },
    toolbarBtnActive: {},
    toolbarBtnIcon: { fontSize: 22 },
    toolbarBtnLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

    // Picker sheets
    pickerSheet: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 80,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(20,8,0,0.96)',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        ...Shadow.lg,
    },
    pickerHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: Spacing.sm,
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
    wallpaperPickerScroll: { paddingHorizontal: Spacing.lg },
    wallpaperOption: { alignItems: 'center', gap: 6, marginRight: Spacing.md },
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
    wallpaperLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
});
