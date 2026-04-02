import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/useAuthore';

// ── Theme ─────────────────────────────────────────────────────────────────────
const Theme = {
    navy: '#0B0F2A',
    navyDeep: '#070B1E',
    navyMid: '#111840',
    gold: '#D4A017',
    goldLight: '#F2C84B',
    goldDim: 'rgba(212,160,23,0.4)',
    amber: '#E87820',
    amberLight: '#FFA040',
    cyan: '#2BBFDF',
    cyanDeep: '#1A8FAA',
    cyanLight: '#6FD8EE',
    white: '#FFFFFF',
    whiteDim: 'rgba(255,255,255,0.55)',
    whiteFaint: 'rgba(255,255,255,0.18)',
};

type SplashProps = NativeStackScreenProps<RootParamList, 'splash'>;

const { width: W, height: H } = Dimensions.get('window');

// ── Floating particle ─────────────────────────────────────────────────────────
const Particle: React.FC<{
    x: number;
    y: number;
    size: number;
    delay: number;
    color: string;
    duration: number;
}> = ({ x, y, size, delay, color, duration }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0.75,
                        duration: duration * 0.3,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: duration * 0.3,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -36,
                        duration: duration * 0.7,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.quad),
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: duration * 0.7,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(scale, { toValue: 0, duration: 0, useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
                ]),
            ]),
        );
        anim.start();
        return () => anim.stop();
    }, []);

    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                opacity,
                transform: [{ scale }, { translateY }],
            }}
        />
    );
};

// ── Revolving ring ────────────────────────────────────────────────────────────
const RevolvingRing: React.FC<{
    radius: number;
    delay: number;
    clockwise?: boolean;
    dotColor1?: string;
    dotColor2?: string;
}> = ({
    radius,
    delay,
    clockwise = true,
    dotColor1 = 'rgba(212,160,23,0.3)',
    dotColor2 = 'rgba(43,191,223,0.2)',
}) => {
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.timing(rotate, {
                toValue: clockwise ? 1 : -1,
                duration: 10000,
                useNativeDriver: true,
                easing: Easing.linear,
            }),
        );
        const t = setTimeout(() => anim.start(), delay);
        return () => {
            clearTimeout(t);
            anim.stop();
        };
    }, []);

    const spin = rotate.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-360deg', '0deg', '360deg'],
    });
    const dotCount = radius > 90 ? 8 : 6;

    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: 'absolute',
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                borderWidth: 0.6,
                borderColor: 'rgba(212,160,23,0.12)',
                transform: [{ rotate: spin }],
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {Array.from({ length: dotCount }).map((_, i) => {
                const angle = (i / dotCount) * 2 * Math.PI;
                const dx = radius + radius * Math.cos(angle) - 3;
                const dy = radius + radius * Math.sin(angle) - 3;
                return (
                    <View
                        key={i}
                        style={{
                            position: 'absolute',
                            left: dx,
                            top: dy,
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor: i % 2 === 0 ? dotColor1 : dotColor2,
                        }}
                    />
                );
            })}
        </Animated.View>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const SplashScreen = ({ navigation }: SplashProps) => {
    // Native-driver values
    const bgScale = useRef(new Animated.Value(1.1)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(0.5)).current;
    const archOpacity = useRef(new Animated.Value(0)).current;
    const archScale = useRef(new Animated.Value(0.8)).current;
    const ramOpacity = useRef(new Animated.Value(0)).current;
    const ramScale = useRef(new Animated.Value(0.7)).current;
    const ramY = useRef(new Animated.Value(20)).current;
    const flamePulse = useRef(new Animated.Value(1)).current;
    const lineScaleX = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleY = useRef(new Animated.Value(20)).current;
    const subOpacity = useRef(new Animated.Value(0)).current;
    const subY = useRef(new Animated.Value(14)).current;
    const tagOpacity = useRef(new Animated.Value(0)).current;
    const tagY = useRef(new Animated.Value(12)).current;
    const versionOpacity = useRef(new Animated.Value(0)).current;
    const dot1 = useRef(new Animated.Value(0.15)).current;
    const dot2 = useRef(new Animated.Value(0.15)).current;
    const dot3 = useRef(new Animated.Value(0.15)).current;

    // JS-driver only (letterSpacing / width)
    const barWidth = useRef(new Animated.Value(0)).current;
    const titleSpacing = useRef(new Animated.Value(4)).current; // JS driver

    const { loadUser } = useAuthStore();

    const handleNavigation = async () => {
        await loadUser();
        const { user, isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
            // navigation.replace(user?.role === 'pandit' ? 'pandit' : 'main', { screen: 'Home' });
            navigation.replace('mainDrawer', { screen: 'Home' });
        } else {
            navigation.replace('login');
        }
    };

    const PARTICLES = [
        { x: W * 0.1, y: H * 0.3, size: 4, delay: 0, color: Theme.gold, duration: 2200 },
        { x: W * 0.85, y: H * 0.38, size: 5, delay: 400, color: Theme.amber, duration: 2800 },
        { x: W * 0.22, y: H * 0.55, size: 3, delay: 800, color: Theme.cyan, duration: 1900 },
        { x: W * 0.78, y: H * 0.32, size: 5, delay: 1200, color: Theme.goldLight, duration: 2500 },
        { x: W * 0.5, y: H * 0.7, size: 3, delay: 600, color: Theme.gold, duration: 2100 },
        { x: W * 0.08, y: H * 0.65, size: 4, delay: 1000, color: Theme.amberLight, duration: 3000 },
        { x: W * 0.9, y: H * 0.62, size: 3, delay: 200, color: Theme.cyan, duration: 2400 },
        { x: W * 0.4, y: H * 0.25, size: 4, delay: 900, color: Theme.goldLight, duration: 1800 },
    ];

    useEffect(() => {
        const dotLoop = (dot: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, { toValue: 1, duration: 380, useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.15, duration: 380, useNativeDriver: true }),
                ]),
            );

        // ── Phase A: All native-driver animations ─────────────────────────────
        Animated.sequence([
            // BG zoom
            Animated.timing(bgScale, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),

            // Golden glow bloom
            Animated.parallel([
                Animated.timing(glowOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.spring(glowScale, {
                    toValue: 1,
                    tension: 35,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),

            // Arch reveals
            Animated.parallel([
                Animated.timing(archOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.spring(archScale, {
                    toValue: 1,
                    tension: 60,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),

            // Ram rises in
            Animated.parallel([
                Animated.timing(ramOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.spring(ramScale, {
                    toValue: 1,
                    tension: 70,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(ramY, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),

            // Divider line
            Animated.timing(lineScaleX, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),

            // Title (opacity + translateY only — native-safe)
            Animated.parallel([
                Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(titleY, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),

            // Subtitle "RAM NAVMI LAUNCH"
            Animated.parallel([
                Animated.timing(subOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.timing(subY, { toValue: 0, duration: 450, useNativeDriver: true }),
            ]),

            // Tagline chips
            Animated.parallel([
                Animated.timing(tagOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.timing(tagY, { toValue: 0, duration: 450, useNativeDriver: true }),
            ]),

            // Version fade
            Animated.timing(versionOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start(() => {
            // Flame / halo pulse loop (native)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(flamePulse, {
                        toValue: 1.06,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(flamePulse, {
                        toValue: 0.96,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();

            // Loading dots (native)
            dotLoop(dot1, 0).start();
            dotLoop(dot2, 220).start();
            dotLoop(dot3, 440).start();

            // Navigate
            const timer = setTimeout(() => handleNavigation(), 800);
            return () => clearTimeout(timer);
        });

        // ── Phase B: JS-driver animations (run independently) ─────────────────
        // letterSpacing expand
        Animated.timing(titleSpacing, {
            toValue: 8,
            duration: 1400,
            delay: 2200, // starts around Phase 5
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // MUST be false for letterSpacing
        }).start();

        // Progress bar (JS driver — width is not natively animatable)
        Animated.timing(barWidth, {
            toValue: W - 80,
            duration: 2400,
            delay: 2800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false, // MUST be false for width
        }).start();
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Background ── */}
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: bgScale }] }]}>
                <LinearGradient
                    colors={[Theme.navyDeep, Theme.navy, '#0E1535', Theme.navyDeep]}
                    locations={[0, 0.4, 0.75, 1]}
                    style={StyleSheet.absoluteFill}
                />
                {/* Soft mesh blobs */}
                <View style={styles.meshTR} />
                <View style={styles.meshBL} />
                <View style={styles.meshCenter} />
            </Animated.View>

            {/* ── Particles ── */}
            {PARTICLES.map((p, i) => (
                <Particle key={i} {...p} />
            ))}

            {/* ── Revolving rings (centered on illustration) ── */}
            <View style={styles.ringsContainer} pointerEvents="none">
                <RevolvingRing
                    radius={150}
                    delay={0}
                    clockwise={true}
                    dotColor1="rgba(212,160,23,0.25)"
                    dotColor2="rgba(43,191,223,0.15)"
                />
                <RevolvingRing
                    radius={118}
                    delay={1000}
                    clockwise={false}
                    dotColor1="rgba(43,191,223,0.2)"
                    dotColor2="rgba(212,160,23,0.2)"
                />
                <RevolvingRing
                    radius={86}
                    delay={500}
                    clockwise={true}
                    dotColor1="rgba(232,120,32,0.25)"
                    dotColor2="rgba(212,160,23,0.15)"
                />
            </View>

            {/* ── Amber halo / glow ── */}
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.halo,
                    {
                        opacity: glowOpacity,
                        transform: [{ scale: Animated.multiply(glowScale, flamePulse) }],
                    },
                ]}
            />

            {/* ── Main content ── */}
            <View style={styles.content}>
                {/* Arch + Ram illustration area */}
                <Animated.View
                    style={{
                        opacity: archOpacity,
                        transform: [{ scale: archScale }],
                        alignItems: 'center',
                        marginBottom: 0,
                    }}
                >
                    {/* Mughal arch frame */}
                    <View style={styles.archFrame}>
                        {/* Outer arch top ornament */}
                        <View style={styles.archTop} />
                        {/* Left pillar */}
                        <View style={[styles.pillar, { left: 10 }]} />
                        {/* Right pillar */}
                        <View style={[styles.pillar, { right: 10 }]} />
                        {/* Arch inner glow */}
                        <LinearGradient
                            colors={[
                                'rgba(232,120,32,0.55)',
                                'rgba(212,160,23,0.25)',
                                'transparent',
                            ]}
                            style={styles.archInnerGlow}
                        />
                    </View>

                    {/* Ram emoji / icon — centered on halo */}
                    <Animated.View
                        style={{
                            marginTop: -H * 0.04,
                            opacity: ramOpacity,
                            transform: [{ scale: ramScale }, { translateY: ramY }],
                            alignItems: 'center',
                        }}
                    >
                        <Text style={styles.ramIcon}>🙏</Text>
                        <View style={styles.ramGlow} />
                    </Animated.View>
                </Animated.View>

                {/* OM symbol */}
                <Animated.Text
                    style={[
                        styles.om,
                        { opacity: titleOpacity, transform: [{ translateY: titleY }] },
                    ]}
                >
                    ॐ
                </Animated.Text>

                {/* Divider */}
                <View style={styles.dividerWrap}>
                    <Animated.View
                        style={[styles.divider, { transform: [{ scaleX: lineScaleX }] }]}
                    >
                        <LinearGradient
                            colors={[
                                'transparent',
                                Theme.gold,
                                Theme.amber,
                                Theme.gold,
                                'transparent',
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                    <Animated.View style={[styles.diamondWrap, { opacity: lineScaleX }]}>
                        <View style={styles.diamond} />
                    </Animated.View>
                </View>

                {/* App name — सनातन सेवा */}
                <Animated.Text
                    style={[
                        styles.appName,
                        {
                            opacity: titleOpacity,
                            // FIX: letterSpacing on a separate JS-animated view below
                            transform: [{ translateY: titleY }],
                        },
                    ]}
                >
                    सनातन सेवा
                </Animated.Text>

                {/* Letter-spaced latin subtitle — driven by JS animator */}
                <Animated.Text
                    style={[
                        styles.subTitle,
                        {
                            opacity: subOpacity,
                            transform: [{ translateY: subY }],
                            letterSpacing: titleSpacing, // ✅ JS driver only
                        },
                    ]}
                >
                    SANATAN SEVA
                </Animated.Text>

                {/* Chips row */}
                <Animated.View
                    style={[
                        styles.chipRow,
                        { opacity: tagOpacity, transform: [{ translateY: tagY }] },
                    ]}
                >
                    {['Puja', 'Darshan', 'Nam Lekhan'].map((chip, i) => (
                        <View key={i} style={styles.chip}>
                            <Text style={styles.chipText}>{chip}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Sanskrit tagline */}
                <Animated.Text
                    style={[
                        styles.tagline,
                        { opacity: tagOpacity, transform: [{ translateY: tagY }] },
                    ]}
                >
                    श्री राम जय राम जय जय राम
                </Animated.Text>
            </View>

            {/* ── Bottom ── */}
            <View style={styles.bottom}>
                <View style={styles.progressTrack}>
                    <Animated.View style={{ overflow: 'hidden', width: barWidth, height: 2 }}>
                        <LinearGradient
                            colors={[Theme.cyanDeep, Theme.cyan, Theme.gold, Theme.amber]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ flex: 1, borderRadius: 2 }}
                        />
                    </Animated.View>
                </View>

                <Animated.View style={[styles.bottomRow, { opacity: versionOpacity }]}>
                    <View style={styles.dotsRow}>
                        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
                    </View>
                    <Text style={styles.version}>v1.0.0</Text>
                </Animated.View>
            </View>

            {/* ── Accent bar ── */}
            <LinearGradient
                colors={[Theme.cyanDeep, Theme.gold, Theme.amber, Theme.gold, Theme.cyanDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentBar}
            />
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const RINGS_SIZE = 300;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Theme.navyDeep },

    // Background mesh blobs
    meshTR: {
        position: 'absolute',
        width: W * 0.85,
        height: W * 0.85,
        borderRadius: W * 0.425,
        top: -W * 0.28,
        right: -W * 0.28,
        backgroundColor: Theme.amber,
        opacity: 0.06,
    },
    meshBL: {
        position: 'absolute',
        width: W * 0.65,
        height: W * 0.65,
        borderRadius: W * 0.325,
        bottom: H * 0.08,
        left: -W * 0.22,
        backgroundColor: Theme.cyan,
        opacity: 0.05,
    },
    meshCenter: {
        position: 'absolute',
        width: W * 0.7,
        height: W * 0.7,
        borderRadius: W * 0.35,
        top: H * 0.18,
        left: W * 0.15,
        backgroundColor: Theme.gold,
        opacity: 0.04,
    },

    // Rings container — centered around illustration
    ringsContainer: {
        position: 'absolute',
        top: H * 0.18,
        left: W / 2 - RINGS_SIZE / 2,
        width: RINGS_SIZE,
        height: RINGS_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Amber halo
    halo: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        top: H * 0.22,
        left: W / 2 - 120,
        backgroundColor: Theme.amber,
        opacity: 0,
        shadowColor: Theme.amber,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 90,
    },

    // Content
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 36,
    },

    // Arch frame
    archFrame: {
        width: 200,
        height: 160,
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
    },
    archTop: {
        width: 140,
        height: 90,
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        borderWidth: 2.5,
        borderBottomWidth: 0,
        borderColor: Theme.gold,
        position: 'absolute',
        top: 0,
        shadowColor: Theme.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
    },
    pillar: {
        position: 'absolute',
        bottom: 0,
        width: 14,
        height: 120,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Theme.gold,
        borderRadius: 4,
        shadowColor: Theme.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    archInnerGlow: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        bottom: 0,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
    },

    // Ram icon
    ramIcon: {
        fontSize: 72,
        textAlign: 'center',
        textShadowColor: Theme.amber,
        textShadowRadius: 28,
        textShadowOffset: { width: 0, height: 4 },
    },
    ramGlow: {
        position: 'absolute',
        bottom: -6,
        alignSelf: 'center',
        width: 70,
        height: 16,
        borderRadius: 35,
        backgroundColor: Theme.amber,
        opacity: 0.28,
    },

    // OM
    om: {
        fontSize: 52,
        color: Theme.gold,
        fontWeight: '900',
        lineHeight: 64,
        textAlign: 'center',
        textShadowColor: Theme.gold,
        textShadowRadius: 18,
        textShadowOffset: { width: 0, height: 0 },
        marginTop: 2,
    },

    // Divider
    dividerWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
    divider: { width: 200, height: 1.5, overflow: 'hidden', borderRadius: 2 },
    diamondWrap: { position: 'absolute' },
    diamond: { width: 8, height: 8, backgroundColor: Theme.gold, transform: [{ rotate: '45deg' }] },

    // App name (Devanagari)
    appName: {
        fontSize: 34,
        color: Theme.gold,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 2,
        textShadowColor: 'rgba(212,160,23,0.5)',
        textShadowRadius: 16,
        textShadowOffset: { width: 0, height: 2 },
    },

    // Latin subtitle
    subTitle: {
        fontSize: 11,
        color: Theme.whiteDim,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
    },

    // Chip row
    chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: 'rgba(43,191,223,0.4)',
        backgroundColor: 'rgba(43,191,223,0.08)',
    },
    chipText: {
        fontSize: 10,
        color: Theme.cyanLight,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Tagline
    tagline: {
        fontSize: 12,
        color: Theme.whiteFaint,
        letterSpacing: 1.2,
        textAlign: 'center',
    },

    // Bottom
    bottom: { paddingHorizontal: 40, paddingBottom: 34, gap: 12 },
    progressTrack: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dotsRow: { flexDirection: 'row', gap: 6 },
    dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Theme.gold },
    version: { fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 1, fontWeight: '600' },

    // Accent bar
    accentBar: { height: 3, width: '100%' },
});

export default SplashScreen;
