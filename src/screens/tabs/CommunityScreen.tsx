import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ListRenderItemInfo,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SpiritualHeader from '../../components/SpiritualHeader';
import { SaffronButton } from '../../components/UIComponents';
import { Colors, SacredSymbols, Spacing, Typography, Radius, Shadow } from '../../theme/colors';
// ─── Types ───────────────────────────────────────────────────────

interface Post {
  id: string;
  user: string;
  city: string;
  avatar: string;
  time: string;
  type: string;
  content: string;
  emoji: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  verified: boolean;
}

interface PostType {
  key: string;
  label: string;
  icon: string;
}

// ─── Data ────────────────────────────────────────────────────────

const POSTS: Post[] = [
  {
    id: '1', user: 'राम भक्त राजेश', city: 'अयोध्या', avatar: 'RR', time: '2 घंटे पहले',
    type: 'temple', content: 'आज अयोध्या में श्री राम मंदिर में भव्य दर्शन हुए। जय श्री राम! 🚩 हर भक्त को एक बार जरूर आना चाहिए।',
    emoji: '🛕', likes: 432, comments: 87, shares: 34, liked: false, verified: true,
  },
  {
    id: '2', user: 'कृष्ण प्रेमी प्रिया', city: 'वृंदावन', avatar: 'KP', time: '4 घंटे पहले',
    type: 'bhajan', content: 'आज वृंदावन में भव्य भजन संध्या हुई। राधे-राधे! 🎵 आप सभी को आमंत्रित करते हैं। जय श्री कृष्ण!',
    emoji: '🎵', likes: 289, comments: 54, shares: 21, liked: true, verified: false,
  },
  {
    id: '3', user: 'शिव भक्त अनिल', city: 'उज्जैन', avatar: 'SA', time: '6 घंटे पहले',
    type: 'katha', content: 'महाकालेश्वर में आज की भस्म आरती अद्भुत थी। हर हर महादेव! 🔱 कल की आरती के लिए जगह बुक करने के लिए नीचे कमेंट करें।',
    emoji: '🔱', likes: 654, comments: 132, shares: 67, liked: false, verified: true,
  },
  {
    id: '4', user: 'सेवा ट्रस्ट मुंबई', city: 'मुंबई', avatar: 'ST', time: '8 घंटे पहले',
    type: 'bhandara', content: 'आज हमारे मोहल्ले में भव्य भंडारा है! सभी का हार्दिक स्वागत है। 🍛 प्रसाद वितरण दोपहर 12 बजे से शुरू होगा। जय माता दी!',
    emoji: '🍛', likes: 876, comments: 201, shares: 143, liked: false, verified: false,
  },
  {
    id: '5', user: 'गुरु भक्त सुरेश', city: 'हरिद्वार', avatar: 'GS', time: '12 घंटे पहले',
    type: 'pooja', content: 'हरिद्वार गंगा घाट पर आज संध्या आरती में शामिल हुए। जीवन धन्य हो गया। 🪔 हर हर गंगे!',
    emoji: '🪔', likes: 345, comments: 67, shares: 28, liked: true, verified: false,
  },
];

const POST_TYPES: PostType[] = [
  { key: 'all', label: 'सभी', icon: '🏠' },
  { key: 'temple', label: 'मंदिर', icon: '🛕' },
  { key: 'bhajan', label: 'भजन', icon: '🎵' },
  { key: 'katha', label: 'कथा', icon: '📖' },
  { key: 'bhandara', label: 'भंडारा', icon: '🍛' },
  { key: 'pooja', label: 'पूजा', icon: '🪔' },
];

const TYPE_COLORS: Record<string, string> = {
  temple: Colors.crimson,
  bhajan: '#6A1B9A',
  katha: Colors.saffron,
  bhandara: Colors.success,
  pooja: '#F57F17',
};

type Props = NativeStackScreenProps<any, 'Community'>;

const CommunityScreen: React.FC<Props> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [showCompose, setShowCompose] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<string>('');
  const [newPostType, setNewPostType] = useState<string>('temple');

  const filtered = activeFilter === 'all' ? posts : posts.filter(p => p.type === activeFilter);

  const handleLike = (id: string): void => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handlePost = (): void => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      user: 'आप', city: 'आपका शहर', avatar: 'आ', time: 'अभी',
      type: newPostType, content: newPost,
      emoji: POST_TYPES.find(t => t.key === newPostType)?.icon ?? '🙏',
      likes: 0, comments: 0, shares: 0, liked: false, verified: false,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setShowCompose(false);
  };

  const renderPost = ({ item }: ListRenderItemInfo<Post>) => {
    const typeColor = TYPE_COLORS[item.type] ?? Colors.saffron;
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <LinearGradient
            colors={[typeColor + 'CC', typeColor]}
            style={styles.postAvatar}
          >
            <Text style={styles.postAvatarText}>{item.avatar}</Text>
          </LinearGradient>
          <View style={styles.postUserInfo}>
            <View style={styles.postUserRow}>
              <Text style={styles.postUserName}>{item.user}</Text>
              {item.verified && <Text style={styles.verifiedIcon}>✓</Text>}
            </View>
            <Text style={styles.postMeta}>📍 {item.city} • {item.time}</Text>
          </View>
          <View style={[styles.postTypeBadge, { backgroundColor: typeColor + '20' }]}>
            <Text style={styles.postTypeIcon}>{item.emoji}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postDivider} />
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.postAction} onPress={() => handleLike(item.id)}>
            <Text style={styles.postActionIcon}>{item.liked ? '🙏' : '🤲'}</Text>
            <Text style={[styles.postActionText, item.liked && styles.postActionTextLiked]}>
              {item.likes.toLocaleString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Text style={styles.postActionIcon}>💬</Text>
            <Text style={styles.postActionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Text style={styles.postActionIcon}>↗</Text>
            <Text style={styles.postActionText}>{item.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postActionRight}>
            <Text style={styles.postActionText}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SpiritualHeader title="समुदाय फीड" titleHindi="Community Feed" showBack navigation={navigation} showSearch />

      {/* Compose Bar */}
      <TouchableOpacity style={styles.composeBar} onPress={() => setShowCompose(true)} activeOpacity={0.85}>
        <LinearGradient colors={Colors.gradientSaffron} style={styles.composeAvatar}>
          <Text style={styles.composeAvatarText}>{SacredSymbols.pray}</Text>
        </LinearGradient>
        <Text style={styles.composePlaceholder}>अपना अनुभव साझा करें... जय श्री राम!</Text>
        <TouchableOpacity style={styles.composeBtn} onPress={() => setShowCompose(true)}>
          <Text style={styles.composeBtnText}>✍️ लिखें</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterBar}
      >
        {POST_TYPES.map(type => (
          <TouchableOpacity key={type.key} onPress={() => setActiveFilter(type.key)} activeOpacity={0.8}>
            <LinearGradient
              colors={activeFilter === type.key ? Colors.gradientSaffron : ['#FFF3E0', '#FFF3E0']}
              style={styles.filterChip}
            >
              <Text style={styles.filterChipIcon}>{type.icon}</Text>
              <Text style={[styles.filterChipText, activeFilter === type.key && styles.filterChipTextActive]}>
                {type.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Marquee */}
      <LinearGradient colors={[Colors.saffronDark, Colors.saffron]} style={styles.marquee}>
        <Text style={styles.marqueeIcon}>📢</Text>
        <Text style={styles.marqueeText} numberOfLines={1}>
          🚩 महाकुंभ 2025 प्रयागराज • 🛕 राम मंदिर विशेष आरती • 🎤 धीरेन्द्र शास्त्री की कथा उज्जैन में
        </Text>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 52 }}>🔍</Text>
            <Text style={styles.emptyTitle}>कोई पोस्ट नहीं मिली</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCompose(true)} activeOpacity={0.85}>
        <LinearGradient colors={Colors.gradientSaffron} style={styles.fabGrad}>
          <Text style={styles.fabIcon}>✍️</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Compose Modal */}
      <Modal visible={showCompose} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.composeModal}>
            <View style={styles.composeModalHandle} />
            <Text style={styles.composeModalTitle}>✍️ नई पोस्ट लिखें</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.composeTypeScroll}>
              {POST_TYPES.filter(t => t.key !== 'all').map(type => (
                <TouchableOpacity key={type.key} onPress={() => setNewPostType(type.key)} activeOpacity={0.8}>
                  <LinearGradient
                    colors={newPostType === type.key ? Colors.gradientSaffron : ['#FFF3E0', '#FFF3E0']}
                    style={styles.composeTypeChip}
                  >
                    <Text>{type.icon}</Text>
                    <Text style={[styles.composeTypeText, newPostType === type.key && styles.composeTypeTextActive]}>
                      {type.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.composeInput}
              placeholder="जय श्री राम! अपना अनुभव, कथा, भजन या घोषणा यहाँ लिखें..."
              placeholderTextColor={Colors.brownLight}
              multiline
              numberOfLines={6}
              value={newPost}
              onChangeText={setNewPost}
              textAlignVertical="top"
            />

            <View style={styles.composeAttachRow}>
              {['📷 फोटो', '🎥 वीडियो', '📍 स्थान'].map((a, i) => (
                <TouchableOpacity key={i} style={styles.attachBtn}>
                  <Text style={styles.attachBtnText}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.composeActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCompose(false)}>
                <Text style={styles.cancelBtnText}>रद्द करें</Text>
              </TouchableOpacity>
              <SaffronButton title="पोस्ट करें 🚩" onPress={handlePost} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  composeBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  composeAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  composeAvatarText: { fontSize: 20 },
  composePlaceholder: { flex: 1, fontSize: Typography.sm, color: Colors.brownLight, fontStyle: 'italic' },
  composeBtn: {
    backgroundColor: Colors.creamDeep, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.saffron,
  },
  composeBtnText: { color: Colors.saffron, fontSize: Typography.xs, fontWeight: '700' },

  filterBar: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  filterScroll: { paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  filterChipIcon: { fontSize: 14 },
  filterChipText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
  filterChipTextActive: { color: Colors.white },

  marquee: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: Spacing.md, gap: 8 },
  marqueeIcon: { fontSize: 16 },
  marqueeText: { flex: 1, color: Colors.white, fontSize: Typography.xs, fontWeight: '600' },

  list: { padding: Spacing.md, paddingBottom: 80, gap: 12 },

  postCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.divider, ...Shadow.card,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md },
  postAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  postUserInfo: { flex: 1 },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postUserName: { fontSize: Typography.base, fontWeight: '800', color: Colors.darkText },
  verifiedIcon: {
    backgroundColor: Colors.info, color: Colors.white, fontSize: 9, fontWeight: '800',
    width: 16, height: 16, borderRadius: 8, textAlign: 'center', lineHeight: 16,
    overflow: 'hidden',
  },
  postMeta: { fontSize: 11, color: Colors.brownLight, marginTop: 2 },
  postTypeBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  postTypeIcon: { fontSize: 18 },
  postContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, fontSize: Typography.sm, color: Colors.brownMid, lineHeight: 22 },
  postDivider: { height: 1, backgroundColor: Colors.divider },
  postActions: { flexDirection: 'row', padding: Spacing.sm, paddingHorizontal: Spacing.md },
  postAction: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5 },
  postActionRight: { paddingVertical: 5, paddingHorizontal: 10 },
  postActionIcon: { fontSize: 18 },
  postActionText: { fontSize: Typography.sm, color: Colors.brownLight, fontWeight: '600' },
  postActionTextLiked: { color: Colors.saffron },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: '700', color: Colors.brownMid },

  fab: { position: 'absolute', bottom: 24, right: 20, borderRadius: Radius.full, ...Shadow.gold },
  fabGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  composeModal: {
    backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl, padding: Spacing.xl, paddingBottom: 40, gap: 14,
  },
  composeModalHandle: { width: 40, height: 4, backgroundColor: Colors.divider, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  composeModalTitle: { fontSize: Typography.xl, fontWeight: '900', color: Colors.darkText },
  composeTypeScroll: { gap: 8, paddingBottom: 4 },
  composeTypeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  composeTypeText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
  composeTypeTextActive: { color: Colors.white },
  composeInput: {
    borderWidth: 1.5, borderColor: Colors.divider, borderRadius: Radius.lg,
    padding: Spacing.md, fontSize: Typography.base, color: Colors.darkText,
    minHeight: 120, backgroundColor: Colors.cream,
  },
  composeAttachRow: { flexDirection: 'row', gap: 8 },
  attachBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.divider, backgroundColor: Colors.creamDeep,
  },
  attachBtnText: { fontSize: Typography.sm, color: Colors.brownMid, fontWeight: '600' },
  composeActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    paddingVertical: 15, paddingHorizontal: Spacing.lg, borderRadius: Radius.full,
    borderWidth: 2, borderColor: Colors.divider, alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { color: Colors.brownMid, fontSize: Typography.base, fontWeight: '600' },
});

export default CommunityScreen;
