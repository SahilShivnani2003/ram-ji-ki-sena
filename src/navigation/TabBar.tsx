import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors, Fonts, Spacing, Shadow} from '../theme';
import {useI18n} from '../i18n';

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const TABS = [
  {key: 'Home', icon: '🏠', iconActive: '🏠'},
  {key: 'Mandirs', icon: '🛕', iconActive: '🛕'},
  {key: 'Katha', icon: '📖', iconActive: '📖'},
  {key: 'Pandits', icon: '🙏', iconActive: '🙏'},
  {key: 'Community', icon: '👥', iconActive: '👥'},
];

const TabBar: React.FC<TabBarProps> = ({activeTab, onTabPress}) => {
  const {t} = useI18n();

  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      Home: t.home,
      Mandirs: t.mandirs,
      Katha: t.katha,
      Pandits: t.pandits,
      Community: t.community,
    };
    return map[key] || key;
  };

  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}>
            {isActive && <View style={styles.activeIndicator} />}
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {getLabel(tab.key)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    paddingBottom: 16,
    paddingTop: 8,
    ...Shadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});

export default TabBar;
