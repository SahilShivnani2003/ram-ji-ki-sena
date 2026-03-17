import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {I18nProvider} from './src/i18n';
import TabBar from './src/navigation/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import MandirScreen from './src/screens/MandirScreen';
import KathaScreen from './src/screens/KathaScreen';
import PanditScreen from './src/screens/PanditScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import {Colors} from './src/theme';

type TabKey = 'Home' | 'Mandirs' | 'Katha' | 'Pandits' | 'Community' | 'Profile';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');

  // Simple navigation object passed to screens
  const navigation = {
    navigate: (screen: string) => {
      setActiveTab(screen as TabKey);
    },
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen navigation={navigation} />;
      case 'Mandirs':
        return <MandirScreen />;
      case 'Katha':
        return <KathaScreen />;
      case 'Pandits':
        return <PanditScreen />;
      case 'Community':
        return <CommunityScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.screenContainer}>{renderScreen()}</View>
        <TabBar
          activeTab={activeTab}
          onTabPress={(tab) => {
            setActiveTab(tab as TabKey);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});

export default App;
