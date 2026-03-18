import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Fonts, Shadow } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/AppNavigator';

type splashProps = NativeStackScreenProps<RootParamList, 'splash'>;

const SplashScreen = ({ navigation }: splashProps) => {
  // Animation values
  const divaScale = useRef(new Animated.Value(0)).current;
  const divaOpacity = useRef(new Animated.Value(0)).current;
  const omScale = useRef(new Animated.Value(0.4)).current;
  const omOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameY = useRef(new Animated.Value(20)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(16)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const flamePulse = useRef(new Animated.Value(1)).current;

  // Dot blink values
  const dot1 = useRef(new Animated.Value(0.2)).current;
  const dot2 = useRef(new Animated.Value(0.2)).current;
  const dot3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const dotLoop = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

    Animated.sequence([
      // 1. Diya blooms in
      Animated.parallel([
        Animated.spring(divaScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(divaOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 2. OM appears
      Animated.parallel([
        Animated.spring(omScale, {
          toValue: 1,
          tension: 80,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(omOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 3. Divider line expands
      Animated.timing(lineWidth, {
        toValue: 80,
        duration: 500,
        useNativeDriver: false, // width cannot use native driver
      }),
      // 4. App name slides up
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(nameY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 5. Tagline appears
      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(tagY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 6. Loading dots appear
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start flame pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(flamePulse, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(flamePulse, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Start loading dots
      dotLoop(dot1, 0).start();
      dotLoop(dot2, 200).start();
      dotLoop(dot3, 400).start();

      // Navigate away after 2.5s of loading animation
      const timer = setTimeout(
        () =>
          navigation.replace('login'),
        2500,
      );
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <View style={styles.root}>

      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.darkBg, '#2D0D00', Colors.darkBg]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Corner ornaments */}
      <Text style={[styles.corner, styles.cornerTL]}>✦</Text>
      <Text style={[styles.corner, styles.cornerTR]}>✦</Text>
      <Text style={[styles.corner, styles.cornerBL]}>✦</Text>
      <Text style={[styles.corner, styles.cornerBR]}>✦</Text>

      {/* Main content */}
      <View style={styles.content}>
        {/* Diya icon */}
        <Animated.View
          style={[
            styles.divaWrap,
            {
              opacity: divaOpacity,
              transform: [{ scale: Animated.multiply(divaScale, flamePulse) }],
            },
          ]}
        >
          <Text style={styles.divaEmoji}>🪔</Text>
        </Animated.View>

        {/* OM symbol */}
        <Animated.Text
          style={[
            styles.omText,
            {
              opacity: omOpacity,
              transform: [{ scale: omScale }],
            },
          ]}
        >
          ॐ
        </Animated.Text>

        {/* Gold divider */}
        <Animated.View style={[styles.divider, { width: lineWidth }]} />

        {/* App name */}
        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: nameOpacity,
              transform: [{ translateY: nameY }],
            },
          ]}
        >
          AARADHANA
        </Animated.Text>

        {/* Sanskrit tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: tagOpacity,
              transform: [{ translateY: tagY }],
            },
          ]}
        >
          श्री राम जय राम जय जय राम
        </Animated.Text>

        {/* Loading dots */}
        <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </Animated.View>
      </View>

      {/* Bottom saffron accent bar */}
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
        style={styles.bottomBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Corner ornaments
  corner: {
    position: 'absolute',
    color: Colors.gold,
    fontSize: 18,
    opacity: 0.35,
  },
  cornerTL: { top: 48, left: 24 },
  cornerTR: { top: 48, right: 24 },
  cornerBL: { bottom: 24, left: 24 },
  cornerBR: { bottom: 24, right: 24 },

  // Diya
  divaWrap: {
    marginBottom: 4,
    ...Shadow.lg,
  },
  divaEmoji: {
    fontSize: 72,
    textAlign: 'center',
  },

  // OM
  omText: {
    fontSize: 56,
    color: Colors.gold,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    lineHeight: 68,
    textShadowColor: Colors.gold,
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },

  // Divider
  divider: {
    height: 2,
    backgroundColor: Colors.gold,
    borderRadius: 2,
    marginVertical: 12,
    opacity: 0.8,
  },

  // App name
  appName: {
    fontSize: Fonts.sizes.xxl,
    color: Colors.textLight,
    letterSpacing: 6,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Tagline
  tagline: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 4,
  },

  // Loading dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  // Bottom bar
  bottomBar: {
    height: 3,
    width: '100%',
  },
});

export default SplashScreen;
