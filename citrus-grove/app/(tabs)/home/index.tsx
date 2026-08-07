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
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import theme from '../../../theme';
import {
  DEALS,
  NEW_PRODUCTS,
  TOP_TESTERS,
  BUDGET_FINDS,
  CATEGORIES,
  getProductsByCategory,
  type Category,
  type Product,
} from '../../../data/products';
import DealCard from '../../../components/DealCard';
import SectionRow from '../../../components/SectionRow';
import ProductDetailModal from '../../../components/ProductDetailModal';
import StoreSheet from '../../../components/StoreSheet';
import AIButton from '../../../components/AIButton';
import ProductCard from '../../../components/ProductCard';
import { useCart } from '../../../context/CartContext';
import { useStore } from '../../../context/StoreContext';

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

const TILE_COLORS = [
  { bg: 'rgba(232, 93, 76, 0.14)', icon: '#E85D4C' },
  { bg: 'rgba(245, 197, 24, 0.22)', icon: '#C9A00E' },
  { bg: 'rgba(60, 179, 113, 0.16)', icon: '#3CB371' },
  { bg: 'rgba(232, 93, 76, 0.10)', icon: '#C43D2E' },
];

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function HomeScreen() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { store, setStore } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStoreSheet, setShowStoreSheet] = useState(false);

  const grovePicks = TOP_TESTERS.length > 0 ? TOP_TESTERS : NEW_PRODUCTS;

  const handleProductPress = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const navigateToCategory = useCallback((categoryId: string) => {
    router.push({ pathname: '/(tabs)/search', params: { category: categoryId } });
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.7} onPress={() => setShowStoreSheet(true)}>
          <Ionicons name="sunny" size={14} color={theme.colors.accentDark} />
          <Text style={styles.locationText} numberOfLines={1}>{store.city}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.accentDark} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Citrus Grove</Text>
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
        {/* Sun-drenched hero */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[theme.colors.primary, '#F08A3A', theme.colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroEyebrow}>SUN-DRENCHED HARVEST</Text>
            <Text style={styles.heroTitle}>Squeeze more joy from every ritual.</Text>
            <Text style={styles.heroSub}>
              Coral energy, citrus lift, and grove-fresh botanicals.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>ENTER THE GROVE</Text>
              <Ionicons name="arrow-forward" size={15} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Sunny pickup chip */}
        <TouchableOpacity style={styles.pickupChip} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupSun}>
            <Ionicons name="sunny-outline" size={18} color={theme.colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>SUNNY PICKUP</Text>
            <Text style={styles.pickupAddress} numberOfLines={1}>
              {store.name} · {store.address}
            </Text>
          </View>
          <View style={styles.openPill}>
            <View style={styles.openDot} />
            <Text style={styles.openText}>Open</Text>
          </View>
        </TouchableOpacity>

        {/* Grove Picks rail */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>FRESH FROM THE GROVE</Text>
              <Text style={styles.sectionTitle}>Grove Picks</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllRow}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {grovePicks.slice(0, 10).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                width={168}
                onPress={() => handleProductPress(product)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Soft rounded category tiles */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse the Grove</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {CATEGORIES.map((cat, i) => {
              const palette = TILE_COLORS[i % TILE_COLORS.length];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catTile, { backgroundColor: palette.bg }]}
                  onPress={() => navigateToCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.catIconWrap}>
                    <MaterialCommunityIcons
                      name={cat.icon as MCIName}
                      size={26}
                      color={palette.icon}
                    />
                  </View>
                  <Text style={styles.catLabel} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Playful Sunny Deals */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sunny Deals</Text>
            <TouchableOpacity style={styles.seeAllRow} activeOpacity={0.7}>
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
          title="Top Testers"
          subtitle="Highest potency in store"
          products={TOP_TESTERS}
          accentColor={theme.colors.accentDark}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Budget Finds"
          subtitle="Bright value picks"
          products={BUDGET_FINDS}
          accentColor={theme.colors.success}
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
            <Text style={styles.sealLetter}>C</Text>
          </View>
          <Text style={styles.footerTitle}>Stay sunny in the grove.</Text>
          <Text style={styles.footerText}>Citrus Grove · {store.name}, {store.province}</Text>
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
    width: 92,
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
    letterSpacing: -0.3,
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
    color: theme.colors.text,
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
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.white,
  },
  heroTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 28,
    lineHeight: 34,
    color: theme.colors.white,
  },
  heroSub: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.92)',
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
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: theme.colors.primaryDark,
  },

  pickupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  pickupSun: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupLabel: {
    ...theme.typography.label,
    color: theme.colors.primaryDark,
    fontSize: 9,
  },
  pickupAddress: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.text,
    marginTop: 1,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  openDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.success,
  },
  openText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.success,
  },

  sectionWrap: { marginBottom: theme.spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionEyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.accentDark,
    marginBottom: 2,
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
    gap: theme.spacing.sm + 2,
  },

  catTile: {
    width: 96,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
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
    fontFamily: theme.fonts.serifBold,
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
