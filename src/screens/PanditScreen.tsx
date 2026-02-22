import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme/colors';
import SpiritualHeader from '../components/SpiritualHeader';
import { SaffronButton, RatingStars } from '../components/UIComponents';

// ─── Types ───────────────────────────────────────────────────────

interface PoojaType {
  id: string;
  name: string;
  nameEn: string;
  duration: string;
  price: number;
  emoji: string;
}

interface Pandit {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  exp: string;
  rating: number;
  reviews: number;
  lang: string[];
  speciality: string;
  avatar: string;
  available: boolean;
}

// ─── Data ────────────────────────────────────────────────────────

const POOJA_TYPES: PoojaType[] = [
  { id: '1', name: 'गृह प्रवेश', nameEn: 'Griha Pravesh', duration: '3-4 घंटे', price: 2100, emoji: '🏠' },
  { id: '2', name: 'सत्यनारायण कथा', nameEn: 'Satyanarayan Katha', duration: '4-5 घंटे', price: 3100, emoji: '📖' },
  { id: '3', name: 'रुद्राभिषेक', nameEn: 'Rudrabhishek', duration: '2-3 घंटे', price: 1500, emoji: '🔱' },
  { id: '4', name: 'विवाह', nameEn: 'Vivah / Wedding', duration: '5-6 घंटे', price: 11000, emoji: '💒' },
  { id: '5', name: 'हवन', nameEn: 'Havan Ceremony', duration: '2-3 घंटे', price: 2500, emoji: '🔥' },
  { id: '6', name: 'मुंडन', nameEn: 'Mundan Ceremony', duration: '1-2 घंटे', price: 1100, emoji: '✂️' },
  { id: '7', name: 'श्राद्ध', nameEn: 'Shradh / Pind Dan', duration: '3-4 घंटे', price: 2100, emoji: '🙏' },
  { id: '8', name: 'नामकरण', nameEn: 'Namkaran Ceremony', duration: '1-2 घंटे', price: 1100, emoji: '👶' },
];

const PANDITS: Pandit[] = [
  { id: '1', name: 'पं. रमेश शास्त्री', nameEn: 'Pt. Ramesh Shastri', city: 'वाराणसी', exp: '25 वर्ष', rating: 5, reviews: 342, lang: ['हिंदी', 'Sanskrit'], speciality: 'वैदिक अनुष्ठान', avatar: 'RS', available: true },
  { id: '2', name: 'पं. गोविंद तिवारी', nameEn: 'Pt. Govind Tiwari', city: 'प्रयागराज', exp: '18 वर्ष', rating: 5, reviews: 218, lang: ['हिंदी', 'Sanskrit', 'English'], speciality: 'गृह शांति', avatar: 'GT', available: true },
  { id: '3', name: 'पं. सुरेश पाठक', nameEn: 'Pt. Suresh Pathak', city: 'उज्जैन', exp: '30 वर्ष', rating: 5, reviews: 489, lang: ['हिंदी', 'Sanskrit'], speciality: 'महाकाल पूजन', avatar: 'SP', available: false },
  { id: '4', name: 'पं. अनिल मिश्रा', nameEn: 'Pt. Anil Mishra', city: 'मुंबई', exp: '15 वर्ष', rating: 4, reviews: 156, lang: ['हिंदी', 'English', 'Marathi'], speciality: 'विवाह अनुष्ठान', avatar: 'AM', available: true },
];

const STEPS = ['पूजा', 'पंडित', 'दिनांक', 'पुष्टि'];
const DATES = ['आज, 22 फरवरी', 'कल, 23 फरवरी', 'सोम, 24 फरवरी', 'मंग, 25 फरवरी', 'बुध, 26 फरवरी', 'गुरु, 27 फरवरी'];
const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

type Props = NativeStackScreenProps<any, 'Pandit'>;

const PanditScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<number>(0);
  const [selectedPooja, setSelectedPooja] = useState<PoojaType | null>(null);
  const [selectedPandit, setSelectedPandit] = useState<Pandit | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingDone, setBookingDone] = useState<boolean>(false);

  const goNext = (): void => {
    if (step < 3) setStep(step + 1);
    else setBookingDone(true);
  };

  const canNext = (): boolean => {
    if (step === 0) return selectedPooja !== null;
    if (step === 1) return selectedPandit !== null;
    if (step === 2) return selectedDate !== null && selectedTime !== null;
    return true;
  };

  if (bookingDone) {
    return (
      <View style={styles.container}>
        <SpiritualHeader title="बुकिंग सफल" showBack navigation={navigation} />
        <ScrollView contentContainerStyle={styles.successScreen}>
          <LinearGradient colors={Colors.gradientSunrise} style={styles.successCircle}>
            <Text style={{ fontSize: 56 }}>🙏</Text>
          </LinearGradient>
          <Text style={styles.successTitle}>बुकिंग सफल हुई!</Text>
          <Text style={styles.successSubtitle}>जय श्री राम</Text>

          <View style={styles.bookingCard}>
            <Text style={styles.bookingCardTitle}>बुकिंग विवरण</Text>
            {([
              { label: 'बुकिंग ID', value: '#BK' + Math.floor(Math.random() * 90000 + 10000) },
              { label: 'पूजा', value: selectedPooja?.name ?? '' },
              { label: 'पंडित जी', value: selectedPandit?.name ?? '' },
              { label: 'दिनांक', value: selectedDate ?? '' },
              { label: 'समय', value: selectedTime ?? '' },
              { label: 'शुल्क', value: '₹' + (selectedPooja?.price ?? 0).toLocaleString() },
            ] as Array<{ label: string; value: string }>).map((item, i) => (
              <View key={i} style={styles.bookingRow}>
                <Text style={styles.bookingLabel}>{item.label}</Text>
                <Text style={styles.bookingValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.successNote}>
            📞 पंडित जी 24 घंटे में संपर्क करेंगे{'\n'}📧 पुष्टि ईमेल भेजी गई
          </Text>
          <SaffronButton title="मुख्य पृष्ठ पर जाएं" onPress={() => navigation.navigate('Home')} style={{ width: '100%' }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SpiritualHeader title="पंडित बुकिंग" titleHindi="Book a Pandit" showBack navigation={navigation} />

      {/* Step Indicator */}
      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <LinearGradient
                colors={
                  step >= i
                    ? step === i
                      ? [Colors.saffron, Colors.gold]
                      : [Colors.success, '#388E3C']
                    : ['#E0E0E0', '#E0E0E0']
                }
                style={styles.stepCircle}
              >
                <Text style={styles.stepCircleText}>{step > i ? '✓' : i + 1}</Text>
              </LinearGradient>
              <Text style={[styles.stepLabel, step === i && styles.stepLabelActive]}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepConnector, step > i && styles.stepConnectorDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── STEP 0: SELECT POOJA ── */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <LinearGradient colors={Colors.gradientCrimson} style={styles.stepHeader}>
              <Text style={styles.stepHeaderEmoji}>🙏</Text>
              <Text style={styles.stepHeaderTitle}>पूजा का प्रकार चुनें</Text>
              <Text style={styles.stepHeaderSub}>Choose Pooja Type</Text>
            </LinearGradient>
            <View style={styles.poojaGrid}>
              {POOJA_TYPES.map(pooja => (
                <TouchableOpacity
                  key={pooja.id}
                  style={[styles.poojaCard, selectedPooja?.id === pooja.id && styles.poojaCardSelected]}
                  onPress={() => setSelectedPooja(pooja)}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 32 }}>{pooja.emoji}</Text>
                  <Text style={[styles.poojaName, selectedPooja?.id === pooja.id && styles.poojaNameSelected]}>
                    {pooja.name}
                  </Text>
                  <Text style={styles.poojaNameEn}>{pooja.nameEn}</Text>
                  <Text style={styles.poojaDuration}>⏱ {pooja.duration}</Text>
                  <Text style={[styles.poojaPrice, selectedPooja?.id === pooja.id && styles.poojaPriceSelected]}>
                    ₹{pooja.price.toLocaleString()}
                  </Text>
                  {selectedPooja?.id === pooja.id && (
                    <View style={styles.poojaCheck}><Text style={{ color: Colors.white, fontSize: 12 }}>✓</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── STEP 1: SELECT PANDIT ── */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <LinearGradient colors={Colors.gradientCrimson} style={styles.stepHeader}>
              <Text style={styles.stepHeaderEmoji}>👳</Text>
              <Text style={styles.stepHeaderTitle}>पंडित जी चुनें</Text>
              <Text style={styles.stepHeaderSub}>Select Your Pandit</Text>
            </LinearGradient>
            {PANDITS.map(pandit => (
              <TouchableOpacity
                key={pandit.id}
                style={[
                  styles.panditCard,
                  selectedPandit?.id === pandit.id && styles.panditCardSelected,
                  !pandit.available && styles.panditCardUnavailable,
                ]}
                onPress={() => pandit.available && setSelectedPandit(pandit)}
                activeOpacity={pandit.available ? 0.85 : 1}
              >
                <LinearGradient
                  colors={pandit.available ? Colors.gradientSaffron : ['#9E9E9E', '#757575']}
                  style={styles.panditAvatar}
                >
                  <Text style={styles.panditAvatarText}>{pandit.avatar}</Text>
                </LinearGradient>
                <View style={styles.panditInfo}>
                  <View style={styles.panditNameRow}>
                    <Text style={styles.panditName}>{pandit.name}</Text>
                    {selectedPandit?.id === pandit.id && <Text style={{ color: Colors.success, fontSize: 18 }}>✓</Text>}
                  </View>
                  <Text style={styles.panditSpec}>🎯 {pandit.speciality}</Text>
                  <Text style={styles.panditCity}>📍 {pandit.city} • {pandit.exp} अनुभव</Text>
                  <View style={styles.panditLangRow}>
                    {pandit.lang.map((l, i) => (
                      <View key={i} style={styles.langChip}>
                        <Text style={styles.langChipText}>{l}</Text>
                      </View>
                    ))}
                  </View>
                  <RatingStars rating={pandit.rating} count={pandit.reviews} />
                </View>
                {!pandit.available && (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>उपलब्ध नहीं</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── STEP 2: DATE & TIME ── */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <LinearGradient colors={Colors.gradientCrimson} style={styles.stepHeader}>
              <Text style={styles.stepHeaderEmoji}>📅</Text>
              <Text style={styles.stepHeaderTitle}>दिनांक और समय चुनें</Text>
              <Text style={styles.stepHeaderSub}>Select Date & Time</Text>
            </LinearGradient>

            <View style={styles.dateSection}>
              <Text style={styles.dateSectionTitle}>📆 दिनांक चुनें</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                {DATES.map(d => (
                  <TouchableOpacity key={d} onPress={() => setSelectedDate(d)} activeOpacity={0.8}>
                    <LinearGradient
                      colors={selectedDate === d ? [Colors.saffron, Colors.gold] : [Colors.white, Colors.creamDeep]}
                      style={styles.dateChip}
                    >
                      <Text style={[styles.dateChipText, selectedDate === d && styles.dateChipTextActive]}>{d}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.dateSectionTitle}>⏰ समय चुनें</Text>
              <View style={styles.timeGrid}>
                {TIMES.map(t => (
                  <TouchableOpacity key={t} onPress={() => setSelectedTime(t)} activeOpacity={0.8} style={{ flex: 1 }}>
                    <LinearGradient
                      colors={selectedTime === t ? [Colors.saffron, Colors.gold] : [Colors.white, Colors.creamDeep]}
                      style={styles.timeChip}
                    >
                      <Text style={[styles.timeChipText, selectedTime === t && styles.timeChipTextActive]}>{t}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.locationSection}>
              <Text style={styles.dateSectionTitle}>📍 पूजा स्थान</Text>
              {['घर पर', 'मंदिर में', 'अन्य स्थान'].map(loc => (
                <TouchableOpacity key={loc} style={styles.locationOption} activeOpacity={0.85}>
                  <View style={styles.locationRadio} />
                  <Text style={styles.locationText}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── STEP 3: REVIEW ── */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <LinearGradient colors={Colors.gradientCrimson} style={styles.stepHeader}>
              <Text style={styles.stepHeaderEmoji}>✅</Text>
              <Text style={styles.stepHeaderTitle}>बुकिंग की समीक्षा</Text>
              <Text style={styles.stepHeaderSub}>Review & Confirm Booking</Text>
            </LinearGradient>

            <View style={styles.reviewCard}>
              {([
                { label: 'पूजा', value: selectedPooja?.name, sub: selectedPooja?.nameEn, icon: selectedPooja?.emoji },
                { label: 'पंडित जी', value: selectedPandit?.name, sub: selectedPandit?.city, icon: '👳' },
                { label: 'दिनांक', value: selectedDate, icon: '📅' },
                { label: 'समय', value: selectedTime, icon: '⏰' },
              ] as Array<{ label: string; value?: string; sub?: string; icon?: string }>).map((item, i) => (
                <View key={i} style={styles.reviewRow}>
                  <Text style={styles.reviewIcon}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewLabel}>{item.label}</Text>
                    <Text style={styles.reviewValue}>{item.value}</Text>
                    {item.sub && <Text style={styles.reviewSub}>{item.sub}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => setStep(i)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>बदलें</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.priceBreakdown}>
              <Text style={styles.priceTitle}>💰 शुल्क विवरण</Text>
              {([
                { label: 'पूजा शुल्क', val: selectedPooja?.price ?? 0 },
                { label: 'सामग्री शुल्क', val: 500 },
                { label: 'प्लेटफॉर्म शुल्क', val: 99 },
              ] as Array<{ label: string; val: number }>).map((p, i) => (
                <View key={i} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{p.label}</Text>
                  <Text style={styles.priceVal}>₹{p.val.toLocaleString()}</Text>
                </View>
              ))}
              <View style={[styles.priceRow, styles.priceTotalRow]}>
                <Text style={styles.priceTotalLabel}>कुल शुल्क</Text>
                <Text style={styles.priceTotalVal}>₹{((selectedPooja?.price ?? 0) + 599).toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.priceTitle}>💳 भुगतान विधि</Text>
              {['UPI / PhonePe / GPay', 'क्रेडिट / डेबिट कार्ड', 'नेट बैंकिंग'].map((m, i) => (
                <TouchableOpacity key={i} style={[styles.payOption, i === 0 && styles.payOptionSelected]}>
                  <View style={[styles.payRadio, i === 0 && styles.payRadioSelected]}>
                    {i === 0 && <View style={styles.payRadioInner} />}
                  </View>
                  <Text style={styles.payOptionText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>← वापस</Text>
          </TouchableOpacity>
        )}
        <SaffronButton
          title={step === 3 ? '🙏 बुकिंग पूर्ण करें' : `आगे बढ़ें (${step + 1}/4) →`}
          onPress={goNext}
          style={{ flex: 1, opacity: canNext() ? 1 : 0.5 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingBottom: 20 },

  stepBar: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepCircleText: { color: Colors.white, fontWeight: '800', fontSize: Typography.sm },
  stepLabel: { fontSize: 10, color: Colors.brownLight, fontWeight: '500' },
  stepLabelActive: { color: Colors.saffron, fontWeight: '700' },
  stepConnector: { flex: 1, height: 2, backgroundColor: Colors.divider, marginBottom: 16 },
  stepConnectorDone: { backgroundColor: Colors.success },

  stepContent: { gap: 16 },
  stepHeader: { padding: Spacing.xl, alignItems: 'center', gap: 8 },
  stepHeaderEmoji: { fontSize: 40 },
  stepHeaderTitle: { color: Colors.goldLight, fontSize: Typography.xl, fontWeight: '900' },
  stepHeaderSub: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.sm },

  poojaGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: 10 },
  poojaCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.divider,
    ...Shadow.card, gap: 4, position: 'relative',
  },
  poojaCardSelected: { borderColor: Colors.saffron, backgroundColor: Colors.creamDeep },
  poojaName: { fontSize: Typography.sm, fontWeight: '800', color: Colors.darkText, textAlign: 'center' },
  poojaNameSelected: { color: Colors.saffron },
  poojaNameEn: { fontSize: 10, color: Colors.brownLight, textAlign: 'center' },
  poojaDuration: { fontSize: 11, color: Colors.brownLight },
  poojaPrice: { fontSize: Typography.base, fontWeight: '900', color: Colors.darkText },
  poojaPriceSelected: { color: Colors.saffron },
  poojaCheck: {
    position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.saffron, alignItems: 'center', justifyContent: 'center',
  },

  panditCard: {
    flexDirection: 'row', gap: 14, backgroundColor: Colors.white,
    marginHorizontal: Spacing.md, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: 10,
    borderWidth: 1.5, borderColor: Colors.divider, ...Shadow.card,
  },
  panditCardSelected: { borderColor: Colors.saffron, backgroundColor: Colors.parchment },
  panditCardUnavailable: { opacity: 0.6 },
  panditAvatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  panditAvatarText: { color: Colors.white, fontWeight: '800', fontSize: 20 },
  panditInfo: { flex: 1, gap: 3 },
  panditNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panditName: { fontSize: Typography.base, fontWeight: '800', color: Colors.darkText },
  panditSpec: { fontSize: 12, color: Colors.saffron, fontWeight: '600' },
  panditCity: { fontSize: 12, color: Colors.brownLight },
  panditLangRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  langChip: {
    backgroundColor: Colors.creamDeep, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
  },
  langChipText: { fontSize: 10, color: Colors.brownMid, fontWeight: '600' },
  unavailableBadge: {
    position: 'absolute', top: 10, right: 10, backgroundColor: '#9E9E9E',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  unavailableText: { color: Colors.white, fontSize: 10, fontWeight: '600' },

  dateSection: { paddingHorizontal: Spacing.md },
  timeSection: { paddingHorizontal: Spacing.md },
  locationSection: { paddingHorizontal: Spacing.md, gap: 8 },
  dateSectionTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.darkText, marginBottom: 10 },
  dateScroll: { gap: 8, paddingBottom: 4 },
  dateChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.lg, ...Shadow.card, minWidth: 120, alignItems: 'center' },
  dateChipText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
  dateChipTextActive: { color: Colors.white, fontWeight: '700' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.md, ...Shadow.card,
    minWidth: 80, alignItems: 'center', marginBottom: 4,
  },
  timeChipText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
  timeChipTextActive: { color: Colors.white },
  locationOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.divider },
  locationRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.saffron },
  locationText: { fontSize: Typography.base, color: Colors.darkText, fontWeight: '500' },

  reviewCard: { marginHorizontal: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.divider, overflow: 'hidden', ...Shadow.card },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  reviewIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  reviewLabel: { fontSize: 11, color: Colors.brownLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewValue: { fontSize: Typography.sm, fontWeight: '700', color: Colors.darkText },
  reviewSub: { fontSize: 11, color: Colors.brownLight },
  editBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.saffron },
  editBtnText: { color: Colors.saffron, fontSize: 11, fontWeight: '600' },

  priceBreakdown: { marginHorizontal: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.divider, ...Shadow.card },
  paymentSection: { marginHorizontal: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.divider, ...Shadow.card },
  priceTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.darkText, marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: Typography.sm, color: Colors.brownMid },
  priceVal: { fontSize: Typography.sm, color: Colors.darkText, fontWeight: '600' },
  priceTotalRow: { borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 8, marginTop: 4 },
  priceTotalLabel: { fontSize: Typography.md, fontWeight: '800', color: Colors.darkText },
  priceTotalVal: { fontSize: Typography.lg, fontWeight: '900', color: Colors.saffron },
  payOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.sm, borderRadius: Radius.md, marginBottom: 8 },
  payOptionSelected: { backgroundColor: Colors.creamDeep },
  payRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.divider, alignItems: 'center', justifyContent: 'center' },
  payRadioSelected: { borderColor: Colors.saffron },
  payRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.saffron },
  payOptionText: { fontSize: Typography.sm, color: Colors.darkText, fontWeight: '500' },

  bottomBar: {
    flexDirection: 'row', gap: 12, padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.md,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  backBtn: {
    paddingVertical: 15, paddingHorizontal: Spacing.lg, borderRadius: Radius.full,
    borderWidth: 2, borderColor: Colors.divider, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: Colors.brownMid, fontSize: Typography.base, fontWeight: '600' },

  successScreen: { padding: Spacing.xl, alignItems: 'center', gap: 16, paddingBottom: 40 },
  successCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', ...Shadow.gold },
  successTitle: { fontSize: Typography.xxl, fontWeight: '900', color: Colors.darkText },
  successSubtitle: { fontSize: Typography.xl, color: Colors.saffron, fontWeight: '700' },
  bookingCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xl, width: '100%', borderWidth: 1, borderColor: Colors.divider, ...Shadow.card },
  bookingCardTitle: { fontSize: Typography.lg, fontWeight: '900', color: Colors.darkText, marginBottom: 14, textAlign: 'center' },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  bookingLabel: { fontSize: Typography.sm, color: Colors.brownLight },
  bookingValue: { fontSize: Typography.sm, fontWeight: '700', color: Colors.darkText },
  successNote: { fontSize: Typography.sm, color: Colors.brownMid, textAlign: 'center', lineHeight: 22, backgroundColor: Colors.creamDeep, padding: Spacing.md, borderRadius: Radius.md, width: '100%' },
});

export default PanditScreen;
