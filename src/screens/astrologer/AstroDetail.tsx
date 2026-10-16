import React, { memo, useMemo, useState } from 'react';
import {
      Alert,
      Image,
      Linking,
      Modal,
      Platform,
      Pressable,
      ScrollView,
      Share,
      StatusBar,
      StyleSheet,
      Text,
      useWindowDimensions,
      View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
// 👇 adjust to your project's paths
import { BorderRadius, Colors, Fonts, Shadow, Spacing, } from '../../theme/index';
import type { AstrologerAvailabilityStatus, IAstrologer, IAstrologerReview, IAstrologerService, } from '../../types/IAstrologer';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../../navigation/AppNavigator';
import ConsultationRequestModal from './CreateConsult';
import { useAuthStore } from '../../store/useAuthore';

/*                                    Types                                   */
type AstrologerProps = NativeStackScreenProps<RootParamList, 'AstroDetail'>;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/*                                  Constants                                 */
const STATUS: Record<AstrologerAvailabilityStatus, { label: string; color: string }> = {
      online: { label: 'Available (Online)', color: Colors.success },
      busy: { label: 'Busy right now', color: Colors.warning },
      offline: { label: 'Currently offline', color: Colors.textMuted },
};

/** Static selling points shown in the booking card. */
const PERKS: ReadonlyArray<string> = [
      '100% confidential and personal discussion',
      'Birth Chart / Kundali Analysis',
      'Practical remedies and clear guidance',
      'Consult by phone call or WhatsApp',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WIDE_MIN_WIDTH = 900;
const MAX_CONTENT_WIDTH = 1100;
const SIDE_COLUMN_WIDTH = 340;

/*                                   Helpers                                  */

const formatINR = (amount: number): string => {
      const [int] = amount.toFixed(2).split('.');
      const last3 = int.slice(-3);
      const rest = int.slice(0, -3);
      const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
      return `₹${grouped}`;
};

const formatDate = (iso: string): string => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const getInitials = (name: string): string =>
      name
            .replace(/^pt\.?\s*/i, '')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(w => w.charAt(0).toUpperCase())
            .join('');

const experienceLabel = (years: number): string =>
      years < 1 ? 'New astrologer' : `${years}+ years experience`;

const openUrl = async (url: string, failMessage: string): Promise<void> => {
      try {
            const supported = await Linking.canOpenURL(url);
            if (!supported) throw new Error('unsupported');
            await Linking.openURL(url);
      } catch {
            Alert.alert('Something went wrong', failMessage);
      }
};

const digitsOnly = (s: string): string => s.replace(/[^\d]/g, '');

/* -------------------------------------------------------------------------- */
/*                               Small components                             */
/* -------------------------------------------------------------------------- */

const Stars = memo(({ rating, size = 14 }: { rating: number; size?: number }) => {
      const rounded = Math.round(rating);
      return (
            <View style={styles.starsRow} accessibilityLabel={`${rating.toFixed(1)} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map(i => (
                        <Ionicons
                              key={i}
                              name={i <= rounded ? 'star' : 'star-outline'}
                              size={size}
                              color={Colors.gold}
                        />
                  ))}
            </View>
      );
});

const Portrait = memo(({ photo, size, radius }: { photo: string; size: number; radius: number }) => {
      const [failed, setFailed] = useState(false);
      return (
            <View style={[styles.portraitFrame, { width: size, height: size, borderRadius: radius }]}>
                  {photo && !failed ? (
                        <Image
                              source={{ uri: photo }}
                              style={{ width: size, height: size }}
                              onError={() => setFailed(true)}
                        />
                  ) : (
                        <Text style={{ fontSize: size * 0.5 }}>🔮</Text>
                  )}
            </View>
      );
});

const Section = ({
      title,
      icon,
      children,
}: {
      title: string;
      icon?: IconName;
      children: React.ReactNode;
}) => (
      <View style={styles.card}>
            <View style={styles.cardTitleRow}>
                  {icon ? (
                        <View style={styles.cardTitleIcon}>
                              <Ionicons name={icon} size={18} color={Colors.goldDark} />
                        </View>
                  ) : null}
                  <Text style={styles.cardTitle}>{title}</Text>
            </View>
            {children}
      </View>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
      <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
      </View>
);

interface GoldButtonProps {
      label: string;
      onPress: () => void;
      icon?: IconName;
      compact?: boolean;
}

const GoldButton = ({ label, onPress, icon = 'sparkles-outline', compact }: GoldButtonProps) => {
      const [g0 = Colors.goldLight, g1 = Colors.gold] = Colors.gradientGold;
      return (
            <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  style={({ pressed }) => [
                        styles.goldWrap,
                        pressed && { transform: [{ scale: 0.98 }], opacity: 0.94 },
                  ]}
            >
                  <LinearGradient
                        colors={[g0, g1, Colors.goldDark] as string[]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.goldBtn, compact && styles.goldBtnCompact]}
                  >
                        <Ionicons name={icon} size={19} color={Colors.textPrimary} />
                        <Text style={styles.goldText}>{label}</Text>
                  </LinearGradient>
            </Pressable>
      );
};

const ContactButton = ({
      icon,
      label,
      color,
      onPress,
}: {
      icon: IconName;
      label: string;
      color: string;
      onPress: () => void;
}) => (
      <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.contactBtn, { borderColor: color }, pressed && { opacity: 0.8 }]}
      >
            <Ionicons name={icon} size={18} color={color} />
            <Text style={[styles.contactText, { color }]}>{label}</Text>
      </Pressable>
);

const GalleryImage = ({ uri, onPress }: { uri: string; onPress: (u: string) => void }) => {
      const [failed, setFailed] = useState(false);
      if (failed) return null;
      return (
            <Pressable
                  onPress={() => onPress(uri)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel="Open photo"
                  style={({ pressed }) => pressed && { opacity: 0.85 }}
            >
                  <Image source={{ uri }} style={styles.galleryImg} onError={() => setFailed(true)} />
            </Pressable>
      );
};

const ServiceCard = ({
      service,
      onBook,
}: {
      service: IAstrologerService;
      onBook: (s: IAstrologerService) => void;
}) => (
      <View style={styles.serviceCard}>
            <View style={styles.serviceTop}>
                  <View style={styles.flex}>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <View style={styles.serviceMeta}>
                              {service.type ? (
                                    <View style={styles.serviceChip}>
                                          <Text style={styles.serviceChipText}>{service.type}</Text>
                                    </View>
                              ) : null}
                              {service.duration ? (
                                    <View style={styles.serviceMetaItem}>
                                          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                                          <Text style={styles.serviceMetaText}>{service.duration}</Text>
                                    </View>
                              ) : null}
                        </View>
                  </View>
                  <Text style={styles.servicePrice}>{formatINR(service.price)}</Text>
            </View>
            {service.description ? <Text style={styles.serviceDesc}>{service.description}</Text> : null}
            <Pressable
                  onPress={() => onBook(service)}
                  accessibilityRole="button"
                  accessibilityLabel={`Book ${service.title}`}
                  style={({ pressed }) => [styles.serviceBtn, pressed && { opacity: 0.85 }]}
            >
                  <Text style={styles.serviceBtnText}>Book this service</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primaryDark} />
            </Pressable>
      </View>
);

const RatingSummary = ({ reviews, average }: { reviews: ReadonlyArray<IAstrologerReview>; average: number }) => {
      const rows = useMemo(
            () =>
                  [5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => Math.round(r.rating) === star).length;
                        return { star, count, pct: reviews.length ? count / reviews.length : 0 };
                  }),
            [reviews],
      );
      return (
            <View style={styles.summary}>
                  <View style={styles.summaryLeft}>
                        <Text style={styles.summaryValue}>{average.toFixed(1)}</Text>
                        <Stars rating={average} size={15} />
                        <Text style={styles.summaryCount}>
                              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                        </Text>
                  </View>
                  <View style={styles.summaryBars}>
                        {rows.map(r => (
                              <View key={r.star} style={styles.barRow}>
                                    <Text style={styles.barStar}>{r.star}</Text>
                                    <View style={styles.barTrack}>
                                          <View style={[styles.barFill, { width: `${Math.round(r.pct * 100)}%` }]} />
                                    </View>
                                    <Text style={styles.barCount}>{r.count}</Text>
                              </View>
                        ))}
                  </View>
            </View>
      );
};

const ReviewCard = ({ review }: { review: IAstrologerReview }) => (
      <View style={styles.review}>
            <View style={styles.reviewHead}>
                  <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{getInitials(review.userName) || '🙏'}</Text>
                  </View>
                  <View style={styles.flex}>
                        <Text style={styles.reviewName} numberOfLines={1}>
                              {review.userName}
                        </Text>
                        <View style={styles.reviewSub}>
                              <Stars rating={review.rating} size={12} />
                              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                        </View>
                  </View>
            </View>
            {review.topic ? (
                  <View style={styles.topicChip}>
                        <Text style={styles.topicText}>{review.topic}</Text>
                  </View>
            ) : null}
            {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
      </View>
);

export default function AstrologerDetailScreen({ navigation, route }: AstrologerProps) {
      const { astrologer } = route.params;
      const a = astrologer;
      const { width } = useWindowDimensions();
      const wide = width >= WIDE_MIN_WIDTH;
      const [lightbox, setLightbox] = useState<string | null>(null);
      const [showModal, setShowModal] = useState(false);
      const { isAuthenticated } = useAuthStore();

      const [dark0 = Colors.darkBg, dark1 = Colors.darkBg] = Colors.gradientDark;
      const status = STATUS[a.availabilityStatus];
      const location = [a.location.city, a.location.state].filter(Boolean).join(', ');
      const reviews = a.reviews ?? [];
      const services = a.services ?? [];
      const gallery = a.photos.filter(p => p && p !== a.photo);
      const phone = a.contact.phone;
      const whatsapp = a.contact.whatsapp || a.contact.phone;
      const email = a.contact.email;


      const onBookConsultation = () => {
            if (isAuthenticated) {
                  setShowModal(true);
            } else {
                  Alert.alert(
                        'For booking consultation',
                        'Please login to continue.',
                        [
                              {
                                    text: 'Cancel',
                                    style: 'cancel',
                              },
                              {
                                    text: 'Login',
                                    onPress: () => navigation.getParent<NativeStackNavigationProp<RootParamList>>().replace('login'),
                              },
                        ]
                  );
            }
      }
      const onBack = () => { navigation.goBack(); }

      // const book = (service?: IAstrologerService): void => onBookConsultation(a, service);

      const handleShare = async (): Promise<void> => {
            try {
                  await Share.share({
                        message: `${a.name}${a.tagline ? ` – ${a.tagline}` : ''}\n${a.specialties.join(', ')}\n${location ? `${location}\n` : ''
                              }Consultation from ${formatINR(a.fee)} per session`,
                  });
            } catch {
                  /* dismissed */
            }
      };

      /* ------------------------------ Content blocks ----------------------------- */
      const intro = (
            <Section title="Introduction and experience" icon="person-outline">
                  <Text style={styles.about}>
                        {a.about.trim() || "This astrologer hasn't added an introduction yet."}
                  </Text>
                  <View style={styles.divider} />
                  <View style={styles.infoGrid}>
                        <InfoItem label="CONSULTING LANGUAGES" value={a.languages.join(', ') || '—'} />
                        <InfoItem label="EDUCATION/DEGREE" value={a.qualifications.trim() || '—'} />
                        <InfoItem label="CONSULTATIONS DONE" value={String(a.totalConsultations)} />
                        {a.feePerMinute > 0 ? (
                              <InfoItem label="RATE PER MINUTE" value={`${formatINR(a.feePerMinute)} / min`} />
                        ) : null}
                  </View>
            </Section>
      );

      const booking = (
            <View style={[styles.card, styles.bookCard]}>
                  <Text style={styles.bookEyebrow}>BOOK A LIVE CONSULTATION</Text>
                  <View style={styles.bookPriceRow}>
                        <Text style={styles.bookPrice}>{formatINR(a.fee)}</Text>
                        <Text style={styles.bookUnit}> / Session</Text>
                  </View>
                  <Text style={styles.bookSub}>Personal consultation by phone call or WhatsApp</Text>

                  <View style={styles.divider} />

                  {PERKS.map(p => (
                        <View key={p} style={styles.perkRow}>
                              <View style={styles.perkIcon}>
                                    <Ionicons name="checkmark" size={15} color={Colors.primaryDark} />
                              </View>
                              <Text style={styles.perkText}>{p}</Text>
                        </View>
                  ))}

                  <View style={styles.bookActions}>
                        <GoldButton label="Book a consultation" onPress={() => onBookConsultation()} />
                        <View style={styles.contactRow}>
                              {phone ? (
                                    <ContactButton
                                          icon="call-outline"
                                          label="Call"
                                          color={Colors.tulsi}
                                          onPress={() => void openUrl(`tel:${phone}`, 'Could not open the phone dialer.')}
                                    />
                              ) : null}
                              {whatsapp ? (
                                    <ContactButton
                                          icon="logo-whatsapp"
                                          label="WhatsApp"
                                          color={Colors.tulsi}
                                          onPress={() =>
                                                void openUrl(`https://wa.me/${digitsOnly(whatsapp)}`, 'Could not open WhatsApp.')
                                          }
                                    />
                              ) : null}
                              {email ? (
                                    <ContactButton
                                          icon="mail-outline"
                                          label="Email"
                                          color={Colors.secondary}
                                          onPress={() => void openUrl(`mailto:${email}`, 'Could not open your email app.')}
                                    />
                              ) : null}
                        </View>
                  </View>
            </View>
      );

      const servicesBlock =
            services.length > 0 ? (
                  <Section title="Services" icon="sparkles-outline">
                        <View style={styles.serviceList}>
                              {services.map(s => (
                                    <ServiceCard key={s._id} service={s} onBook={onBookConsultation} />
                              ))}
                        </View>
                  </Section>
            ) : null;

      const galleryBlock =
            gallery.length > 0 ? (
                  <Section title="Photos" icon="images-outline">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                              {gallery.map(uri => (
                                    <GalleryImage key={uri} uri={uri} onPress={setLightbox} />
                              ))}
                        </ScrollView>
                  </Section>
            ) : null;

      const reviewsBlock = (
            <Section title="Reviews" icon="chatbubble-ellipses-outline">
                  {reviews.length === 0 ? (
                        <View style={styles.noReviews}>
                              <Text style={styles.noReviewsEmoji}>🌟</Text>
                              <Text style={styles.noReviewsTitle}>No reviews yet</Text>
                              <Text style={styles.noReviewsSub}>
                                    Reviews from people who consult {a.name} will appear here.
                              </Text>
                        </View>
                  ) : (
                        <>
                              <RatingSummary reviews={reviews} average={a.averageRating} />
                              <View style={styles.divider} />
                              {reviews.map((r, i) => (
                                    <View key={r._id}>
                                          {i > 0 ? <View style={styles.reviewRule} /> : null}
                                          <ReviewCard review={r} />
                                    </View>
                              ))}
                        </>
                  )}
            </Section>
      );

      return (
            <View style={styles.root}>
                  <StatusBar barStyle="light-content" backgroundColor={Colors.darkBg} />

                  <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scroll, !wide && styles.scrollWithBar]}
                  >
                        {/* -------------------------------- Hero --------------------------------- */}
                        <LinearGradient
                              colors={[dark0, dark1, Colors.background] as string[]}
                              locations={[0, 0.5, 1]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={styles.hero}
                        >
                              <View style={styles.centerWrap}>
                                    <View style={styles.navRow}>
                                          <Pressable
                                                onPress={onBack}
                                                hitSlop={10}
                                                accessibilityRole="button"
                                                accessibilityLabel="Back to all astrologers"
                                                style={({ pressed }) => [styles.backLink, pressed && { opacity: 0.7 }]}
                                          >
                                                <Ionicons name="arrow-back" size={18} color={Colors.gold} />
                                                <Text style={styles.backText} numberOfLines={1}>
                                                      All Astrologers & Tarot Readers
                                                </Text>
                                          </Pressable>
                                          <Pressable
                                                onPress={() => void handleShare()}
                                                hitSlop={10}
                                                accessibilityRole="button"
                                                accessibilityLabel="Share this astrologer"
                                                style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
                                          >
                                                <Ionicons name="share-outline" size={19} color={Colors.goldLight} />
                                          </Pressable>
                                    </View>

                                    <View style={styles.glass}>
                                          <View style={[styles.heroRow, wide && styles.heroRowWide]}>
                                                <View style={styles.portraitWrap}>
                                                      <Portrait photo={a.photo} size={wide ? 168 : 104} radius={wide ? 28 : 22} />
                                                      <View style={styles.statusRing}>
                                                            <View style={[styles.statusDotLarge, { backgroundColor: status.color }]} />
                                                      </View>
                                                </View>

                                                <View style={styles.heroInfo}>
                                                      <View style={styles.pillRow}>
                                                            <View style={styles.statusPill}>
                                                                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                                                                  <Text style={styles.statusText}>{status.label}</Text>
                                                            </View>
                                                            {a.isVerified ? (
                                                                  <View style={styles.certified}>
                                                                        <Ionicons name="shield-checkmark" size={13} color={Colors.textLight} />
                                                                        <Text style={styles.certifiedText}>Certified</Text>
                                                                  </View>
                                                            ) : null}
                                                      </View>

                                                      <Text style={[styles.name, wide && styles.nameWide]} numberOfLines={2}>
                                                            {a.name}
                                                      </Text>
                                                      {a.tagline ? <Text style={styles.tagline}>{a.tagline}</Text> : null}
                                                </View>

                                                {wide ? (
                                                      <View style={styles.feeBox}>
                                                            <Text style={styles.feeLabel}>CONSULTANCY FEE</Text>
                                                            <Text style={styles.feeValue}>{formatINR(a.fee)}</Text>
                                                            <Text style={styles.feeUnit}>/ 30 min session</Text>
                                                            <View style={{ marginTop: Spacing.lg }}>
                                                                  <GoldButton label="Book a consultation" onPress={() => onBookConsultation()} />
                                                            </View>
                                                      </View>
                                                ) : null}
                                          </View>

                                          <View style={styles.metaRow}>
                                                {location ? (
                                                      <View style={styles.metaItem}>
                                                            <Ionicons name="location-outline" size={17} color={Colors.gold} />
                                                            <Text style={styles.metaText}>{location}</Text>
                                                      </View>
                                                ) : null}
                                                <View style={styles.metaItem}>
                                                      <Ionicons name="ribbon-outline" size={17} color={Colors.gold} />
                                                      <Text style={styles.metaText}>{experienceLabel(a.experience)}</Text>
                                                </View>
                                                <View style={styles.metaItem}>
                                                      <Ionicons name="star" size={17} color={Colors.gold} />
                                                      <Text style={styles.metaRating}>{a.averageRating.toFixed(1)}</Text>
                                                      <Text style={styles.metaText}>
                                                            ( {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} )
                                                      </Text>
                                                </View>
                                          </View>

                                          {a.specialties.length > 0 ? (
                                                <View style={styles.tagRow}>
                                                      {a.specialties.map(s => (
                                                            <View key={s} style={styles.tag}>
                                                                  <Text style={styles.tagText}>{s}</Text>
                                                            </View>
                                                      ))}
                                                </View>
                                          ) : null}
                                    </View>
                              </View>
                        </LinearGradient>

                        {/* -------------------------------- Body --------------------------------- */}
                        <View style={[styles.centerWrap, styles.body]}>
                              {wide ? (
                                    <View style={styles.columns}>
                                          <View style={styles.mainColumn}>
                                                {intro}
                                                {servicesBlock}
                                                {galleryBlock}
                                                {reviewsBlock}
                                          </View>
                                          <View style={styles.sideColumn}>{booking}</View>
                                    </View>
                              ) : (
                                    <View style={styles.stack}>
                                          {intro}
                                          {booking}
                                          {servicesBlock}
                                          {galleryBlock}
                                          {reviewsBlock}
                                    </View>
                              )}
                        </View>
                  </ScrollView>

                  {/* ----------------------------- Sticky booking bar -------------------------- */}
                  {!wide ? (
                        <View style={styles.bar}>
                              <View>
                                    <Text style={styles.barLabel}>CONSULTANCY FEE</Text>
                                    <View style={styles.barPriceRow}>
                                          <Text style={styles.barPrice}>{formatINR(a.fee)}</Text>
                                          <Text style={styles.barUnit}> / 30 min</Text>
                                    </View>
                              </View>
                              <View style={styles.flex}>
                                    <GoldButton label="Book a consultation" onPress={() => onBookConsultation()} compact />
                              </View>
                        </View>
                  ) : null}

                  {/* -------------------------------- Lightbox --------------------------------- */}
                  <Modal
                        visible={lightbox !== null}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setLightbox(null)}
                        statusBarTranslucent
                  >
                        <View style={styles.lightbox}>
                              <Pressable
                                    style={StyleSheet.absoluteFill}
                                    onPress={() => setLightbox(null)}
                                    accessibilityLabel="Close photo"
                              />
                              {lightbox ? (
                                    <Image source={{ uri: lightbox }} style={styles.lightboxImg} resizeMode="contain" />
                              ) : null}
                              <Pressable
                                    onPress={() => setLightbox(null)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close photo"
                                    style={styles.lightboxClose}
                              >
                                    <Ionicons name="close" size={24} color={Colors.textLight} />
                              </Pressable>
                        </View>
                  </Modal>
                  <ConsultationRequestModal
                        visible={showModal}
                        onClose={() => setShowModal(false)}
                        astrologer={astrologer}
                  />
            </View>
      );
}

const styles = StyleSheet.create({
      root: { flex: 1, backgroundColor: Colors.background },
      flex: { flex: 1 },
      scroll: { paddingBottom: Spacing.section + Spacing.xxl },
      scrollWithBar: { paddingBottom: 130 },
      centerWrap: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },

      /* hero */
      hero: {
            paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.section + Spacing.xl,
      },
      navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
      backLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
      backText: { flexShrink: 1, fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.gold },
      shareBtn: {
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
      },
      glass: {
            padding: Spacing.xl,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: 'rgba(212,175,55,0.32)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            ...Shadow.lg,
      },
      heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
      heroRowWide: { alignItems: 'flex-start', gap: Spacing.xxl },
      portraitWrap: { alignSelf: 'flex-start' },
      portraitFrame: {
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: Colors.goldDark,
            backgroundColor: Colors.darkBg,
      },
      statusRing: {
            position: 'absolute',
            right: -4,
            bottom: -4,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.darkBg,
      },
      statusDotLarge: { width: 16, height: 16, borderRadius: 8 },
      heroInfo: { flex: 1 },
      pillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
      statusPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
            borderRadius: BorderRadius.full,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.22)',
            backgroundColor: 'rgba(0,0,0,0.3)',
      },
      statusDot: { width: 10, height: 10, borderRadius: 5 },
      statusText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.goldLight },
      certified: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.tulsi,
      },
      certifiedText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.textLight },
      name: { marginTop: Spacing.sm, fontSize: Fonts.sizes.xxxl, lineHeight: 34, fontWeight: '800', color: Colors.textLight },
      nameWide: { marginTop: Spacing.md, fontSize: 48, lineHeight: 54 },
      tagline: { marginTop: Spacing.xs + 2, fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.goldLight },
      metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, marginTop: Spacing.xl },
      metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
      metaText: { fontSize: Fonts.sizes.md, color: 'rgba(255,255,255,0.85)' },
      metaRating: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.textLight },
      tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
      tag: {
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
            borderRadius: BorderRadius.md,
            borderWidth: 1,
            borderColor: 'rgba(212,175,55,0.45)',
            backgroundColor: 'rgba(212,175,55,0.18)',
      },
      tagText: { fontSize: Fonts.sizes.sm + 1, fontWeight: '800', color: Colors.goldLight },

      feeBox: {
            width: 250,
            alignItems: 'center',
            padding: Spacing.xl,
            borderRadius: BorderRadius.lg,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.18)',
            backgroundColor: 'rgba(255,255,255,0.08)',
      },
      feeLabel: { fontSize: Fonts.sizes.xs + 1, fontWeight: '800', letterSpacing: 0.8, color: Colors.goldLight },
      feeValue: { marginTop: Spacing.xs, fontSize: 40, lineHeight: 46, fontWeight: '800', color: Colors.textLight },
      feeUnit: { fontSize: Fonts.sizes.sm + 1, color: 'rgba(255,255,255,0.75)' },

      /* gold button */
      goldWrap: { borderRadius: BorderRadius.lg, ...Shadow.md, shadowColor: Colors.gold },
      goldBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.lg,
            borderRadius: BorderRadius.lg,
      },
      goldBtnCompact: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg },
      goldText: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },

      /* body */
      body: { paddingHorizontal: Spacing.lg, marginTop: -Spacing.xl },
      stack: { gap: Spacing.lg },
      columns: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xl },
      mainColumn: { flex: 1, gap: Spacing.lg },
      sideColumn: { width: SIDE_COLUMN_WIDTH },

      card: {
            padding: Spacing.xl,
            borderRadius: BorderRadius.xl,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.cardBg,
            ...Shadow.sm,
      },
      cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
      cardTitleIcon: {
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      cardTitle: { flexShrink: 1, fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.textPrimary },
      about: { fontSize: Fonts.sizes.lg, lineHeight: 25, color: Colors.textSecondary },
      divider: { height: 1, marginVertical: Spacing.xl, backgroundColor: Colors.saffronBg },
      infoGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.xl, columnGap: Spacing.xl },
      infoItem: { flexGrow: 1, flexBasis: '45%' },
      infoLabel: { fontSize: Fonts.sizes.sm, fontWeight: '800', letterSpacing: 0.8, color: Colors.textMuted },
      infoValue: { marginTop: Spacing.xs + 1, fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },

      /* booking card */
      bookCard: { alignItems: 'stretch' },
      bookEyebrow: {
            textAlign: 'center',
            fontSize: Fonts.sizes.sm + 1,
            fontWeight: '800',
            letterSpacing: 1.6,
            color: Colors.primaryDark,
      },
      bookPriceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: Spacing.md },
      bookPrice: { fontSize: 42, lineHeight: 48, fontWeight: '800', color: Colors.textPrimary },
      bookUnit: { fontSize: Fonts.sizes.lg, fontWeight: '700', color: Colors.textMuted },
      bookSub: { marginTop: Spacing.xs, textAlign: 'center', fontSize: Fonts.sizes.md, color: Colors.textSecondary },
      perkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
      perkIcon: {
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
      },
      perkText: { flex: 1, fontSize: Fonts.sizes.md, color: Colors.textSecondary },
      bookActions: { marginTop: Spacing.lg, gap: Spacing.md },
      contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
      contactBtn: {
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.md,
            borderRadius: BorderRadius.lg,
            borderWidth: 1.5,
            backgroundColor: Colors.cardBg,
      },
      contactText: { fontSize: Fonts.sizes.md, fontWeight: '800' },

      /* services */
      serviceList: { gap: Spacing.md },
      serviceCard: {
            padding: Spacing.lg,
            borderRadius: BorderRadius.lg,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: '#FFFCF8',
      },
      serviceTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
      serviceTitle: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
      serviceMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
      serviceChip: {
            paddingHorizontal: Spacing.md,
            paddingVertical: 3,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.goldLight,
      },
      serviceChipText: { fontSize: Fonts.sizes.sm, fontWeight: '800', color: Colors.goldDark },
      serviceMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
      serviceMetaText: { fontSize: Fonts.sizes.sm + 1, color: Colors.textMuted },
      servicePrice: { fontSize: Fonts.sizes.xl + 2, fontWeight: '800', color: Colors.primaryDark },
      serviceDesc: { marginTop: Spacing.md, fontSize: Fonts.sizes.md, lineHeight: 21, color: Colors.textSecondary },
      serviceBtn: {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: Spacing.md,
      },
      serviceBtnText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.primaryDark },

      /* gallery */
      galleryRow: { gap: Spacing.md },
      galleryImg: {
            width: 150,
            height: 150,
            borderRadius: BorderRadius.lg,
            borderWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.saffronBg,
      },

      /* reviews */
      starsRow: { flexDirection: 'row', gap: 2 },
      summary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
      summaryLeft: { alignItems: 'center', gap: 4 },
      summaryValue: { fontSize: 44, lineHeight: 50, fontWeight: '800', color: Colors.textPrimary },
      summaryCount: { fontSize: Fonts.sizes.sm + 1, color: Colors.textMuted },
      summaryBars: { flex: 1, gap: 6 },
      barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
      barStar: { width: 12, fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.textSecondary },
      barTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: Colors.saffronBg, overflow: 'hidden' },
      barFill: { height: 7, borderRadius: 4, backgroundColor: Colors.gold },
      barCount: { width: 22, textAlign: 'right', fontSize: Fonts.sizes.sm, color: Colors.textMuted },
      review: { gap: Spacing.sm },
      reviewRule: { height: 1, marginVertical: Spacing.lg, backgroundColor: Colors.saffronBg },
      reviewHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
      reviewAvatar: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.saffronBg,
            borderWidth: 1,
            borderColor: Colors.border,
      },
      reviewAvatarText: { fontSize: Fonts.sizes.md, fontWeight: '800', color: Colors.primaryDark },
      reviewName: { fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
      reviewSub: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
      reviewDate: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
      topicChip: {
            alignSelf: 'flex-start',
            paddingHorizontal: Spacing.md,
            paddingVertical: 3,
            borderRadius: BorderRadius.sm,
            backgroundColor: '#E8F0FE',
      },
      topicText: { fontSize: Fonts.sizes.sm, fontWeight: '700', color: Colors.info },
      reviewComment: { fontSize: Fonts.sizes.md + 1, lineHeight: 22, color: Colors.textSecondary },
      noReviews: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
      noReviewsEmoji: { fontSize: 36 },
      noReviewsTitle: { marginTop: Spacing.xs, fontSize: Fonts.sizes.lg, fontWeight: '800', color: Colors.textPrimary },
      noReviewsSub: { fontSize: Fonts.sizes.md, color: Colors.textMuted, textAlign: 'center' },

      /* sticky bar */
      bar: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.lg,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            paddingBottom: Platform.OS === 'ios' ? 30 : Spacing.lg,
            backgroundColor: Colors.cardBg,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            ...Shadow.lg,
      },
      barLabel: { fontSize: Fonts.sizes.xs, fontWeight: '800', letterSpacing: 0.8, color: Colors.textMuted },
      barPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
      barPrice: { fontSize: Fonts.sizes.xxl, fontWeight: '800', color: Colors.primaryDark },
      barUnit: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },

      /* lightbox */
      lightbox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(26,10,0,0.92)' },
      lightboxImg: { width: '100%', height: '80%' },
      lightboxClose: {
            position: 'absolute',
            top: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 56) + Spacing.sm,
            right: Spacing.lg,
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.16)',
      },
});