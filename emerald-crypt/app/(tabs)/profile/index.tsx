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
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase, Tables } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import StoreSheet from '../../../components/StoreSheet';
import AIButton from '../../../components/AIButton';
import theme from '../../../theme';

const STORE_WEBSITE = 'https://www.emeraldcrypt.example';

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

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'Guest';

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const loyaltyPts = profile?.loyalty_pts ?? 0;
  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : 2024;
  const archiveId = user?.id
    ? `ARC-${user.id.slice(0, 4).toUpperCase()}-${user.id.slice(4, 8).toUpperCase()}`
    : 'ARC-GUEST-0000';
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
          'Crypt Tokens',
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
      title: 'VAULT / ACCOUNT',
      items: [
        { id: 'personal', icon: 'person-outline', label: 'Personal Info', value: displayName },
        { id: 'age', icon: 'shield-checkmark-outline', label: 'Age Verification', value: 'Verified ✓' },
        {
          id: 'loyalty',
          icon: 'diamond-outline',
          label: 'Crypt Tokens',
          value: `${loyaltyPts.toLocaleString()} pts`,
        },
      ],
    },
    {
      title: 'VAULT / PREFERENCES',
      items: [
        { id: 'notif', icon: 'notifications-outline', label: 'Order Updates', toggle: true, toggleKey: 'notif' },
        { id: 'deals', icon: 'pricetag-outline', label: 'Deal Alerts', toggle: true, toggleKey: 'deals' },
        { id: 'location', icon: 'location-outline', label: 'Store Location', value: `${store.name}, ${store.province}` },
      ],
    },
    {
      title: 'VAULT / SHOP',
      items: [
        { id: 'favourites', icon: 'heart-outline', label: 'Saved Favourites' },
        { id: 'payment', icon: 'card-outline', label: 'Payment Methods', value: 'Cash / Debit / Credit' },
      ],
    },
    {
      title: 'VAULT / SUPPORT',
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
        <Text style={styles.topNavTitle}>Archive</Text>
        <AIButton />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Archive member ID block */}
        <View style={styles.archiveBlock}>
          <View style={styles.fileTab}>
            <Ionicons name="folder-outline" size={12} color={theme.colors.primary} />
            <Text style={styles.fileTabText}>MEMBER_RECORD.vault</Text>
          </View>
          <View style={styles.archiveBody}>
            <View style={styles.archiveHeader}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarInitial}</Text>
                </View>
              )}
              <View style={styles.archiveMeta}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.fieldLabel}>ARCHIVE ID</Text>
                <Text style={styles.archiveId}>{archiveId}</Text>
                <Text style={styles.filedAt}>Filed {memberYear} · {store.city} vault</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            <TouchableOpacity
              style={styles.tokenRow}
              activeOpacity={0.85}
              onPress={() => handleMenuItem('loyalty')}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <View>
                    <Text style={styles.fieldLabel}>CRYPT TOKENS</Text>
                    <Text style={styles.tokenPts}>{loyaltyPts.toLocaleString()}</Text>
                  </View>
                  <View style={styles.tokenRight}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
                    </View>
                    <Text style={styles.tokenHint}>
                      {totalRedeemable > 0
                        ? `$${totalRedeemable} unlockable`
                        : `${ptsToNext} → $${REDEEM_VALUE}`}
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
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
            <Ionicons name="lock-closed-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.footerLogo}>Emerald Crypt</Text>
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
  archiveBlock: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  fileTab: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: theme.radius.sm,
    borderTopRightRadius: theme.radius.sm,
  },
  fileTabText: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.primary,
  },
  archiveBody: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  archiveHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  avatarText: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: theme.colors.primary,
  },
  archiveMeta: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.accent,
  },
  archiveId: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.primaryLight,
    letterSpacing: 0.8,
  },
  filedAt: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    minHeight: 56,
  },
  tokenPts: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: theme.colors.text,
  },
  tokenRight: {
    flex: 1,
    gap: 6,
  },
  progressBar: {
    height: 5,
    backgroundColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  tokenHint: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'right',
  },
  section: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.accent,
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
    width: 30,
    height: 30,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuIconDestructive: {
    backgroundColor: theme.colors.danger + '15',
    borderColor: theme.colors.danger + '40',
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
