import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, Radius, SacredSymbols } from '../theme/colors';

interface SpiritualHeaderProps {
  title?: string;
  titleHindi?: string;
  showLogo?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  navigation?: { goBack: () => void };
  showSearch?: boolean;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

const SpiritualHeader: React.FC<SpiritualHeaderProps> = ({
  title,
  titleHindi,
  showLogo = false,
  showBack = false,
  onBack,
  navigation,
  showSearch = false,
  rightComponent,
  transparent = false,
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.crimsonDark} />
      <LinearGradient
        colors={['#7F0000', '#B71C1C', '#C62828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        {/* Decorative Om pattern */}
        <Text style={styles.bgOm}>{SacredSymbols.om}</Text>

        <View style={styles.inner}>
          {/* Left */}
          <View style={styles.left}>
            {showBack && (
              <TouchableOpacity
                onPress={onBack ?? (() => navigation?.goBack())}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            )}

            {showLogo ? (
              <View style={styles.logoRow}>
                <View style={styles.logoOmCircle}>
                  <Text style={styles.logoOm}>{SacredSymbols.om}</Text>
                </View>
                <View>
                  <Text style={styles.logoTitle}>सनातन सेवा</Text>
                  <Text style={styles.logoSubtitle}>Sanatan Seva Platform</Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.headerTitle}>{title}</Text>
                {titleHindi && <Text style={styles.headerTitleHindi}>{titleHindi}</Text>}
              </View>
            )}
          </View>

          {/* Right */}
          <View style={styles.right}>
            {rightComponent ?? (
              <View style={styles.rightActions}>
                {showSearch && (
                  <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                    <Text style={{ fontSize: 18 }}>🔍</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                  <View style={styles.notifDot} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <LinearGradient
                    colors={[Colors.gold, Colors.amberLight]}
                    style={styles.avatarCircle}
                  >
                    <Text style={styles.avatarText}>{SacredSymbols.pray}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Gold bottom stripe */}
        <View style={styles.goldStripe} />
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 14,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  bgOm: {
    position: 'absolute',
    right: 10,
    top: Platform.OS === 'ios' ? 30 : 10,
    fontSize: 70,
    color: 'rgba(255,255,255,0.06)',
    fontWeight: '900',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  right: {},
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: Colors.white, fontSize: 20, fontWeight: '600' },

  // Logo
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoOmCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(249,168,37,0.25)',
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOm: { fontSize: 22, color: Colors.gold },
  logoTitle: { color: Colors.goldLight, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  logoSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 0.3 },

  // Title
  headerTitle: { color: Colors.white, fontSize: Typography.lg, fontWeight: '800' },
  headerTitleHindi: { color: Colors.goldLight, fontSize: Typography.sm, fontWeight: '600', marginTop: 1 },

  // Right Actions
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
    borderWidth: 1.5,
    borderColor: Colors.crimson,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 20 },

  // Gold Stripe
  goldStripe: {
    height: 2,
    backgroundColor: Colors.gold,
    marginHorizontal: -Spacing.md,
    marginTop: 10,
    opacity: 0.6,
  },
});

export default SpiritualHeader;
