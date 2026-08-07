import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

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
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundLight, '#FFE8D2']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.logoWrap}>
        <View style={styles.seal}>
          <Text style={styles.sealLetter}>C</Text>
        </View>
        <Text style={styles.brand}>Citrus Grove</Text>
        <Text style={styles.brandSub}>D I S P E N S A R Y</Text>
      </View>

      <Text style={styles.tagline}>Squeeze more joy from every ritual.</Text>

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
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name="logo-google" size={20} color={theme.colors.primary} />
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
        <Text style={styles.footerText}>Toronto, Ontario · Est. 2024 · 19+ Only</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 4,
  },
  seal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  sealLetter: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 38,
    color: theme.colors.primary,
  },
  brand: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 36,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.accentDark,
    letterSpacing: 5,
    marginTop: 2,
  },
  tagline: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
    marginTop: theme.spacing.sm,
  },
  cardTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 24,
    color: theme.colors.primary,
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
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  googleBtnLoading: {
    opacity: 0.7,
  },
  googleBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.white,
    letterSpacing: 0.2,
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
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
