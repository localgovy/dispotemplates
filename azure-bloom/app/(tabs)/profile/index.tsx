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

const STORE_WEBSITE = 'https://www.azurebloom.com';

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
    'Alex Rivera';

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const loyaltyPts = profile?.loyalty_pts ?? 0;
  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : 2024;
  const REDEEM_THRESHOLD = 500;
  const REDEEM_VALUE = 10;
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
          'Bloom Points',
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

  const MENU_SECTIONS: { title: string; pastel: string; items: MenuItem[] }[] = [
    {
      title: 'Preferences',
      pastel: theme.colors.surfaceElevated,
      items: [
        { id: 'notif', icon: 'notifications-outline', label: 'Order Updates', toggle: true, toggleKey: 'notif' },
        { id: 'deals', icon: 'pricetag-outline', label: 'Deal Alerts', toggle: true, toggleKey: 'deals' },
        { id: 'location', icon: 'location-outline', label: 'Store Location', value: `${store.name}, ${store.province}` },
      ],
    },
    {
      title: 'Account',
      pastel: theme.colors.secondaryContainer,
      items: [
        { id: 'personal', icon: 'person-outline', label: 'Personal Info', value: displayName },
        { id: 'age', icon: 'shield-checkmark-outline', label: 'Age Verification', value: 'Verified ✓' },
        {
          id: 'loyalty',
          icon: 'flower-outline',
          label: 'Bloom Points',
          value: `${loyaltyPts.toLocaleString()} pts`,
        },
      ],
    },
    {
      title: 'Shop',
      pastel: '#E8F8FF',
      items: [
        { id: 'favourites', icon: 'heart-outline', label: 'Saved Favourites' },
        { id: 'payment', icon: 'card-outline', label: 'Payment Methods', value: 'Cash / Debit / Credit' },
      ],
    },
    {
      title: 'Support',
      pastel: '#FFF0EC',
      items: [
        { id: 'faq', icon: 'call-outline', label: 'Contact & Hours' },
        { id: 'about', icon: 'globe-outline', label: 'Our Website' },
        { id: 'terms', icon: 'document-text-outline', label: 'Terms & Privacy' },
      ],
    },
    {
      title: '',
      pastel: theme.colors.white,
      items: [
        { id: 'signout', icon: 'log-out-outline', label: 'Sign Out', destructive: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Calm header with Bloom Points chip */}
      <View style={styles.topNav}>
        <View style={styles.topNavLeft}>
          <View style={styles.miniAvatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.miniAvatarImage} />
            ) : (
              <Text style={styles.miniAvatarText}>{avatarInitial}</Text>
            )}
          </View>
          <View>
            <Text style={styles.topNavTitle}>Account</Text>
            <Text style={styles.topNavSub}>{displayName} · since {memberYear}</Text>
          </View>
        </View>
        <View style={styles.topNavRight}>
          <TouchableOpacity
            style={styles.pointsChip}
            activeOpacity={0.85}
            onPress={() => handleMenuItem('loyalty')}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="flower" size={12} color={theme.colors.primary} />
                <Text style={styles.pointsChipText}>{loyaltyPts.toLocaleString()} pts</Text>
              </>
            )}
          </TouchableOpacity>
          <AIButton />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.section}>
            {section.title !== '' && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            <View style={[styles.menuCard, { backgroundColor: section.pastel }]}>
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
                      color={item.destructive ? theme.colors.accent : theme.colors.primary}
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
            <Ionicons name="flower-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.footerLogo}>Azure Bloom</Text>
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
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  topNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  miniAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  miniAvatarText: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 14,
    color: theme.colors.white,
  },
  topNavTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.primary,
  },
  topNavSub: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  pointsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryContainer,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    minWidth: 72,
    justifyContent: 'center',
  },
  pointsChipText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.primaryDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    paddingLeft: 4,
  },
  menuCard: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
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
    borderBottomColor: 'rgba(26, 36, 64, 0.06)',
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDestructive: {
    backgroundColor: 'rgba(255, 122, 89, 0.16)',
  },
  menuLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  menuLabelDestructive: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.semibold,
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
    color: theme.colors.primary,
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
