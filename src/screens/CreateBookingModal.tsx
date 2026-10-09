import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
      ActivityIndicator,
      Alert,
      Animated,
      KeyboardAvoidingView,
      Modal,
      Platform,
      Pressable,
      ScrollView,
      StatusBar,
      StyleSheet,
      Text,
      TextInput,
      View,
} from 'react-native';

// 👇 adjust these import paths to match your project
import { BorderRadius, Colors, Fonts, Shadow, Spacing } from '../theme/index';
import type { ICreateBooking } from '../types/IBooking';

interface CreateBookingModalProps {
      visible: boolean;
      panditId: string;
      panditName: string;
      /** Pooja fee charged by the pandit (₹). */
      price: number;
      /** Platform fee (₹). Defaults to 0. */
      platformFee?: number;
      onClose: () => void;
      /** Should reject with an Error if the API call fails – the message is shown to the user. */
      onSubmit: (payload: ICreateBooking) => Promise<void>;
}

type Period = 'AM' | 'PM';

interface TimeValue {
      hour: number; // 1-12
      minute: number; // 0-59
      period: Period;
}

interface FormState {
      poojaType: string;
      language: string;
      date: string; // YYYY-MM-DD
      time: TimeValue | null;
      duration: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      landmark: string;
      numberOfPeople: number;
      specialInstructions: string;
      samagriNeeded: boolean;
}

type FieldKey = 'poojaType' | 'date' | 'time' | 'address' | 'city' | 'state' | 'pincode' | 'numberOfPeople';
type SectionKey = 'pooja' | 'location' | 'additional';
type Errors = Partial<Record<FieldKey, string>>;
type TextFieldKey = 'city' | 'state' | 'pincode' | 'landmark';

const LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'Marathi', 'Gujarati', 'Bengali', 'Tamil'] as const;
const DURATIONS = ['1 hour', '2 hours', '3 hours', '4 hours', 'Half day', 'Full day'] as const;
const POOJA_SUGGESTIONS = [
      'Griha Pravesh',
      'Satyanarayan Katha',
      'Rudrabhishek',
      'Navgraha Shanti',
      'Ganesh Puja',
      'Lakshmi Puja',
      'Vivah',
      'Mundan',
] as const;

const FIELD_SECTION: Record<FieldKey, SectionKey> = {
      poojaType: 'pooja',
      date: 'pooja',
      time: 'pooja',
      address: 'location',
      city: 'location',
      state: 'location',
      pincode: 'location',
      numberOfPeople: 'additional',
};

const FIELD_ORDER: FieldKey[] = [
      'poojaType',
      'date',
      'time',
      'address',
      'city',
      'state',
      'pincode',
      'numberOfPeople',
];

const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_HEAD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;
const GRADIENT_SEGMENTS = 40;
const MAX_PEOPLE = 100;
const MAX_NOTE = 300;

const INITIAL_FORM: FormState = {
      poojaType: '',
      language: 'Hindi',
      date: '',
      time: null,
      duration: '2 hours',
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      numberOfPeople: 1,
      specialInstructions: '',
      samagriNeeded: false,
};

const pad = (n: number): string => String(n).padStart(2, '0');

const toISODate = (y: number, m: number, d: number): string => `${y}-${pad(m + 1)}-${pad(d)}`;

const todayISO = (): string => {
      const n = new Date();
      return toISODate(n.getFullYear(), n.getMonth(), n.getDate());
};

const parseISODate = (iso: string): { y: number; m: number; d: number } | null => {
      const parts = iso.split('-').map(Number);
      if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) return null;
      return { y: parts[0], m: parts[1] - 1, d: parts[2] };
};

const formatDisplayDate = (iso: string): string => {
      const p = parseISODate(iso);
      if (!p) return '';
      const wd = WEEKDAYS_SHORT[new Date(p.y, p.m, p.d).getDay()];
      return `${wd}, ${p.d} ${MONTHS_SHORT[p.m]} ${p.y}`;
};

const formatTime = (t: TimeValue): string => `${t.hour}:${pad(t.minute)} ${t.period}`;

const minutesOfDay = (t: TimeValue): number => ((t.hour % 12) + (t.period === 'PM' ? 12 : 0)) * 60 + t.minute;

const formatINR = (amount: number): string => {
      const [int, dec] = amount.toFixed(2).split('.');
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3);
      const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
      return `₹${grouped}${dec === '00' ? '' : `.${dec}`}`;
};

const hexToRgb = (hex: string): [number, number, number] => {
      const h = hex.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const mixHex = (from: string, to: string, t: number): string => {
      const a = hexToRgb(from);
      const b = hexToRgb(to);
      const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
      return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const buildMonthGrid = (year: number, month: number): Array<number | null> => {
      const first = new Date(year, month, 1).getDay();
      const days = new Date(year, month + 1, 0).getDate();
      const cells: Array<number | null> = [];
      for (let i = 0; i < first; i += 1) cells.push(null);
      for (let d = 1; d <= days; d += 1) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null);
      return cells;
};

const validate = (f: FormState): Errors => {
      const e: Errors = {};
      if (f.poojaType.trim().length < 3) e.poojaType = 'Enter the type of pooja';
      if (!f.date) e.date = 'Choose a date';
      else if (f.date < todayISO()) e.date = 'Date cannot be in the past';
      if (!f.time) e.time = 'Choose a time';
      else if (f.date === todayISO()) {
            const now = new Date();
            if (minutesOfDay(f.time) <= now.getHours() * 60 + now.getMinutes()) {
                  e.time = 'Choose a time later than now';
            }
      }
      if (f.address.trim().length < 5) e.address = 'Enter the full address';
      if (!f.city.trim()) e.city = 'Required';
      if (!f.state.trim()) e.state = 'Required';
      if (f.pincode.length > 0 && f.pincode.length !== 6) e.pincode = 'Must be 6 digits';
      if (f.numberOfPeople < 1) e.numberOfPeople = 'At least 1 person';
      return e;
};

const GradientBar = memo(({ from, to }: { from: string; to: string }) => (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.gradientRow}>
                  {Array.from({ length: GRADIENT_SEGMENTS }, (_, i) => (
                        <View
                              key={i}
                              style={{ flex: 1, backgroundColor: mixHex(from, to, i / (GRADIENT_SEGMENTS - 1)) }}
                        />
                  ))}
            </View>
      </View>
));

const SectionTitle = ({ emoji, title }: { emoji: string; title: string }) => (
      <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIcon}>
                  <Text style={styles.sectionEmoji}>{emoji}</Text>
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionRule} />
      </View>
);

interface FieldProps {
      label: string;
      required?: boolean;
      error?: string;
      children: React.ReactNode;
      style?: object;
}

const Field = ({ label, required, error, children, style }: FieldProps) => (
      <View style={[styles.field, style]}>
            <Text style={styles.label}>
                  {label}
                  {required ? <Text style={{ color: Colors.error }}> *</Text> : null}
            </Text>
            {children}
            {error ? (
                  <Text style={styles.error} accessibilityLiveRegion="polite">
                        {error}
                  </Text>
            ) : null}
      </View>
);

interface TextFieldProps {
      value: string;
      onChangeText: (t: string) => void;
      placeholder?: string;
      hasError?: boolean;
      multiline?: boolean;
      maxLength?: number;
      keyboardType?: 'default' | 'number-pad';
      returnKeyType?: 'next' | 'done';
      onSubmitEditing?: () => void;
      inputRef?: (r: TextInput | null) => void;
      autoCapitalize?: 'none' | 'words' | 'sentences';
      accessibilityLabel: string;
}

const TextField = memo(
      ({
            value,
            onChangeText,
            placeholder,
            hasError,
            multiline,
            maxLength,
            keyboardType = 'default',
            returnKeyType = 'next',
            onSubmitEditing,
            inputRef,
            autoCapitalize = 'words',
            accessibilityLabel,
      }: TextFieldProps) => {
            const [focused, setFocused] = useState(false);
            return (
                  <TextInput
                        ref={inputRef}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={Colors.textMuted}
                        multiline={multiline}
                        maxLength={maxLength}
                        keyboardType={keyboardType}
                        returnKeyType={multiline ? 'default' : returnKeyType}
                        onSubmitEditing={onSubmitEditing}
                        blurOnSubmit={!onSubmitEditing}
                        autoCapitalize={autoCapitalize}
                        accessibilityLabel={accessibilityLabel}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        textAlignVertical={multiline ? 'top' : 'center'}
                        style={[
                              styles.input,
                              multiline && styles.inputMultiline,
                              focused && styles.inputFocused,
                              hasError && styles.inputError,
                        ]}
                  />
            );
      },
);

interface ChipProps {
      label: string;
      active: boolean;
      onPress: () => void;
}

const Chip = memo(({ label, active, onPress }: ChipProps) => (
      <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && !active && { opacity: 0.7 }]}
      >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      </Pressable>
));

interface PickerButtonProps {
      emoji: string;
      value: string;
      placeholder: string;
      hasError?: boolean;
      onPress: () => void;
      accessibilityLabel: string;
}

const PickerButton = memo(({ emoji, value, placeholder, hasError, onPress, accessibilityLabel }: PickerButtonProps) => (
      <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            style={({ pressed }) => [styles.input, styles.pickerBtn, hasError && styles.inputError, pressed && { opacity: 0.8 }]}
      >
            <Text style={styles.pickerEmoji}>{emoji}</Text>
            <Text style={[styles.pickerText, !value && { color: Colors.textMuted, fontWeight: '600' }]} numberOfLines={1}>
                  {value || placeholder}
            </Text>
      </Pressable>
));

/* ------------------------------- Picker sheets ----------------------------- */

const PickerSheet = ({
      title,
      onClose,
      children,
}: {
      title: string;
      onClose: () => void;
      children: React.ReactNode;
}) => (
      <View style={styles.overlay}>
            <Pressable style={styles.overlayBackdrop} onPress={onClose} accessibilityLabel="Dismiss picker" />
            <View style={styles.pickerPanel}>
                  <View style={styles.grabber} />
                  <View style={styles.pickerHead}>
                        <Text style={styles.pickerTitle}>{title}</Text>
                        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close picker" hitSlop={10}>
                              <Text style={styles.pickerClose}>✕</Text>
                        </Pressable>
                  </View>
                  {children}
            </View>
      </View>
);

interface DatePickerProps {
      selected: string;
      onSelect: (iso: string) => void;
      onClose: () => void;
}

const DatePicker = ({ selected, onSelect, onClose }: DatePickerProps) => {
      const today = todayISO();
      const base = parseISODate(selected) ?? parseISODate(today);
      const [view, setView] = useState<{ y: number; m: number }>({
            y: base ? base.y : new Date().getFullYear(),
            m: base ? base.m : new Date().getMonth(),
      });

      const now = new Date();
      const isCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();
      const cells = useMemo(() => buildMonthGrid(view.y, view.m), [view]);

      const shift = (delta: number): void => {
            const d = new Date(view.y, view.m + delta, 1);
            setView({ y: d.getFullYear(), m: d.getMonth() });
      };

      return (
            <PickerSheet title="Select date" onClose={onClose}>
                  <View style={styles.calHead}>
                        <Pressable
                              onPress={() => shift(-1)}
                              disabled={isCurrentMonth}
                              accessibilityRole="button"
                              accessibilityLabel="Previous month"
                              style={[styles.calNav, isCurrentMonth && { opacity: 0.3 }]}
                        >
                              <Text style={styles.calNavText}>‹</Text>
                        </Pressable>
                        <Text style={styles.calMonth}>
                              {MONTHS[view.m]} {view.y}
                        </Text>
                        <Pressable
                              onPress={() => shift(1)}
                              accessibilityRole="button"
                              accessibilityLabel="Next month"
                              style={styles.calNav}
                        >
                              <Text style={styles.calNavText}>›</Text>
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
                              const iso = toISODate(view.y, view.m, d);
                              const past = iso < today;
                              const isSel = iso === selected;
                              const isToday = iso === today;
                              return (
                                    <View key={iso} style={styles.calCell}>
                                          <Pressable
                                                disabled={past}
                                                onPress={() => {
                                                      onSelect(iso);
                                                      onClose();
                                                }}
                                                accessibilityRole="button"
                                                accessibilityLabel={formatDisplayDate(iso)}
                                                accessibilityState={{ selected: isSel, disabled: past }}
                                                style={({ pressed }) => [
                                                      styles.calDay,
                                                      isToday && styles.calDayToday,
                                                      isSel && styles.calDaySelected,
                                                      pressed && !isSel && { backgroundColor: Colors.saffronBg },
                                                ]}
                                          >
                                                <Text
                                                      style={[
                                                            styles.calDayText,
                                                            past && { color: Colors.border },
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
            </PickerSheet>
      );
};

interface TimePickerProps {
      value: TimeValue | null;
      onChange: (t: TimeValue) => void;
      onClose: () => void;
}

const TimePicker = ({ value, onChange, onClose }: TimePickerProps) => {
      const [draft, setDraft] = useState<TimeValue>(value ?? { hour: 9, minute: 0, period: 'AM' });

      return (
            <PickerSheet title="Select time" onClose={onClose}>
                  <View style={styles.timePreview}>
                        <Text style={styles.timePreviewText}>{formatTime(draft)}</Text>
                        <View style={styles.periodRow}>
                              {(['AM', 'PM'] as const).map((p) => (
                                    <Pressable
                                          key={p}
                                          onPress={() => setDraft((d) => ({ ...d, period: p }))}
                                          accessibilityRole="button"
                                          accessibilityState={{ selected: draft.period === p }}
                                          style={[styles.periodBtn, draft.period === p && styles.periodBtnActive]}
                                    >
                                          <Text style={[styles.periodText, draft.period === p && { color: Colors.textLight }]}>{p}</Text>
                                    </Pressable>
                              ))}
                        </View>
                  </View>

                  <Text style={styles.timeLabel}>Hour</Text>
                  <View style={styles.timeGrid}>
                        {HOURS.map((h) => (
                              <Pressable
                                    key={h}
                                    onPress={() => setDraft((d) => ({ ...d, hour: h }))}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${h} o'clock`}
                                    accessibilityState={{ selected: draft.hour === h }}
                                    style={[styles.timeCell, draft.hour === h && styles.timeCellActive]}
                              >
                                    <Text style={[styles.timeCellText, draft.hour === h && { color: Colors.textLight }]}>{h}</Text>
                              </Pressable>
                        ))}
                  </View>

                  <Text style={styles.timeLabel}>Minute</Text>
                  <View style={styles.timeGrid}>
                        {MINUTES.map((m) => (
                              <Pressable
                                    key={m}
                                    onPress={() => setDraft((d) => ({ ...d, minute: m }))}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${m} minutes`}
                                    accessibilityState={{ selected: draft.minute === m }}
                                    style={[styles.timeCell, draft.minute === m && styles.timeCellActive]}
                              >
                                    <Text style={[styles.timeCellText, draft.minute === m && { color: Colors.textLight }]}>{pad(m)}</Text>
                              </Pressable>
                        ))}
                  </View>

                  <Pressable
                        onPress={() => {
                              onChange(draft);
                              onClose();
                        }}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.primaryBtn, { marginTop: Spacing.xl }, pressed && { opacity: 0.9 }]}
                  >
                        <Text style={styles.primaryBtnText}>Set time</Text>
                  </Pressable>
            </PickerSheet>
      );
};

/* ------------------------------ Success panel ------------------------------ */

const SuccessPanel = ({
      panditName,
      payload,
      onDone,
}: {
      panditName: string;
      payload: ICreateBooking;
      onDone: () => void;
}) => {
      const pop = useRef(new Animated.Value(0)).current;
      useEffect(() => {
            Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
      }, [pop]);

      return (
            <View style={styles.successWrap}>
                  <Animated.View style={[styles.successDiya, { transform: [{ scale: pop }], opacity: pop }]}>
                        <Text style={styles.successEmoji}>🪔</Text>
                  </Animated.View>
                  <Text style={styles.successTitle}>Booking requested</Text>
                  <Text style={styles.successSub}>
                        Your request has been sent to {panditName}. You'll be notified once the pandit confirms.
                  </Text>

                  <View style={styles.successCard}>
                        <View style={styles.sumRow}>
                              <Text style={styles.sumLabel}>Pooja</Text>
                              <Text style={styles.sumValue}>{payload.poojaType}</Text>
                        </View>
                        <View style={styles.sumRow}>
                              <Text style={styles.sumLabel}>When</Text>
                              <Text style={styles.sumValue}>
                                    {formatDisplayDate(payload.poojaDate)}, {payload.poojaTime}
                              </Text>
                        </View>
                        <View style={styles.sumRow}>
                              <Text style={styles.sumLabel}>Where</Text>
                              <Text style={styles.sumValue}>{payload.location.city}</Text>
                        </View>
                        <View style={styles.sumDivider} />
                        <View style={styles.sumRow}>
                              <Text style={[styles.sumLabel, { fontWeight: '800', color: Colors.textPrimary }]}>Total</Text>
                              <Text style={styles.sumTotal}>{formatINR(payload.totalAmount)}</Text>
                        </View>
                  </View>

                  <Pressable
                        onPress={onDone}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.primaryBtn, styles.successBtn, pressed && { opacity: 0.9 }]}
                  >
                        <Text style={styles.primaryBtnText}>Done</Text>
                  </Pressable>
            </View>
      );
};

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
      visible,
      panditId,
      panditName,
      price,
      platformFee = 0,
      onClose,
      onSubmit,
}) => {
      const [form, setForm] = useState<FormState>(INITIAL_FORM);
      const [errors, setErrors] = useState<Errors>({});
      const [submitted, setSubmitted] = useState(false); // user tried to submit once
      const [submitting, setSubmitting] = useState(false);
      const [created, setCreated] = useState<ICreateBooking | null>(null);
      const [picker, setPicker] = useState<'date' | 'time' | null>(null);

      const scrollRef = useRef<ScrollView>(null);
      const sectionY = useRef<Record<SectionKey, number>>({ pooja: 0, location: 0, additional: 0 });
      const inputRefs = useRef<Record<TextFieldKey, TextInput | null>>({
            city: null,
            state: null,
            pincode: null,
            landmark: null,
      });

      const totalAmount = price + platformFee;
      const [gFrom = Colors.primaryDark, gTo = Colors.primary] = [Colors.primaryDark, Colors.primary];

      // fresh form every time the modal opens
      useEffect(() => {
            if (visible) {
                  setForm(INITIAL_FORM);
                  setErrors({});
                  setSubmitted(false);
                  setSubmitting(false);
                  setCreated(null);
                  setPicker(null);
            }
      }, [visible]);

      const dirty = useMemo(
            () =>
                  form.poojaType !== '' ||
                  form.date !== '' ||
                  form.time !== null ||
                  form.address !== '' ||
                  form.city !== '' ||
                  form.state !== '' ||
                  form.pincode !== '' ||
                  form.landmark !== '' ||
                  form.specialInstructions !== '' ||
                  form.samagriNeeded ||
                  form.numberOfPeople !== 1,
            [form],
      );

      const update = useCallback(
            <K extends keyof FormState>(key: K, value: FormState[K]) => {
                  setForm((prev) => {
                        const next = { ...prev, [key]: value };
                        if (submitted) setErrors(validate(next));
                        return next;
                  });
            },
            [submitted],
      );

      const requestClose = useCallback(() => {
            if (submitting) return;
            if (created || !dirty) {
                  onClose();
                  return;
            }
            Alert.alert('Discard this booking?', 'The details you entered will be lost.', [
                  { text: 'Keep editing', style: 'cancel' },
                  { text: 'Discard', style: 'destructive', onPress: onClose },
            ]);
      }, [submitting, created, dirty, onClose]);

      const handleSubmit = useCallback(async () => {
            setSubmitted(true);
            const found = validate(form);
            setErrors(found);

            const firstBad = FIELD_ORDER.find((k) => found[k]);
            if (firstBad) {
                  const y = sectionY.current[FIELD_SECTION[firstBad]];
                  scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
                  return;
            }
            if (!form.time) return; // narrows type; validate() already guarantees this

            const payload: ICreateBooking = {
                  pandit: panditId,
                  poojaType: form.poojaType.trim(),
                  poojaDate: form.date,
                  poojaTime: formatTime(form.time),
                  duration: form.duration,
                  location: {
                        address: form.address.trim(),
                        city: form.city.trim(),
                        state: form.state.trim(),
                        pincode: form.pincode,
                        landmark: form.landmark.trim(),
                  },
                  requirements: {
                        samagriNeeded: form.samagriNeeded,
                        numberOfPeople: form.numberOfPeople,
                        specialInstructions: form.specialInstructions.trim(),
                        language: form.language,
                  },
                  price,
                  platformFee,
                  totalAmount,
            };

            setSubmitting(true);
            try {
                  await onSubmit(payload);
                  setCreated(payload);
            } catch (err) {
                  const message = err instanceof Error ? err.message : 'Please try again in a moment.';
                  Alert.alert("Couldn't create booking", message);
            } finally {
                  setSubmitting(false);
            }
      }, [form, panditId, price, platformFee, totalAmount, onSubmit]);

      const focusNext = (key: TextFieldKey) => () => inputRefs.current[key]?.focus();
      const setRef = (key: TextFieldKey) => (r: TextInput | null) => {
            inputRefs.current[key] = r;
      };
      const onSectionLayout = (key: SectionKey) => (e: { nativeEvent: { layout: { y: number } } }) => {
            sectionY.current[key] = e.nativeEvent.layout.y;
      };

      return (
            <Modal
                  visible={visible}
                  animationType="slide"
                  transparent
                  onRequestClose={requestClose}
                  statusBarTranslucent
            >
                  <View style={styles.backdrop}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} accessibilityLabel="Close booking form" />

                        <KeyboardAvoidingView
                              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                              style={styles.kav}
                        >
                              <View style={styles.sheet}>
                                    {/* ------------------------------ Header ------------------------------ */}
                                    <View style={styles.header}>
                                          <GradientBar from={gFrom} to={gTo} />
                                          <Text style={styles.headerWatermark}>ॐ</Text>
                                          <View style={{ flex: 1 }}>
                                                <Text style={styles.headerTitle}>Book Pandit Ji</Text>
                                                <Text style={styles.headerSub} numberOfLines={1}>
                                                      {panditName}
                                                </Text>
                                          </View>
                                          <Pressable
                                                onPress={requestClose}
                                                accessibilityRole="button"
                                                accessibilityLabel="Close"
                                                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                                          >
                                                <Text style={styles.closeText}>✕</Text>
                                          </Pressable>
                                    </View>

                                    {created ? (
                                          <SuccessPanel panditName={panditName} payload={created} onDone={onClose} />
                                    ) : (
                                          <>
                                                <ScrollView
                                                      ref={scrollRef}
                                                      keyboardShouldPersistTaps="handled"
                                                      showsVerticalScrollIndicator={false}
                                                      contentContainerStyle={styles.content}
                                                >
                                                      {/* --------------------------- Pooja details -------------------------- */}
                                                      <View onLayout={onSectionLayout('pooja')}>
                                                            <SectionTitle emoji="🪔" title="Pooja details" />

                                                            <Field label="Pooja type" required error={errors.poojaType}>
                                                                  <TextField
                                                                        value={form.poojaType}
                                                                        onChangeText={(t) => update('poojaType', t)}
                                                                        placeholder="e.g. Griha Pravesh"
                                                                        hasError={Boolean(errors.poojaType)}
                                                                        accessibilityLabel="Pooja type"
                                                                  />
                                                                  <ScrollView
                                                                        horizontal
                                                                        showsHorizontalScrollIndicator={false}
                                                                        keyboardShouldPersistTaps="handled"
                                                                        contentContainerStyle={styles.chipRow}
                                                                  >
                                                                        {POOJA_SUGGESTIONS.map((s) => (
                                                                              <Chip
                                                                                    key={s}
                                                                                    label={s}
                                                                                    active={form.poojaType === s}
                                                                                    onPress={() => update('poojaType', s)}
                                                                              />
                                                                        ))}
                                                                  </ScrollView>
                                                            </Field>

                                                            <Field label="Language">
                                                                  <ScrollView
                                                                        horizontal
                                                                        showsHorizontalScrollIndicator={false}
                                                                        contentContainerStyle={styles.chipRow}
                                                                  >
                                                                        {LANGUAGES.map((l) => (
                                                                              <Chip
                                                                                    key={l}
                                                                                    label={l}
                                                                                    active={form.language === l}
                                                                                    onPress={() => update('language', l)}
                                                                              />
                                                                        ))}
                                                                  </ScrollView>
                                                            </Field>

                                                            <View style={styles.twoCol}>
                                                                  <Field label="Date" required error={errors.date} style={{ flex: 1 }}>
                                                                        <PickerButton
                                                                              emoji="📅"
                                                                              value={form.date ? formatDisplayDate(form.date) : ''}
                                                                              placeholder="Select"
                                                                              hasError={Boolean(errors.date)}
                                                                              onPress={() => setPicker('date')}
                                                                              accessibilityLabel="Pick date"
                                                                        />
                                                                  </Field>
                                                                  <Field label="Time" required error={errors.time} style={{ flex: 1 }}>
                                                                        <PickerButton
                                                                              emoji="⏰"
                                                                              value={form.time ? formatTime(form.time) : ''}
                                                                              placeholder="Select"
                                                                              hasError={Boolean(errors.time)}
                                                                              onPress={() => setPicker('time')}
                                                                              accessibilityLabel="Pick time"
                                                                        />
                                                                  </Field>
                                                            </View>

                                                            <Field label="Duration">
                                                                  <View style={styles.chipWrap}>
                                                                        {DURATIONS.map((d) => (
                                                                              <Chip
                                                                                    key={d}
                                                                                    label={d}
                                                                                    active={form.duration === d}
                                                                                    onPress={() => update('duration', d)}
                                                                              />
                                                                        ))}
                                                                  </View>
                                                            </Field>
                                                      </View>

                                                      {/* ------------------------------ Location ---------------------------- */}
                                                      <View onLayout={onSectionLayout('location')}>
                                                            <SectionTitle emoji="📍" title="Location" />

                                                            <Field label="Full address" required error={errors.address}>
                                                                  <TextField
                                                                        value={form.address}
                                                                        onChangeText={(t) => update('address', t)}
                                                                        placeholder="House no., street, colony"
                                                                        hasError={Boolean(errors.address)}
                                                                        onSubmitEditing={focusNext('city')}
                                                                        accessibilityLabel="Full address"
                                                                  />
                                                            </Field>

                                                            <View style={styles.twoCol}>
                                                                  <Field label="City" required error={errors.city} style={{ flex: 1 }}>
                                                                        <TextField
                                                                              inputRef={setRef('city')}
                                                                              value={form.city}
                                                                              onChangeText={(t) => update('city', t)}
                                                                              placeholder="City"
                                                                              hasError={Boolean(errors.city)}
                                                                              onSubmitEditing={focusNext('state')}
                                                                              accessibilityLabel="City"
                                                                        />
                                                                  </Field>
                                                                  <Field label="State" required error={errors.state} style={{ flex: 1 }}>
                                                                        <TextField
                                                                              inputRef={setRef('state')}
                                                                              value={form.state}
                                                                              onChangeText={(t) => update('state', t)}
                                                                              placeholder="State"
                                                                              hasError={Boolean(errors.state)}
                                                                              onSubmitEditing={focusNext('pincode')}
                                                                              accessibilityLabel="State"
                                                                        />
                                                                  </Field>
                                                            </View>

                                                            <View style={styles.twoCol}>
                                                                  <Field label="Pincode" error={errors.pincode} style={{ flex: 1 }}>
                                                                        <TextField
                                                                              inputRef={setRef('pincode')}
                                                                              value={form.pincode}
                                                                              onChangeText={(t) => update('pincode', t.replace(/\D/g, '').slice(0, 6))}
                                                                              placeholder="6 digits"
                                                                              keyboardType="number-pad"
                                                                              maxLength={6}
                                                                              hasError={Boolean(errors.pincode)}
                                                                              onSubmitEditing={focusNext('landmark')}
                                                                              accessibilityLabel="Pincode"
                                                                        />
                                                                  </Field>
                                                                  <Field label="Landmark" style={{ flex: 1 }}>
                                                                        <TextField
                                                                              inputRef={setRef('landmark')}
                                                                              value={form.landmark}
                                                                              onChangeText={(t) => update('landmark', t)}
                                                                              placeholder="Near…"
                                                                              returnKeyType="done"
                                                                              accessibilityLabel="Landmark"
                                                                        />
                                                                  </Field>
                                                            </View>
                                                      </View>

                                                      {/* ---------------------------- Additional ---------------------------- */}
                                                      <View onLayout={onSectionLayout('additional')}>
                                                            <SectionTitle emoji="📝" title="Additional details" />

                                                            <Field label="Number of people" error={errors.numberOfPeople}>
                                                                  <View style={styles.stepper}>
                                                                        <Pressable
                                                                              onPress={() => update('numberOfPeople', Math.max(1, form.numberOfPeople - 1))}
                                                                              disabled={form.numberOfPeople <= 1}
                                                                              accessibilityRole="button"
                                                                              accessibilityLabel="Decrease number of people"
                                                                              style={({ pressed }) => [
                                                                                    styles.stepBtn,
                                                                                    form.numberOfPeople <= 1 && { opacity: 0.35 },
                                                                                    pressed && { opacity: 0.7 },
                                                                              ]}
                                                                        >
                                                                              <Text style={styles.stepBtnText}>−</Text>
                                                                        </Pressable>
                                                                        <View style={styles.stepValueWrap}>
                                                                              <Text style={styles.stepValue} accessibilityLabel={`${form.numberOfPeople} people`}>
                                                                                    {form.numberOfPeople}
                                                                              </Text>
                                                                              <Text style={styles.stepUnit}>{form.numberOfPeople === 1 ? 'person' : 'people'}</Text>
                                                                        </View>
                                                                        <Pressable
                                                                              onPress={() => update('numberOfPeople', Math.min(MAX_PEOPLE, form.numberOfPeople + 1))}
                                                                              disabled={form.numberOfPeople >= MAX_PEOPLE}
                                                                              accessibilityRole="button"
                                                                              accessibilityLabel="Increase number of people"
                                                                              style={({ pressed }) => [
                                                                                    styles.stepBtn,
                                                                                    styles.stepBtnPlus,
                                                                                    pressed && { opacity: 0.8 },
                                                                              ]}
                                                                        >
                                                                              <Text style={[styles.stepBtnText, { color: Colors.textLight }]}>+</Text>
                                                                        </Pressable>
                                                                  </View>
                                                            </Field>

                                                            <Field label="Special instructions">
                                                                  <TextField
                                                                        value={form.specialInstructions}
                                                                        onChangeText={(t) => update('specialInstructions', t)}
                                                                        placeholder="Anything the pandit should know…"
                                                                        multiline
                                                                        maxLength={MAX_NOTE}
                                                                        autoCapitalize="sentences"
                                                                        accessibilityLabel="Special instructions"
                                                                  />
                                                                  <Text style={styles.counter}>
                                                                        {form.specialInstructions.length}/{MAX_NOTE}
                                                                  </Text>
                                                            </Field>

                                                            <Pressable
                                                                  onPress={() => update('samagriNeeded', !form.samagriNeeded)}
                                                                  accessibilityRole="checkbox"
                                                                  accessibilityState={{ checked: form.samagriNeeded }}
                                                                  accessibilityLabel="I need Pooja Samagri"
                                                                  style={({ pressed }) => [
                                                                        styles.checkRow,
                                                                        form.samagriNeeded && styles.checkRowActive,
                                                                        pressed && { opacity: 0.85 },
                                                                  ]}
                                                            >
                                                                  <View style={[styles.checkbox, form.samagriNeeded && styles.checkboxActive]}>
                                                                        {form.samagriNeeded ? <Text style={styles.checkMark}>✓</Text> : null}
                                                                  </View>
                                                                  <View style={{ flex: 1 }}>
                                                                        <Text style={styles.checkTitle}>I need Pooja Samagri</Text>
                                                                        <Text style={styles.checkSub}>The pandit will bring the required items</Text>
                                                                  </View>
                                                                  <Text style={styles.checkEmoji}>🪷</Text>
                                                            </Pressable>
                                                      </View>
                                                      {/* ------------------------------ Summary ----------------------------- */}
                                                      <View style={styles.summary}>
                                                            <Text style={styles.summaryTitle}>Price summary</Text>
                                                            <View style={styles.sumRow}>
                                                                  <Text style={styles.sumLabel}>Pooja fee</Text>
                                                                  <Text style={styles.sumValue}>{formatINR(price)}</Text>
                                                            </View>
                                                            <View style={styles.sumRow}>
                                                                  <Text style={styles.sumLabel}>Platform fee</Text>
                                                                  <Text style={styles.sumValue}>{formatINR(platformFee)}</Text>
                                                            </View>
                                                            <View style={styles.sumDivider} />
                                                            <View style={styles.sumRow}>
                                                                  <Text style={[styles.sumLabel, { fontWeight: '800', color: Colors.textPrimary }]}>
                                                                        Total
                                                                  </Text>
                                                                  <Text style={styles.sumTotal}>{formatINR(totalAmount)}</Text>
                                                            </View>
                                                      </View>
                                                </ScrollView>
                                                {/* ---------------------------- Sticky footer --------------------------- */}
                                                <View style={styles.footer}>
                                                      <Pressable
                                                            onPress={() => void handleSubmit()}
                                                            disabled={submitting}
                                                            accessibilityRole="button"
                                                            accessibilityLabel={`Confirm booking, total ${formatINR(totalAmount)}`}
                                                            accessibilityState={{ disabled: submitting, busy: submitting }}
                                                            style={({ pressed }) => [
                                                                  styles.primaryBtn,
                                                                  pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 },
                                                                  submitting && { opacity: 0.8 },
                                                            ]}
                                                      >
                                                            {submitting ? (
                                                                  <ActivityIndicator color={Colors.textLight} />
                                                            ) : (
                                                                  <>
                                                                        <Text style={styles.primaryBtnText}>Confirm Booking</Text>
                                                                        <Text style={styles.primaryBtnAmount}>{formatINR(totalAmount)}</Text>
                                                                  </>
                                                            )}
                                                      </Pressable>
                                                </View>

                                                {/* ------------------------------ Pickers ------------------------------ */}
                                                {picker === 'date' && (
                                                      <DatePicker
                                                            selected={form.date}
                                                            onSelect={(iso) => update('date', iso)}
                                                            onClose={() => setPicker(null)}
                                                      />
                                                )}
                                                {picker === 'time' && (
                                                      <TimePicker
                                                            value={form.time}
                                                            onChange={(t) => update('time', t)}
                                                            onClose={() => setPicker(null)}
                                                      />
                                                )}
                                          </>
                                    )}
                              </View>
                        </KeyboardAvoidingView>
                  </View>
            </Modal>
      );
};

export default CreateBookingModal;

const styles = StyleSheet.create({
      backdrop: { flex: 1, backgroundColor: 'rgba(26,10,0,0.55)', justifyContent: 'flex-end' },
      kav: { width: '100%', maxHeight: '94%' },
      sheet: {
            backgroundColor: Colors.cardBg,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            overflow: 'hidden',
            height: '100%',
            minHeight: 520,
      },
      gradientRow: { flex: 1, flexDirection: 'row' },

      /* header */
      header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Spacing.xxl,
            paddingVertical: Spacing.xl,
            backgroundColor: Colors.primary,
            overflow: 'hidden',
      },
      headerWatermark: {
            position: 'absolute',
            right: 40,
            bottom: -42,
            fontSize: 120,
            color: Colors.textLight,
            opacity: 0.12,
      },
      headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textLight },
      headerSub: { marginTop: 2, fontSize: Fonts.sizes.md, color: Colors.goldLight, fontWeight: '600' },
      closeBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.25)',
      },
      closeText: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textLight },

      /* content */
      content: { padding: Spacing.xxl, paddingBottom: Spacing.section },

      sectionTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.sm + 2,
            marginTop: Spacing.sm,
            marginBottom: Spacing.lg,
      },
      sectionIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      sectionEmoji: { fontSize: Fonts.sizes.md + 1 },
      sectionTitle: {
            fontSize: Fonts.sizes.md + 1,
            fontWeight: '900',
            letterSpacing: 1,
            color: Colors.textPrimary,
            textTransform: 'uppercase',
      },
      sectionRule: { flex: 1, height: 1, backgroundColor: Colors.border },

      field: { marginBottom: Spacing.lg },
      twoCol: { flexDirection: 'row', gap: Spacing.md },
      label: {
            marginBottom: Spacing.sm - 1,
            fontSize: Fonts.sizes.sm,
            fontWeight: '800',
            letterSpacing: 0.8,
            color: Colors.textSecondary,
            textTransform: 'uppercase',
      },
      error: { marginTop: Spacing.xs + 1, fontSize: Fonts.sizes.sm, fontWeight: '600', color: Colors.error },

      input: {
            minHeight: 52,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Platform.OS === 'ios' ? Spacing.md + 2 : Spacing.sm,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
            fontSize: Fonts.sizes.lg,
            fontWeight: '600',
            color: Colors.textPrimary,
      },
      inputFocused: { borderColor: Colors.primary, backgroundColor: Colors.cardBg },
      inputError: { borderColor: Colors.error, backgroundColor: '#FFF6F5' },
      inputMultiline: { minHeight: 96, paddingTop: Spacing.md },

      pickerBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
      pickerEmoji: { fontSize: Fonts.sizes.lg },
      pickerText: { flex: 1, fontSize: Fonts.sizes.md + 1, fontWeight: '700', color: Colors.textPrimary },

      /* chips */
      chipRow: { gap: Spacing.sm, paddingTop: Spacing.md, paddingRight: Spacing.lg },
      chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
      chip: {
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm + 1,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      chipText: { fontSize: Fonts.sizes.md, fontWeight: '700', color: Colors.textSecondary },
      chipTextActive: { color: Colors.textLight },

      /* stepper */
      stepper: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: Spacing.sm,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
      },
      stepBtn: {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      stepBtnPlus: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      stepBtnText: { fontSize: Fonts.sizes.xxl, fontWeight: '700', color: Colors.primaryDark, marginTop: -2 },
      stepValueWrap: { alignItems: 'center' },
      stepValue: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textPrimary },
      stepUnit: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, fontWeight: '600' },

      counter: { marginTop: Spacing.xs, alignSelf: 'flex-end', fontSize: Fonts.sizes.xs + 1, color: Colors.textMuted },

      /* samagri checkbox */
      checkRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            padding: Spacing.lg,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: Colors.saffronBg,
            marginBottom: Spacing.lg,
      },
      checkRowActive: { borderColor: Colors.primary, backgroundColor: '#FFEBD6' },
      checkbox: {
            width: 26,
            height: 26,
            borderRadius: BorderRadius.sm,
            borderWidth: 2,
            borderColor: Colors.borderDark,
            backgroundColor: Colors.cardBg,
            alignItems: 'center',
            justifyContent: 'center',
      },
      checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      checkMark: { fontSize: Fonts.sizes.lg, fontWeight: '900', color: Colors.textLight, marginTop: -1 },
      checkTitle: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
      checkSub: { marginTop: 1, fontSize: Fonts.sizes.sm + 1, color: Colors.textSecondary },
      checkEmoji: { fontSize: 26 },

      /* summary */
      summary: {
            padding: Spacing.xl,
            borderRadius: BorderRadius.xl,
            backgroundColor: Colors.darkBg,
            borderWidth: 1,
            borderColor: Colors.goldDark,
      },
      summaryTitle: {
            marginBottom: Spacing.md,
            fontSize: Fonts.sizes.sm + 1,
            fontWeight: '800',
            letterSpacing: 1,
            color: Colors.goldLight,
            textTransform: 'uppercase',
      },
      sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, gap: Spacing.lg },
      sumLabel: { fontSize: Fonts.sizes.md + 1, color: Colors.textMuted, fontWeight: '600' },
      sumValue: { flexShrink: 1, textAlign: 'right', fontSize: Fonts.sizes.md + 1, color: Colors.textLight, fontWeight: '700' },
      sumDivider: { height: 1, marginVertical: Spacing.sm, backgroundColor: Colors.goldDark, opacity: 0.5 },
      sumTotal: { fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.gold },

      /* footer + primary button */
      footer: {
            paddingHorizontal: Spacing.xxl,
            paddingTop: Spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.xl,
            backgroundColor: Colors.cardBg,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
      },
      primaryBtn: {
            minHeight: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.md,
            paddingHorizontal: Spacing.xl,
            borderRadius: BorderRadius.lg,
            backgroundColor: Colors.primary,
            ...Shadow.md,
            shadowColor: Colors.primary,
            shadowOpacity: 0.4,
      },
      primaryBtnText: { fontSize: Fonts.sizes.lg + 1, fontWeight: '800', color: Colors.textLight },
      primaryBtnAmount: {
            fontSize: Fonts.sizes.md + 1,
            fontWeight: '800',
            color: Colors.textLight,
            paddingHorizontal: Spacing.md,
            paddingVertical: 3,
            borderRadius: BorderRadius.full,
            backgroundColor: 'rgba(0,0,0,0.18)',
            overflow: 'hidden',
      },

      /* picker overlay */
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
      grabber: {
            alignSelf: 'center',
            width: 44,
            height: 5,
            borderRadius: 3,
            backgroundColor: Colors.border,
            marginBottom: Spacing.md,
      },
      pickerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
      pickerTitle: { fontSize: Fonts.sizes.xl, fontWeight: '800', color: Colors.textPrimary },
      pickerClose: { fontSize: Fonts.sizes.xl, color: Colors.textMuted, fontWeight: '700' },

      /* calendar */
      calHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
      calNav: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
      },
      calNavText: { fontSize: 26, fontWeight: '700', color: Colors.primaryDark, marginTop: -3 },
      calMonth: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
      calRow: { flexDirection: 'row' },
      calWeekday: {
            width: `${100 / 7}%`,
            textAlign: 'center',
            paddingVertical: Spacing.xs,
            fontSize: Fonts.sizes.sm,
            fontWeight: '800',
            color: Colors.textMuted,
      },
      calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
      calCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
      calDay: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.full },
      calDayToday: { borderWidth: 1.5, borderColor: Colors.primary },
      calDaySelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      calDayText: { fontSize: Fonts.sizes.md + 1, fontWeight: '600', color: Colors.textPrimary },

      /* time picker */
      timePreview: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: Spacing.lg,
            borderRadius: BorderRadius.lg,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
            marginBottom: Spacing.md,
      },
      timePreviewText: { fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.primaryDark },
      periodRow: { flexDirection: 'row', gap: Spacing.sm },
      periodBtn: {
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.sm,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.cardBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      periodBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      periodText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textSecondary },
      timeLabel: {
            marginTop: Spacing.md,
            marginBottom: Spacing.sm,
            fontSize: Fonts.sizes.sm,
            fontWeight: '800',
            letterSpacing: 0.8,
            color: Colors.textMuted,
            textTransform: 'uppercase',
      },
      timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
      timeCell: {
            width: '14.6%',
            minWidth: 46,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: BorderRadius.md,
            backgroundColor: '#FFFCF8',
            borderWidth: 1,
            borderColor: Colors.border,
      },
      timeCellActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
      timeCellText: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.textPrimary },

      /* success */
      successWrap: { flex: 1, alignItems: 'center', padding: Spacing.xxl, paddingTop: Spacing.section },
      successDiya: {
            width: 110,
            height: 110,
            borderRadius: 55,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 2,
            borderColor: Colors.goldLight,
      },
      successEmoji: { fontSize: 52 },
      successTitle: { marginTop: Spacing.xl, fontSize: Fonts.sizes.xxxl, fontWeight: '800', color: Colors.textPrimary },
      successSub: {
            marginTop: Spacing.sm,
            fontSize: Fonts.sizes.md + 1,
            lineHeight: 22,
            color: Colors.textSecondary,
            textAlign: 'center',
      },
      successCard: {
            alignSelf: 'stretch',
            marginTop: Spacing.xxl,
            padding: Spacing.xl,
            borderRadius: BorderRadius.xl,
            backgroundColor: Colors.darkBg,
            borderWidth: 1,
            borderColor: Colors.goldDark,
      },
      successBtn: { alignSelf: 'stretch', marginTop: Spacing.xxl },
});