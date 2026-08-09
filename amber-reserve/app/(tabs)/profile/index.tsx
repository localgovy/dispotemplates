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
          'Reserve Points',
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
          icon: 'gift-outline',
          label: 'Reserve Points',
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
        {/* Compact member strip */}
        <TouchableOpacity
          style={styles.memberStrip}
          activeOpacity={0.85}
          onPress={() => handleMenuItem('loyalty')}
        >
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
            )}
          </View>
          <View style={styles.memberMeta}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userSince}>Member since {memberYear} · {store.city}</Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.gold} style={{ marginTop: 4 }} />
            ) : (
              <View style={styles.pointsRow}>
                <Text style={styles.pointsLabel}>RESERVE POINTS</Text>
                <Text style={styles.pointsValue}>{loyaltyPts.toLocaleString()}</Text>
              </View>
            )}
          </View>
          <View style={styles.stripRight}>
            <View style={styles.miniProgress}>
              <View style={[styles.miniProgressFill, { width: `${progressPct * 100}%` }]} />
            </View>
            <Text style={styles.stripHint}>
              {totalRedeemable > 0 ? `$${totalRedeemable} ready` : `${ptsToNext} to $${REDEEM_VALUE}`}
            </Text>
          </View>
        </TouchableOpacity>

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
            <Text style={styles.footerLogo}>Amber Reserve</Text>
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
  memberStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.asymmetric,
    gap: theme.spacing.sm,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  avatarText: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.onPrimary,
  },
  memberMeta: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 17,
    color: theme.colors.text,
  },
  userSince: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  pointsLabel: {
    ...theme.typography.label,
    color: theme.colors.gold,
  },
  pointsValue: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.text,
  },
  stripRight: {
    alignItems: 'flex-end',
    gap: 6,
    width: 72,
  },
  miniProgress: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.full,
  },
  stripHint: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: theme.colors.textMuted,
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
    paddingVertical: theme.spacing.md,
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
