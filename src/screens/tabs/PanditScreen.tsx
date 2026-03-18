import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useI18n} from '../../i18n';
import {Colors, Fonts, Spacing, BorderRadius, Shadow} from '../../theme';
import {
  GradientHeader,
  Badge,
  StarRating,
  PrimaryButton,
  SectionHeader,
} from '../../components';
import {PANDITS, POOJA_TYPES} from '../../data/staticData';

const PanditScreen: React.FC = () => {
  const {t, isHindi} = useI18n();
  const [selectedPooja, setSelectedPooja] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <GradientHeader title={t.panditsNearYou} subtitle="🙏 Pandit Booking" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pooja Type Selector */}
        <SectionHeader title={t.selectPooja} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.poojaScroll}>
          {POOJA_TYPES.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.poojaChip,
                selectedPooja === p.id && styles.poojaChipSelected,
              ]}
              onPress={() =>
                setSelectedPooja(selectedPooja === p.id ? null : p.id)
              }>
              <Text style={styles.poojaChipIcon}>{p.icon}</Text>
              <Text
                style={[
                  styles.poojaChipText,
                  selectedPooja === p.id && styles.poojaChipTextSelected,
                ]}>
                {isHindi ? p.nameHi : p.name}
              </Text>
              <Text
                style={[
                  styles.poojaChipPrice,
                  selectedPooja === p.id && styles.poojaChipPriceSelected,
                ]}>
                ₹{p.priceFrom}+
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pandits List */}
        <SectionHeader title={t.panditsNearYou} />
        {PANDITS.map(pandit => (
          <View key={pandit.id} style={styles.panditCard}>
            {/* Card Header */}
            <View style={styles.panditHeader}>
              <View style={styles.panditAvatarBox}>
                <Text style={styles.panditAvatar}>{pandit.image}</Text>
                {pandit.isVerified && (
                  <View style={styles.verifiedDot}>
                    <Text style={styles.verifiedIcon}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.panditInfo}>
                <Text style={styles.panditName}>
                  {isHindi ? pandit.nameHi : pandit.name}
                </Text>
                <Text style={styles.panditCity}>
                  📍 {isHindi ? pandit.cityHi : pandit.city}
                </Text>
                <StarRating rating={pandit.rating} />
                <Text style={styles.reviewCount}>
                  ({pandit.reviewCount} {t.reviews})
                </Text>
              </View>
              <View style={styles.panditRight}>
                <Badge
                  label={
                    pandit.isAvailable ? t.availableToday : t.closed
                  }
                  bgColor={
                    pandit.isAvailable ? Colors.tulsi : Colors.textMuted
                  }
                  small
                />
                <Text style={styles.panditExp}>
                  {pandit.experience} {t.years}
                </Text>
              </View>
            </View>

            {/* Specializations */}
            <View style={styles.specRow}>
              {(isHindi ? pandit.specializationsHi : pandit.specializations).map(
                (spec, i) => (
                  <Badge
                    key={i}
                    label={spec}
                    bgColor={Colors.saffronBg}
                    color={Colors.primaryDark}
                    small
                  />
                ),
              )}
            </View>

            {/* Languages */}
            <View style={styles.langRow}>
              <Text style={styles.langLabel}>
                {isHindi ? 'भाषाएं:' : 'Languages:'}
              </Text>
              {(isHindi ? pandit.languagesHi : pandit.languages).map((lang, i) => (
                <Text key={i} style={styles.langText}>
                  {lang}{i < pandit.languages.length - 1 ? ' • ' : ''}
                </Text>
              ))}
            </View>

            {/* Price & Book */}
            <View style={styles.panditFooter}>
              <View>
                <Text style={styles.priceLabel}>{t.from}</Text>
                <Text style={styles.priceValue}>₹{pandit.priceFrom}</Text>
              </View>
              <PrimaryButton
                label={t.bookNow}
                onPress={() =>
                  Alert.alert(
                    '🙏 ' + (isHindi ? 'बुकिंग की पुष्टि' : 'Booking Confirmed'),
                    isHindi
                      ? `${pandit.nameHi} के साथ बुकिंग हो गई!`
                      : `Booking confirmed with ${pandit.name}!`,
                  )
                }
                style={{flex: 1, marginLeft: Spacing.lg}}
              />
            </View>
          </View>
        ))}

        <View style={{height: 80}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},

  poojaScroll: {paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm},
  poojaChip: {
    width: 110,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  poojaChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.saffronBg,
  },
  poojaChipIcon: {fontSize: 28, marginBottom: 4},
  poojaChipText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  poojaChipTextSelected: {color: Colors.primaryDark},
  poojaChipPrice: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  poojaChipPriceSelected: {color: Colors.primary},

  panditCard: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  panditHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  panditAvatarBox: {position: 'relative', marginRight: Spacing.md},
  panditAvatar: {fontSize: 48},
  verifiedDot: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  verifiedIcon: {color: '#FFF', fontSize: 9, fontWeight: '900'},
  panditInfo: {flex: 1},
  panditName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  panditCity: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  panditRight: {alignItems: 'flex-end', gap: 6},
  panditExp: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  langLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '700',
    marginRight: 6,
  },
  langText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  panditFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  priceLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  priceValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '900',
    color: Colors.primary,
  },
});

export default PanditScreen;
