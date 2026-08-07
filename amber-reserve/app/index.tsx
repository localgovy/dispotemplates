import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

const AGE_KEY = '@amber_reserve_age_verified';

// See app/_layout.tsx for details — lets the localscreenshots capture tool
// skip past the Google sign-in wall, since it can't drive a real OAuth flow.
const SCREENSHOT_MODE = process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1';

function calcAge(mm: string, dd: string, yyyy: string): number | null {
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  const year = parseInt(yyyy, 10);
  if (!month || !day || !year || year < 1900) return null;
  const dob = new Date(year, month - 1, day);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const mDiff = today.getMonth() - dob.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [showAgeGate, setShowAgeGate] = useState(false);

  const [mm, setMm] = useState('');
  const [dd, setDd] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [error, setError] = useState('');

  const ddRef  = useRef<TextInput>(null);
  const yyyyRef = useRef<TextInput>(null);

  useEffect(() => {
    if (authLoading) return;
    AsyncStorage.getItem(AGE_KEY).then((val) => {
      if (val === 'true') {
        const t = setTimeout(() => {
          router.replace(session || SCREENSHOT_MODE ? '/(tabs)/home' : '/login');
        }, 1400);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setShowAgeGate(true), 1400);
        return () => clearTimeout(t);
      }
    });
  }, [authLoading, session]);

  async function handleConfirm() {
    setError('');
    const age = calcAge(mm, dd, yyyy);
    if (age === null) {
      setError('Please enter a valid date of birth.');
      return;
    }
    if (age < 19) {
      setError('You must be 19 or older to access this app.');
      return;
    }
    await AsyncStorage.setItem(AGE_KEY, 'true');
    setShowAgeGate(false);
    router.replace(session || SCREENSHOT_MODE ? '/(tabs)/home' : '/login');
  }

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoWrap}>
        <View style={styles.seal}>
          <Text style={styles.sealLetter}>L</Text>
        </View>
        <Text style={styles.brand}>Amber Reserve</Text>
        <Text style={styles.brandSub}>D I S P E N S A R Y</Text>
      </View>

      <Text style={styles.tagline}>Crafted for the discerning lounge.</Text>
      <Text style={styles.location}>Barrie, Ontario · Est. 2024</Text>

      <Modal visible={showAgeGate} transparent animationType="fade" statusBarTranslucent>
        <KeyboardAvoidingView
          style={styles.gateOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.gateCard}>
            <View style={styles.gateSeal}>
              <Text style={styles.gateSealLetter}>19+</Text>
            </View>

            <Text style={styles.gateTitle}>Age Verification</Text>
            <Text style={styles.gateSub}>
              Cannabis is for adults only. Enter your{'\n'}date of birth to continue.
            </Text>

            {/* DOB inputs */}
            <View style={styles.dobRow}>
              <View style={styles.dobField}>
                <Text style={styles.dobLabel}>MM</Text>
                <TextInput
                  style={styles.dobInput}
                  value={mm}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 2);
                    setMm(clean);
                    setError('');
                    if (clean.length === 2) ddRef.current?.focus();
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor={theme.colors.textMuted}
                  returnKeyType="next"
                  onSubmitEditing={() => ddRef.current?.focus()}
                />
              </View>

              <Text style={styles.dobSep}>/</Text>

              <View style={styles.dobField}>
                <Text style={styles.dobLabel}>DD</Text>
                <TextInput
                  ref={ddRef}
                  style={styles.dobInput}
                  value={dd}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 2);
                    setDd(clean);
                    setError('');
                    if (clean.length === 2) yyyyRef.current?.focus();
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="DD"
                  placeholderTextColor={theme.colors.textMuted}
                  returnKeyType="next"
                  onSubmitEditing={() => yyyyRef.current?.focus()}
                />
              </View>

              <Text style={styles.dobSep}>/</Text>

              <View style={[styles.dobField, styles.dobFieldYear]}>
                <Text style={styles.dobLabel}>YYYY</Text>
                <TextInput
                  ref={yyyyRef}
                  style={styles.dobInput}
                  value={yyyy}
                  onChangeText={(v) => {
                    const clean = v.replace(/\D/g, '').slice(0, 4);
                    setYyyy(clean);
                    setError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="YYYY"
                  placeholderTextColor={theme.colors.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                />
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={theme.colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.yesBtn} onPress={handleConfirm} activeOpacity={0.9}>
              <Text style={styles.yesBtnText}>Confirm & Enter</Text>
            </TouchableOpacity>

            <Text style={styles.gateLegal}>
              By entering you confirm you are of legal age{'\n'}to purchase cannabis in Ontario (19+).
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.ageWarn}>19+ Only · Keep out of reach of children</Text>
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
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  seal: {
    width: 92,
    height: 92,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  sealLetter: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 44,
    color: theme.colors.onSecondaryContainer,
  },
  brand: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 40,
    color: theme.colors.white,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.gold,
    letterSpacing: 5,
    marginTop: 4,
  },
  tagline: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 18,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  location: {
    ...theme.typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: theme.spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  ageWarn: {
    ...theme.typography.small,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },

  // Age gate
  gateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 14, 12, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  gateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.large,
  },
  gateSeal: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  gateSealLetter: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.onPrimary,
  },
  gateTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  gateSub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // DOB inputs
  dobRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    width: '100%',
    justifyContent: 'center',
  },
  dobField: {
    alignItems: 'center',
    flex: 1,
  },
  dobFieldYear: {
    flex: 1.7,
  },
  dobLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: theme.colors.accent,
    marginBottom: 4,
  },
  dobInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.sm,
    fontFamily: theme.fonts.serifBold,
    fontSize: 20,
    color: theme.colors.text,
    textAlign: 'center',
  },
  dobSep: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.textMuted,
    paddingBottom: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.danger + '12',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    width: '100%',
  },
  errorText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.danger,
    flex: 1,
  },
  yesBtn: {
    width: '100%',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  yesBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.onPrimary,
    letterSpacing: 0.3,
  },
  gateLegal: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
