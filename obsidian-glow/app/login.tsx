import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

// Required for the auth session to complete on iOS
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signInWithIdToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const [_request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        setLoading(true);
        signInWithIdToken(idToken)
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
            Alert.alert('Sign-in Error', msg);
          })
          .finally(() => setLoading(false));
      }
    } else if (response?.type === 'error') {
      Alert.alert('Sign-in Error', response.error?.message ?? 'Google sign-in failed.');
    }
  }, [response]);

  async function handleGoogle() {
    if (loading) return;
    await promptAsync();
  }

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Logo */}
      <View style={styles.logoWrap}>
        <View style={styles.seal}>
          <Text style={styles.sealLetter}>O</Text>
        </View>
        <Text style={styles.brand}>Obsidian Lab</Text>
        <Text style={styles.brandSub}>D I S P E N S A R Y</Text>
      </View>

      <Text style={styles.tagline}>Lab-verified strains under UV light.</Text>

      {/* Sign-in card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSub}>
          Sign in to browse, save favourites, and track your orders.
        </Text>

        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.googleBtnLoading]}
          onPress={handleGoogle}
          activeOpacity={0.88}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          ) : (
            <Ionicons name="logo-google" size={20} color={theme.colors.onPrimary} />
          )}
          <Text style={styles.googleBtnText}>
            {loading ? 'Signing in…' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          By continuing you confirm you are 19+ and agree to our Terms of Service.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Barrie, Ontario · Est. 2024 · 19+ Only</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 4,
  },
  seal: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: theme.colors.secondaryContainer,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  sealLetter: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 38,
    color: theme.colors.primary,
  },
  brand: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 36,
    color: theme.colors.onPrimary,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.onPrimary,
    letterSpacing: 5,
    marginTop: 2,
  },
  tagline: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 16,
    color: theme.colors.onPrimaryMuted,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.large,
    marginTop: theme.spacing.sm,
  },
  cardTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 24,
    color: theme.colors.text,
    textAlign: 'center',
  },
  cardSub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 0,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.xs,
    ...theme.shadows.small,
  },
  googleBtnLoading: {
    opacity: 0.7,
  },
  googleBtnText: {
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.colors.onPrimary,
    letterSpacing: 1,
  },
  legal: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    ...theme.typography.small,
    color: theme.colors.onPrimaryMuted,
    textAlign: 'center',
  },
});
