import { useEffect, useState } from 'react';
import { requireOptionalNativeModule } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { CartProvider } from '../context/CartContext';
import { FavouritesProvider } from '../context/FavouritesContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { StoreProvider } from '../context/StoreContext';
import { AIAssistantProvider } from '../context/AIAssistantContext';
import AIAssistantSheet from '../components/AIAssistantSheet';
import theme from '../theme';

const SCREENSHOT_MODE =
  process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1' || Platform.OS === 'web';

if (SCREENSHOT_MODE) {
  requireOptionalNativeModule('DevMenuPreferences')?.setPreferencesAsync({
    showFloatingActionButton: false,
  });
}

function ProtectedRoute() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || SCREENSHOT_MODE) return;
    const seg0 = segments[0] as string | undefined;
    const inTabGroup = seg0 === '(tabs)';
    const inLogin = seg0 === 'login';
    if (!session && inTabGroup) router.replace('/login');
    else if (session && inLogin) router.replace('/(tabs)/home');
  }, [session, loading, segments]);

  return null;
}

export default function RootLayout() {
  const [fontTimeout, setFontTimeout] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'dispo-web-input-fonts';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      /* Keep RN/expo-font on the control; only fix Arial placeholders on web */
      input::placeholder, textarea::placeholder {
        font-family: inherit !important;
        letter-spacing: inherit;
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setFontTimeout(true), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!fontsLoaded && !fontTimeout) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AuthProvider>
        <StoreProvider>
        <CartProvider>
          <FavouritesProvider>
            <AIAssistantProvider>
              <ProtectedRoute />
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.colors.background },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
              </Stack>
              <AIAssistantSheet />
            </AIAssistantProvider>
          </FavouritesProvider>
        </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
