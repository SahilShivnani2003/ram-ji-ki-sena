import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {useI18n} from '../i18n';
import {Colors, Fonts, Spacing, BorderRadius, Shadow} from '../theme';
import {
  GradientHeader,
  Badge,
  StarRating,
  ChipFilter,
  LiveBadge,
  PrimaryButton,
} from '../components';
import {MANDIRS} from '../data/staticData';

const MandirScreen: React.FC = () => {
  const {t, isHindi} = useI18n();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    {key: 'all', label: t.allFilter},
    {key: 'nearby', label: t.nearbyFilter},
    {key: 'popular', label: t.popularFilter},
  ];

  const filtered = MANDIRS.filter(m => {
    const name = isHindi ? m.nameHi : m.name;
    const city = isHindi ? m.cityHi : m.city;
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'nearby' && m.distance <= 5) ||
      (filter === 'popular' && m.rating >= 4.8);
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      <GradientHeader title={t.mandirDirectory} subtitle="🛕 " />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchMandirs}
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ChipFilter options={filterOptions} selected={filter} onSelect={setFilter} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(mandir => (
          <TouchableOpacity
            key={mandir.id}
            style={styles.card}
            activeOpacity={0.9}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.mandirIcon}>{mandir.image}</Text>
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.mandirName}>
                  {isHindi ? mandir.nameHi : mandir.name}
                </Text>
                <Text style={styles.mandirCity}>
                  📍 {isHindi ? mandir.cityHi : mandir.city},{' '}
                  {mandir.state}
                </Text>
                <StarRating rating={mandir.rating} />
              </View>
              <View style={styles.cardHeaderRight}>
                <Badge
                  label={mandir.isOpen ? t.openNow : t.closed}
                  bgColor={mandir.isOpen ? Colors.tulsi : Colors.error}
                  small
                />
                <Text style={styles.distance}>
                  {mandir.distance} {t.km}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {mandir.tags.map(tag => (
                <Badge
                  key={tag}
                  label={tag}
                  bgColor={Colors.saffronBg}
                  color={Colors.primaryDark}
                  small
                />
              ))}
            </View>

            {/* Timings */}
            <View style={styles.timingsRow}>
              <Text style={styles.timingIcon}>🕐</Text>
              <Text style={styles.timingText}>
                {mandir.openTime} – {mandir.closeTime}
              </Text>
              <Text style={styles.aartiText}>
                🪔 {t.aartiTime}: {mandir.aartiTimes[0]}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <PrimaryButton
                label={t.getDirections}
                onPress={() => Alert.alert('🗺️', 'Opening Maps...')}
                outline
                small
                style={{flex: 1, marginRight: Spacing.sm}}
              />
              {mandir.hasLiveDarshan ? (
                <PrimaryButton
                  label={t.liveDarshanBtn}
                  onPress={() => Alert.alert('📺', 'Starting Live Darshan...')}
                  small
                  style={{flex: 1}}
                />
              ) : (
                <PrimaryButton
                  label={t.viewDetails}
                  onPress={() => Alert.alert('🛕', 'Mandir Details')}
                  small
                  style={{flex: 1}}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{height: 80}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  searchIcon: {fontSize: 18, marginRight: Spacing.sm},
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  cardHeader: {flexDirection: 'row', marginBottom: Spacing.md},
  mandirIcon: {fontSize: 44, marginRight: Spacing.md},
  cardHeaderInfo: {flex: 1},
  mandirName: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  mandirCity: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  cardHeaderRight: {alignItems: 'flex-end', gap: 6},
  distance: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  timingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.saffronBg,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timingIcon: {fontSize: 14, marginRight: 4},
  timingText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  aartiText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
  },
  actionRow: {flexDirection: 'row'},
});

export default MandirScreen;
