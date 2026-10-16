import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  TouchableOpacity
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BorderRadius, Colors, Fonts, Shadow, Spacing, } from '../../theme/index';
import { IAstrologerProfile } from '../../types/IAstroProfile';
import { astrologerApi } from '../../service/apis/astroServices';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParamList } from '../../navigation/AppNavigator';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/useAuthore';
import { OmSymbol } from '../../components';

type AstrologerHomeProps = NativeStackScreenProps<RootParamList, 'AstroHome'>

/** Shape of the `stats` object returned by the dashboard API. */
export interface IAstrologerDashboardStats {
  totalConsultations: number;
  pendingConsultations: number;
  completedConsultations: number;
  averageRating: number;
  estimatedEarnings: number;
  availabilityStatus: IAstrologerProfile['availabilityStatus'];
  isVerified: boolean;
}
const demoStats: IAstrologerDashboardStats = {
  totalConsultations: 0,
  pendingConsultations: 0,
  completedConsultations: 0,
  averageRating: 5,
  estimatedEarnings: 0,
  availabilityStatus: "online",
  isVerified: false
}

const demoAstro: IAstrologerProfile = {
  _id: "",
  username: "",
  password: "",
  name: "",
  tagline: "",
  photo: "",
  photos: [],
  about: "",
  contact: {
    phone: "",
    email: "",
    whatsapp: ""
  },
  location: {
    address: "",
    city: "",
    state: ""
  },
  experience: 22,
  specialties: [
    "",
    "",
    "",
    ""
  ],
  languages: [
    "Hindi",
    "Sanskrit"
  ],
  qualifications: "",
  fee: 501,
  feePerMinute: 15,
  services: [
    {
      title: "",
      price: 0,
      duration: "",
      type: "Call",
      description: "",
      _id: ""
    }
  ],
  reviews: [
    {
      userName: "",
      rating: 5,
      comment: "",
      topic: "",
      _id: "",
      createdAt: ""
    }
  ],
  averageRating: 0,
  totalConsultations: 0,
  isVerified: true,
  isActive: true,
  availabilityStatus: 'offline',
  createdAt: "",
  updatedAt: "",
  __v: 0
}

/**
 * No consultation interface was shared, so this is an assumption –
 * rename / extend the fields to match your API.
 */
export type ConsultationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IConsultationRequest {
  _id: string;
  userName: string;
  topic: string;
  status: ConsultationStatus;
  scheduledAt: string;
  fee: number;
}

export interface IAstrologerSettingsPayload {
  tagline: string;
  fee: number;
  about: string;
}


type IconName = React.ComponentProps<typeof Ionicons>['name'];
type TabKey = 'requests' | 'settings';
type FilterKey = 'all' | ConsultationStatus;

interface StatCardData {
  key: string;
  label: string;
  value: string;
  caption: string;
  captionIcon?: IconName;
  labelColor: string;
  valueColor: string;
  captionColor: string;
}

const FILTERS: ReadonlyArray<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_CONFIG: Record<ConsultationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: Colors.goldDark, bg: Colors.saffronBg },
  confirmed: { label: 'Confirmed', color: Colors.tulsi, bg: '#E8F5E9' },
  completed: { label: 'Completed', color: Colors.info, bg: '#E3F2FD' },
  cancelled: { label: 'Cancelled', color: Colors.textMuted, bg: '#F5EFEA' },
};

const AVAILABILITY: ReadonlyArray<{
  key: IAstrologerProfile['availabilityStatus'];
  label: string;
  color: string;
}> = [
    { key: 'online', label: 'Online', color: Colors.success },
    { key: 'busy', label: 'Busy', color: Colors.warning },
    { key: 'offline', label: 'Offline', color: Colors.textMuted },
  ];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_TAGLINE = 80;
const MAX_BIO = 500;
const MAX_FEE = 100000;
const WIDE_LAYOUT_MIN_WIDTH = 720;

/*                                   Helpers                                  */
const formatINR = (amount: number): string => {
  const [int, dec] = amount.toFixed(2).split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
  return `₹${grouped}${dec === '00' ? '' : `.${dec}`}`;
};

const formatSchedule = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} · ${h12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
};

const getInitials = (name: string): string =>
  name?.replace(/^pt\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

const digitsOnly = (s: string, max: number): string => s.replace(/\D/g, '').slice(0, max);

/** API stats → the four dashboard cards. */
const buildStatCards = (s: IAstrologerDashboardStats): StatCardData[] => [
  {
    key: 'total',
    label: 'TOTAL CONSULTATIONS',
    value: String(s.totalConsultations),
    caption: 'All-time sessions',
    labelColor: Colors.textSecondary,
    valueColor: Colors.textPrimary,
    captionColor: Colors.textMuted,
  },
  {
    key: 'pending',
    label: 'PENDING REQUESTS',
    value: String(s.pendingConsultations),
    caption: 'Waiting for your response',
    labelColor: Colors.primary,
    valueColor: Colors.primary,
    captionColor: Colors.primaryDark,
  },
  {
    key: 'completed',
    label: 'COMPLETED CONSULTATIONS',
    value: String(s.completedConsultations),
    caption: 'Successfully completed',
    labelColor: Colors.tulsi,
    valueColor: Colors.tulsi,
    captionColor: Colors.tulsi,
  },
  {
    key: 'earnings',
    label: 'ESTIMATED EARNINGS',
    value: formatINR(s.estimatedEarnings),
    caption: `Rating: ${s.averageRating.toFixed(1)}`,
    captionIcon: 'star',
    labelColor: Colors.primaryDark,
    valueColor: Colors.primaryDark,
    captionColor: Colors.textSecondary,
  },
];

/** One-time fade + rise on mount, staggered by `index`. */
const Entrance = ({
  index,
  style,
  children,
}: {
  index: number;
  style?: object;
  children: React.ReactNode;
}) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay: 100 + index * 70,
      useNativeDriver: true,
    }).start();
  }, [v, index]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const StatCard = ({ data, wide, index }: { data: StatCardData; wide: boolean; index: number }) => (
  <Entrance index={index} style={[styles.statCardWrap, { flexBasis: wide ? '23%' : '47%' }]}>
    <View
      style={styles.statCard}
      accessible
      accessibilityLabel={`${data.label}: ${data.value}. ${data.caption}`}
    >
      <Text style={[styles.statLabel, { color: data.labelColor }]} numberOfLines={1}>
        {data.label}
      </Text>
      <Text
        style={[styles.statValue, { color: data.valueColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {data.value}
      </Text>
      <View style={styles.statCaptionRow}>
        {data.captionIcon ? <Ionicons name={data.captionIcon} size={13} color={Colors.gold} /> : null}
        <Text style={[styles.statCaption, { color: data.captionColor }]} numberOfLines={2}>
          {data.caption}
        </Text>
      </View>
    </View>
  </Entrance>
);

const Avatar = ({ photo, name }: { photo: string; name: string }) => {
  const [failed, setFailed] = useState(false);
  return photo && !failed ? (
    <Image source={{ uri: photo }} style={styles.avatar} onError={() => setFailed(true)} />
  ) : (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarInitials}>{getInitials(name) || '🙏'}</Text>
    </View>
  );
};

interface AvailabilityControlProps {
  value: IAstrologerProfile['availabilityStatus'];
  editable: boolean;
  onChange: (next: IAstrologerProfile['availabilityStatus']) => void;
}

const AvailabilityControl = ({ value, editable, onChange }: AvailabilityControlProps) => (
  <View>
    <Text style={styles.availLabel}>Your status</Text>
    <View style={styles.availTrack}>
      {AVAILABILITY.map(a => {
        const active = a.key === value;
        return (
          <Pressable
            key={a.key}
            disabled={!editable}
            onPress={() => onChange(a.key)}
            accessibilityRole="button"
            accessibilityLabel={`Set status to ${a.label}`}
            accessibilityState={{ selected: active, disabled: !editable }}
            style={({ pressed }) => [
              styles.availSeg,
              active && styles.availSegActive,
              pressed && !active && { opacity: 0.7 },
            ]}
          >
            <View style={[styles.availDot, { backgroundColor: a.color }]} />
            <Text style={[styles.availText, active && styles.availTextActive]}>{a.label}</Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

interface TabButtonProps {
  icon: IconName;
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabButton = ({ icon, label, active, onPress }: TabButtonProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{ selected: active }}
    style={({ pressed }) => [
      styles.tab,
      active && styles.tabActive,
      pressed && !active && { opacity: 0.8 },
    ]}
  >
    <Ionicons name={icon} size={18} color={active ? Colors.textLight : Colors.textSecondary} />
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </Pressable>
);

/* ----------------------------- Consultation list --------------------------- */

const ConsultationCard = ({
  item,
  onPress,
}: {
  item: IConsultationRequest;
  onPress?: (c: IConsultationRequest) => void;
}) => {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.topic} with ${item.userName}, ${cfg.label}`}
      style={({ pressed }) => [styles.cCard, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.cStrip, { backgroundColor: cfg.color }]} />
      <View style={styles.cAvatar}>
        <Text style={styles.cAvatarText}>{getInitials(item.userName) || '🙏'}</Text>
      </View>
      <View style={styles.cInfo}>
        <View style={styles.cTitleRow}>
          <Text style={styles.cName} numberOfLines={1}>
            {item.userName}
          </Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={styles.cTopic} numberOfLines={1}>
          {item.topic}
        </Text>
        <View style={styles.cMetaRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.cMeta}>{formatSchedule(item.scheduledAt)}</Text>
          <Text style={styles.cFee}>{formatINR(item.fee)}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const EmptyRequests = ({ filter }: { filter: FilterKey }) => (
  <View style={styles.emptyCard}>
    <Text style={styles.emptyEmoji}>🔮</Text>
    <Text style={styles.emptyTitle}>
      {filter === 'all'
        ? 'No consultation requests found'
        : `No ${STATUS_CONFIG[filter].label.toLowerCase()} requests`}
    </Text>
    <Text style={styles.emptySub}>New requests will appear here.</Text>
  </View>
);

/* ------------------------------ Settings form ------------------------------ */

interface SettingsFormProps {
  astrologer: IAstrologerProfile;
  // onSave: (payload: IAstrologerSettingsPayload) => Promise<void>;
}

interface SettingsValues {
  tagline: string;
  fee: string;
  about: string;
}

const toValues = (a: IAstrologerProfile): SettingsValues => ({
  tagline: a.tagline ?? '',
  fee: String(a.fee ?? ''),
  about: a.about ?? '',
});

const FieldLabel = ({ children }: { children: string }) => <Text style={styles.fieldLabel}>{children}</Text>;

const SettingsForm = ({ astrologer }: SettingsFormProps) => {
  const [baseline, setBaseline] = useState<SettingsValues>(() => toValues(astrologer));
  const [values, setValues] = useState<SettingsValues>(() => toValues(astrologer));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focus, setFocus] = useState<keyof SettingsValues | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync when fresh data arrives from the server.
  useEffect(() => {
    const next = toValues(astrologer);
    setBaseline(next);
    setValues(next);
  }, [astrologer]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const feeNumber = Number(values.fee);
  const feeError =
    values.fee === '' || Number.isNaN(feeNumber) || feeNumber < 1 || feeNumber > MAX_FEE
      ? `Enter a fee between ₹1 and ${formatINR(MAX_FEE)}`
      : null;
  const dirty =
    values.tagline !== baseline.tagline ||
    values.fee !== baseline.fee ||
    values.about !== baseline.about;
  const canSave = dirty && !feeError && !saving;

  const set = <K extends keyof SettingsValues>(key: K, v: SettingsValues[K]): void => {
    setSaved(false);
    setValues(prev => ({ ...prev, [key]: v }));
  };

  const onSave = async (data: any) => {
    const response = await astrologerApi.profileUpdate(data);
    if (response.success) {
      Alert.alert('Changes saved');
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!canSave) return;
    const payload: IAstrologerSettingsPayload = {
      tagline: values.tagline.trim(),
      fee: feeNumber,
      about: values.about.trim(),
    };
    setSaving(true);
    try {
      await onSave(payload);
      const next: SettingsValues = {
        tagline: payload.tagline,
        fee: String(payload.fee),
        about: payload.about,
      };
      setBaseline(next);
      setValues(next);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2800);
    } catch (err) {
      Alert.alert(
        "Couldn't save changes",
        err instanceof Error ? err.message : 'Please try again in a moment.',
      );
    } finally {
      setSaving(false);
    }
  };

  const boxStyle = (key: keyof SettingsValues, hasError?: boolean) => [
    styles.inputBox,
    focus === key && styles.inputBoxFocused,
    hasError && styles.inputBoxError,
  ];

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Profile & Consult Settings</Text>
      <Text style={styles.formSub}>Update your tagline, fee and introduction from here.</Text>

      <FieldLabel>Short Slogan (Tagline)</FieldLabel>
      <View style={boxStyle('tagline')}>
        <TextInput
          value={values.tagline}
          onChangeText={t => set('tagline', t)}
          onFocus={() => setFocus('tagline')}
          onBlur={() => setFocus(null)}
          placeholder="For example, accurate horoscope and marriage analysis for 15 years."
          placeholderTextColor={Colors.textMuted}
          maxLength={MAX_TAGLINE}
          accessibilityLabel="Short slogan"
          style={styles.input}
        />
      </View>
      <Text style={styles.counter}>
        {values.tagline.length}/{MAX_TAGLINE}
      </Text>

      <FieldLabel>Consultation Fee (₹ per 30 minute session)</FieldLabel>
      <View style={boxStyle('fee', Boolean(feeError))}>
        <Text style={styles.adornment}>₹</Text>
        <TextInput
          value={values.fee}
          onChangeText={t => set('fee', digitsOnly(t, 6))}
          onFocus={() => setFocus('fee')}
          onBlur={() => setFocus(null)}
          placeholder="e.g. 501"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          maxLength={6}
          accessibilityLabel="Consultation fee per 30 minute session in rupees"
          style={styles.input}
        />
      </View>
      {feeError ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle-outline" size={13} color={Colors.error} />
          <Text style={styles.errorText}>{feeError}</Text>
        </View>
      ) : null}

      <View style={{ height: Spacing.lg }} />
      <FieldLabel>Detailed introduction about yourself (Bio)</FieldLabel>
      <View style={[...boxStyle('about'), styles.inputBoxMultiline]}>
        <TextInput
          value={values.about}
          onChangeText={t => set('about', t)}
          onFocus={() => setFocus('about')}
          onBlur={() => setFocus(null)}
          placeholder="Tell devotees about your experience, knowledge and consulting style…"
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={MAX_BIO}
          textAlignVertical="top"
          accessibilityLabel="Bio"
          style={[styles.input, styles.inputMultiline]}
        />
      </View>
      <Text style={styles.counter}>
        {values.about.length}/{MAX_BIO}
      </Text>

      <View style={styles.saveRow}>
        <Pressable
          onPress={() => void handleSave()}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel={saving ? 'Saving' : 'Save changes'}
          accessibilityState={{ disabled: !canSave, busy: saving }}
          style={({ pressed }) => [
            styles.saveBtn,
            !canSave && !saving && styles.saveBtnDisabled,
            pressed && canSave && { transform: [{ scale: 0.97 }] },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.textLight} />
          ) : (
            <Ionicons name="save-outline" size={18} color={Colors.textLight} />
          )}
          <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>

        {dirty && !saving ? (
          <Pressable
            onPress={() => {
              setValues(baseline);
              setSaved(false);
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Discard changes"
          >
            <Text style={styles.resetText}>Discard</Text>
          </Pressable>
        ) : null}

        {saved ? (
          <View style={styles.savedRow} accessibilityLiveRegion="polite">
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.savedText}>Changes saved</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};


export default function AstrologerHomeScreen({ navigation, route }: AstrologerHomeProps) {
  const { id } = route.params;
  const [stats, setStats] = useState<IAstrologerDashboardStats>(demoStats);
  const [consultations, setConsultations] = useState([]);
  const [astrologer, setAstrologer] = useState<IAstrologerProfile>(demoAstro);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_LAYOUT_MIN_WIDTH;

  const [tab, setTab] = useState<TabKey>('requests');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [availability, setAvailability] = useState<IAstrologerProfile['availabilityStatus']>(
    stats?.availabilityStatus ?? 'offline',
  );
  const { t, isHindi, language, setLanguage } = useI18n();
  const { logOut } = useAuthStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await astrologerApi.stats();
      const res = await astrologerApi.astroConsultation();
      const astro = await astrologerApi.profile(id);
      setStats(response?.stats);
      setConsultations(res?.consultations);
      setAstrologer(astro?.astrologer);

    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const onRefresh = () => { }
  const onRetry = () => { }
  const onViewPublicProfile = (data: any) => { }

  const onChangeAvailability = (data: any) => { }
  const onPressConsultation = (data: any) => { }

  useEffect(() => {
    if (stats) setAvailability(stats.availabilityStatus);
  }, [stats]);

  const cards = useMemo(() => (stats ? buildStatCards(stats) : []), [stats]);

  const visibleConsultations = useMemo(
    () =>
      (filter === 'all' ? consultations : consultations.filter(c => c.status === filter)).slice(),
    [consultations, filter],
  );

  const handleAvailability = useCallback(
    async (next: IAstrologerProfile['availabilityStatus']) => {
      if (!onChangeAvailability || next === availability) return;
      const previous = availability;
      setAvailability(next);
      try {
        await onChangeAvailability(next);
      } catch (err) {
        setAvailability(previous);
        Alert.alert(
          "Couldn't update status",
          err instanceof Error ? err.message : 'Please try again in a moment.',
        );
      }
    },
    [availability, onChangeAvailability],
  );

  const handleLogout = () => {
    Alert.alert(
      isHindi ? 'लॉगआउट' : 'Sign Out',
      isHindi ? 'क्या आप लॉगआउट करना चाहते हैं?' : 'Are you sure you want to sign out?',
      [
        { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: isHindi ? 'हाँ' : 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logOut();
            // navigation.getParent<NativeStackNavigationProp<RootParamList>>().replace('login');
            navigation.replace('login');
          },
        },
      ],
    );
  };

  /* ---------------------------- loading / error ---------------------------- */
  // if (!astrologer || !stats) {
  //   return (
  //     <View style={[styles.root, styles.centerState]}>
  //       <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
  //       {isLoading ? (
  //         <>
  //           <ActivityIndicator size="large" color={Colors.primary} />
  //           <Text style={styles.stateSub}>Loading your dashboard…</Text>
  //         </>
  //       ) : (
  //         <>
  //           <Ionicons name="cloud-offline-outline" size={44} color={Colors.textMuted} />
  //           <Text style={styles.stateTitle}>Couldn't load your dashboard</Text>
  //           <Text style={styles.stateSub}>{errorMessage ?? 'Please check your connection.'}</Text>
  //           {onRetry ? (
  //             <Pressable
  //               onPress={onRetry}
  //               accessibilityRole="button"
  //               accessibilityLabel="Try again"
  //               style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.85 }]}
  //             >
  //               <Text style={styles.retryText}>Try again</Text>
  //             </Pressable>
  //           ) : null}
  //         </>
  //       )}
  //     </View>
  //   );
  // }

  const specialty = astrologer?.specialties[0];
  const extraSpecialties = astrologer?.specialties.length - 1;
  const locationLine = [
    [astrologer?.location.city, astrologer?.location.state].filter(Boolean).join(', '),
    specialty ? `${specialty}${extraSpecialties > 0 ? ` +${extraSpecialties}` : ''}` : '',
  ]
  //   .filter(Boolean)
  //   .join(' • ');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={Colors.gradientDark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      // style={[styles.header]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.navigate('main', { screen: 'Namlekhan', params: { deity: undefined } })}
            style={styles.iconBtn}
          >
            <Ionicons name="home-outline" size={24} color={Colors.goldDark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.goldDark} />
          </TouchableOpacity>
        </View>
        {/* ...rest of header children unchanged... */}
      </LinearGradient>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            ) : undefined
          }
        >
          {/* -------------------------------- Hero -------------------------------- */}
          <LinearGradient
            colors={Colors.gradientDark as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroGlow} />
            <Text style={styles.heroWatermark}>ॐ</Text>

            <View style={styles.heroTop}>
              <View style={styles.flex}>
                <Text style={styles.heroEyebrow}>Jai Shri Ram • Astrologer dashboard</Text>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  Welcome,
                  {astrologer?.name}
                </Text>
                {locationLine ? <Text style={styles.heroSub}>{locationLine}</Text> : null}
              </View>
              <Avatar photo={astrologer?.photo} name={astrologer?.name} />
            </View>

            <View style={styles.heroActions}>
              {/* <Pressable
                onPress={() => onViewPublicProfile(astrologer)}
                accessibilityRole="button"
                accessibilityLabel="View public profile"
                style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.ghostBtnText}>View public profile</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
              </Pressable> */}

              {stats.isVerified ? (
                <View style={styles.verifiedChip}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.goldLight} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.heroDivider} />
            <AvailabilityControl
              value={availability}
              editable={Boolean(onChangeAvailability)}
              onChange={next => void handleAvailability(next)}
            />
          </LinearGradient>

          {/* ---------------------------- Verification ---------------------------- */}
          {!stats.isVerified ? (
            <View style={styles.notice} accessibilityRole="alert">
              <Ionicons name="time-outline" size={20} color={Colors.goldDark} />
              <View style={styles.flex}>
                <Text style={styles.noticeTitle}>Verification pending</Text>
                <Text style={styles.noticeSub}>
                  Our team is reviewing your profile. You'll get a verified badge once it's approved.
                </Text>
              </View>
            </View>
          ) : null}

          {/* ------------------------------- Stats -------------------------------- */}
          <View style={styles.statsGrid}>
            {cards.map((c, i) => (
              <StatCard key={c.key} data={c} wide={wide} index={i} />
            ))}
          </View>

          {/* -------------------------------- Tabs -------------------------------- */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
            accessibilityRole="tablist"
          >
            <TabButton
              icon="clipboard-outline"
              label={`Consultation Requests (${stats.pendingConsultations})`}
              active={tab === 'requests'}
              onPress={() => setTab('requests')}
            />
            <TabButton
              icon="settings-outline"
              label="Profile & Fee Settings"
              active={tab === 'settings'}
              onPress={() => setTab('settings')}
            />
          </ScrollView>
          <View style={styles.tabRule} />

          {/* ------------------------------ Tab content --------------------------- */}
          {tab === 'requests' ? (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTERS.map(f => {
                  const active = filter === f.key;
                  return (
                    <Pressable
                      key={f.key}
                      onPress={() => setFilter(f.key)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.filterChip,
                        active && styles.filterChipActive,
                        pressed && !active && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={[styles.filterText, active && styles.filterTextActive]}>
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {visibleConsultations.length === 0 ? (
                <EmptyRequests filter={filter} />
              ) : (
                visibleConsultations.map(c => (
                  <ConsultationCard key={c._id} item={c} onPress={onPressConsultation} />
                ))
              )}
            </View>
          ) : (
            <SettingsForm astrologer={astrologer} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center', // ← was 'flex-start', caused vertical misalignment
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: 3
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // ← prevents icon from being squeezed by long mantra text
  },
  omCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    flexShrink: 0, // ← same, prevents squeezing
  },
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.section + Spacing.xxl,
  },

  /* loading / error */
  centerState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxxl, gap: Spacing.sm },
  stateTitle: { marginTop: Spacing.sm, fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
  stateSub: { fontSize: Fonts.sizes.md, color: Colors.textMuted, textAlign: 'center' },
  retryBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  retryText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textLight },

  /* hero */
  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.goldDark,
    ...Shadow.lg,
  },
  heroGlow: {
    position: 'absolute',
    right: -60,
    top: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.primaryDark,
    opacity: 0.4,
  },
  heroWatermark: {
    position: 'absolute',
    right: 16,
    bottom: -30,
    fontSize: 120,
    color: Colors.gold,
    opacity: 0.12,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg },
  heroEyebrow: {
    fontSize: Fonts.sizes.xs + 1,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.goldLight,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: Spacing.sm,
    fontSize: Fonts.sizes.xxxl,
    lineHeight: 34,
    fontWeight: '800',
    color: Colors.textLight,
  },
  heroSub: { marginTop: Spacing.xs + 2, fontSize: Fonts.sizes.md, color: Colors.goldLight, opacity: 0.85 },
  heroActions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.xl },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ghostBtnText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textLight },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.goldDark,
    backgroundColor: 'rgba(212,175,55,0.14)',
  },
  verifiedText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.goldLight },
  heroDivider: { height: 1, marginVertical: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.12)' },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.gold,
    backgroundColor: Colors.darkBg,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.goldLight },

  /* availability */
  availLabel: { marginBottom: Spacing.sm, fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.goldLight },
  availTrack: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  availSeg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 1,
    borderRadius: BorderRadius.full,
  },
  availSegActive: { backgroundColor: Colors.cardBg },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  availTextActive: { color: Colors.textPrimary, fontWeight: '800' },

  /* notice */
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.goldLight,
    backgroundColor: Colors.saffronBg,
  },
  noticeTitle: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textPrimary },
  noticeSub: { marginTop: 2, fontSize: Fonts.sizes.sm + 1, lineHeight: 18, color: Colors.textSecondary },

  /* stats */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.xl },
  statCardWrap: { flexGrow: 1 },
  statCard: {
    flex: 1,
    minHeight: 124,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
    ...Shadow.sm,
  },
  statLabel: { fontSize: Fonts.sizes.xs + 1, fontWeight: '800', letterSpacing: 0.6 },
  statValue: { marginTop: Spacing.sm, fontSize: 34, lineHeight: 40, fontWeight: '800' },
  statCaptionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing.sm },
  statCaption: { flexShrink: 1, fontSize: Fonts.sizes.sm, fontWeight: '600' },

  /* tabs */
  tabRow: { gap: Spacing.sm, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary, ...Shadow.sm, shadowColor: Colors.primary },
  tabText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textSecondary },
  tabTextActive: { color: Colors.textLight },
  tabRule: { height: 1, marginBottom: Spacing.lg, backgroundColor: Colors.border },

  /* filters */
  filterRow: { gap: Spacing.sm, paddingBottom: Spacing.lg },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  filterChipActive: { backgroundColor: Colors.darkBg, borderColor: Colors.darkBg },
  filterText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
  filterTextActive: { color: Colors.textLight, fontWeight: '800' },

  /* empty */
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { marginTop: Spacing.md, fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { marginTop: Spacing.xs + 2, fontSize: Fonts.sizes.md, color: Colors.textMuted, textAlign: 'center' },

  /* consultation card */
  cCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    paddingLeft: Spacing.lg + Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  cAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.saffronBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cAvatarText: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.primaryDark },
  cInfo: { flex: 1 },
  cTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cName: { flexShrink: 1, fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
  cTopic: { marginTop: 2, fontSize: Fonts.sizes.md, fontWeight: '600', color: Colors.textSecondary },
  cMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing.sm },
  cMeta: { flex: 1, fontSize: Fonts.sizes.sm + 1, color: Colors.textMuted },
  cFee: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.tulsi },
  badge: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, borderRadius: BorderRadius.full },
  badgeText: { fontSize: Fonts.sizes.xs + 1, fontWeight: '800' },

  /* settings form */
  formCard: {
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
    ...Shadow.sm,
  },
  formTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textPrimary },
  formSub: { marginTop: Spacing.xs + 2, marginBottom: Spacing.xl, fontSize: Fonts.sizes.md, color: Colors.textMuted },
  fieldLabel: { marginBottom: Spacing.sm - 1, fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textPrimary },
  inputBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FFFCF8',
  },
  inputBoxFocused: { borderColor: Colors.primary, backgroundColor: Colors.cardBg },
  inputBoxError: { borderColor: Colors.error, backgroundColor: '#FFF6F5' },
  inputBoxMultiline: { minHeight: 130, alignItems: 'flex-start' },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md + 2 : Spacing.sm,
    fontSize: Fonts.sizes.md + 1,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inputMultiline: { minHeight: 118, paddingTop: Spacing.md },
  adornment: { fontSize: Fonts.sizes.md + 1, fontWeight: '800', color: Colors.textSecondary },
  counter: { marginTop: Spacing.xs, alignSelf: 'flex-end', fontSize: Fonts.sizes.xs + 1, color: Colors.textMuted },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs + 1 },
  errorText: { flexShrink: 1, fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.error },

  saveRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.lg, marginTop: Spacing.xl },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    ...Shadow.md,
    shadowColor: Colors.primary,
  },
  saveBtnDisabled: { backgroundColor: Colors.borderDark, shadowOpacity: 0, elevation: 0, opacity: 0.6 },
  saveText: { fontSize: Fonts.sizes.md + 1, fontWeight: '800', color: Colors.textLight },
  resetText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  savedText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.success },
});