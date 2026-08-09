import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase, Tables } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import StoreSheet from '../../../components/StoreSheet';
import ContactHoursSheet from '../../../components/ContactHoursSheet';
import AIButton from '../../../components/AIButton';
import theme from '../../../theme';


type Profile = Tables['profiles'];

interface MenuItem {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  destructive?: boolean;
  toggle?: boolean;
  toggleKey?: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { store, setStore } = useStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toggles, setToggles] = useState({ notif: true, deals: true });
  const [loading, setLoading] = useState(true);
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [showContactHours, setShowContactHours] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Alex Rivera';

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const loyaltyPts = profile?.loyalty_pts ?? 0;
  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : 2024;
  const memberId = user?.id ? `LAB-${user.id.slice(0, 6).toUpperCase()}` : 'LAB-GUEST';
  const REDEEM_THRESHOLD = 500;
  const REDEEM_VALUE = 10;
  const progressPct = Math.min((loyaltyPts % REDEEM_THRESHOLD) / REDEEM_THRESHOLD, 1);
  const ptsToNext = REDEEM_THRESHOLD - (loyaltyPts % REDEEM_THRESHOLD);
  const totalRedeemable = Math.floor(loyaltyPts / REDEEM_THRESHOLD) * REDEEM_VALUE;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as Profile);
          setToggles({ notif: data.notif_order, deals: data.notif_promo });
        }
        setLoading(false);
      });
  }, [user]);

  async function toggleSwitch(key: string) {
    const newVal = !toggles[key as keyof typeof toggles];
    setToggles((t) => ({ ...t, [key]: newVal }));
    if (!user) return;
    const col = key === 'notif' ? 'notif_order' : 'notif_promo';
    await supabase.from('profiles').update({ [col]: newVal }).eq('id', user.id);
  }

  function handleMenuItem(id: string) {
    switch (id) {
      case 'signout':
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              router.replace('/login');
            },
          },
        ]);
        break;

      case 'age':
        Alert.alert('Age Verified ✓', 'Your 19+ age has been verified. You\'re good to shop.');
        break;

      case 'loyalty':
        Alert.alert(
          'Lab Credits',
          `You have ${loyaltyPts.toLocaleString()} pts.\n\nEarn 1 pt per $1 spent.\nRedeem ${REDEEM_THRESHOLD} pts for $${REDEEM_VALUE} off your next order.\n\n${
            totalRedeemable > 0
              ? `You currently have $${totalRedeemable} available to redeem!`
              : `${ptsToNext} more pts until your next $${REDEEM_VALUE} reward.`
          }`,
        );
        break;

      case 'personal':
        Alert.alert(
          'Personal Info',
          `Name: ${displayName}\nEmail: ${user?.email ?? 'N/A'}\n\nYour profile is managed through your Google account.`,
        );
        break;

      case 'location':
        setShowStoreSheet(true);
        break;

      case 'favourites':
        router.push('/(tabs)/search');
        break;

      case 'payment':
        Alert.alert(
          'Payment Methods',
          'We accept:\n\n• Cash\n• Interac Debit\n• Credit Card (Visa / Mastercard)\n\nPayment is taken in-store at pickup. No online payments processed.',
        );
        break;

      case 'faq':
        setShowContactHours(true);
        break;

      case 'about':
        Alert.alert(
          'Our Website',
          'The store website isn’t available in this demo preview.\n\nWhen you launch your own app, this link will open your real site.',
          [{ text: 'OK' }],
        );
        break;

      case 'terms':
        Alert.alert(
          'Terms & Privacy',
          'By using this app you confirm you are 19+ years of age. All purchases require valid government-issued ID at pickup.\n\nPersonal data is stored securely and never sold to third parties. Full terms will be linked on your production website.',
          [{ text: 'OK' }],
        );
        break;
    }
  }

  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { id: 'personal', icon: 'person-outline', label: 'Personal Info', value: displayName },
        { id: 'age', icon: 'shield-checkmark-outline', label: 'Age Verification', value: 'Verified ✓' },
        {
          id: 'loyalty',
          icon: 'flash-outline',
          label: 'Lab Credits',
          value: `${loyaltyPts.toLocaleString()} pts`,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { id: 'notif', icon: 'notifications-outline', label: 'Order Updates', toggle: true, toggleKey: 'notif' },
        { id: 'deals', icon: 'pricetag-outline', label: 'Deal Alerts', toggle: true, toggleKey: 'deals' },
        { id: 'location', icon: 'location-outline', label: 'Store Location', value: `${store.name}, ${store.province}` },
      ],
    },
    {
      title: 'Shop',
      items: [
        { id: 'favourites', icon: 'heart-outline', label: 'Saved Favourites' },
        { id: 'payment', icon: 'card-outline', label: 'Payment Methods', value: 'Cash / Debit / Credit' },
      ],
    },
    {
      title: 'Support',
      items: [
        { id: 'faq', icon: 'call-outline', label: 'Contact & Hours' },
        { id: 'about', icon: 'globe-outline', label: 'Our Website' },
        { id: 'terms', icon: 'document-text-outline', label: 'Terms & Privacy' },
      ],
    },
    {
      title: '',
      items: [
        { id: 'signout', icon: 'log-out-outline', label: 'Sign Out', destructive: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topNav}>
        <Text style={styles.topNavTitle}>Account</Text>
        <AIButton />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Terminal identity block */}
        <View style={styles.terminalBlock}>
          <Text style={styles.promptLine}>{'>'} Session active</Text>
          <View style={styles.identityRow}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
            )}
            <View style={styles.identityMeta}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.monoMuted}>ID {memberId}</Text>
              <Text style={styles.monoMuted}>Member since {memberYear} · {store.city}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.creditsPanel}
            activeOpacity={0.85}
            onPress={() => handleMenuItem('loyalty')}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <View style={styles.creditsHeader}>
                  <Text style={styles.creditsLabel}>Lab Credits</Text>
                  <Text style={styles.creditsPts}>{loyaltyPts.toLocaleString()}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
                </View>
                <Text style={styles.creditsHint}>
                  {totalRedeemable > 0
                    ? `$${totalRedeemable} redeemable`
                    : `${ptsToNext} pts → $${REDEEM_VALUE}`}
                  {'  '}· 1pt/$1
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.section}>
            {section.title !== '' && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            <View style={styles.menuCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuRow,
                    ii < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  onPress={() => !item.toggle && handleMenuItem(item.id)}
                  activeOpacity={item.toggle ? 1 : 0.75}
                >
                  <View style={[styles.menuIcon, item.destructive && styles.menuIconDestructive]}>
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={item.destructive ? theme.colors.danger : theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.menuLabel, item.destructive && styles.menuLabelDestructive]}>
                    {item.label}
                  </Text>
                  <View style={styles.menuRight}>
                    {item.toggle && item.toggleKey ? (
                      <Switch
                        value={toggles[item.toggleKey as keyof typeof toggles]}
                        onValueChange={() => toggleSwitch(item.toggleKey!)}
                        trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primaryMuted }}
                        thumbColor={
                          toggles[item.toggleKey as keyof typeof toggles]
                            ? theme.colors.primary
                            : theme.colors.textMuted
                        }
                        ios_backgroundColor={theme.colors.surfaceLight}
                      />
                    ) : item.value ? (
                      <Text style={[styles.menuValue, item.id === 'age' && styles.verifiedText]}>
                        {item.value}
                      </Text>
                    ) : (
                      !item.destructive && (
                        <Text style={styles.chevronMono}>›</Text>
                      )
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>Obsidian Lab</Text>
          <Text style={styles.footerAge}>19+ ONLY · KEEP OUT OF REACH OF CHILDREN</Text>
        </View>
      </ScrollView>

      <StoreSheet
        visible={showStoreSheet}
        onClose={() => setShowStoreSheet(false)}
        activeStore={store}
        onSelect={setStore}
      />

      <ContactHoursSheet
        visible={showContactHours}
        onClose={() => setShowContactHours(false)}
        store={store}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  topNavTitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 1.6,
    color: theme.colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  terminalBlock: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.md,
  },
  promptLine: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    color: theme.colors.primary,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  avatarText: {
    fontFamily: theme.fonts.mono,
    fontSize: 22,
    color: theme.colors.primary,
  },
  identityMeta: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.text,
  },
  monoMuted: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 0.3,
  },
  creditsPanel: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    padding: theme.spacing.md,
    gap: 8,
    minHeight: 88,
    justifyContent: 'center',
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  creditsLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: theme.colors.primary,
  },
  creditsPts: {
    fontFamily: theme.fonts.mono,
    fontSize: 24,
    color: theme.colors.text,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  creditsHint: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
  },
  section: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md - 2,
    gap: theme.spacing.sm,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  menuIcon: {
    width: 28,
    height: 28,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDestructive: {
    backgroundColor: theme.colors.danger + '18',
  },
  menuLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.colors.text,
    flex: 1,
  },
  menuLabelDestructive: {
    color: theme.colors.danger,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  verifiedText: {
    color: theme.colors.primary,
  },
  chevronMono: {
    fontFamily: theme.fonts.mono,
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: 6,
  },
  footerLogo: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
  },
  footerAge: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    color: theme.colors.textDisabled,
  },
});
