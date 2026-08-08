import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../../theme';
import {
  DEALS,
  NEW_PRODUCTS,
  TOP_TESTERS,
  BUDGET_FINDS,
  getProductsByCategory,
  type Category,
  type Product,
} from '../../../data/products';
import DealCard from '../../../components/DealCard';
import SectionRow from '../../../components/SectionRow';
import ProductDetailModal from '../../../components/ProductDetailModal';
import StoreSheet from '../../../components/StoreSheet';
import AIButton from '../../../components/AIButton';
import { useCart } from '../../../context/CartContext';
import { useStore } from '../../../context/StoreContext';

const RITUAL_KEY = '@azure_bloom_daily_ritual';

const ALL_CATEGORIES: Category[] = [
  'Flower',
  'Pre-Rolls',
  'Vape',
  'Edibles',
  'Beverage',
  'Oral',
  'Hemp Products',
  'Accessories',
  'Apparel',
];

type RitualState = {
  hydrate: boolean;
  dose: boolean;
  pickup: boolean;
};

const DEFAULT_RITUAL: RitualState = { hydrate: false, dose: false, pickup: false };

const RITUAL_ITEMS: { key: keyof RitualState; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'hydrate', label: 'Hydrate', icon: 'water-outline' },
  { key: 'dose', label: 'Dose reminder', icon: 'alarm-outline' },
  { key: 'pickup', label: 'Pickup window', icon: 'time-outline' },
];

const CATEGORY_GRID: {
  id: Category;
  name: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  bg: string;
  fg: string;
}[] = [
  { id: 'Flower', name: 'Flower', icon: 'flower-pollen', bg: 'rgba(91, 124, 250, 0.14)', fg: '#5B7CFA' },
  { id: 'Pre-Rolls', name: 'Pre-Rolls', icon: 'cigar', bg: 'rgba(255, 122, 89, 0.14)', fg: '#FF7A59' },
  { id: 'Vape', name: 'Vape', icon: 'smoke', bg: 'rgba(125, 211, 252, 0.28)', fg: '#2B8BB8' },
  { id: 'Edibles', name: 'Edibles', icon: 'candy', bg: 'rgba(155, 140, 255, 0.18)', fg: '#5B4BB8' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { store, setStore } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [ritual, setRitual] = useState<RitualState>(DEFAULT_RITUAL);
  const [ritualReady, setRitualReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(RITUAL_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as RitualState;
          setRitual({
            hydrate: !!parsed.hydrate,
            dose: !!parsed.dose,
            pickup: !!parsed.pickup,
          });
        } catch {
          // ignore corrupt cache
        }
      }
      setRitualReady(true);
    });
  }, []);

  const toggleRitual = useCallback(async (key: keyof RitualState) => {
    setRitual((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(RITUAL_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleProductPress = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const navigateToCategory = useCallback((categoryId: string) => {
    router.push({ pathname: '/(tabs)/search', params: { category: categoryId } });
  }, [router]);

  const ritualDone = Object.values(ritual).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.7} onPress={() => setShowStoreSheet(true)}>
          <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{store.city}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Azure Bloom</Text>
        <View style={styles.headerActions}>
          <AIButton />
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(tabs)/cart')}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={22} color={theme.colors.primary} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Daily Ritual FIRST — invert marketing-first layout */}
        <View style={styles.ritualCard}>
          <View style={styles.ritualHeader}>
            <View>
              <Text style={styles.ritualEyebrow}>TODAY</Text>
              <Text style={styles.ritualTitle}>Daily Ritual</Text>
            </View>
            <View style={styles.ritualCount}>
              <Text style={styles.ritualCountText}>
                {ritualReady ? `${ritualDone}/3` : '…'}
              </Text>
            </View>
          </View>
          {RITUAL_ITEMS.map((item) => {
            const checked = ritual[item.key];
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.ritualRow}
                onPress={() => toggleRitual(item.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                  {checked && (
                    <Ionicons name="checkmark" size={14} color={theme.colors.white} />
                  )}
                </View>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={checked ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.ritualLabel, checked && styles.ritualLabelDone]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2×2 pastel category grid */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Blooms</Text>
          </View>
          <View style={styles.catGrid}>
            {CATEGORY_GRID.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catCard, { backgroundColor: cat.bg }]}
                onPress={() => navigateToCategory(cat.id)}
                activeOpacity={0.85}
              >
                <View style={styles.catIconCircle}>
                  <MaterialCommunityIcons name={cat.icon} size={26} color={cat.fg} />
                </View>
                <Text style={[styles.catName, { color: cat.fg }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hero teaser — marketing lower */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[theme.colors.primary, '#7B9CFF', theme.colors.info]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroEyebrow}>DAILY BLOOM</Text>
            <Text style={styles.heroTitle}>Clear skies for clearer rituals.</Text>
            <Text style={styles.heroSub}>
              Periwinkle calm, coral spark, and airy botanical care.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>START YOUR RITUAL</Text>
              <Ionicons name="arrow-forward" size={15} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.pickupCard} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupIcon}>
            <Ionicons name="storefront-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>PICKUP LOCATION</Text>
            <Text style={styles.pickupAddress}>{store.address}, {store.city}</Text>
            <View style={styles.openRow}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>{store.hoursShort}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sky Deals</Text>
            <TouchableOpacity style={styles.seeAllRow} activeOpacity={0.7} onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {DEALS.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View>

        <SectionRow
          title="New & Now"
          subtitle="Just landed in store"
          products={NEW_PRODUCTS}
          accentColor={theme.colors.primary}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Staff picks"
          subtitle="Highest THC right now"
          products={TOP_TESTERS}
          accentColor={theme.colors.accent}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Budget Finds"
          subtitle="Great value"
          products={BUDGET_FINDS}
          accentColor={theme.colors.info}
          onProductPress={handleProductPress}
        />

        {ALL_CATEGORIES.map((cat) => {
          const products = getProductsByCategory(cat);
          if (products.length === 0) return null;
          return (
            <SectionRow
              key={cat}
              title={cat}
              products={products}
              accentColor={theme.colors.primary}
              onProductPress={handleProductPress}
              onSeeAll={() => navigateToCategory(cat)}
            />
          );
        })}

        <View style={styles.footer}>
          <View style={styles.seal}>
            <Text style={styles.sealLetter}>A</Text>
          </View>
          <Text style={styles.footerTitle}>Stay light. Bloom daily.</Text>
          <Text style={styles.footerText}>Azure Bloom · {store.name}, {store.province}</Text>
          <Text style={styles.footerSub}>19+ Only · Please consume responsibly</Text>
        </View>
      </ScrollView>

      <ProductDetailModal
        product={selectedProduct}
        visible={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 88,
    maxWidth: 120,
    flexShrink: 1,
  },
  locationText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  wordmark: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.primary,
    letterSpacing: -0.4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    width: 92,
    justifyContent: 'flex-end',
  },
  headerIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: theme.colors.accent,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: theme.colors.white,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
  },

  heroWrap: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  hero: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  heroEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.white,
  },
  heroTitle: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 28,
    lineHeight: 34,
    color: theme.colors.white,
  },
  heroSub: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.xs,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.xs,
  },
  heroBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: theme.colors.primaryDark,
  },

  ritualCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    gap: 4,
  },
  ritualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  ritualEyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: theme.colors.primary,
  },
  ritualTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.text,
    marginTop: 2,
  },
  ritualCount: {
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  ritualCountText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.primaryDark,
  },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: theme.radius.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  checkboxOn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ritualLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
  },
  ritualLabelDone: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },

  sectionWrap: { marginBottom: theme.spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.heading,
    color: theme.colors.primary,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  hScroll: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 2,
    paddingBottom: 6,
    gap: theme.spacing.md,
  },

  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'space-between',
    rowGap: theme.spacing.sm,
  },
  catCard: {
    width: '48%',
    borderRadius: theme.radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
  },
  catIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
  },

  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    ...theme.shadows.small,
  },
  pickupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  pickupAddress: {
    fontFamily: theme.fonts.serif,
    fontSize: 15,
    color: theme.colors.text,
    marginTop: 1,
  },
  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  openDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.success,
  },
  openText: {
    ...theme.typography.small,
    color: theme.colors.success,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: 6,
  },
  seal: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  sealLetter: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 28,
    color: theme.colors.onSecondaryContainer,
  },
  footerTitle: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 20,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  footerSub: {
    ...theme.typography.small,
    color: theme.colors.textDisabled,
  },
});
