import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootParamList } from '../navigation/AppNavigator';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
}

type NotificationProps = NativeStackScreenProps<RootParamList, 'notifications'>;

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Daily Naam Reminder',
    body: 'Your 3 chants reminder is ready. Tap to start your ritual.',
    time: '1m ago',
    read: false,
    icon: 'notifications',
  },
  {
    id: 'n2',
    title: 'New Katha Uploaded',
    body: 'Shri Ram Katha part 5 is now live. Join on the mandir page.',
    time: '32m ago',
    read: false,
    icon: 'book',
  },
  {
    id: 'n3',
    title: 'Pandit booking confirmed',
    body: 'Your Pandit booking for Saturday is confirmed.',
    time: 'Yesterday',
    read: true,
    icon: 'person',
  },
  {
    id: 'n4',
    title: 'Festival Offer',
    body: 'Get 20% discount on seva packages for the next 3 days.',
    time: '2d ago',
    read: true,
    icon: 'gift',
  },
];

const NotificationScreen = ({ navigation }: NotificationProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications],
  );

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? { ...item, read: !item.read } : item)),
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => toggleRead(item.id)}
      style={[
        styles.card,
        item.read ? styles.cardRead : styles.cardUnread,
        Shadow.sm,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={item.icon as any}
          size={18}
          color={item.read ? Colors.textMuted : Colors.textLight}
        />
      </View>

      <View style={styles.textWrap}>
        <View style={styles.rowTop}>
          <Text style={[styles.title, item.read && styles.textMuted]}>{item.title}</Text>
          <Text style={[styles.time, item.read && styles.textMuted]}>{item.time}</Text>
        </View>
        <Text style={[styles.body, item.read && styles.textMuted]}>{item.body}</Text>
      </View>

      <Ionicons
        name={item.read ? 'checkmark-circle' : 'ellipse'}
        size={18}
        color={item.read ? Colors.success : Colors.primary}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkBg} />

      <LinearGradient
        colors={[Colors.secondary, Colors.primary] as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
          <Text style={styles.actionText}>Mark all read</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}> 
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySub}>Stay tuned for updates from RamSena 🙏</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  backBtn: { padding: Spacing.sm },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    color: Colors.textLight,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionBtn: { padding: Spacing.sm },
  actionText: { color: Colors.textLight, fontSize: Fonts.sizes.sm, fontWeight: '600' },

  summaryBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.darkBg,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  summaryText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    fontWeight: '500',
  },

  list: { padding: Spacing.lg, gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardUnread: { backgroundColor: '#2D0D00', borderColor: Colors.primary },
  cardRead: { backgroundColor: '#221000', borderColor: Colors.border },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textWrap: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: Colors.textLight, fontWeight: '700', fontSize: Fonts.sizes.md },
  body: {
    color: Colors.textSecondary,
    fontSize: Fonts.sizes.sm,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  time: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  textMuted: { color: Colors.textMuted },

  empty: { marginTop: Spacing.xxxl, alignItems: 'center' },
  emptyText: { color: Colors.textLight, fontWeight: '600', fontSize: Fonts.sizes.md },
  emptySub: { color: Colors.textMuted, marginTop: Spacing.sm, fontSize: Fonts.sizes.sm },
});

export default NotificationScreen;
