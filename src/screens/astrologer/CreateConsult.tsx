import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
      ActivityIndicator,
      Alert,
      Keyboard,
      KeyboardAvoidingView,
      LayoutChangeEvent,
      Modal,
      NativeSyntheticEvent,
      Platform,
      Pressable,
      ScrollView,
      StatusBar,
      StyleSheet,
      Text,
      TextInput,
      TextInputKeyPressEventData,
      useWindowDimensions,
      View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BorderRadius, Colors, Fonts, Shadow, Spacing, } from '../../theme/index';
import type { IAstrologer, IAstrologerService } from '../../types/IAstrologer';
import { astrologerApi } from '../../service/apis/astroServices';


export type ConsultationMode = 'phone' | 'whatsapp' | 'video';


export interface IConsultationRequestPayload {
      astrologer: string;
      serviceId?: string;
      name: string;
      phone: string;
      mode: ConsultationMode;
      topic: string;
      /** YYYY-MM-DD */
      date: string;
      /** e.g. "11:00 AM - 12:00 PM" */
      timeSlot: string;
      birthDetails: {
            /** YYYY-MM-DD, empty when not given */
            date: string;
            /** e.g. "6:30 AM", empty when not given */
            time: string;
            place: string;
      };
      description: string;
      fee: number;
}

interface ConsultationRequestModalProps {
      visible: boolean;
      astrologer: IAstrologer;
      /** Set when booking one of the astrologer's listed services. */
      service?: IAstrologerService;
      /** Pre-fill from the logged-in user. */
      defaultValues?: { name?: string; phone?: string };
      onClose: () => void;
      /** Reject with an Error to show its message to the user. */
      // onSubmit: (payload: IConsultationRequestPayload) => Promise<void>;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Period = 'AM' | 'PM';

interface FormState {
      name: string;
      phone: string;
      mode: ConsultationMode;
      topic: string;
      date: string;
      slot: number | null; // start hour (24h)
      dobD: string;
      dobM: string;
      dobY: string;
      tobH: string;
      tobM: string;
      tobPeriod: Period;
      place: string;
      description: string;
}

type ErrorKey = 'name' | 'phone' | 'date' | 'slot' | 'dob' | 'tob' | 'place';
type Errors = Partial<Record<ErrorKey, string>>;
type SectionKey = 'contact' | 'session' | 'birth';
type InputKey =
      | 'name'
      | 'phone'
      | 'dobD'
      | 'dobM'
      | 'dobY'
      | 'tobH'
      | 'tobM'
      | 'place'
      | 'description';

const MODES: ReadonlyArray<{ key: ConsultationMode; label: string; icon: IconName }> = [
      { key: 'phone', label: 'Phone Call', icon: 'call-outline' },
      { key: 'whatsapp', label: 'WhatsApp Call', icon: 'logo-whatsapp' },
      { key: 'video', label: 'Video Call', icon: 'videocam-outline' },
];

const TOPICS: ReadonlyArray<string> = [
      'General guidance',
      'Career & business',
      'Marriage & relationships',
      'Kundli / horoscope',
      'Health',
      'Finance & wealth',
      'Education',
      'Vastu',
      'Gemstone advice',
];

/** Topics where birth details are needed for a proper reading. */
const BIRTH_REQUIRED_TOPICS: ReadonlyArray<string> = [
      'Marriage & relationships',
      'Kundli / horoscope',
];

const SLOT_START_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;

const ERROR_ORDER: ReadonlyArray<ErrorKey> = ['name', 'phone', 'date', 'slot', 'dob', 'tob', 'place'];
const ERROR_SECTION: Record<ErrorKey, SectionKey> = {
      name: 'contact',
      phone: 'contact',
      date: 'session',
      slot: 'session',
      dob: 'birth',
      tob: 'birth',
      place: 'birth',
};
const ERROR_INPUT: Partial<Record<ErrorKey, InputKey>> = {
      name: 'name',
      phone: 'phone',
      dob: 'dobD',
      tob: 'tobH',
      place: 'place',
};

const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_HEAD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const PHONE_RE = /^[6-9]\d{9}$/;
const MAX_DESC = 400;
const MAX_DAYS_AHEAD = 60;
const TWO_COLUMN_MIN_WIDTH = 540;
const SHEET_MAX_WIDTH = 720;

/*                                   Helpers                                  */
const pad = (n: number): string => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number): string => `${y}-${pad(m + 1)}-${pad(d)}`;

const todayISO = (): string => {
      const n = new Date();
      return toISO(n.getFullYear(), n.getMonth(), n.getDate());
};

const addDaysISO = (days: number): string => {
      const n = new Date();
      n.setDate(n.getDate() + days);
      return toISO(n.getFullYear(), n.getMonth(), n.getDate());
};

const parseISO = (iso: string): { y: number; m: number; d: number } | null => {
      const p = iso.split('-').map(Number);
      if (p.length !== 3 || p.some(Number.isNaN)) return null;
      return { y: p[0], m: p[1] - 1, d: p[2] };
};

const formatDisplayDate = (iso: string): string => {
      const p = parseISO(iso);
      if (!p) return '';
      return `${WEEKDAYS_SHORT[new Date(p.y, p.m, p.d).getDay()]}, ${p.d} ${MONTHS_SHORT[p.m]} ${p.y}`;
};

const hourLabel = (h24: number): string => {
      const h = h24 % 12 === 0 ? 12 : h24 % 12;
      return `${h}:00 ${h24 >= 12 ? 'PM' : 'AM'}`;
};

const slotLabel = (startHour: number): string => `${hourLabel(startHour)} - ${hourLabel(startHour + 1)}`;

const isSlotPast = (dateISO: string, startHour: number): boolean =>
      dateISO === todayISO() && startHour <= new Date().getHours();

const hasSlotsLeft = (dateISO: string): boolean =>
      SLOT_START_HOURS.some(h => !isSlotPast(dateISO, h));

const formatINR = (amount: number): string => {
      const [int] = amount.toFixed(2).split('.');
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3);
      const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
      return `₹${grouped}`;
};

const digitsOnly = (s: string, max: number): string => s.replace(/\D/g, '').slice(0, max);

const buildMonthGrid = (year: number, month: number): Array<number | null> => {
      const first = new Date(year, month, 1).getDay();
      const days = new Date(year, month + 1, 0).getDate();
      const cells: Array<number | null> = [];
      for (let i = 0; i < first; i += 1) cells.push(null);
      for (let d = 1; d <= days; d += 1) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null);
      return cells;
};

const anyBirthDate = (f: FormState): boolean => f.dobD !== '' || f.dobM !== '' || f.dobY !== '';
const anyBirthTime = (f: FormState): boolean => f.tobH !== '' || f.tobM !== '';

const validateDob = (f: FormState): string | null => {
      if (!anyBirthDate(f)) return null;
      const d = Number(f.dobD);
      const m = Number(f.dobM);
      const y = Number(f.dobY);
      if (f.dobD === '' || f.dobM === '' || f.dobY.length !== 4) return 'Enter day, month and 4-digit year';
      const dt = new Date(y, m - 1, d);
      const valid = dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
      if (!valid || y < 1900) return 'Enter a valid date of birth';
      if (dt.getTime() > Date.now()) return 'Date of birth cannot be in the future';
      return null;
};

const validateTob = (f: FormState): string | null => {
      if (!anyBirthTime(f)) return null;
      const h = Number(f.tobH);
      const m = Number(f.tobM);
      if (f.tobH === '' || f.tobM === '' || h < 1 || h > 12 || m < 0 || m > 59) {
            return 'Enter a valid time, e.g. 6:30';
      }
      return null;
};

const validate = (f: FormState): Errors => {
      const e: Errors = {};
      const birthRequired = BIRTH_REQUIRED_TOPICS.includes(f.topic);

      if (f.name.trim().length < 3) e.name = 'Enter your full name';
      if (!PHONE_RE.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number';

      if (!f.date) e.date = 'Choose a date';
      else if (f.date < todayISO()) e.date = 'Date cannot be in the past';
      if (f.slot === null) e.slot = 'Choose a time slot';
      else if (isSlotPast(f.date, f.slot)) e.slot = 'That slot has passed – choose another';

      const dobError = validateDob(f);
      if (dobError) e.dob = dobError;
      else if (birthRequired && !anyBirthDate(f)) e.dob = 'Date of birth is needed for this topic';

      const tobError = validateTob(f);
      if (tobError) e.tob = tobError;

      if (birthRequired && f.place.trim().length < 2) e.place = 'Place of birth is needed for this topic';
      return e;
};

const makeInitial = (defaults?: { name?: string; phone?: string }): FormState => {
      let date = todayISO();
      if (!hasSlotsLeft(date)) date = addDaysISO(1);
      return {
            name: defaults?.name ?? '',
            phone: digitsOnly(defaults?.phone ?? '', 10),
            mode: 'phone',
            topic: TOPICS[0],
            date,
            slot: null,
            dobD: '',
            dobM: '',
            dobY: '',
            tobH: '',
            tobM: '',
            tobPeriod: 'AM',
            place: '',
            description: '',
      };
};

/*                               Small components                             */
const Field = ({
      label,
      required,
      error,
      half,
      children,
}: {
      label: string;
      required?: boolean;
      error?: string;
      half?: boolean;
      children: React.ReactNode;
}) => (
      <View style={[styles.field, half && styles.half]}>
            <Text style={styles.label}>
                  {label}
                  {required ? <Text style={{ color: Colors.error }}> *</Text> : null}
            </Text>
            {children}
            {error ? (
                  <View style={styles.errorRow} accessibilityLiveRegion="polite">
                        <Ionicons name="alert-circle-outline" size={13} color={Colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                  </View>
            ) : null}
      </View>
);

interface TextFieldProps {
      value: string;
      onChangeText: (t: string) => void;
      placeholder: string;
      accessibilityLabel: string;
      hasError?: boolean;
      multiline?: boolean;
      maxLength?: number;
      keyboardType?: 'default' | 'number-pad' | 'phone-pad';
      autoCapitalize?: 'none' | 'words' | 'sentences';
      returnKeyType?: 'next' | 'done';
      onSubmitEditing?: () => void;
      inputRef?: (r: TextInput | null) => void;
      prefix?: string;
}

const TextField = ({
      value,
      onChangeText,
      placeholder,
      accessibilityLabel,
      hasError,
      multiline,
      maxLength,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      returnKeyType = 'next',
      onSubmitEditing,
      inputRef,
      prefix,
}: TextFieldProps) => {
      const [focused, setFocused] = useState(false);
      return (
            <View
                  style={[
                        styles.inputBox,
                        multiline && styles.inputBoxMultiline,
                        focused && styles.inputBoxFocused,
                        hasError && styles.inputBoxError,
                  ]}
            >
                  {prefix ? <Text style={styles.adornment}>{prefix}</Text> : null}
                  <TextInput
                        ref={inputRef}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.textMuted}
                        accessibilityLabel={accessibilityLabel}
                        multiline={multiline}
                        maxLength={maxLength}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        autoCorrect={false}
                        returnKeyType={multiline ? 'default' : returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                        blurOnSubmit={!onSubmitEditing}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        textAlignVertical={multiline ? 'top' : 'center'}
                        style={[styles.input, multiline && styles.inputMultiline]}
                  />
            </View>
      );
};

interface SegInputProps {
      value: string;
      placeholder: string;
      maxLength: number;
      accessibilityLabel: string;
      hasError?: boolean;
      wide?: boolean;
      inputRef: (r: TextInput | null) => void;
      onChangeText: (t: string) => void;
      onBackspaceEmpty?: () => void;
}

const SegInput = ({
      value,
      placeholder,
      maxLength,
      accessibilityLabel,
      hasError,
      wide,
      inputRef,
      onChangeText,
      onBackspaceEmpty,
}: SegInputProps) => {
      const [focused, setFocused] = useState(false);
      const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>): void => {
            if (e.nativeEvent.key === 'Backspace' && value === '') onBackspaceEmpty?.();
      };
      return (
            <TextInput
                  ref={inputRef}
                  value={value}
                  onChangeText={onChangeText}
                  onKeyPress={onKeyPress}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.textMuted}
                  accessibilityLabel={accessibilityLabel}
                  keyboardType="number-pad"
                  maxLength={maxLength}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={[
                        styles.seg,
                        wide && styles.segWide,
                        focused && styles.inputBoxFocused,
                        hasError && styles.inputBoxError,
                  ]}
            />
      );
};

const Chip = memo(
      ({
            label,
            icon,
            active,
            disabled,
            onPress,
      }: {
            label: string;
            icon?: IconName;
            active: boolean;
            disabled?: boolean;
            onPress: () => void;
      }) => (
            <Pressable
                  onPress={onPress}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active, disabled }}
                  style={({ pressed }) => [
                        styles.chip,
                        active && styles.chipActive,
                        disabled && styles.chipDisabled,
                        pressed && !active && !disabled && { opacity: 0.75 },
                  ]}
            >
                  {icon ? (
                        <Ionicons
                              name={icon}
                              size={16}
                              color={active ? Colors.textLight : disabled ? Colors.border : Colors.textSecondary}
                        />
                  ) : null}
                  <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>
                        {label}
                  </Text>
            </Pressable>
      ),
);

/* ------------------------------- Date picker ------------------------------- */

const DatePicker = ({
      selected,
      onSelect,
      onClose,
}: {
      selected: string;
      onSelect: (iso: string) => void;
      onClose: () => void;
}) => {
      const today = todayISO();
      const max = addDaysISO(MAX_DAYS_AHEAD);
      const base = parseISO(selected) ?? parseISO(today);
      const [view, setView] = useState<{ y: number; m: number }>({
            y: base ? base.y : new Date().getFullYear(),
            m: base ? base.m : new Date().getMonth(),
      });

      const now = new Date();
      const isCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();
      const maxP = parseISO(max);
      const isLastMonth = maxP ? view.y === maxP.y && view.m === maxP.m : false;
      const cells = useMemo(() => buildMonthGrid(view.y, view.m), [view]);

      const shift = (delta: number): void => {
            const d = new Date(view.y, view.m + delta, 1);
            setView({ y: d.getFullYear(), m: d.getMonth() });
      };

      return (
            <View style={styles.overlay}>
                  <Pressable style={styles.overlayBackdrop} onPress={onClose} accessibilityLabel="Dismiss date picker" />
                  <View style={styles.pickerPanel}>
                        <View style={styles.grabber} />
                        <View style={styles.pickerHead}>
                              <Text style={styles.pickerTitle}>Select date</Text>
                              <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
                                    <Ionicons name="close" size={22} color={Colors.textMuted} />
                              </Pressable>
                        </View>

                        <View style={styles.calHead}>
                              <Pressable
                                    onPress={() => shift(-1)}
                                    disabled={isCurrentMonth}
                                    accessibilityRole="button"
                                    accessibilityLabel="Previous month"
                                    style={[styles.calNav, isCurrentMonth && { opacity: 0.3 }]}
                              >
                                    <Ionicons name="chevron-back" size={20} color={Colors.primaryDark} />
                              </Pressable>
                              <Text style={styles.calMonth}>
                                    {MONTHS[view.m]} {view.y}
                              </Text>
                              <Pressable
                                    onPress={() => shift(1)}
                                    disabled={isLastMonth}
                                    accessibilityRole="button"
                                    accessibilityLabel="Next month"
                                    style={[styles.calNav, isLastMonth && { opacity: 0.3 }]}
                              >
                                    <Ionicons name="chevron-forward" size={20} color={Colors.primaryDark} />
                              </Pressable>
                        </View>

                        <View style={styles.calRow}>
                              {WEEKDAY_HEAD.map((w, i) => (
                                    <Text key={`${w}${i}`} style={styles.calWeekday}>
                                          {w}
                                    </Text>
                              ))}
                        </View>

                        <View style={styles.calGrid}>
                              {cells.map((d, i) => {
                                    if (d === null) return <View key={`e${i}`} style={styles.calCell} />;
                                    const iso = toISO(view.y, view.m, d);
                                    const disabled = iso < today || iso > max;
                                    const isSel = iso === selected;
                                    return (
                                          <View key={iso} style={styles.calCell}>
                                                <Pressable
                                                      disabled={disabled}
                                                      onPress={() => {
                                                            onSelect(iso);
                                                            onClose();
                                                      }}
                                                      accessibilityRole="button"
                                                      accessibilityLabel={formatDisplayDate(iso)}
                                                      accessibilityState={{ selected: isSel, disabled }}
                                                      style={({ pressed }) => [
                                                            styles.calDay,
                                                            iso === today && styles.calDayToday,
                                                            isSel && styles.calDaySelected,
                                                            pressed && !isSel && { backgroundColor: Colors.saffronBg },
                                                      ]}
                                                >
                                                      <Text
                                                            style={[
                                                                  styles.calDayText,
                                                                  disabled && { color: Colors.border },
                                                                  isSel && { color: Colors.textLight, fontWeight: '800' },
                                                            ]}
                                                      >
                                                            {d}
                                                      </Text>
                                                </Pressable>
                                          </View>
                                    );
                              })}
                        </View>
                  </View>
            </View>
      );
};

/* ------------------------------ Success panel ------------------------------ */

const SuccessPanel = ({
      astrologer,
      payload,
      onDone,
}: {
      astrologer: IAstrologer;
      payload: IConsultationRequestPayload;
      onDone: () => void;
}) => {
      const modeLabel = MODES.find(m => m.key === payload.mode)?.label ?? payload.mode;
      return (
            <View style={styles.successWrap}>
                  <View style={styles.successOrb}>
                        <Text style={styles.successEmoji}>🙏</Text>
                  </View>
                  <Text style={styles.successTitle}>Request sent</Text>
                  <Text style={styles.successSub}>
                        {astrologer.name} will review your request. You'll be notified once it's confirmed.
                  </Text>

                  <View style={styles.summaryCard}>
                        {(
                              [
                                    ['Topic', payload.topic],
                                    ['Mode', modeLabel],
                                    ['Date', formatDisplayDate(payload.date)],
                                    ['Time slot', payload.timeSlot],
                              ] as const
                        ).map(([k, v]) => (
                              <View key={k} style={styles.sumRow}>
                                    <Text style={styles.sumLabel}>{k}</Text>
                                    <Text style={styles.sumValue}>{v}</Text>
                              </View>
                        ))}
                        <View style={styles.sumDivider} />
                        <View style={styles.sumRow}>
                              <Text style={[styles.sumLabel, { fontWeight: '800', color: Colors.textLight }]}>Fee</Text>
                              <Text style={styles.sumTotal}>{formatINR(payload.fee)}</Text>
                        </View>
                  </View>

                  <Pressable
                        onPress={onDone}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.9 }]}
                  >
                        <Text style={styles.doneText}>Done</Text>
                  </Pressable>
            </View>
      );
};

export default function ConsultationRequestModal({
      visible,
      astrologer,
      service,
      defaultValues,
      onClose,
}: ConsultationRequestModalProps) {
      const { width } = useWindowDimensions();
      const twoCol = width >= TWO_COLUMN_MIN_WIDTH;

      const [form, setForm] = useState<FormState>(() => makeInitial(defaultValues));
      const [initial, setInitial] = useState<FormState>(() => makeInitial(defaultValues));
      const [errors, setErrors] = useState<Errors>({});
      const [submitted, setSubmitted] = useState(false);
      const [submitting, setSubmitting] = useState(false);
      const [created, setCreated] = useState<IConsultationRequestPayload | null>(null);
      const [datePickerOpen, setDatePickerOpen] = useState(false);

      const scrollRef = useRef<ScrollView>(null);
      const sectionY = useRef<Record<SectionKey, number>>({ contact: 0, session: 0, birth: 0 });
      const inputs = useRef<Record<InputKey, TextInput | null>>({
            name: null,
            phone: null,
            dobD: null,
            dobM: null,
            dobY: null,
            tobH: null,
            tobM: null,
            place: null,
            description: null,
      });

      const fee = service?.price ?? astrologer.fee;
      const sessionTitle = service?.title ?? 'Personal Astrology Session';
      const birthRequired = BIRTH_REQUIRED_TOPICS.includes(form.topic);

      // fresh form every time the modal opens
      useEffect(() => {
            if (visible) {
                  const fresh = makeInitial(defaultValues);
                  setForm(fresh);
                  setInitial(fresh);
                  setErrors({});
                  setSubmitted(false);
                  setSubmitting(false);
                  setCreated(null);
                  setDatePickerOpen(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [visible]);

      // keep errors in sync once the user has tried to submit
      useEffect(() => {
            if (submitted) setErrors(validate(form));
      }, [form, submitted]);

      const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

      const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
            setForm(prev => ({ ...prev, [key]: value }));
      }, []);

      const setRef = (key: InputKey) => (r: TextInput | null) => {
            inputs.current[key] = r;
      };
      const focus = (key: InputKey) => () => inputs.current[key]?.focus();

      const onSectionLayout = (key: SectionKey) => (e: LayoutChangeEvent) => {
            sectionY.current[key] = e.nativeEvent.layout.y;
      };

      const requestClose = useCallback(() => {
            if (submitting) return;
            if (created || !dirty) {
                  onClose();
                  return;
            }
            Alert.alert('Discard this request?', 'The details you entered will be lost.', [
                  { text: 'Keep editing', style: 'cancel' },
                  { text: 'Discard', style: 'destructive', onPress: onClose },
            ]);
      }, [submitting, created, dirty, onClose]);

      const handleDateChange = useCallback((iso: string) => {
            setForm(prev => ({
                  ...prev,
                  date: iso,
                  // drop the chosen slot if it doesn't exist on the new date
                  slot: prev.slot !== null && isSlotPast(iso, prev.slot) ? null : prev.slot,
            }));
      }, []);

      const onSubmit = async (data: any) => {
            try {
                  const response = await astrologerApi.createConsultation(data);
                  if (response.success) {
                        Alert.alert('Consultation created!');
                  }
            } catch (error: any) {
                  Alert.alert(error?.response?.data?.message || 'Something went wrong');
            }
      }

      const handleSubmit = useCallback(async () => {
            if (submitting) return;
            Keyboard.dismiss();
            setSubmitted(true);

            const found = validate(form);
            setErrors(found);

            const first = ERROR_ORDER.find(k => found[k]);
            if (first) {
                  scrollRef.current?.scrollTo({
                        y: Math.max(0, sectionY.current[ERROR_SECTION[first]] - Spacing.md),
                        animated: true,
                  });
                  const target = ERROR_INPUT[first];
                  if (target) setTimeout(() => inputs.current[target]?.focus(), 350);
                  return;
            }
            if (form.slot === null) return; // narrowed – validate() already guarantees this

            const hasDob = anyBirthDate(form);
            const hasTob = anyBirthTime(form);
            const payload: IConsultationRequestPayload = {
                  astrologer: astrologer._id,
                  serviceId: service?._id,
                  name: form.name.trim(),
                  phone: form.phone,
                  mode: form.mode,
                  topic: form.topic,
                  date: form.date,
                  timeSlot: slotLabel(form.slot),
                  birthDetails: {
                        date: hasDob ? `${form.dobY}-${pad(Number(form.dobM))}-${pad(Number(form.dobD))}` : '',
                        time: hasTob ? `${Number(form.tobH)}:${pad(Number(form.tobM))} ${form.tobPeriod}` : '',
                        place: form.place.trim(),
                  },
                  description: form.description.trim(),
                  fee,
            };

            setSubmitting(true);
            try {
                  await onSubmit(payload);
                  setCreated(payload);
            } catch (err) {
                  Alert.alert(
                        "Couldn't send request",
                        err instanceof Error ? err.message : 'Please try again in a moment.',
                  );
            } finally {
                  setSubmitting(false);
            }
      }, [form, astrologer._id, service?._id, fee, onSubmit, submitting]);

      const rowStyle = twoCol ? styles.row : undefined;
      const slotsAvailable = form.date ? hasSlotsLeft(form.date) : true;

      return (
            <Modal
                  visible={visible}
                  animationType="slide"
                  transparent
                  onRequestClose={requestClose}
                  statusBarTranslucent
            >
                  <View style={styles.backdrop}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} accessibilityLabel="Close form" />

                        <KeyboardAvoidingView
                              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                              style={styles.kav}
                        >
                              <View style={styles.sheet}>
                                    {/* ------------------------------ Header ------------------------------ */}
                                    <LinearGradient
                                          colors={[Colors.primaryDark, Colors.secondary] as string[]}
                                          start={{ x: 0, y: 0 }}
                                          end={{ x: 1, y: 1 }}
                                          style={styles.header}
                                    >
                                          <Text style={styles.headerWatermark}>ॐ</Text>
                                          <View style={styles.flex}>
                                                <Text style={styles.headerEyebrow}>Consultation request form</Text>
                                                <Text style={styles.headerTitle} numberOfLines={2}>
                                                      Consultation with {astrologer.name}
                                                </Text>
                                                <Text style={styles.headerSub} numberOfLines={1}>
                                                      {sessionTitle} • {formatINR(fee)}
                                                </Text>
                                          </View>
                                          <Pressable
                                                onPress={requestClose}
                                                accessibilityRole="button"
                                                accessibilityLabel="Close"
                                                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                                          >
                                                <Ionicons name="close" size={22} color={Colors.textLight} />
                                          </Pressable>
                                    </LinearGradient>

                                    {created ? (
                                          <SuccessPanel astrologer={astrologer} payload={created} onDone={onClose} />
                                    ) : (
                                          <>
                                                <ScrollView
                                                      ref={scrollRef}
                                                      keyboardShouldPersistTaps="handled"
                                                      showsVerticalScrollIndicator={false}
                                                      contentContainerStyle={styles.content}
                                                >
                                                      {/* ----------------------------- Contact ----------------------------- */}
                                                      <View onLayout={onSectionLayout('contact')} style={rowStyle}>
                                                            <Field label="Your Full Name" required error={errors.name} half={twoCol}>
                                                                  <TextField
                                                                        inputRef={setRef('name')}
                                                                        value={form.name}
                                                                        onChangeText={t => update('name', t)}
                                                                        placeholder="Ex. Rahul Sharma"
                                                                        accessibilityLabel="Your full name"
                                                                        hasError={Boolean(errors.name)}
                                                                        autoCapitalize="words"
                                                                        onSubmitEditing={focus('phone')}
                                                                  />
                                                            </Field>
                                                            <Field label="Mobile Number (WhatsApp)" required error={errors.phone} half={twoCol}>
                                                                  <TextField
                                                                        inputRef={setRef('phone')}
                                                                        value={form.phone}
                                                                        onChangeText={t => update('phone', digitsOnly(t, 10))}
                                                                        placeholder="10 digit mobile number"
                                                                        accessibilityLabel="Mobile number"
                                                                        hasError={Boolean(errors.phone)}
                                                                        keyboardType="phone-pad"
                                                                        maxLength={10}
                                                                        prefix="+91"
                                                                        returnKeyType="done"
                                                                  />
                                                            </Field>
                                                      </View>

                                                      {/* ----------------------------- Session ----------------------------- */}
                                                      <View onLayout={onSectionLayout('session')}>
                                                            <Field label="Mode of consultation">
                                                                  <View style={styles.chipWrap}>
                                                                        {MODES.map(m => (
                                                                              <Chip
                                                                                    key={m.key}
                                                                                    label={m.label}
                                                                                    icon={m.icon}
                                                                                    active={form.mode === m.key}
                                                                                    onPress={() => update('mode', m.key)}
                                                                              />
                                                                        ))}
                                                                  </View>
                                                            </Field>

                                                            <Field label="Topic of consultation">
                                                                  <View style={styles.chipWrap}>
                                                                        {TOPICS.map(t => (
                                                                              <Chip
                                                                                    key={t}
                                                                                    label={t}
                                                                                    active={form.topic === t}
                                                                                    onPress={() => update('topic', t)}
                                                                              />
                                                                        ))}
                                                                  </View>
                                                            </Field>

                                                            <Field label="Date" required error={errors.date}>
                                                                  <Pressable
                                                                        onPress={() => {
                                                                              Keyboard.dismiss();
                                                                              setDatePickerOpen(true);
                                                                        }}
                                                                        accessibilityRole="button"
                                                                        accessibilityLabel="Pick consultation date"
                                                                        style={({ pressed }) => [
                                                                              styles.inputBox,
                                                                              errors.date ? styles.inputBoxError : null,
                                                                              pressed && { opacity: 0.85 },
                                                                        ]}
                                                                  >
                                                                        <Ionicons name="calendar-outline" size={19} color={Colors.primaryDark} />
                                                                        <Text style={styles.pickerText}>
                                                                              {form.date ? formatDisplayDate(form.date) : 'Select date'}
                                                                        </Text>
                                                                        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
                                                                  </Pressable>
                                                            </Field>

                                                            <Field label="Time Slot" required error={errors.slot}>
                                                                  {slotsAvailable ? (
                                                                        <View style={styles.chipWrap}>
                                                                              {SLOT_START_HOURS.map(h => (
                                                                                    <Chip
                                                                                          key={h}
                                                                                          label={slotLabel(h)}
                                                                                          icon="time-outline"
                                                                                          active={form.slot === h}
                                                                                          disabled={isSlotPast(form.date, h)}
                                                                                          onPress={() => update('slot', h)}
                                                                                    />
                                                                              ))}
                                                                        </View>
                                                                  ) : (
                                                                        <View style={styles.noSlots}>
                                                                              <Ionicons name="moon-outline" size={18} color={Colors.goldDark} />
                                                                              <Text style={styles.noSlotsText}>
                                                                                    No slots left today. Please choose another date.
                                                                              </Text>
                                                                        </View>
                                                                  )}
                                                            </Field>
                                                      </View>

                                                      {/* ---------------------------- Birth details ------------------------ */}
                                                      <View onLayout={onSectionLayout('birth')} style={styles.birthBox}>
                                                            <View style={styles.birthHead}>
                                                                  <Text style={styles.birthTitle}>
                                                                        📜 Birth Details{' '}
                                                                        <Text style={styles.birthTitleNote}>(required for Kundali analysis)</Text>
                                                                  </Text>
                                                                  {birthRequired ? (
                                                                        <View style={styles.neededPill}>
                                                                              <Text style={styles.neededText}>Needed for this topic</Text>
                                                                        </View>
                                                                  ) : null}
                                                            </View>

                                                            <View style={rowStyle}>
                                                                  <Field label="Date of Birth (DOB)" required={birthRequired} error={errors.dob} half={twoCol}>
                                                                        <View style={styles.segRow}>
                                                                              <SegInput
                                                                                    inputRef={setRef('dobD')}
                                                                                    value={form.dobD}
                                                                                    placeholder="DD"
                                                                                    maxLength={2}
                                                                                    accessibilityLabel="Birth day"
                                                                                    hasError={Boolean(errors.dob)}
                                                                                    onChangeText={t => {
                                                                                          const v = digitsOnly(t, 2);
                                                                                          update('dobD', v);
                                                                                          if (v.length === 2) inputs.current.dobM?.focus();
                                                                                    }}
                                                                              />
                                                                              <SegInput
                                                                                    inputRef={setRef('dobM')}
                                                                                    value={form.dobM}
                                                                                    placeholder="MM"
                                                                                    maxLength={2}
                                                                                    accessibilityLabel="Birth month"
                                                                                    hasError={Boolean(errors.dob)}
                                                                                    onChangeText={t => {
                                                                                          const v = digitsOnly(t, 2);
                                                                                          update('dobM', v);
                                                                                          if (v.length === 2) inputs.current.dobY?.focus();
                                                                                    }}
                                                                                    onBackspaceEmpty={() => inputs.current.dobD?.focus()}
                                                                              />
                                                                              <SegInput
                                                                                    inputRef={setRef('dobY')}
                                                                                    value={form.dobY}
                                                                                    placeholder="YYYY"
                                                                                    maxLength={4}
                                                                                    wide
                                                                                    accessibilityLabel="Birth year"
                                                                                    hasError={Boolean(errors.dob)}
                                                                                    onChangeText={t => update('dobY', digitsOnly(t, 4))}
                                                                                    onBackspaceEmpty={() => inputs.current.dobM?.focus()}
                                                                              />
                                                                        </View>
                                                                  </Field>

                                                                  <Field label="Time of Birth (TOB)" error={errors.tob} half={twoCol}>
                                                                        <View style={styles.segRow}>
                                                                              <SegInput
                                                                                    inputRef={setRef('tobH')}
                                                                                    value={form.tobH}
                                                                                    placeholder="HH"
                                                                                    maxLength={2}
                                                                                    accessibilityLabel="Birth hour"
                                                                                    hasError={Boolean(errors.tob)}
                                                                                    onChangeText={t => {
                                                                                          const v = digitsOnly(t, 2);
                                                                                          update('tobH', v);
                                                                                          if (v.length === 2) inputs.current.tobM?.focus();
                                                                                    }}
                                                                              />
                                                                              <SegInput
                                                                                    inputRef={setRef('tobM')}
                                                                                    value={form.tobM}
                                                                                    placeholder="MM"
                                                                                    maxLength={2}
                                                                                    accessibilityLabel="Birth minute"
                                                                                    hasError={Boolean(errors.tob)}
                                                                                    onChangeText={t => update('tobM', digitsOnly(t, 2))}
                                                                                    onBackspaceEmpty={() => inputs.current.tobH?.focus()}
                                                                              />
                                                                              <View style={styles.periodRow}>
                                                                                    {(['AM', 'PM'] as const).map(p => (
                                                                                          <Pressable
                                                                                                key={p}
                                                                                                onPress={() => update('tobPeriod', p)}
                                                                                                accessibilityRole="button"
                                                                                                accessibilityState={{ selected: form.tobPeriod === p }}
                                                                                                accessibilityLabel={p}
                                                                                                style={[styles.periodBtn, form.tobPeriod === p && styles.periodBtnActive]}
                                                                                          >
                                                                                                <Text
                                                                                                      style={[
                                                                                                            styles.periodText,
                                                                                                            form.tobPeriod === p && { color: Colors.textLight },
                                                                                                      ]}
                                                                                                >
                                                                                                      {p}
                                                                                                </Text>
                                                                                          </Pressable>
                                                                                    ))}
                                                                              </View>
                                                                        </View>
                                                                  </Field>
                                                            </View>

                                                            <Field label="Place of Birth (City)" required={birthRequired} error={errors.place}>
                                                                  <TextField
                                                                        inputRef={setRef('place')}
                                                                        value={form.place}
                                                                        onChangeText={t => update('place', t)}
                                                                        placeholder="For example, Bhopal, M.P."
                                                                        accessibilityLabel="Place of birth"
                                                                        hasError={Boolean(errors.place)}
                                                                        autoCapitalize="words"
                                                                        onSubmitEditing={focus('description')}
                                                                  />
                                                            </Field>
                                                      </View>

                                                      {/* ---------------------------- Description -------------------------- */}
                                                      <Field label="A brief description of your problem or question">
                                                            <TextField
                                                                  inputRef={setRef('description')}
                                                                  value={form.description}
                                                                  onChangeText={t => update('description', t)}
                                                                  placeholder="What do you want to ask? Like: when will I get a job, delay in marriage, business growth etc…"
                                                                  accessibilityLabel="Description of your question"
                                                                  multiline
                                                                  maxLength={MAX_DESC}
                                                            />
                                                            <Text style={styles.counter}>
                                                                  {form.description.length}/{MAX_DESC}
                                                            </Text>
                                                      </Field>
                                                </ScrollView>

                                                {/* ---------------------------- Sticky footer --------------------------- */}
                                                <View style={styles.footer}>
                                                      <View>
                                                            <Text style={styles.feeLabel}>Fee Amount</Text>
                                                            <Text style={styles.feeValue}>{formatINR(fee)}</Text>
                                                      </View>
                                                      <Pressable
                                                            onPress={() => void handleSubmit()}
                                                            disabled={submitting}
                                                            accessibilityRole="button"
                                                            accessibilityLabel={`Submit request, fee ${formatINR(fee)}`}
                                                            accessibilityState={{ disabled: submitting, busy: submitting }}
                                                            style={({ pressed }) => [
                                                                  styles.submitWrap,
                                                                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
                                                                  submitting && { opacity: 0.8 },
                                                            ]}
                                                      >
                                                            <LinearGradient
                                                                  colors={[Colors.goldLight, Colors.gold, Colors.goldDark] as string[]}
                                                                  start={{ x: 0, y: 0 }}
                                                                  end={{ x: 1, y: 1 }}
                                                                  style={styles.submit}
                                                            >
                                                                  {submitting ? (
                                                                        <ActivityIndicator color={Colors.textPrimary} />
                                                                  ) : (
                                                                        <Text style={styles.submitText}>Submit Request 🙏</Text>
                                                                  )}
                                                            </LinearGradient>
                                                      </Pressable>
                                                </View>

                                                {datePickerOpen ? (
                                                      <DatePicker
                                                            selected={form.date}
                                                            onSelect={handleDateChange}
                                                            onClose={() => setDatePickerOpen(false)}
                                                      />
                                                ) : null}
                                          </>
                                    )}
                              </View>
                        </KeyboardAvoidingView>
                  </View>
            </Modal>
      );
}

const styles = StyleSheet.create({
      flex: { flex: 1 },
      backdrop: { flex: 1, backgroundColor: 'rgba(26,10,0,0.55)', justifyContent: 'flex-end' },
      kav: { width: '100%', maxWidth: SHEET_MAX_WIDTH, alignSelf: 'center', maxHeight: '94%' },
      sheet: {
            flexShrink: 1,
            backgroundColor: Colors.cardBg,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            overflow: 'hidden',
            minHeight: 420,
            paddingTop: Platform.OS === 'android' ? 0 : 0,
      },

      /* header */
      header: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: Spacing.md,
            paddingHorizontal: Spacing.xxl,
            paddingVertical: Spacing.xl,
            overflow: 'hidden',
      },
      headerWatermark: {
            position: 'absolute',
            right: 56,
            bottom: -40,
            fontSize: 120,
            color: Colors.textLight,
            opacity: 0.1,
      },
      headerEyebrow: {
            fontSize: Fonts.sizes.sm,
            fontWeight: '800',
            letterSpacing: 1.1,
            color: Colors.goldLight,
            textTransform: 'uppercase',
      },
      headerTitle: {
            marginTop: Spacing.sm,
            fontSize: Fonts.sizes.xxl + 2,
            lineHeight: 30,
            fontWeight: '800',
            color: Colors.textLight,
      },
      headerSub: { marginTop: Spacing.xs + 2, fontSize: Fonts.sizes.md, color: Colors.goldLight, opacity: 0.9 },
      closeBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.22)',
      },

      /* content */
      content: { padding: Spacing.xxl, paddingBottom: Spacing.xxl },
      row: { flexDirection: 'row', gap: Spacing.lg },
      half: { flex: 1 },
      field: { marginBottom: Spacing.lg },
      label: { marginBottom: Spacing.sm - 1, fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textPrimary },
      errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs + 1 },
      errorText: { flexShrink: 1, fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.error },

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
      inputBoxMultiline: { minHeight: 110, alignItems: 'flex-start' },
      inputBoxFocused: { borderColor: Colors.primary, backgroundColor: Colors.cardBg },
      inputBoxError: { borderColor: Colors.error, backgroundColor: '#FFF6F5' },
      input: {
            flex: 1,
            paddingVertical: Platform.OS === 'ios' ? Spacing.md + 2 : Spacing.sm,
            fontSize: Fonts.sizes.md + 1,
            fontWeight: '600',
            color: Colors.textPrimary,
      },
      inputMultiline: { minHeight: 98, paddingTop: Spacing.md },
      adornment: { fontSize: Fonts.sizes.md + 1, fontWeight: '800', color: Colors.textSecondary },
      pickerText: { flex: 1, fontSize: Fonts.sizes.md + 1, fontWeight: '700', color: Colors.textPrimary },
      counter: { marginTop: Spacing.xs, alignSelf: 'flex-end', fontSize: Fonts.sizes.xs + 1, color: Colors.textMuted },

      /* chips */
      chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
      chip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 2,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      chipDisabled: { backgroundColor: '#FAF6F1', borderColor: Colors.saffronBg },
      chipText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
      chipTextActive: { color: Colors.textLight, fontWeight: '800' },
      chipTextDisabled: { color: Colors.border, textDecorationLine: 'line-through' },
      noSlots: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm,
            padding: Spacing.md,
            borderRadius: BorderRadius.md,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.goldLight,
      },
      noSlotsText: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.textSecondary },

      /* birth details */
      birthBox: {
            marginBottom: Spacing.lg,
            padding: Spacing.lg,
            borderRadius: BorderRadius.lg,
            borderWidth: 1,
            borderColor: Colors.goldLight,
            backgroundColor: Colors.saffronBg,
      },
      birthHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
      birthTitle: { flexShrink: 1, fontSize: Fonts.sizes.md + 1, fontWeight: '800', color: Colors.secondary },
      birthTitleNote: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.primaryDark },
      neededPill: {
            paddingHorizontal: Spacing.md,
            paddingVertical: 3,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.goldLight,
      },
      neededText: { fontSize: Fonts.sizes.xs + 1, fontWeight: '800', color: Colors.textPrimary },
      segRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
      seg: {
            flex: 1,
            minHeight: 52,
            textAlign: 'center',
            paddingHorizontal: Spacing.sm,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: Colors.cardBg,
            fontSize: Fonts.sizes.lg,
            fontWeight: '700',
            color: Colors.textPrimary,
      },
      segWide: { flex: 1.6 },
      periodRow: { flexDirection: 'row', borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border },
      periodBtn: { paddingHorizontal: Spacing.md, minHeight: 49, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cardBg },
      periodBtnActive: { backgroundColor: Colors.primary },
      periodText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textSecondary },

      /* footer */
      footer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: Spacing.lg,
            paddingHorizontal: Spacing.xxl,
            paddingTop: Spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.xl,
            backgroundColor: Colors.cardBg,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
      },
      feeLabel: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textMuted },
      feeValue: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.secondary },
      submitWrap: { flexShrink: 1, borderRadius: BorderRadius.lg, ...Shadow.md, shadowColor: Colors.gold },
      submit: {
            minHeight: 54,
            minWidth: 190,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: Spacing.xxl,
            borderRadius: BorderRadius.lg,
      },
      submitText: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },

      /* date picker overlay */
      overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
      overlayBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,10,0,0.45)' },
      pickerPanel: {
            backgroundColor: Colors.cardBg,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            padding: Spacing.xxl,
            paddingTop: Spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xxl,
            ...Shadow.lg,
      },
      grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: Colors.border, marginBottom: Spacing.md },
      pickerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
      pickerTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },
      calHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
      calNav: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.saffronBg },
      calMonth: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
      calRow: { flexDirection: 'row' },
      calWeekday: { width: `${100 / 7}%`, textAlign: 'center', paddingVertical: Spacing.xs, fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.textMuted },
      calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
      calCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
      calDay: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.full },
      calDayToday: { borderWidth: 1.5, borderColor: Colors.primary },
      calDaySelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      calDayText: { fontSize: Fonts.sizes.md + 1, fontWeight: '600', color: Colors.textPrimary },

      /* success */
      successWrap: { alignItems: 'center', padding: Spacing.xxl, paddingTop: Spacing.section },
      successOrb: {
            width: 104,
            height: 104,
            borderRadius: 52,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 2,
            borderColor: Colors.goldLight,
      },
      successEmoji: { fontSize: 50 },
      successTitle: { marginTop: Spacing.xl, fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.textPrimary },
      successSub: { marginTop: Spacing.sm, fontSize: Fonts.sizes.md + 1, lineHeight: 22, color: Colors.textSecondary, textAlign: 'center' },
      summaryCard: {
            alignSelf: 'stretch',
            marginTop: Spacing.xxl,
            padding: Spacing.xl,
            borderRadius: BorderRadius.xl,
            backgroundColor: Colors.darkBg,
            borderWidth: 1,
            borderColor: Colors.goldDark,
      },
      sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.lg, paddingVertical: 5 },
      sumLabel: { fontSize: Fonts.sizes.md + 1, fontWeight: '600', color: Colors.textMuted },
      sumValue: { flexShrink: 1, textAlign: 'right', fontSize: Fonts.sizes.md + 1, fontWeight: '700', color: Colors.textLight },
      sumDivider: { height: 1, marginVertical: Spacing.sm, backgroundColor: Colors.goldDark, opacity: 0.5 },
      sumTotal: { fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.gold },
      doneBtn: {
            alignSelf: 'stretch',
            marginTop: Spacing.xxl,
            alignItems: 'center',
            paddingVertical: Spacing.lg,
            borderRadius: BorderRadius.lg,
            backgroundColor: Colors.primary,
            ...Shadow.md,
            shadowColor: Colors.primary,
      },
      doneText: { fontSize: Fonts.sizes.lg + 1, fontWeight: '800', color: Colors.textLight },
});