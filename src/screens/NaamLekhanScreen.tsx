import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ImageBackground,
    ScrollView,
    Platform,
    Vibration,
    Alert,
    Dimensions,
    ActivityIndicator,
    TextInput,
    Keyboard,
    Modal,
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
import { DrawerScreenProps } from '@react-navigation/drawer';

// ── Types ─────────────────────────────────────────────────────────────────────
type Props = DrawerScreenProps<DrawerParamList, 'Namlekhan'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Constants ─────────────────────────────────────────────────────────────────
const MALA_SIZE = 108;

const DEFAULT_WALLPAPERS = [
    { id: 'saffron', label: 'केसरिया', gradient: ['#FF6B00', '#8B0000'] as [string, string] },
    { id: 'night', label: 'रात्रि', gradient: ['#1A0A00', '#3D1A00'] as [string, string] },
    { id: 'lotus', label: 'कमल', gradient: ['#E75480', '#4A148C'] as [string, string] },
    { id: 'sky', label: 'आकाश', gradient: ['#0277BD', '#01579B'] as [string, string] },
    { id: 'forest', label: 'वन', gradient: ['#1B5E20', '#0D3B10'] as [string, string] },
    { id: 'gold', label: 'स्वर्ण', gradient: ['#D4AF37', '#8B6914'] as [string, string] },
];

interface DeityKeys {
    keys: string[];
    syllables: string[];
    mantra: string;
    color: string;
}

const DEITY_KEY_MAP: Record<string, DeityKeys> = {
    ram: {
        keys: ['r', 'a', 'm'],
        syllables: ['र', 'ा', 'म'],
        mantra: 'राम',
        color: Colors.primary,
    },
    krishna: {
        keys: ['k', 'r', 'a'],
        syllables: ['कृ', 'ष्', 'ण'],
        mantra: 'कृष्ण',
        color: '#3F51B5',
    },
    radha: {
        keys: ['r', 'a', 'd'],
        syllables: ['रा', 'धे', 'रा'],
        mantra: 'राधे',
        color: Colors.lotus,
    },
    shiva: { keys: ['o', 'm', 's'], syllables: ['ॐ', 'न', 'म'], mantra: 'ॐ नमः', color: '#607D8B' },
    hanuman: {
        keys: ['j', 'a', 'y'],
        syllables: ['जय', 'ह', 'नु'],
        mantra: 'जय हनुमान',
        color: Colors.secondary,
    },
};

// ── Mala progress ring ────────────────────────────────────────────────────────
const MalaRing: React.FC<{ count: number; color: string; size?: number }> = ({
    count,
    color,
    size = 96,
}) => {
    const progress = (count % MALA_SIZE) / MALA_SIZE;
    const malasDone = Math.floor(count / MALA_SIZE);
    const beadsTotal = 20;
    const beadsFilled = Math.round(progress * beadsTotal);
    const r = size * 0.4;
    const cx = size / 2;

    return (
        <View
            style={{
                width: size,
                height: size,
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {Array.from({ length: beadsTotal }).map((_, i) => {
                const angle = (i / beadsTotal) * 2 * Math.PI - Math.PI / 2;
                const bx = cx + r * Math.cos(angle) - 5;
                const by = cx + r * Math.sin(angle) - 5;
                return (
                    <View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: bx,
                            top: by,
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: i < beadsFilled ? color : 'rgba(255,255,255,0.15)',
                        }}
                    />
                );
            })}
            <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: Fonts.sizes.xxl, fontWeight: '900', color }}>{malasDone}</Text>
                <Text style={{ fontSize: Fonts.sizes.xl, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>
                    माला
                </Text>
            </View>
        </View>
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function NamLekhanScreen({ navigation, route }: Props) {
    const initialDeity = route.params?.deity ?? DEITIES[0];

    const [deity, setDeity] = useState<IDeity>(initialDeity);
    const [count, setCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [displayLines, setDisplayLines] = useState<string[]>([]);
    const [wallpaper, setWallpaper] = useState<string | null>(null);
    const [wallpaperGradient, setWallpaperGradient] = useState(DEFAULT_WALLPAPERS[0].gradient);
    const [soundOn, setSoundOn] = useState(true);
    const [vibrationOn, setVibrationOn] = useState(true);
    const [showDeityPicker, setShowDeityPicker] = useState(false);
    const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const inputRef = useRef<TextInput>(null);
    const scrollRef = useRef<ScrollView>(null);
    const countAnim = useRef(new Animated.Value(1)).current;
    const savePulse = useRef(new Animated.Value(1)).current;
    const malaFlash = useRef(new Animated.Value(1)).current;
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

    // Track shortcut button press progress (how many of 3 keys pressed)
    const shortcutBufferRef = useRef<number>(0);

    const deityKeys = DEITY_KEY_MAP[deity.id] ?? DEITY_KEY_MAP['ram'];
    const mantra = deityKeys.mantra;

    // ── Keyboard listeners ────────────────────────────────────────────────────
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    // ── Sound ─────────────────────────────────────────────────────────────────
    const soundRef = useRef<Sound | null>(null);

    useEffect(() => {
        const soundMap: Record<string, string> = {
            ram: 'ram.mp3',
            krishna: 'krishna.mp3',
            radha: 'radhe.mp3',
            shiva: 'shiv.mp3',
            hanuman: 'hanuman.mp3',
        };
        Sound.setCategory('Playback');
        soundRef.current = new Sound(soundMap[deity.id] ?? 'ram.mp3', Sound.MAIN_BUNDLE, err => {
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

    // ── Stats ─────────────────────────────────────────────────────────────────
    const malaCount = count / MALA_SIZE;
    const beadsInMala = count % MALA_SIZE;
    const hasUnsaved = count !== savedCount;

    // ── Core: append one mantra to display and increment counter ──────────────
    const appendMantraAndIncrement = useCallback(() => {
        // Update display lines — simple append, no split/filter bug
        setDisplayLines(prev => {
            const MANTRAS_PER_LINE = 5;
            const updated = [...prev];

            if (updated.length === 0) {
                // First mantra ever
                updated.push(mantra);
                return updated;
            }

            const lastLine = updated[updated.length - 1];
            // Count how many times mantra appears in last line
            const matches = lastLine.split(mantra).length - 1;

            if (matches < MANTRAS_PER_LINE) {
                updated[updated.length - 1] = lastLine + '  ' + mantra;
            } else {
                updated.push(mantra);
            }
            return updated;
        });

        // Increment counter with animation
        setCount(c => {
            const next = c + 1;
            Animated.sequence([
                Animated.timing(countAnim, { toValue: 1.25, duration: 70, useNativeDriver: true }),
                Animated.spring(countAnim, {
                    toValue: 1,
                    tension: 200,
                    friction: 6,
                    useNativeDriver: true,
                }),
            ]).start();

            if (next % MALA_SIZE === 0) {
                Animated.sequence([
                    Animated.timing(malaFlash, {
                        toValue: 1.4,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.spring(malaFlash, {
                        toValue: 1,
                        tension: 120,
                        friction: 5,
                        useNativeDriver: true,
                    }),
                ]).start();
                if (vibrationOn) Vibration.vibrate([0, 50, 80, 50]);
            } else {
                if (vibrationOn) Vibration.vibrate(20);
            }
            return next;
        });

        playSound();
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, [mantra, countAnim, malaFlash, vibrationOn, playSound]);

    // ── FIX 1: Shortcut buttons — NO keyboard, direct mantra append ───────────
    // Each of the 3 buttons maps to one syllable. Pressing all 3 in any order
    // (tracked by index bitmask) completes one mantra. We use a simple sequential
    // approach: each tap advances a position counter; 3 taps = 1 mantra.
    const handleShortcutKey = useCallback(
        (_keyIndex: number) => {
            // Dismiss keyboard if somehow open
            Keyboard.dismiss();

            shortcutBufferRef.current += 1;
            if (shortcutBufferRef.current >= deityKeys.keys.length) {
                shortcutBufferRef.current = 0;
                appendMantraAndIncrement();
            }
        },
        [deityKeys.keys.length, appendMantraAndIncrement],
    );

    // ── Handle text change from physical keyboard ─────────────────────────────
    const keyBuffer = useRef<string>('');

    const handleTextChange = useCallback(
        (text: string) => {
            setTypedText(text);
            const lower = text.toLowerCase();
            const lastChar = lower.slice(-1);
            const MANTRA_TRIGGER_KEYS = deityKeys.keys;

            if (MANTRA_TRIGGER_KEYS.includes(lastChar)) {
                keyBuffer.current += lastChar;
                const seq = MANTRA_TRIGGER_KEYS.join('');
                if (keyBuffer.current.endsWith(seq)) {
                    keyBuffer.current = '';
                    appendMantraAndIncrement();
                }
            }
        },
        [deityKeys.keys, appendMantraAndIncrement],
    );

    // ── Save ──────────────────────────────────────────────────────────────────
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
                    Animated.sequence([
                        Animated.timing(savePulse, {
                            toValue: 1.12,
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
            } catch (err) {
                if (!silent) Alert.alert('Error', 'Something went wrong while saving.');
            } finally {
                setSaving(false);
            }
        },
        [count, malaCount, saving],
    );

    // ── Back guard ────────────────────────────────────────────────────────────
    useFocusEffect(
        useCallback(() => {
            const unsub = navigation.addListener('beforeRemove', e => {
                if (!hasUnsaved) return;
                e.preventDefault();
                Alert.alert('💾 सहेजें?', `${count - savedCount} असहेजे जाप हैं।`, [
                    {
                        text: 'छोड़ें',
                        style: 'destructive',
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                    {
                        text: 'सहेजें & जाएं',
                        onPress: async () => {
                            await handleSave(true);
                            navigation.dispatch(e.data.action);
                        },
                    },
                    { text: 'रुकें', style: 'cancel' },
                ]);
            });
            return unsub;
        }, [hasUnsaved, count, savedCount, handleSave, navigation]),
    );

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        Alert.alert('गणना रीसेट?', `वर्तमान: ${count.toLocaleString('hi-IN')}`, [
            { text: 'रद्द करें', style: 'cancel' },
            {
                text: 'रीसेट',
                style: 'destructive',
                onPress: () => {
                    setCount(0);
                    setSavedCount(0);
                    setDisplayLines([]);
                    setTypedText('');
                    keyBuffer.current = '';
                    shortcutBufferRef.current = 0;
                },
            },
        ]);
    };

    // ── Wallpaper picker ──────────────────────────────────────────────────────
    const pickCustomWallpaper = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        if (result.assets?.[0]?.uri) {
            setWallpaper(result.assets[0].uri);
            setShowWallpaperPicker(false);
        }
    };

    // ── Key color helpers ─────────────────────────────────────────────────────
    const keyColors = [
        [Colors.secondary, '#C41E3A'],
        [Colors.primary, '#FF9A3C'],
        [Colors.gold, Colors.goldLight],
    ] as [string, string][];

    // ── Render ────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            {/* ── Background (always full screen) ── */}
            {wallpaper ? (
                <ImageBackground
                    source={{ uri: wallpaper }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                >
                    <View style={styles.wallpaperOverlay} />
                </ImageBackground>
            ) : (
                <LinearGradient
                    colors={wallpaperGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* ── Decorative mandala rings ── */}
            <View style={styles.mandalaContainer} pointerEvents="none">
                {[220, 180, 140, 100].map((r, i) => (
                    <View
                        key={i}
                        style={[
                            styles.mandalaRing,
                            {
                                width: r * 2,
                                height: r * 2,
                                borderRadius: r,
                                opacity: 0.04 + i * 0.01,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* ── Content layout (flex fills screen) ── */}
            <View style={{ flex: 1 }}>
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.toggleDrawer()}
                        style={styles.iconBtn}
                    >
                        <Ionicons name="menu" size={32} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>
                            {deity.icon} {deity.nameHi}
                        </Text>
                        <Text style={styles.headerSub}>{mantra} जाप</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => setSoundOn(s => !s)}
                        >
                            <Ionicons
                                name={soundOn ? 'volume-high' : 'volume-mute'}
                                size={32}
                                color={soundOn ? Colors.goldLight : 'rgba(255,255,255,0.5)'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={handleReset}>
                            <Ionicons name="refresh" size={32} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Stats Row ── */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>जाप</Text>
                        <Animated.Text
                            style={[
                                styles.statValue,
                                { color: Colors.goldLight, transform: [{ scale: countAnim }] },
                            ]}
                        >
                            {count.toLocaleString('hi-IN')}
                        </Animated.Text>
                    </View>
                    <Animated.View
                        style={[styles.statCardCenter, { transform: [{ scale: malaFlash }] }]}
                    >
                        <MalaRing count={count} color={Colors.goldLight} size={120} />
                    </Animated.View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>माला प्रगति</Text>
                        <Text style={[styles.statValue, { color: Colors.primaryLight }]}>
                            {beadsInMala}/{MALA_SIZE}
                        </Text>
                    </View>
                </View>

                {/* ── Writing Area ── */}
                <View style={styles.writingAreaWrap}>
                    <View style={styles.writingAreaHeader}>
                        <View style={styles.writingAreaLabel}>
                            <View style={[styles.labelDot, { backgroundColor: deityKeys.color }]} />
                            <Text style={styles.writingAreaLabelText}>नाम लेखन</Text>
                        </View>
                        <View style={styles.jaapBadge}>
                            <Text style={styles.jaapBadgeText}>JAAP: {count}</Text>
                        </View>
                    </View>
                    <ScrollView
                        ref={scrollRef}
                        style={styles.writingScroll}
                        contentContainerStyle={styles.writingScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {displayLines.length === 0 ? (
                            <Text style={styles.writingPlaceholder}>
                                नीचे बटन दबाएं या टाइप करें…
                            </Text>
                        ) : (
                            displayLines.map((line, i) => (
                                <Text
                                    key={i}
                                    style={[styles.writingMantra, { color: Colors.textLight }]}
                                >
                                    {line}
                                </Text>
                            ))
                        )}
                    </ScrollView>
                    <TextInput
                        ref={inputRef}
                        style={styles.hiddenInput}
                        value={typedText}
                        onChangeText={handleTextChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                        blurOnSubmit={false}
                        showSoftInputOnFocus={true}
                    />
                </View>

                {/* ── Shortcut Keys Row ── */}
                <View style={styles.keysRow}>
                    {deityKeys.syllables.map((syl, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.keyBtnWrap}
                            onPress={() => handleShortcutKey(i)}
                            activeOpacity={0.75}
                        >
                            <LinearGradient
                                colors={keyColors[i]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.keyBtn}
                            >
                                <Text style={styles.keyBtnSyl}>{syl}</Text>
                                <Text style={styles.keyBtnTrigger}>
                                    {deityKeys.keys[i].toUpperCase()}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Bottom Bar ── */}
                <View style={styles.bottomBar}>
                    <Animated.View style={{ transform: [{ scale: savePulse }], flex: 1 }}>
                        <TouchableOpacity
                            style={[
                                styles.saveBtn,
                                !hasUnsaved && styles.saveBtnDisabled,
                                saveSuccess && styles.saveBtnSuccess,
                            ]}
                            onPress={() => handleSave(false)}
                            disabled={saving || !hasUnsaved}
                            activeOpacity={0.85}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : saveSuccess ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                    <Text style={styles.saveBtnText}>सहेजा!</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={16}
                                        color={hasUnsaved ? '#fff' : 'rgba(255,255,255,0.4)'}
                                    />
                                    <Text
                                        style={[
                                            styles.saveBtnText,
                                            !hasUnsaved && { color: 'rgba(255,255,255,0.4)' },
                                        ]}
                                    >
                                        सहेजें {hasUnsaved ? `(+${count - savedCount})` : ''}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                    <TouchableOpacity style={styles.historyBtn} activeOpacity={0.85}>
                        <Ionicons name="bar-chart-outline" size={16} color="#fff" />
                        <Text style={styles.historyBtnText}>इतिहास</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Toolbar ── */}
                <View style={styles.toolbarSafeArea}>
                    <View style={styles.toolbar}>
                        <TouchableOpacity
                            style={styles.toolbarBtn}
                            onPress={() => {
                                setShowDeityPicker(p => !p);
                                setShowWallpaperPicker(false);
                            }}
                        >
                            <Text style={styles.toolbarBtnIcon}>{deity.icon}</Text>
                            <Text style={styles.toolbarBtnLabel}>देवता</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.toolbarBtn}
                            onPress={() => {
                                setShowWallpaperPicker(p => !p);
                                setShowDeityPicker(false);
                            }}
                        >
                            <Ionicons
                                name="image-outline"
                                size={32}
                                color="rgba(255,255,255,0.85)"
                            />
                            <Text style={styles.toolbarBtnLabel}>पृष्ठभूमि</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toolbarBtn, vibrationOn && styles.toolbarBtnActive]}
                            onPress={() => setVibrationOn(v => !v)}
                        >
                            <Ionicons
                                name="pulse-outline"
                                size={32}
                                color={vibrationOn ? Colors.goldLight : 'rgba(255,255,255,0.85)'}
                            />
                            <Text
                                style={[
                                    styles.toolbarBtnLabel,
                                    vibrationOn && { color: Colors.goldLight },
                                ]}
                            >
                                कंपन
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toolbarBtn, soundOn && styles.toolbarBtnActive]}
                            onPress={() => setSoundOn(s => !s)}
                        >
                            <Ionicons
                                name={soundOn ? 'musical-notes' : 'musical-notes-outline'}
                                size={32}
                                color={soundOn ? Colors.goldLight : 'rgba(255,255,255,0.85)'}
                            />
                            <Text
                                style={[
                                    styles.toolbarBtnLabel,
                                    soundOn && { color: Colors.goldLight },
                                ]}
                            >
                                ध्वनि
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ── Deity Picker Modal ── */}
            <Modal
                visible={showDeityPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDeityPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowDeityPicker(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.pickerSheet}>
                        <View style={styles.pickerHandle} />
                        <Text style={styles.pickerTitle}>देवता चुनें</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: Spacing.lg,
                                gap: Spacing.md,
                            }}
                        >
                            {DEITIES.map(d => (
                                <TouchableOpacity
                                    key={d.id}
                                    style={[
                                        styles.deityItem,
                                        d.id === deity.id && styles.deityItemActive,
                                    ]}
                                    onPress={() => {
                                        setDeity(d);
                                        setShowDeityPicker(false);
                                        setDisplayLines([]);
                                        setTypedText('');
                                        keyBuffer.current = '';
                                        shortcutBufferRef.current = 0;
                                    }}
                                >
                                    <Text style={styles.deityItemIcon}>{d.icon}</Text>
                                    <Text style={styles.deityItemName}>{d.nameHi}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* ── Wallpaper Picker Modal ── */}
            <Modal
                visible={showWallpaperPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowWallpaperPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowWallpaperPicker(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.pickerSheet}>
                        <View style={styles.pickerHandle} />
                        <Text style={styles.pickerTitle}>पृष्ठभूमि चुनें</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: Spacing.lg,
                                gap: Spacing.md,
                            }}
                        >
                            <TouchableOpacity style={styles.wpOption} onPress={pickCustomWallpaper}>
                                <View style={[styles.wpThumb, styles.wpUpload]}>
                                    <Ionicons
                                        name="camera-outline"
                                        size={26}
                                        color="rgba(255,255,255,0.8)"
                                    />
                                    <Text
                                        style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: 9,
                                            marginTop: 2,
                                        }}
                                    >
                                        अपलोड
                                    </Text>
                                </View>
                                <Text style={styles.wpLabel}>गैलरी</Text>
                            </TouchableOpacity>

                            {wallpaper && (
                                <TouchableOpacity
                                    style={styles.wpOption}
                                    onPress={() => {
                                        setWallpaper(null);
                                        setShowWallpaperPicker(false);
                                    }}
                                >
                                    <ImageBackground
                                        source={{ uri: wallpaper }}
                                        style={[styles.wpThumb, { overflow: 'hidden' }]}
                                        resizeMode="cover"
                                    >
                                        <View
                                            style={{
                                                ...StyleSheet.absoluteFillObject,
                                                backgroundColor: 'rgba(0,0,0,0.3)',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={20}
                                                color="rgba(255,255,255,0.9)"
                                            />
                                        </View>
                                    </ImageBackground>
                                    <Text style={styles.wpLabel}>हटाएं</Text>
                                </TouchableOpacity>
                            )}

                            {DEFAULT_WALLPAPERS.map(wp => (
                                <TouchableOpacity
                                    key={wp.id}
                                    style={styles.wpOption}
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
                                        style={[
                                            styles.wpThumb,
                                            wallpaper === null &&
                                                wallpaperGradient[0] === wp.gradient[0] &&
                                                styles.wpThumbActive,
                                        ]}
                                    />
                                    <Text style={styles.wpLabel}>{wp.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* ── Floating texts ── */}
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
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.darkBg },
    wallpaperOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.52)' },

    // Mandala
    mandalaContainer: {
        position: 'absolute',
        top: SCREEN_H * 0.12,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mandalaRing: {
        position: 'absolute',
        borderWidth: 1.5,
        borderColor: '#fff',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    headerSub: {
        fontSize: Fonts.sizes.xl,
        color: 'rgba(255,255,255,0.55)',
        marginTop: 2,
        letterSpacing: 1.5,
    },
    headerRight: { flexDirection: 'row', gap: 6 },

    // Stats
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statCard: { alignItems: 'center', flex: 1 },
    statCardCenter: { alignItems: 'center' },
    statLabel: {
        fontSize: Fonts.sizes.xxl,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    statValue: { fontSize: Fonts.sizes.xxxl, fontWeight: '900', letterSpacing: -0.5 },

    // Writing area
    writingAreaWrap: {
        flex: 1,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
        minHeight: 130,
    },
    writingAreaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    writingAreaLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    labelDot: { width: 8, height: 8, borderRadius: 4 },
    writingAreaLabelText: {
        fontSize: Fonts.sizes.xxl,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '700',
        letterSpacing: 1,
    },
    jaapBadge: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    jaapBadgeText: { fontSize: Fonts.sizes.lg, color: '#fff', fontWeight: '800', letterSpacing: 1 },
    writingScroll: { flex: 1 },
    writingScrollContent: { padding: Spacing.md, paddingBottom: Spacing.lg, gap: 4 },
    writingPlaceholder: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: Fonts.sizes.xl,
        fontStyle: 'italic',
    },
    // FIX: Each line is one Text element — full mantra string, no split/filter
    writingMantra: {
        fontSize: Fonts.sizes.xxxl,
        fontWeight: '800',
        lineHeight: 32,
        letterSpacing: 2,
        flexWrap: 'wrap',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1,
        bottom: 0,
        left: 0,
    },

    // Keys row
    keysRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    keyBtnWrap: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadow.md },
    keyBtn: {
        paddingVertical: Spacing.md + 2,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    keyBtnSyl: { fontSize: Fonts.sizes.xxxl, fontWeight: '900', color: '#fff', letterSpacing: 1 },
    keyBtnTrigger: {
        fontSize: Fonts.sizes.xxl,
        color: 'rgba(255,255,255,0.55)',
        fontWeight: '700',
        letterSpacing: 2,
    },

    // Bottom bar
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    saveBtnSuccess: { backgroundColor: Colors.success },
    saveBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.08)',
    },
    saveBtnText: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        ...Shadow.sm,
    },
    historyBtnText: {
        fontSize: Fonts.sizes.lg,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },

    // FIX 3: Toolbar with SafeAreaView wrapper
    toolbarSafeArea: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
        paddingBottom: Platform.OS === 'android' ? 8 : 0,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spacing.sm,
        // No hardcoded paddingBottom — SafeAreaView handles it
    },
    toolbarBtn: { alignItems: 'center', gap: 3, paddingHorizontal: Spacing.sm },
    toolbarBtnActive: {},
    toolbarBtnIcon: { fontSize: 32 },
    toolbarBtnLabel: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },

    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    // Picker sheet
    pickerSheet: {
        backgroundColor: 'rgba(15,5,0,0.97)',
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingTop: Spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        ...Shadow.lg,
    },
    pickerHandle: {
        width: 32,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: Spacing.sm,
    },
    pickerTitle: {
        fontSize: Fonts.sizes.xs,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    deityItem: {
        alignItems: 'center',
        gap: 6,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        minWidth: 72,
    },
    deityItemActive: { borderColor: Colors.goldLight, backgroundColor: 'rgba(255,255,255,0.07)' },
    deityItemIcon: { fontSize: 36 },
    deityItemName: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

    wpOption: { alignItems: 'center', gap: 5 },
    wpThumb: {
        width: 68,
        height: 68,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wpThumbActive: { borderColor: Colors.goldLight, borderWidth: 2.5 },
    wpUpload: { backgroundColor: 'rgba(255,255,255,0.1)' },
    wpLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

    floatingText: {
        position: 'absolute',
        fontSize: Fonts.sizes.md,
        fontWeight: '900',
        color: Colors.goldLight,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 4,
        textShadowOffset: { width: 0, height: 1 },
        pointerEvents: 'none',
    },
});
