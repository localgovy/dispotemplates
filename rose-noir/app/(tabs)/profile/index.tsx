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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase, Tables } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { useFavourites } from '../../../context/FavouritesContext';
import { PRODUCTS } from '../../../data/products';
import StoreSheet from '../../../components/StoreSheet';
import ContactHoursSheet from '../../../components/ContactHoursSheet';
import AIButton from '../../../components/AIButton';
import theme from '../../../theme';

const DOSAGE_KEY = '@rose_noir_dosage_journal';

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
  note: string;
  dose: string;
  method: string;
}

const FLAVOR_BY_STRAIN: Record<string, string> = {
  Indica: 'Earthy & Pine',
  Sativa: 'Citrus & Floral',
  Hybrid: 'Berry & Spice',
  CBD: 'Herbal & Soft',
};

function formatEntryDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '--', mon: '—' };
  return {
    day: String(d.getDate()).padStart(2, '0'),
    mon: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { store, setStore } = useStore();
  const { favourites } = useFavourites();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [toggles, setToggles] = useState({ notif: true, deals: true });
  const [loading, setLoading] = useState(true);
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [showContactHours, setShowContactHours] = useState(false);
  const [journal, setJournal] = useState<DosageEntry[]>([]);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Alex Rivera';

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const loyaltyPts = profile?.loyalty_pts ?? 0;
  const memberId = user?.id ? `RN-${user.id.slice(0, 6).toUpperCase()}` : 'RN-GUEST';
  const REDEEM_THRESHOLD = 500;
  const REDEEM_VALUE = 10;
  const progressPct = Math.min((loyaltyPts % REDEEM_THRESHOLD) / REDEEM_THRESHOLD, 1);
  const ptsToNext = REDEEM_THRESHOLD - (loyaltyPts % REDEEM_THRESHOLD);
  const totalRedeemable = Math.floor(loyaltyPts / REDEEM_THRESHOLD) * REDEEM_VALUE;

  const curated = useMemo(() => {
    const favProducts = PRODUCTS.filter((p) => favourites.has(p.id));
    if (favProducts.length === 0) {
      return {
        strain: 'Indica Dominant',
        flavor: 'Earthy & Pine',
        format: 'Flower',
      };
    }
    const strainCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    for (const p of favProducts) {
      if (p.strain !== 'N/A') strainCounts[p.strain] = (strainCounts[p.strain] ?? 0) + 1;
      catCounts[p.category] = (catCounts[p.category] ?? 0) + 1;
    }
    const topStrain =
      Object.entries(strainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Hybrid';
    const topFormat =
      Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Flower';
    return {
      strain: `${topStrain} Dominant`,
      flavor: FLAVOR_BY_STRAIN[topStrain] ?? 'Earthy & Pine',
      format: topFormat,
    };
  }, [favourites]);

  useEffect(() => {
    AsyncStorage.getItem(DOSAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as DosageEntry[];
        if (Array.isArray(parsed)) setJournal(parsed);
      } catch {
        /* ignore corrupt cache */
      }
    });
  }, []);

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

  async function persistJournal(next: DosageEntry[]) {
    setJournal(next);
    await AsyncStorage.setItem(DOSAGE_KEY, JSON.stringify(next));
  }

  function pushSampleEntry(overrides?: Partial<DosageEntry>) {
    const entry: DosageEntry = {
      id: `dose-${Date.now()}`,
      date: new Date().toISOString(),
      productName: overrides?.productName ?? 'Midnight Kush',
      note: overrides?.note ?? 'Soft body melt. Perfect lounge pace.',
      dose: overrides?.dose ?? '0.3g',
      method: overrides?.method ?? 'Flower',
    };
    void persistJournal([entry, ...journal]);
  }

  function addJournalEntry() {
    if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
      Alert.prompt(
        'New Dosage Entry',
        'Product name for tonight’s ritual:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: (name?: string) => {
              pushSampleEntry({
                productName: name?.trim() || 'Untitled Ritual',
                note: 'Logged from the lounge.',
              });
            },
          },
        ],
        'plain-text',
      );
      return;
    }
    pushSampleEntry();
  }

  function handleRedeem() {
    if (totalRedeemable > 0) {
      Alert.alert(
        'Redeem Noir Points',
        `You have $${totalRedeemable} ready.\n\nMention this at pickup and we’ll apply $${REDEEM_VALUE} off per ${REDEEM_THRESHOLD} pts.`,
        [{ text: 'Got it' }],
      );
      return;
    }
    Alert.alert(
      'Noir Points',
      `You have ${loyaltyPts.toLocaleString()} pts.\n\nEarn 1 pt per $1 spent.\nRedeem ${REDEEM_THRESHOLD} pts for $${REDEEM_VALUE} off.\n\n${ptsToNext} more pts until your next reward.`,
    );
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
        handleRedeem();
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
          icon: 'gift-outline',
          label: 'Noir Points',
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
        {/* Thesis hero */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={theme.colors.onPrimary} />
            </View>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillText}>NOIR TIER MEMBER</Text>
          </View>
          <Text style={styles.memberId}>Member ID · {memberId}</Text>
        </View>

        {/* Loyalty */}
        <View style={styles.loyaltyCard}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primaryLight} />
          ) : (
            <>
              <View style={styles.loyaltyTop}>
                <View>
                  <Text style={styles.loyaltyLabel}>NOIR POINTS</Text>
                  <Text style={styles.loyaltyPoints}>{loyaltyPts.toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={styles.redeemBtn} onPress={handleRedeem} activeOpacity={0.85}>
                  <Text style={styles.redeemBtnText}>Redeem</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.loyaltyNext}>
                {totalRedeemable > 0
                  ? `$${totalRedeemable} ready to redeem`
                  : `${ptsToNext} pts until $${REDEEM_VALUE} off`}
              </Text>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.max(progressPct * 100, 4)}%` }]}
                />
              </View>
              <Text style={styles.loyaltyHint}>1 pt / $1 · {REDEEM_THRESHOLD} pts = ${REDEEM_VALUE}</Text>
            </>
          )}
        </View>

        {/* Curated Tastes */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Curated Tastes</Text>
          <View style={styles.tastesCard}>
            <TasteRow label="Primary Strain" value={curated.strain} />
            <View style={styles.tasteDivider} />
            <TasteRow label="Flavor Profile" value={curated.flavor} />
            <View style={styles.tasteDivider} />
            <TasteRow label="Format" value={curated.format} />
          </View>
        </View>

        {/* Dosage Journal */}
        <View style={styles.sectionPad}>
          <View style={styles.journalHeader}>
            <Text style={styles.sectionTitle}>Dosage Journal</Text>
            <TouchableOpacity style={styles.newEntryBtn} onPress={addJournalEntry} activeOpacity={0.85}>
              <Text style={styles.newEntryText}>+ NEW ENTRY</Text>
            </TouchableOpacity>
          </View>

          {journal.length === 0 ? (
            <View style={styles.emptyJournal}>
              <Text style={styles.emptyJournalText}>
                Log your evening rituals — dose, method, and mood.
              </Text>
            </View>
          ) : (
            journal.map((entry) => {
              const { day, mon } = formatEntryDate(entry.date);
              return (
                <View key={entry.id} style={styles.journalCard}>
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateDay}>{day}</Text>
                    <Text style={styles.dateMon}>{mon}</Text>
                  </View>
                  <View style={styles.journalBody}>
                    <Text style={styles.journalName}>{entry.productName}</Text>
                    <Text style={styles.journalNote} numberOfLines={2}>{entry.note}</Text>
                    <View style={styles.pillRow}>
                      <View style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{entry.dose}</Text>
                      </View>
                      <View style={styles.metaPill}>
                        <Text style={styles.metaPillText}>{entry.method}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Menu Sections */}
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
                      color={item.destructive ? theme.colors.danger : theme.colors.primaryLight}
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
                            ? theme.colors.primaryLight
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
            <Ionicons name="flower-outline" size={16} color={theme.colors.accent} />
            <Text style={styles.footerLogo}>Rose Noir</Text>
          </View>
          <Text style={styles.footerVersion}>{store.name}, {store.province}</Text>
          <Text style={styles.footerAge}>19+ Only. Keep out of reach of children.</Text>
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

function TasteRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tasteRow}>
      <Text style={styles.tasteLabel}>{label}</Text>
      <Text style={styles.tasteValue}>{value}</Text>
    </View>
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
    color: theme.colors.primaryLight,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
  },
  avatarText: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 34,
    color: theme.colors.primaryLight,
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
    borderColor: theme.colors.background,
  },
  userName: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    lineHeight: 34,
    color: theme.colors.textPrimary,
  },
  tierPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryContainer,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  tierPillText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: theme.colors.primaryLight,
  },
  memberId: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
  },
  loyaltyCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  loyaltyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loyaltyLabel: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
  loyaltyPoints: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 32,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  redeemBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  redeemBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.onPrimary,
  },
  loyaltyNext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
  loyaltyHint: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'right',
  },
  sectionPad: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
    paddingLeft: 2,
  },
  tastesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
  },
  tasteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  tasteLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  tasteValue: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  tasteDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  newEntryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.secondaryContainer,
  },
  newEntryText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.primaryLight,
  },
  emptyJournal: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surface,
  },
  emptyJournalText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  journalCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateBlock: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
  },
  dateDay: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 20,
    color: theme.colors.primaryLight,
  },
  dateMon: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.accent,
  },
  journalBody: {
    flex: 1,
    gap: 4,
  },
  journalName: {
    fontFamily: theme.fonts.serif,
    fontSize: 17,
    color: theme.colors.textPrimary,
  },
  journalNote: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaPillText: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.primaryLight,
  },
  section: {
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
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
    backgroundColor: theme.colors.danger + '18',
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
    color: theme.colors.primaryLight,
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
