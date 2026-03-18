import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {useI18n} from '../../i18n';
import {Colors, Fonts, Spacing, BorderRadius, Shadow} from '../../theme';
import {GradientHeader, Badge, SectionHeader} from '../../components';
import {COMMUNITY_POSTS} from '../../data/staticData';

const CommunityScreen: React.FC = () => {
  const {t, isHindi} = useI18n();
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [postText, setPostText] = useState('');

  const handleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? {...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1}
          : p,
      ),
    );
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    Alert.alert('🙏', isHindi ? 'पोस्ट हो गई!' : 'Posted successfully!');
    setPostText('');
  };

  const typeColors: Record<string, string> = {
    'Pooja Update': Colors.lotus,
    'Bhajan Sandhya': Colors.primary,
    'Bhandara': Colors.tulsi,
    'Spiritual Challenge': Colors.gold,
    'पूजा अपडेट': Colors.lotus,
    'भजन संध्या': Colors.primary,
    'भंडारा': Colors.tulsi,
    'आध्यात्मिक चैलेंज': Colors.gold,
  };

  return (
    <View style={styles.container}>
      <GradientHeader title={t.communityFeed} subtitle="🤝 Jai Shri Ram" />

      <ScrollView showsVerticalScrollIndicator={false}>
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
              <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
                <Text style={styles.postBtnText}>
                  {isHindi ? 'पोस्ट करें' : 'Post'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Posts */}
        {posts.map(post => {
          const typeLabel = isHindi ? post.typeHi : post.type;
          return (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <Text style={styles.postAvatar}>{post.avatar}</Text>
                <View style={styles.postHeaderInfo}>
                  <View style={styles.postNameRow}>
                    <Text style={styles.postAuthor}>
                      {isHindi ? post.authorHi : post.author}
                    </Text>
                    <Badge
                      label={typeLabel}
                      bgColor={typeColors[typeLabel] || Colors.primary}
                      small
                    />
                  </View>
                  <View style={styles.postMeta}>
                    <Text style={styles.postCity}>
                      📍 {isHindi ? post.cityHi : post.city}
                    </Text>
                    <Text style={styles.postTime}>
                      · {isHindi ? post.timeAgoHi : post.timeAgo}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Post Content */}
              <Text style={styles.postContent}>
                {isHindi ? post.contentHi : post.content}
              </Text>

              {/* Divider */}
              <View style={styles.postDivider} />

              {/* Post Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleLike(post.id)}>
                  <Text style={styles.actionIcon}>
                    {post.isLiked ? '❤️' : '🤍'}
                  </Text>
                  <Text
                    style={[
                      styles.actionText,
                      post.isLiked && styles.actionTextActive,
                    ]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    Alert.alert('💬', isHindi ? 'टिप्पणी करें' : 'Add comment')
                  }>
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    Alert.alert('📤', isHindi ? 'शेयर करें' : 'Share')
                  }>
                  <Text style={styles.actionIcon}>📤</Text>
                  <Text style={styles.actionText}>{t.share}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

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
            onPress={() => Alert.alert('🙏', 'Help Forum')}>
            <Text style={styles.helpBtnText}>{t.needHelp}</Text>
          </TouchableOpacity>
        </View>

        <View style={{height: 80}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},

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
  writeAvatar: {fontSize: 36, marginRight: Spacing.md},
  writeInputBox: {flex: 1},
  writeInput: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  postBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
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
  postHeader: {flexDirection: 'row', marginBottom: Spacing.md},
  postAvatar: {fontSize: 40, marginRight: Spacing.md},
  postHeaderInfo: {flex: 1},
  postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: Fonts.sizes.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  postMeta: {flexDirection: 'row', alignItems: 'center'},
  postCity: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  postTime: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  postContent: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  postDivider: {height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md},
  postActions: {flexDirection: 'row', justifyContent: 'space-around'},
  actionBtn: {flexDirection: 'row', alignItems: 'center', gap: 4},
  actionIcon: {fontSize: 18},
  actionText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  actionTextActive: {color: Colors.lotus, fontWeight: '800'},

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
  helpIcon: {fontSize: 36, marginRight: Spacing.md},
  helpInfo: {flex: 1},
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
