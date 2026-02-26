import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    TextInput,
    Modal,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SpiritualHeader from '../../components/SpiritualHeader';
import { SectionHeader, RatingStars, OmDivider } from '../../components/UIComponents';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────

interface Mandir {
    id: string;
    name: string;
    nameEn: string;
    city: string;
    state: string;
    deity: string;
    type: string;
    timings: string;
    aartis: string[];
    rating: number;
    reviews: number;
    featured: boolean;
    liveStream: boolean;
    emoji: string;
    description: string;
    facilities: string[];
}

// ─── Data ────────────────────────────────────────────────────────

const MANDIRS: Mandir[] = [
    {
        id: '1', name: 'श्री काशी विश्वनाथ मंदिर', nameEn: 'Kashi Vishwanath', city: 'वाराणसी', state: 'UP',
        deity: 'महादेव', type: 'शैव', timings: 'प्रातः 2:30 - रात्रि 11:00', aartis: ['सुबह 5:00', 'दोपहर 12:00', 'संध्या 7:00'],
        rating: 5, reviews: 4523, featured: true, liveStream: true, emoji: '🏛️',
        description: 'काशी विश्वनाथ मंदिर वाराणसी में गंगा नदी के पश्चिमी तट पर स्थित है। यह हिंदुओं के सबसे पवित्र स्थलों में से एक है।',
        facilities: ['🚿 स्नान', '🛍️ प्रसाद', '🚌 परिवहन', '🏠 आवास'],
    },
    {
        id: '2', name: 'श्री ISKCON मंदिर', nameEn: 'ISKCON Temple', city: 'मुंबई', state: 'Maharashtra',
        deity: 'राधा कृष्ण', type: 'वैष्णव', timings: 'प्रातः 4:30 - रात्रि 9:00', aartis: ['मंगला 4:30', 'दर्शन 7:15', 'संध्या 6:30'],
        rating: 5, reviews: 3210, featured: true, liveStream: true, emoji: '🪷',
        description: 'इस्कॉन मंदिर हरे कृष्ण आंदोलन का प्रमुख मंदिर है, जहाँ हर शाम भव्य आरती और भजन होते हैं।',
        facilities: ['🍽️ प्रसाद भोजन', '📚 पुस्तकालय', '🛍️ गीता भवन', '🚌 परिवहन'],
    },
    {
        id: '3', name: 'श्री महाकालेश्वर मंदिर', nameEn: 'Mahakaleshwar', city: 'उज्जैन', state: 'MP',
        deity: 'महाकाल', type: 'शैव', timings: 'प्रातः 3:00 - रात्रि 11:00', aartis: ['भस्म आरती 4:00', 'दोपहर 10:30', 'संध्या 5:00'],
        rating: 5, reviews: 5678, featured: true, liveStream: false, emoji: '🔱',
        description: 'महाकालेश्वर ज्योतिर्लिंग भारत के 12 ज्योतिर्लिंगों में से एक है। यहाँ की भस्म आरती विश्व प्रसिद्ध है।',
        facilities: ['🛕 ज्योतिर्लिंग', '🏊 शिप्रा स्नान', '🍽️ अन्नक्षेत्र', '🚌 परिवहन'],
    },
    {
        id: '4', name: 'श्री राम मंदिर अयोध्या', nameEn: 'Ram Mandir Ayodhya', city: 'अयोध्या', state: 'UP',
        deity: 'श्री राम', type: 'वैष्णव', timings: 'प्रातः 5:00 - रात्रि 10:00', aartis: ['प्रातः 6:00', 'दोपहर 12:00', 'संध्या 7:30'],
        rating: 5, reviews: 8901, featured: true, liveStream: true, emoji: '🚩',
        description: 'भगवान श्री राम का भव्य नवनिर्मित मंदिर, जिसका निर्माण वर्षों की प्रतीक्षा के बाद हुआ। यह सनातन धर्म का गौरव है।',
        facilities: ['🙏 दर्शन', '🛍️ प्रसाद', '🏠 विश्रामालय', '🚌 परिवहन'],
    },
    {
        id: '5', name: 'श्री वैष्णो देवी मंदिर', nameEn: 'Vaishno Devi', city: 'कटरा', state: 'J&K',
        deity: 'माँ वैष्णो देवी', type: 'शाक्त', timings: '24 घंटे', aartis: ['सुबह 5:00', 'शाम 6:00'],
        rating: 5, reviews: 10234, featured: false, liveStream: true, emoji: '🌙',
        description: 'माँ वैष्णो देवी का पवित्र धाम त्रिकूट पर्वत पर स्थित है। हर वर्ष लाखों श्रद्धालु यहाँ दर्शन करने आते हैं।',
        facilities: ['🚡 उड़न खटोला', '🏠 यात्री निवास', '🍽️ भोजनालय', '🏥 चिकित्सा'],
    },
];

const STATES = ['सभी राज्य', 'UP', 'Maharashtra', 'MP', 'J&K', 'Rajasthan', 'Gujarat', 'Tamil Nadu'];
const TYPES = ['सभी', 'शैव', 'वैष्णव', 'शाक्त', 'ISKCON', 'जैन'];

type Props = NativeStackScreenProps<any, 'Mandirs'>;

const MandirsScreen: React.FC<Props> = ({ navigation }) => {
    const [search, setSearch] = useState<string>('');
    const [activeState, setActiveState] = useState<string>('सभी राज्य');
    const [activeType, setActiveType] = useState<string>('सभी');
    const [showLive, setShowLive] = useState<boolean>(false);
    const [selectedMandir, setSelectedMandir] = useState<Mandir | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    const filtered = MANDIRS.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.city.toLowerCase().includes(search.toLowerCase());
        const matchState = activeState === 'सभी राज्य' || m.state === activeState;
        const matchType = activeType === 'सभी' || m.type === activeType;
        const matchLive = !showLive || m.liveStream;
        return matchSearch && matchState && matchType && matchLive;
    });

    const featured = MANDIRS.filter(m => m.featured);

    return (
        <View style={styles.container}>
            <SpiritualHeader title="मंदिर डायरेक्टरी" titleHindi="Mandir Directory" showBack navigation={navigation} />

            {/* Search */}
            <View style={styles.searchBar}>
                <View style={styles.searchInput}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchText}
                        placeholder="मंदिर या शहर खोजें..."
                        placeholderTextColor={Colors.brownLight}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity style={styles.mapBtn} activeOpacity={0.8}>
                    <LinearGradient colors={Colors.gradientSaffron} style={styles.mapBtnGrad}>
                        <Text style={{ color: Colors.white, fontSize: 18 }}>🗺️</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Live toggle */}
            <View style={styles.liveRow}>
                <TouchableOpacity
                    style={[styles.liveToggle, showLive && styles.liveToggleActive]}
                    onPress={() => setShowLive(!showLive)}
                >
                    <View style={[styles.liveDot, showLive && styles.liveDotActive]} />
                    <Text style={[styles.liveText, showLive && styles.liveTextActive]}>🔴 लाइव दर्शन उपलब्ध</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nearbyBtn} activeOpacity={0.8}>
                    <Text style={styles.nearbyText}>📍 नजदीकी मंदिर</Text>
                </TouchableOpacity>
            </View>

            {/* State filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stateScroll}>
                {STATES.map(s => (
                    <TouchableOpacity key={s} onPress={() => setActiveState(s)} activeOpacity={0.8}>
                        <LinearGradient
                            colors={activeState === s ? Colors.gradientSaffron : ['#FFF3E0', '#FFF3E0']}
                            style={styles.stateChip}
                        >
                            <Text style={[styles.stateChipText, activeState === s && styles.stateChipTextActive]}>{s}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Featured */}
                {!search && activeState === 'सभी राज्य' && (
                    <View style={styles.section}>
                        <SectionHeader title="प्रसिद्ध मंदिर" titleHindi="Featured Temples" />
                        <FlatList
                            data={featured}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredList}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.featuredCard}
                                    onPress={() => { setSelectedMandir(item); setShowModal(true); }}
                                    activeOpacity={0.88}
                                >
                                    <LinearGradient colors={Colors.gradientCrimson} style={styles.featuredCardHeader}>
                                        <Text style={{ fontSize: 42 }}>{item.emoji}</Text>
                                        {item.liveStream && (
                                            <View style={styles.liveStreamBadge}>
                                                <View style={styles.liveDot2} />
                                                <Text style={styles.liveStreamText}>LIVE</Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                    <View style={styles.featuredCardBody}>
                                        <Text style={styles.featuredName}>{item.name}</Text>
                                        <Text style={styles.featuredDeity}>🙏 {item.deity}</Text>
                                        <Text style={styles.featuredCity}>📍 {item.city}, {item.state}</Text>
                                        <RatingStars rating={item.rating} count={item.reviews} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                <OmDivider />

                {/* All Mandirs */}
                <View style={[styles.section, styles.sectionPad]}>
                    <SectionHeader title={`सभी मंदिर (${filtered.length})`} titleHindi="All Temples" />
                    {filtered.map(mandir => (
                        <TouchableOpacity
                            key={mandir.id}
                            style={styles.mandirCard}
                            onPress={() => { setSelectedMandir(mandir); setShowModal(true); }}
                            activeOpacity={0.88}
                        >
                            <View style={styles.mandirCardLeft}>
                                <LinearGradient colors={Colors.gradientCrimson} style={styles.mandirEmoji}>
                                    <Text style={{ fontSize: 28 }}>{mandir.emoji}</Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.mandirInfo}>
                                <View style={styles.mandirNameRow}>
                                    <Text style={styles.mandirName}>{mandir.name}</Text>
                                    {mandir.liveStream && (
                                        <View style={styles.miniLiveBadge}>
                                            <Text style={styles.miniLiveText}>🔴</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.mandirDeity}>🙏 {mandir.deity} • {mandir.type}</Text>
                                <Text style={styles.mandirCity}>📍 {mandir.city}, {mandir.state}</Text>
                                <Text style={styles.mandirTimings}>⏰ {mandir.timings}</Text>
                                <RatingStars rating={mandir.rating} count={mandir.reviews} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Mandir Detail Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHandle} />
                        {selectedMandir && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <LinearGradient colors={Colors.gradientHero} style={styles.modalHeader}>
                                    <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
                                        <Text style={{ color: Colors.white, fontSize: 22 }}>×</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 56, textAlign: 'center' }}>{selectedMandir.emoji}</Text>
                                    <Text style={styles.modalTitle}>{selectedMandir.name}</Text>
                                    <Text style={styles.modalSubtitle}>📍 {selectedMandir.city}, {selectedMandir.state}</Text>
                                    {selectedMandir.liveStream && (
                                        <TouchableOpacity style={styles.liveBtn} activeOpacity={0.85}>
                                            <Text style={styles.liveBtnText}>🔴 लाइव दर्शन देखें</Text>
                                        </TouchableOpacity>
                                    )}
                                </LinearGradient>

                                <View style={styles.modalBody}>
                                    <Text style={styles.modalDesc}>{selectedMandir.description}</Text>

                                    <View style={styles.infoGrid}>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>मुख्य देवता</Text>
                                            <Text style={styles.infoValue}>🙏 {selectedMandir.deity}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.infoLabel}>मंदिर प्रकार</Text>
                                            <Text style={styles.infoValue}>{selectedMandir.type}</Text>
                                        </View>
                                        <View style={[styles.infoItem, { flex: 2 }]}>
                                            <Text style={styles.infoLabel}>दर्शन समय</Text>
                                            <Text style={styles.infoValue}>⏰ {selectedMandir.timings}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.modalSectionTitle}>🔔 आरती समय</Text>
                                    <View style={styles.aartiRow}>
                                        {selectedMandir.aartis.map((a, i) => (
                                            <View key={i} style={styles.aartiChip}>
                                                <Text style={styles.aartiText}>{a}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <Text style={styles.modalSectionTitle}>🏛️ सुविधाएं</Text>
                                    <View style={styles.facilityRow}>
                                        {selectedMandir.facilities.map((f, i) => (
                                            <View key={i} style={styles.facilityChip}>
                                                <Text style={styles.facilityText}>{f}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <TouchableOpacity style={styles.directionsBtn} activeOpacity={0.85}>
                                        <LinearGradient colors={Colors.gradientSaffron} style={styles.directionsBtnGrad}>
                                            <Text style={styles.directionsBtnText}>📍 दिशा-निर्देश पाएं</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.cream },

    searchBar: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: 10,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    searchInput: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.cream, borderRadius: Radius.md,
        paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1.5, borderColor: Colors.divider, gap: 8,
    },
    searchIcon: { fontSize: 16 },
    searchText: { flex: 1, fontSize: Typography.base, color: Colors.darkText },
    mapBtn: { borderRadius: Radius.md, overflow: 'hidden' },
    mapBtnGrad: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },

    liveRow: {
        flexDirection: 'row',
        padding: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.white,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    liveToggle: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
        borderWidth: 1.5, borderColor: Colors.divider, backgroundColor: Colors.cream,
    },
    liveToggleActive: { borderColor: Colors.crimson, backgroundColor: '#FCE4EC' },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.divider },
    liveDotActive: { backgroundColor: Colors.crimson },
    liveText: { fontSize: Typography.sm, color: Colors.brownLight, fontWeight: '600' },
    liveTextActive: { color: Colors.crimson },
    nearbyBtn: {
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
        backgroundColor: Colors.saffron + '15', borderWidth: 1.5, borderColor: Colors.saffron,
    },
    nearbyText: { fontSize: Typography.sm, color: Colors.saffron, fontWeight: '600' },

    stateScroll: { paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8 },
    stateChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
    stateChipText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
    stateChipTextActive: { color: Colors.white },

    section: { paddingVertical: Spacing.md },
    sectionPad: { paddingHorizontal: Spacing.md },

    featuredList: { paddingHorizontal: Spacing.md, gap: 12 },
    featuredCard: {
        width: 190, backgroundColor: Colors.white, borderRadius: Radius.lg,
        overflow: 'hidden', borderWidth: 1, borderColor: Colors.divider, ...Shadow.card,
    },
    featuredCardHeader: { height: 100, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    liveStreamBadge: {
        position: 'absolute', top: 8, right: 8, flexDirection: 'row',
        alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
    },
    liveDot2: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.crimson },
    liveStreamText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
    featuredCardBody: { padding: Spacing.sm, gap: 3 },
    featuredName: { fontSize: Typography.sm, fontWeight: '800', color: Colors.darkText },
    featuredDeity: { fontSize: 11, color: Colors.saffron, fontWeight: '600' },
    featuredCity: { fontSize: 11, color: Colors.brownLight },

    mandirCard: {
        flexDirection: 'row', gap: 14, backgroundColor: Colors.white,
        borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 10,
        borderWidth: 1, borderColor: Colors.divider, ...Shadow.card,
    },
    mandirCardLeft: {},
    mandirEmoji: { width: 66, height: 66, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
    mandirInfo: { flex: 1, gap: 3 },
    mandirNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    mandirName: { fontSize: Typography.base, fontWeight: '800', color: Colors.darkText, flex: 1 },
    miniLiveBadge: { paddingHorizontal: 4, paddingVertical: 1, backgroundColor: '#FCE4EC', borderRadius: 4 },
    miniLiveText: { fontSize: 12 },
    mandirDeity: { fontSize: 12, color: Colors.saffron, fontWeight: '600' },
    mandirCity: { fontSize: 12, color: Colors.brownLight },
    mandirTimings: { fontSize: 12, color: Colors.brownMid },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modal: {
        backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl,
        borderTopRightRadius: Radius.xxl, maxHeight: '92%', overflow: 'hidden',
    },
    modalHandle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginTop: 12 },
    modalClose: {
        position: 'absolute', top: 16, right: 16, zIndex: 10,
        width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
    },
    modalHeader: { padding: Spacing.xl, alignItems: 'center', gap: 10 },
    modalTitle: { color: Colors.white, fontSize: Typography.xl, fontWeight: '900', textAlign: 'center' },
    modalSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.sm },
    liveBtn: {
        backgroundColor: Colors.crimson, paddingVertical: 10, paddingHorizontal: 24,
        borderRadius: Radius.full, marginTop: 6,
    },
    liveBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sm },
    modalBody: { padding: Spacing.xl, gap: 14 },
    modalDesc: { fontSize: Typography.base, color: Colors.brownMid, lineHeight: 24 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    infoItem: {
        flex: 1, backgroundColor: Colors.creamDeep, borderRadius: Radius.md,
        padding: Spacing.md, gap: 4, minWidth: 120,
    },
    infoLabel: { fontSize: 11, color: Colors.brownLight, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    infoValue: { fontSize: Typography.sm, color: Colors.darkText, fontWeight: '700' },
    modalSectionTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.darkText, marginTop: 4 },
    aartiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    aartiChip: {
        backgroundColor: Colors.creamDeep, paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.saffron,
    },
    aartiText: { color: Colors.saffron, fontSize: Typography.sm, fontWeight: '600' },
    facilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    facilityChip: {
        backgroundColor: Colors.parchment, paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.divider,
    },
    facilityText: { color: Colors.brownMid, fontSize: Typography.sm, fontWeight: '500' },
    directionsBtn: { borderRadius: Radius.full, overflow: 'hidden', marginTop: 6 },
    directionsBtnGrad: { paddingVertical: 15, alignItems: 'center', borderRadius: Radius.full },
    directionsBtnText: { color: Colors.white, fontSize: Typography.md, fontWeight: '700' },
});

export default MandirsScreen;
