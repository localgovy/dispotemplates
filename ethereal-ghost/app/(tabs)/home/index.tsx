import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import theme from '../../../theme';
import {
  DEALS,
  NEW_PRODUCTS,
  TOP_TESTERS,
  BUDGET_FINDS,
  CATEGORIES,
  CATEGORY_IMAGE_MAP,
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

const { width: SCREEN_W } = Dimensions.get('window');
const SPOTLIGHT = [...NEW_PRODUCTS, ...TOP_TESTERS].slice(0, 5);
const SLIDE_W = SCREEN_W;

export default function HomeScreen() {
  const router = useRouter();
  const { totalItems, addToCart } = useCart();
  const { store, setStore } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  const handleProductPress = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const navigateToCategory = useCallback((categoryId: string) => {
    router.push({ pathname: '/(tabs)/search', params: { category: categoryId } });
  }, [router]);

  const onSpotlightScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SLIDE_W);
    setSpotlightIndex(idx);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.7} onPress={() => setShowStoreSheet(true)}>
          <Ionicons name="location-sharp" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>{store.name}, {store.province}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Ghost Atelier</Text>
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
        {/* Gallery-first spotlight carousel */}
        <View style={styles.spotlightSection}>
          <Text style={styles.spotlightEyebrow}>Featured</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onSpotlightScroll}
            decelerationRate="fast"
          >
            {SPOTLIGHT.map((product) => (
              <View key={`spot-${product.id}`} style={styles.spotlightSlide}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleProductPress(product)}
                  style={styles.spotlightCard}
                >
                  <Image
                    source={CATEGORY_IMAGE_MAP[product.category]}
                    style={styles.spotlightImage}
                    resizeMode="cover"
                  />
                  <View style={styles.spotlightScrim} />
                  <View style={styles.spotlightMeta}>
                    <Text style={styles.spotlightName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.spotlightPrice}>${product.price.toFixed(2)}</Text>
                    <TouchableOpacity
                      style={styles.spotlightAdd}
                      onPress={() => addToCart(product)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.spotlightAddText}>Add</Text>
                      <Ionicons name="add" size={16} color={theme.colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {SPOTLIGHT.map((p, i) => (
              <View
                key={`dot-${p.id}`}
                style={[styles.dot, i === spotlightIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Pickup */}
        <TouchableOpacity style={styles.pickupCard} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupIcon}>
            <Ionicons name="storefront-outline" size={20} color={theme.colors.textSecondary} />
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

        {/* Vapor category orbs */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse the Atelier</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.orbScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.orb}
                onPress={() => navigateToCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.orbText} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Deals lower — after categories */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured picks</Text>
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
          title="Fresh in the mist"
          subtitle="Just landed in store"
          products={NEW_PRODUCTS}
          accentColor={theme.colors.textSecondary}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Staff picks"
          subtitle="Curated for the Atelier"
          products={TOP_TESTERS}
          accentColor={theme.colors.textSecondary}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Quiet values"
          subtitle="Soft prices, clear picks"
          products={BUDGET_FINDS}
          accentColor={theme.colors.textSecondary}
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
              accentColor={theme.colors.textSecondary}
              onProductPress={handleProductPress}
              onSeeAll={() => navigateToCategory(cat)}
            />
          );
        })}

        <View style={styles.footer}>
          <View style={styles.seal}>
            <Text style={styles.sealLetter}>G</Text>
          </View>
          <Text style={styles.footerTitle}>Soft light. Quiet picks. Atelier calm.</Text>
          <Text style={styles.footerText}>Ghost Atelier · {store.name}, {store.province}</Text>
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
    paddingTop: 16,
    paddingBottom: 12,
    overflow: 'visible',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
    fontSize: 20,
    lineHeight: 28,
    paddingTop: 2,
    color: theme.colors.textPrimary,
    overflow: 'visible',
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
    color: theme.colors.white,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
  },
  spotlightSection: {
    marginBottom: theme.spacing.lg,
  },
  spotlightEyebrow: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  spotlightSlide: {
    width: SLIDE_W,
    paddingHorizontal: theme.spacing.md,
  },
  spotlightCard: {
    height: 360,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.large,
  },
  spotlightImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  spotlightScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18,18,18,0.45)',
  },
  spotlightMeta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  spotlightName: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    color: theme.colors.white,
    letterSpacing: -0.3,
  },
  spotlightPrice: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  spotlightAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 4,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
  },
  spotlightAddText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.onPrimary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: theme.spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.white,
    width: 18,
  },
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.asymmetricSm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
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
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  orbScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  orb: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    ...theme.shadows.small,
  },
  orbText: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  hScroll: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 2,
    paddingBottom: 6,
    gap: theme.spacing.md,
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
