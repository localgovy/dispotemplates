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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase, Tables } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import StoreSheet from '../../../components/StoreSheet';
import AIButton from '../../../components/AIButton';
import theme from '../../../theme';

const STORE_WEBSITE = 'https://www.luminousbotanical.example';
const JOURNAL_KEY = '@luminous_botanical_dosage_journal';

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

interface DosageEntry {
  id: string;
  date: string;
  productName: string;
  strain: string;
  dose: string;
  note: string;
}

const CANNED_ENTRIES: Omit<DosageEntry, 'id' | 'date'>[] = [
  {
    productName: 'Sunset Sherbet',
    strain: 'Hybrid',
    dose: 'Evening · 0.3 g',
    note: 'Soft body calm with a gentle lift. Perfect after dinner.',
  },
  {
    productName: 'Mint Soft Chews',
    strain: 'Sativa',
    dose: 'Afternoon · 5 mg',
    note: 'Light creative energy without jitters.',
  },
  {
    productName: 'Calm CBD Drops',
    strain: 'CBD',
    dose: 'Morning · 15 mg',
    note: 'Steady focus for the workday.',
  },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { store, setStore } = useStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toggles, setToggles] = useState({ notif: true, deals: true });
  const [loading, setLoading] = useState(true);
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [journal, setJournal] = useState<DosageEntry[]>([]);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Guest';

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const loyaltyPts = profile?.loyalty_pts ?? 0;
  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : 2024;
  const REDEEM_THRESHOLD = 500;
  const REDEEM_VALUE = 10;
  const progressPct = Math.min((loyaltyPts % REDEEM_THRESHOLD) / REDEEM_THRESHOLD, 1);
  const ptsToNext = REDEEM_THRESHOLD - (loyaltyPts % REDEEM_THRESHOLD);
  const totalRedeemable = Math.floor(loyaltyPts / REDEEM_THRESHOLD) * REDEEM_VALUE;

  const loadJournal = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(JOURNAL_KEY);
      if (raw) setJournal(JSON.parse(raw) as DosageEntry[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

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

  async function addDosageEntry() {
    const canned = CANNED_ENTRIES[journal.length % CANNED_ENTRIES.length];
    const entry: DosageEntry = {
      id: `dj_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      ...canned,
    };
    const next = [entry, ...journal];
    setJournal(next);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
  }

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
          'Botanical Points',
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
        Alert.alert(
          `${store.name} — Contact & Hours`,
          `${store.address}, ${store.city} ${store.postalCode}\n\n📞 ${store.phone}\n\n🕐 ${store.hoursLines.map((l) => `${l.days}: ${l.hours}`).join('\n')}\n\nFor product questions, call us or visit in store.`,
          [
            { text: 'Call Now', onPress: () => Linking.openURL(`tel:${store.phone}`) },
            { text: 'Close', style: 'cancel' },
          ],
        );
        break;

      case 'about':
        Linking.openURL(STORE_WEBSITE);
        break;

      case 'terms':
        Alert.alert(
          'Terms & Privacy',
          'By using this app you confirm you are 19+ years of age. All purchases require valid government-issued ID at pickup.\n\nPersonal data is stored securely and never sold to third parties. For full terms visit our website.',
          [
            { text: 'View Website', onPress: () => Linking.openURL(STORE_WEBSITE) },
            { text: 'OK', style: 'cancel' },
          ],
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
          icon: 'gift-outline',
          label: 'Botanical Points',
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
        <LinearGradient
          colors={[theme.colors.secondaryContainer + '55', theme.colors.surface]}
          style={styles.profileHeader}
        >
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={theme.colors.white} />
            </View>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userSince}>Member since {memberYear} · {store.city}, {store.province}</Text>

          {/* Botanical Points card */}
          <TouchableOpacity
            style={styles.loyaltyCard}
            activeOpacity={0.85}
            onPress={() => handleMenuItem('loyalty')}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.gold} />
            ) : (
              <>
                <View style={styles.loyaltyLeft}>
                  <View style={styles.loyaltyIcon}>
                    <Ionicons name="leaf" size={18} color={theme.colors.gold} />
                  </View>
                  <View>
                    <Text style={styles.loyaltyLabel}>BOTANICAL POINTS</Text>
                    <Text style={styles.loyaltyPoints}>{loyaltyPts.toLocaleString()} pts</Text>
                  </View>
                </View>
                <View style={styles.loyaltyRight}>
                  <Text style={styles.loyaltyNext}>
                    {totalRedeemable > 0
                      ? `$${totalRedeemable} ready to redeem!`
                      : `${ptsToNext} pts until $${REDEEM_VALUE} off`}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
                  </View>
                  <Text style={styles.loyaltyRedeem}>1 pt / $1 · {REDEEM_THRESHOLD} pts = ${REDEEM_VALUE}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Dosage Journal */}
        <View style={styles.section}>
          <View style={styles.journalHeader}>
            <Text style={styles.sectionTitle}>Dosage Journal</Text>
            <TouchableOpacity style={styles.newEntryBtn} onPress={addDosageEntry} activeOpacity={0.85}>
              <Ionicons name="add" size={14} color={theme.colors.white} />
              <Text style={styles.newEntryText}>Add</Text>
            </TouchableOpacity>
          </View>
          {journal.length === 0 ? (
            <View style={styles.journalEmpty}>
              <Ionicons name="water-outline" size={28} color={theme.colors.primaryLight} />
              <Text style={styles.journalEmptyText}>
                Track doses and routines for your botanical practice.
              </Text>
            </View>
          ) : (
            <View style={styles.journalList}>
              {journal.map((entry) => (
                <View key={entry.id} style={styles.journalCard}>
                  <View style={styles.journalTop}>
                    <Text style={styles.journalProduct}>{entry.productName}</Text>
                    <View style={styles.strainBadge}>
                      <Text style={styles.strainBadgeText}>{entry.strain}</Text>
                    </View>
                  </View>
                  <Text style={styles.journalDose}>{entry.dose}</Text>
                  <Text style={styles.journalNote}>{entry.note}</Text>
                  <Text style={styles.journalDate}>{entry.date}</Text>
                </View>
              ))}
            </View>
          )}
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
                      size={18}
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
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                      )
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <View style={styles.footerLogoRow}>
            <Ionicons name="leaf" size={16} color={theme.colors.accentDark} />
            <Text style={styles.footerLogo}>Luminous Botanical</Text>
          </View>
          <Text style={styles.footerVersion}>{store.name}, {store.province} · v1.0.0</Text>
          <Text style={styles.footerAge}>19+ Only. Keep out of reach of children.</Text>
        </View>
      </ScrollView>

      <StoreSheet
        visible={showStoreSheet}
        onClose={() => setShowStoreSheet(false)}
        activeStore={store}
        onSelect={setStore}
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
    borderBottomColor: theme.colors.border,
  },
  topNavTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gold,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: theme.colors.gold,
  },
  avatarText: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 32,
    color: theme.colors.gold,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  userName: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  userSince: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  loyaltyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    width: '100%',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.medium,
    minHeight: 72,
    borderWidth: 1,
    borderColor: theme.colors.gold + '55',
  },
  loyaltyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loyaltyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(204, 168, 48, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loyaltyLabel: {
    ...theme.typography.label,
    color: theme.colors.gold,
  },
  loyaltyPoints: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.white,
  },
  loyaltyRight: {
    flex: 1,
    gap: 4,
  },
  loyaltyNext: {
    ...theme.typography.small,
    color: theme.colors.onPrimaryMuted,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.full,
  },
  loyaltyRedeem: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.gold,
    textAlign: 'right',
  },
  section: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.accentDark,
    marginBottom: theme.spacing.sm,
    paddingLeft: 4,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  newEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  newEntryText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.white,
  },
  journalEmpty: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  journalEmptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  journalList: {
    gap: theme.spacing.sm,
  },
  journalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.secondaryContainer,
    padding: theme.spacing.md,
    gap: 4,
    ...theme.shadows.small,
  },
  journalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  journalProduct: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  strainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryContainer,
  },
  strainBadgeText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: theme.colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  journalDose: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  journalNote: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  journalDate: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
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
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDestructive: {
    backgroundColor: theme.colors.danger + '15',
  },
  menuLabel: {
    ...theme.typography.body,
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
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  verifiedText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: 4,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLogo: {
    ...theme.typography.subheading,
    color: theme.colors.textMuted,
  },
  footerVersion: {
    ...theme.typography.small,
    color: theme.colors.textDisabled,
  },
  footerAge: {
    ...theme.typography.small,
    color: theme.colors.textDisabled,
    marginTop: 4,
  },
});
