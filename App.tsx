import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { I18nProvider } from './src/i18n';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const isDark = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <I18nProvider>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
          <AppNavigator/>
        </I18nProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
