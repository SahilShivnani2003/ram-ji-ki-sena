import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import {useI18n} from '../i18n';
import {Colors, Fonts, Spacing, BorderRadius, Shadow} from '../theme';
import {GradientHeader, Badge, OmSymbol, PrimaryButton} from '../components';
import {PROFILE_USER, DOHAS, RAM_NAAM_LEADERBOARD} from '../data/staticData';

const ProfileScreen: React.FC = () => {
  const {t, isHindi, language, setLanguage} = useI18n();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const user = PROFILE_USER;

  const getLevel = (count: number) => {
    if (count >= 10000) return {label: t.ramBhakt, color: Colors.goldDark};
    if (count >= 5000) return {label: t.mahabhakt, color: Colors.primary};
    return {label: t.bhakt, color: Colors.tulsi};
  };
  const level = getLevel(user.ramNaamCount);

  const menuItems = [
    {icon: '📋', label: t.myBookings, onPress: () => Alert.alert('📋', 'My Bookings')},
    {icon: '💛', label: t.myDonations, onPress: () => Alert.alert('💛', 'My Donations')},
    {icon: '🛕', label: t.followedMandirs + ` (${user.followedMandirs})`, onPress: () => Alert.alert('🛕', 'Followed Mandirs')},
    {icon: '🔔', label: t.notifications, onPress: () => Alert.alert('🔔', 'Notifications')},
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Om */}
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{user.avatar}</Text>
          </View>
          <View style={styles.levelBadgeContainer}>
            <Badge label={isHindi ? user.levelHi : user.level} bgColor={level.color} />
          </View>
        </View>
        <Text style={styles.userName}>
          {isHindi ? user.nameHi : user.name}
        </Text>
        <Text style={styles.userCity}>
          📍 {isHindi ? user.cityHi : user.city}
        </Text>
        <Text style={styles.joinDate}>
          {t.joinedSince} {user.joinedYear}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <OmSymbol size={20} color={Colors.primary} />
          <Text style={styles.statNumber}>
            {user.ramNaamCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>{t.ramNaamCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statNumber}>
            {user.spiritualPoints.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>{t.spiritualPoints}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💛</Text>
          <Text style={styles.statNumber}>₹{user.donationsTotal.toLocaleString()}</Text>
          <Text style={styles.statLabel}>{t.myDonations}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            {t.level}: {isHindi ? user.levelHi : user.level}
          </Text>
          <Text style={styles.progressPercent}>
            {Math.min(100, Math.floor((user.ramNaamCount / 5000) * 100))}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {width: `${Math.min(100, Math.floor((user.ramNaamCount / 5000) * 100))}%`},
            ]}
          />
        </View>
        <Text style={styles.progressHint}>
          {isHindi
            ? `${(5000 - user.ramNaamCount).toLocaleString()} राम नाम और लिखें → महाभक्त बनें`
            : `Write ${(5000 - user.ramNaamCount).toLocaleString()} more Ram Naam → Become MahaBhakt`}
        </Text>
      </View>

      {/* Language Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.language}</Text>
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[
              styles.langBtn,
              language === 'hi' && styles.langBtnActive,
            ]}
            onPress={() => setLanguage('hi')}>
            <Text
              style={[
                styles.langBtnText,
                language === 'hi' && styles.langBtnTextActive,
              ]}>
              हिन्दी
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langBtn,
              language === 'en' && styles.langBtnActive,
            ]}
            onPress={() => setLanguage('en')}>
            <Text
              style={[
                styles.langBtnText,
                language === 'en' && styles.langBtnTextActive,
              ]}>
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Toggle */}
      <View style={styles.settingRow}>
        <Text style={styles.settingIcon}>🔔</Text>
        <Text style={styles.settingLabel}>{t.notifications}</Text>
        <Switch
          value={notificationsOn}
          onValueChange={setNotificationsOn}
          trackColor={{false: Colors.border, true: Colors.primary}}
          thumbColor={notificationsOn ? Colors.goldLight : '#FFF'}
        />
      </View>

      {/* Menu Items */}
      <View style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.menuItem,
              i < menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isHindi ? 'राम नाम लीडरबोर्ड' : 'Ram Naam Leaderboard'}
        </Text>
        <View style={styles.leaderCard}>
          {RAM_NAAM_LEADERBOARD.map(item => (
            <View
              key={item.rank}
              style={[
                styles.leaderRow,
                item.rank === 5 && styles.leaderRowHighlight,
              ]}>
              <Text
                style={[
                  styles.leaderRank,
                  item.rank <= 3 && styles.leaderRankTop,
                ]}>
                {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
              </Text>
              <Text style={styles.leaderName}>
                {isHindi ? item.nameHi : item.name}
              </Text>
              <Text style={styles.leaderCity}>
                {isHindi ? item.cityHi : item.city}
              </Text>
              <Text style={styles.leaderCount}>
                {item.count.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Donate Section */}
      <View style={styles.donateSection}>
        <OmSymbol size={28} color={Colors.goldLight} />
        <Text style={styles.donateTitle}>{t.donateTitle}</Text>
        <Text style={styles.donateDesc}>{t.donateDesc}</Text>
        <View style={styles.donateAmounts}>
          {[51, 101, 251, 501, 1001].map(amt => (
            <TouchableOpacity
              key={amt}
              style={styles.donateAmtBtn}
              onPress={() =>
                Alert.alert(
                  '🙏',
                  isHindi
                    ? `₹${amt} दान के लिए धन्यवाद!`
                    : `Thank you for ₹${amt} donation!`,
                )
              }>
              <Text style={styles.donateAmtText}>₹{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <PrimaryButton
        label={t.logout}
        onPress={() => Alert.alert('👋', isHindi ? 'जय श्री राम!' : 'Jai Shri Ram!')}
        outline
        style={styles.logoutBtn}
      />

      <View style={{height: 80}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},

  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  avatarContainer: {alignItems: 'center', marginBottom: Spacing.md},
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.goldLight,
    marginBottom: 8,
  },
  avatarEmoji: {fontSize: 48},
  levelBadgeContainer: {marginTop: -4},
  userName: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.xxl,
    fontWeight: '900',
  },
  userCity: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Fonts.sizes.sm,
    marginTop: 4,
  },
  joinDate: {
    color: Colors.goldLight,
    fontSize: Fonts.sizes.xs,
    marginTop: 2,
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {flex: 1, alignItems: 'center'},
  statIcon: {fontSize: 20, marginBottom: 4},
  statNumber: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '900',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  statDivider: {width: 1, backgroundColor: Colors.border},

  progressCard: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressPercent: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.saffronBg,
    borderRadius: 5,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  progressHint: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },

  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.saffronBg,
    borderRadius: BorderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  langBtnActive: {backgroundColor: Colors.primary},
  langBtnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  langBtnTextActive: {color: Colors.textLight},

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  settingIcon: {fontSize: 22, marginRight: Spacing.md},
  settingLabel: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  menuCard: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {fontSize: 22, marginRight: Spacing.md},
  menuLabel: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  menuArrow: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: '300',
  },

  leaderCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderRowHighlight: {backgroundColor: Colors.saffronBg},
  leaderRank: {
    width: 36,
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  leaderRankTop: {color: Colors.gold},
  leaderName: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  leaderCity: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginRight: Spacing.sm,
  },
  leaderCount: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '800',
    color: Colors.primary,
  },

  donateSection: {
    backgroundColor: Colors.darkBg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldDark,
    ...Shadow.md,
  },
  donateTitle: {
    color: Colors.goldLight,
    fontSize: Fonts.sizes.xl,
    fontWeight: '900',
    marginTop: Spacing.sm,
  },
  donateDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Fonts.sizes.sm,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  donateAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  donateAmtBtn: {
    backgroundColor: Colors.goldDark,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  donateAmtText: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.md,
    fontWeight: '800',
  },

  logoutBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
});

export default ProfileScreen;
