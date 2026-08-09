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
  const featuredDeal = DEALS[0];

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
        {/* Sunny SPLIT hero: left CTA + right deal teaser */}
        <View style={styles.heroWrap}>
          <View style={styles.heroSplit}>
            <LinearGradient
              colors={[theme.colors.primary, '#F08A3A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroLeft}
            >
              <Text style={styles.heroEyebrow}>SUN-DRENCHED</Text>
              <Text style={styles.heroTitle}>Squeeze more joy.</Text>
              <Text style={styles.heroSub}>
                Coral energy & grove-fresh botanicals.
              </Text>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => router.push('/(tabs)/search')}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBtnText}>ENTER GROVE</Text>
                <Ionicons name="arrow-forward" size={14} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            </LinearGradient>

            {featuredDeal && (
              <TouchableOpacity
                style={styles.heroDeal}
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/search')}
              >
                <LinearGradient
                  colors={featuredDeal.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroDealInner}
                >
                  <View style={styles.heroDealBadge}>
                    <Text style={styles.heroDealBadgeText}>{featuredDeal.badge}</Text>
                  </View>
                  <Text style={styles.heroDealTitle} numberOfLines={2}>
                    {featuredDeal.title}
                  </Text>
                  <Text style={styles.heroDealSub} numberOfLines={2}>
                    {featuredDeal.subtitle}
                  </Text>
                  <Text style={styles.heroDealTap}>View →</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sunny pickup chip with open-status */}
        <TouchableOpacity style={styles.pickupChip} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupSun}>
            <Ionicons name="sunny-outline" size={18} color={theme.colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>Pickup</Text>
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
          accentColor={theme.colors.accentDark}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Budget Finds"
          subtitle="Great value"
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
    paddingVertical: 12,
    overflow: 'visible',
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
    lineHeight: 30,
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
  heroSplit: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 200,
  },
  heroLeft: {
    flex: 1.15,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    gap: 6,
    justifyContent: 'flex-end',
    ...theme.shadows.medium,
  },
  heroDeal: {
    flex: 0.95,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  heroDealInner: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 200,
  },
  heroDealBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  heroDealBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    letterSpacing: 1,
    color: theme.colors.white,
  },
  heroDealTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 18,
    lineHeight: 22,
    color: theme.colors.white,
  },
  heroDealSub: {
    ...theme.typography.small,
    color: 'rgba(255,255,255,0.92)',
  },
  heroDealTap: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-end',
  },
  heroEyebrow: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: theme.colors.white,
  },
  heroTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    lineHeight: 26,
    color: theme.colors.white,
  },
  heroSub: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 4,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    marginTop: 4,
  },
  heroBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
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
