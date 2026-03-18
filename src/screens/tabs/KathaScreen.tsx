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
  ChipFilter,
  LiveBadge,
  PrimaryButton,
  SectionHeader,
  StarRating,
} from '../../components';
import {KATHA_EVENTS, KATHAVACHAKS} from '../../data/staticData';

const KathaScreen: React.FC = () => {
  const {t, isHindi} = useI18n();
  const [tab, setTab] = useState('upcoming');

  const tabOptions = [
    {key: 'live', label: t.liveKatha},
    {key: 'upcoming', label: t.upcomingKatha},
    {key: 'past', label: t.pastKatha},
  ];

  const liveEvents = KATHA_EVENTS.filter(e => e.isLive);
  const upcomingEvents = KATHA_EVENTS.filter(e => !e.isLive);

  return (
    <View style={styles.container}>
      <GradientHeader title={t.kathaEvents} subtitle="📖 Ram Katha" />
      <ChipFilter options={tabOptions} selected={tab} onSelect={setTab} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Live Katha */}
        {tab === 'live' && (
          <>
            {liveEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📺</Text>
                <Text style={styles.emptyText}>
                  {isHindi ? 'अभी कोई लाइव कथा नहीं' : 'No live katha right now'}
                </Text>
              </View>
            ) : (
              liveEvents.map(event => (
                <KathaEventCard key={event.id} event={event} isHindi={isHindi} t={t} />
              ))
            )}
          </>
        )}

        {/* Upcoming Katha */}
        {tab === 'upcoming' && (
          <>
            {upcomingEvents.map(event => (
              <KathaEventCard key={event.id} event={event} isHindi={isHindi} t={t} />
            ))}
          </>
        )}

        {/* Past Katha */}
        {tab === 'past' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📼</Text>
            <Text style={styles.emptyText}>
              {isHindi
                ? 'पिछली कथाओं की रिकॉर्डिंग जल्द आएगी'
                : 'Past katha recordings coming soon'}
            </Text>
          </View>
        )}

        {/* Kathavachaks Section */}
        <SectionHeader title={t.kathavachak} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kathavachakScroll}>
          {KATHAVACHAKS.map(k => (
            <TouchableOpacity key={k.id} style={styles.kathavachakCard}>
              <Text style={styles.kathavachakAvatar}>{k.image}</Text>
              {k.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              )}
              <Text style={styles.kathavachakName} numberOfLines={2}>
                {isHindi ? k.nameHi : k.name}
              </Text>
              <Text style={styles.kathavachakTitle} numberOfLines={1}>
                {isHindi ? k.titleHi : k.title}
              </Text>
              <Text style={styles.kathavachakFollowers}>
                👥 {k.followers}
              </Text>
              <StarRating rating={k.rating} size={10} />
              <View style={styles.nextEventBox}>
                <Text style={styles.nextEventLabel}>
                  {isHindi ? 'अगली कथा:' : 'Next:'}
                </Text>
                <Text style={styles.nextEventText} numberOfLines={2}>
                  {isHindi ? k.nextEventHi : k.nextEvent}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{height: 80}} />
      </ScrollView>
    </View>
  );
};

interface KathaEventCardProps {
  event: (typeof KATHA_EVENTS)[0];
  isHindi: boolean;
  t: any;
}

const KathaEventCard: React.FC<KathaEventCardProps> = ({event, isHindi, t}) => (
  <TouchableOpacity style={styles.eventCard} activeOpacity={0.9}>
    <View style={styles.eventHeader}>
      <Text style={styles.eventIcon}>{event.image}</Text>
      <View style={styles.eventHeaderInfo}>
        <Text style={styles.eventType}>
          {isHindi ? event.typeHi : event.type}
        </Text>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {isHindi ? event.titleHi : event.title}
        </Text>
      </View>
      {event.isLive ? (
        <LiveBadge />
      ) : (
        <Badge
          label={event.isFree ? t.free : t.paid}
          bgColor={event.isFree ? Colors.tulsi : Colors.primary}
        />
      )}
    </View>

    <View style={styles.eventDetails}>
      <View style={styles.eventDetailRow}>
        <Text style={styles.detailIcon}>🎤</Text>
        <Text style={styles.detailLabel}>{t.kathavachak}:</Text>
        <Text style={styles.detailValue}>
          {isHindi ? event.kathavachakHi : event.kathavachak}
        </Text>
      </View>
      <View style={styles.eventDetailRow}>
        <Text style={styles.detailIcon}>📍</Text>
        <Text style={styles.detailLabel}>{t.venue}:</Text>
        <Text style={styles.detailValue} numberOfLines={1}>
          {isHindi ? event.venueHi : event.venue}
        </Text>
      </View>
      <View style={styles.eventDetailRow}>
        <Text style={styles.detailIcon}>📅</Text>
        <Text style={styles.detailLabel}>{isHindi ? 'तारीख:' : 'Date:'}
        </Text>
        <Text style={styles.detailValue}>
          {isHindi ? event.dateHi : event.date}
        </Text>
      </View>
      <View style={styles.eventDetailRow}>
        <Text style={styles.detailIcon}>🕐</Text>
        <Text style={styles.detailLabel}>{isHindi ? 'समय:' : 'Time:'}
        </Text>
        <Text style={styles.detailValue}>
          {isHindi ? event.timeHi : event.time}
        </Text>
      </View>
      <View style={styles.eventDetailRow}>
        <Text style={styles.detailIcon}>👥</Text>
        <Text style={styles.detailLabel}>
          {isHindi ? 'भक्त:' : 'Attendees:'}
        </Text>
        <Text style={styles.detailValue}>{event.attendees}</Text>
      </View>
    </View>

    <PrimaryButton
      label={event.isLive ? t.watchNow : t.registerFree}
      onPress={() =>
        Alert.alert(
          '🙏 ' + (isHindi ? 'जय श्री राम' : 'Jai Shri Ram'),
          isHindi ? 'पंजीकरण हो गया!' : 'Registration successful!',
        )
      }
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  emptyIcon: {fontSize: 60, marginBottom: Spacing.md},
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Event Card
  eventCard: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  eventIcon: {fontSize: 40, marginRight: Spacing.md},
  eventHeaderInfo: {flex: 1},
  eventType: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  eventDetails: {
    backgroundColor: Colors.saffronBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {fontSize: 12, marginRight: 6, width: 16},
  detailLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    width: 70,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },

  // Kathavachak cards
  kathavachakScroll: {paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md},
  kathavachakCard: {
    width: 150,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  kathavachakAvatar: {fontSize: 44, marginBottom: 4},
  verifiedBadge: {
    position: 'absolute',
    top: 36,
    right: 36,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {color: '#FFF', fontSize: 10, fontWeight: '800'},
  kathavachakName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  kathavachakTitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  kathavachakFollowers: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  nextEventBox: {
    backgroundColor: Colors.saffronBg,
    borderRadius: BorderRadius.sm,
    padding: 6,
    marginTop: Spacing.sm,
    width: '100%',
  },
  nextEventLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nextEventText: {
    fontSize: 10,
    color: Colors.primaryDark,
    fontWeight: '600',
    lineHeight: 14,
  },
});

export default KathaScreen;
