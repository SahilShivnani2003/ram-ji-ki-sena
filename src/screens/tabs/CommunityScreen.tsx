import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Share,
} from 'react-native';
import { useI18n } from '../../i18n';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../../theme';
import { GradientHeader, Badge, SectionHeader } from '../../components';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../../navigation/DrawerNavigator';
import { otherAPI, ICommunityPost } from '../../service/apis/otherServices';
import { RootParamList } from '../../navigation/AppNavigator';

type communityProps = DrawerScreenProps<DrawerParamList | RootParamList, 'Community'>;

interface CommunityComment {
    _id: string;
    user: { _id: string; username?: string; name?: string };
    text: string;
    createdAt: string;
}

interface Post {
    _id: string;
    author: { _id: string; username?: string; name: string; city?: string };
    text: string;
    images: string[];
    category: string;
    city?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    comments: CommunityComment[];
    isLiked: boolean;
    createdAt: string;
}

// Post options (category values are sent to the API as-is)
const POST_CATEGORIES = [
    { key: 'General', en: 'General', hi: 'सामान्य', icon: '🙏' },
    { key: 'Pooja Update', en: 'Pooja Update', hi: 'पूजा अपडेट', icon: '🪔' },
    { key: 'Bhajan Sandhya', en: 'Bhajan Sandhya', hi: 'भजन संध्या', icon: '🎶' },
    { key: 'Bhandara', en: 'Bhandara', hi: 'भंडारा', icon: '🍛' },
    { key: 'Spiritual Challenge', en: 'Spiritual Challenge', hi: 'आध्यात्मिक चैलेंज', icon: '🏆' },
];

const typeColors: Record<string, string> = {
    General: Colors.primary,
    'Pooja Update': Colors.lotus,
    'Bhajan Sandhya': Colors.primary,
    Bhandara: Colors.tulsi,
    'Spiritual Challenge': Colors.gold,
};

const timeAgo = (iso: string, isHindi: boolean): string => {
    const min = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return isHindi ? 'अभी' : 'Just now';
    if (min < 60) return isHindi ? `${min} मिनट पहले` : `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return isHindi ? `${hr} घंटे पहले` : `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return isHindi ? `${day} दिन पहले` : `${day}d ago`;
    const mon = Math.floor(day / 30);
    if (mon < 12) return isHindi ? `${mon} माह पहले` : `${mon}mo ago`;
    const yr = Math.floor(mon / 12);
    return isHindi ? `${yr} वर्ष पहले` : `${yr}y ago`;
};

const errMsg = (e: any, fallback: string) => e?.response?.data?.message || e?.message || fallback;

const CommunityScreen = ({ navigation }: communityProps) => {
    const { t, isHindi } = useI18n();
    const [posts, setPosts] = useState<Post[]>([]);
    const [postText, setPostText] = useState('');
    const [category, setCategory] = useState('General');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // comments
    const [openComments, setOpenComments] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [commenting, setCommenting] = useState(false);

    // mode: 'initial' = full spinner, 'refresh' = pull-to-refresh, 'silent' = no indicator
    const fetchPosts = useCallback(
        async (mode: 'initial' | 'refresh' | 'silent' = 'initial') => {
            try {
                if (mode === 'initial') setLoading(true);
                if (mode === 'refresh') setRefreshing(true);
                setError(null);
                const response: any = await otherAPI.community();
                const body = response?.data ?? response;
                setPosts(body?.posts ?? []);
            } catch (e: any) {
                console.error('failed to load : ', e);
                if (mode !== 'silent') {
                    setError(
                        errMsg(e, isHindi ? 'पोस्ट लोड नहीं हो सकीं' : 'Failed to load posts'),
                    );
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [isHindi],
    );

    useEffect(() => {
        fetchPosts('initial');
    }, [fetchPosts]);

    /* ---------------- Like ---------------- */
    const handleLike = async (post: Post) => {
        // optimistic update
        setPosts(prev =>
            prev.map(p =>
                p._id === post._id
                    ? {
                          ...p,
                          isLiked: !p.isLiked,
                          likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
                      }
                    : p,
            ),
        );
        try {
            await otherAPI.communityPostLike(post._id);
        } catch (e: any) {
            console.error('like failed : ', e);
            // rollback
            setPosts(prev => prev.map(p => (p._id === post._id ? post : p)));
            Alert.alert('⚠️', errMsg(e, isHindi ? 'लाइक नहीं हो सका' : 'Could not like'));
        }
    };

    /* ---------------- Comment ---------------- */
    const toggleComments = (id: string) => {
        setCommentText('');
        setOpenComments(prev => (prev === id ? null : id));
    };

    const handleComment = async (post: Post) => {
        const text = commentText.trim();
        if (!text || commenting) return;
        try {
            setCommenting(true);
            await otherAPI.communityPostComment(post._id, text);
            setCommentText('');
            await fetchPosts('silent'); // reload so the new comment appears
        } catch (e: any) {
            console.error('comment failed : ', e);
            Alert.alert('⚠️', errMsg(e, isHindi ? 'टिप्पणी नहीं हो सकी' : 'Could not comment'));
        } finally {
            setCommenting(false);
        }
    };

    /* ---------------- Share ---------------- */
    const handleShare = async (post: Post) => {
        try {
            const result = await Share.share({
                message: `${post.author?.name}: ${post.text}`,
            });
            if (result.action === Share.sharedAction) {
                setPosts(prev =>
                    prev.map(p =>
                        p._id === post._id ? { ...p, sharesCount: p.sharesCount + 1 } : p,
                    ),
                );
                otherAPI
                    .communityPostShare(post._id)
                    .catch(e => console.error('share count failed : ', e));
            }
        } catch (e) {
            console.error('share failed : ', e);
        }
    };

    /* ---------------- Create post ---------------- */
    const handlePost = async () => {
        const text = postText.trim();
        if (!text || posting) return;
        try {
            setPosting(true);
            const data: ICommunityPost = { category, image: [], text };
            await otherAPI.communityPost(data);
            setPostText('');
            setCategory('General');
            Alert.alert('🙏', isHindi ? 'पोस्ट हो गई!' : 'Posted successfully!');
            fetchPosts('silent');
        } catch (e: any) {
            console.error('failed to post : ', e);
            Alert.alert('⚠️', errMsg(e, isHindi ? 'पोस्ट नहीं हो सकी' : 'Could not post'));
        } finally {
            setPosting(false);
        }
    };

    const categoryLabel = (key: string) => {
        const c = POST_CATEGORIES.find(x => x.key === key);
        return c ? (isHindi ? c.hi : c.en) : key;
    };

    return (
        <View style={styles.container}>
            <GradientHeader
                title={t.communityFeed}
                subtitle="🤝 Jai Shri Ram"
                navigation={navigation}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchPosts('refresh')}
                        colors={[Colors.primary]}
                    />
                }
            >
                {/* Write Post Box */}
                <View style={styles.writeBox}>
                    <Text style={styles.writeAvatar}>🙏</Text>
                    <View style={styles.writeInputBox}>
                        <TextInput
                            style={styles.writeInput}
                            placeholder={t.writePost}
                            placeholderTextColor={Colors.textMuted}
                            value={postText}
                            onChangeText={setPostText}
                            multiline
                        />

                        {postText.length > 0 && (
                            <>
                                <Text style={styles.optionsLabel}>
                                    {isHindi ? 'पोस्ट का प्रकार चुनें' : 'Choose post type'}
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.chipRow}
                                >
                                    {POST_CATEGORIES.map(c => {
                                        const active = c.key === category;
                                        return (
                                            <TouchableOpacity
                                                key={c.key}
                                                onPress={() => setCategory(c.key)}
                                                style={[styles.chip, active && styles.chipActive]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.chipText,
                                                        active && styles.chipTextActive,
                                                    ]}
                                                >
                                                    {c.icon} {isHindi ? c.hi : c.en}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <TouchableOpacity
                                    style={[styles.postBtn, posting && { opacity: 0.6 }]}
                                    onPress={handlePost}
                                    disabled={posting}
                                >
                                    {posting ? (
                                        <ActivityIndicator size="small" color={Colors.textLight} />
                                    ) : (
                                        <Text style={styles.postBtnText}>
                                            {isHindi ? 'पोस्ट करें' : 'Post'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Posts */}
                {loading ? (
                    <ActivityIndicator
                        style={{ marginTop: 40 }}
                        size="large"
                        color={Colors.primary}
                    />
                ) : error ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>⚠️ {error}</Text>
                        <TouchableOpacity
                            style={styles.retryBtn}
                            onPress={() => fetchPosts('initial')}
                        >
                            <Text style={styles.postBtnText}>
                                {isHindi ? 'फिर कोशिश करें' : 'Retry'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : posts.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>
                            {isHindi
                                ? 'अभी कोई पोस्ट नहीं है। पहली पोस्ट आप करें! 🙏'
                                : 'No posts yet. Be the first to post! 🙏'}
                        </Text>
                    </View>
                ) : (
                    posts.map(post => {
                        const initial = (post.author?.name || '?').trim().charAt(0).toUpperCase();
                        const city = post.city || post.author?.city;
                        const commentsOpen = openComments === post._id;
                        return (
                            <View key={post._id} style={styles.postCard}>
                                {/* Post Header */}
                                <View style={styles.postHeader}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarLetter}>{initial}</Text>
                                    </View>
                                    <View style={styles.postHeaderInfo}>
                                        <View style={styles.postNameRow}>
                                            <Text style={styles.postAuthor} numberOfLines={1}>
                                                {post.author?.name}
                                            </Text>
                                            <Badge
                                                label={categoryLabel(post.category)}
                                                bgColor={
                                                    typeColors[post.category] || Colors.primary
                                                }
                                                small
                                            />
                                        </View>
                                        <View style={styles.postMeta}>
                                            {!!city && (
                                                <Text style={styles.postCity}>📍 {city}</Text>
                                            )}
                                            <Text style={styles.postTime}>
                                                · {timeAgo(post.createdAt, isHindi)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Post Content */}
                                <Text style={styles.postContent}>{post.text}</Text>

                                <View style={styles.postDivider} />

                                {/* Post Actions */}
                                <View style={styles.postActions}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleLike(post)}
                                    >
                                        <Text style={styles.actionIcon}>
                                            {post.isLiked ? '❤️' : '🤍'}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.actionText,
                                                post.isLiked && styles.actionTextActive,
                                            ]}
                                        >
                                            {post.likesCount}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => toggleComments(post._id)}
                                    >
                                        <Text style={styles.actionIcon}>💬</Text>
                                        <Text
                                            style={[
                                                styles.actionText,
                                                commentsOpen && styles.actionTextActive,
                                            ]}
                                        >
                                            {post.commentsCount}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleShare(post)}
                                    >
                                        <Text style={styles.actionIcon}>📤</Text>
                                        <Text style={styles.actionText}>
                                            {t.share}
                                            {post.sharesCount > 0 ? ` (${post.sharesCount})` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Comments */}
                                {commentsOpen && (
                                    <View style={styles.commentsBox}>
                                        {post.comments?.length === 0 && (
                                            <Text style={styles.noComments}>
                                                {isHindi
                                                    ? 'अभी कोई टिप्पणी नहीं'
                                                    : 'No comments yet'}
                                            </Text>
                                        )}
                                        {post.comments?.map(c => (
                                            <View key={c._id} style={styles.commentRow}>
                                                <View style={styles.commentAvatar}>
                                                    <Text style={styles.commentAvatarText}>
                                                        {(c.user?.name || c.user?.username || '?')
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View style={styles.commentBubble}>
                                                    <Text style={styles.commentUser}>
                                                        {c.user?.name || c.user?.username}{' '}
                                                        <Text style={styles.commentTime}>
                                                            · {timeAgo(c.createdAt, isHindi)}
                                                        </Text>
                                                    </Text>
                                                    <Text style={styles.commentText}>{c.text}</Text>
                                                </View>
                                            </View>
                                        ))}

                                        <View style={styles.commentInputRow}>
                                            <TextInput
                                                style={styles.commentInput}
                                                placeholder={
                                                    isHindi
                                                        ? 'टिप्पणी लिखें...'
                                                        : 'Write a comment...'
                                                }
                                                placeholderTextColor={Colors.textMuted}
                                                value={commentText}
                                                onChangeText={setCommentText}
                                                onSubmitEditing={() => handleComment(post)}
                                                returnKeyType="send"
                                            />
                                            <TouchableOpacity
                                                style={[
                                                    styles.commentSend,
                                                    (!commentText.trim() || commenting) && {
                                                        opacity: 0.5,
                                                    },
                                                ]}
                                                onPress={() => handleComment(post)}
                                                disabled={!commentText.trim() || commenting}
                                            >
                                                {commenting ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color={Colors.textLight}
                                                    />
                                                ) : (
                                                    <Text style={styles.postBtnText}>
                                                        {isHindi ? 'भेजें' : 'Send'}
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}

                {/* Help Forum */}
                <SectionHeader title={t.helpForum} />
                <View style={styles.helpCard}>
                    <Text style={styles.helpIcon}>🆘</Text>
                    <View style={styles.helpInfo}>
                        <Text style={styles.helpTitle}>{t.needHelp}</Text>
                        <Text style={styles.helpDesc}>
                            {isHindi
                                ? 'समुदाय से मदद मांगें - पूरी तरह मुफ्त'
                                : 'Ask for help from the community — 100% free'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.helpBtn}
                        onPress={() => Alert.alert('🙏', 'Help Forum')}
                    >
                        <Text style={styles.helpBtnText}>{t.needHelp}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    writeBox: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBg,
        margin: Spacing.lg,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    writeAvatar: { fontSize: 36, marginRight: Spacing.md },
    writeInputBox: { flex: 1 },
    writeInput: {
        fontSize: Fonts.sizes.md,
        color: Colors.textPrimary,
        minHeight: 50,
        textAlignVertical: 'top',
    },
    optionsLabel: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        fontWeight: '700',
        marginTop: Spacing.sm,
    },
    chipRow: { marginTop: Spacing.xs },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: Spacing.xs,
    },
    chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, fontWeight: '600' },
    chipTextActive: { color: Colors.textLight },
    postBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        alignSelf: 'flex-end',
        marginTop: Spacing.sm,
        minWidth: 80,
        alignItems: 'center',
    },
    postBtnText: {
        color: Colors.textLight,
        fontSize: Fonts.sizes.sm,
        fontWeight: '700',
    },

    postCard: {
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.sm,
    },
    postHeader: { flexDirection: 'row', marginBottom: Spacing.md },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarLetter: { color: Colors.textLight, fontSize: 18, fontWeight: '800' },
    postHeaderInfo: { flex: 1 },
    postNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: 4,
    },
    postAuthor: {
        flexShrink: 1,
        fontSize: Fonts.sizes.md,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    postMeta: { flexDirection: 'row', alignItems: 'center' },
    postCity: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
    postTime: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginLeft: 4 },
    postContent: {
        fontSize: Fonts.sizes.md,
        color: Colors.textPrimary,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    postDivider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
    postActions: { flexDirection: 'row', justifyContent: 'space-around' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionIcon: { fontSize: 18 },
    actionText: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textMuted,
        fontWeight: '600',
    },
    actionTextActive: { color: Colors.lotus, fontWeight: '800' },

    commentsBox: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    noComments: {
        fontSize: Fonts.sizes.sm,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },
    commentRow: { flexDirection: 'row', marginBottom: Spacing.sm },
    commentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.tulsi,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    commentAvatarText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
    commentBubble: { flex: 1 },
    commentUser: {
        fontSize: Fonts.sizes.xs,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    commentTime: { fontWeight: '400', color: Colors.textMuted },
    commentText: { fontSize: Fonts.sizes.sm, color: Colors.textPrimary, marginTop: 2 },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        fontSize: Fonts.sizes.sm,
        color: Colors.textPrimary,
    },
    commentSend: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        minWidth: 64,
        alignItems: 'center',
    },

    emptyBox: { alignItems: 'center', padding: Spacing.xl },
    emptyText: {
        fontSize: Fonts.sizes.md,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    retryBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.md,
    },

    helpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBg,
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: Colors.tulsiLight,
        ...Shadow.sm,
    },
    helpIcon: { fontSize: 36, marginRight: Spacing.md },
    helpInfo: { flex: 1 },
    helpTitle: {
        fontSize: Fonts.sizes.md,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    helpDesc: {
        fontSize: Fonts.sizes.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    helpBtn: {
        backgroundColor: Colors.tulsi,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    helpBtnText: {
        color: '#FFF',
        fontSize: Fonts.sizes.xs,
        fontWeight: '700',
    },
});

export default CommunityScreen;
