import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import { FontSizes, Spacing, darkColors } from '../constants/theme';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import '../global.css';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [dbReady, setDbReady] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [initialIsDark, setInitialIsDark] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem('yokdil_theme');
        if (savedTheme === 'light') setInitialIsDark(false);
        if (Platform.OS === 'web' && savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
      } catch (e) { }
      setThemeReady(true);
    }
    loadTheme();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    setDbReady(true);
  }, []);

  useEffect(() => {
    if (loaded && dbReady && themeReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady, themeReady]);

  if (!loaded || !dbReady || !themeReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkColors.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider initialIsDark={initialIsDark}>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar barStyle={colors === darkColors ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-word"
          options={{
            presentation: 'modal',
            title: 'Yeni Kelime Ekle',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkColors.background,
  },
  loadingText: {
    color: darkColors.textSecondary,
    fontSize: FontSizes.md,
    marginTop: Spacing.md,
  },
});
