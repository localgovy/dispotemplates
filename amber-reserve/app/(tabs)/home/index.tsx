import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

const RAPID_REORDER = [...TOP_TESTERS, ...NEW_PRODUCTS].slice(0, 8);

export default function HomeScreen() {
  const router = useRouter();
  const { totalItems, addToCart } = useCart();
  const { store, setStore } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStoreSheet, setShowStoreSheet] = useState(false);

  const handleProductPress = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const navigateToCategory = useCallback((categoryId: string) => {
    router.push({ pathname: '/(tabs)/search', params: { category: categoryId } });
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.7} onPress={() => setShowStoreSheet(true)}>
          <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{store.name}, {store.province}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Amber Reserve</Text>
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
        {/* ── Full-bleed Editorial Hero ──────────────────────── */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroEyebrow}>THE RESERVE COLLECTION</Text>
            <Text style={styles.heroTitle}>Crafted for the discerning lounge.</Text>
            <Text style={styles.heroSub}>
              Aged selections and amber-lit rituals for members who know.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>ENTER THE LOUNGE</Text>
              <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ── Quick picks ─────────────────────────────────── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick picks</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rapidScroll}
          >
            {RAPID_REORDER.map((product) => (
              <View key={`rapid-${product.id}`} style={styles.rapidRow}>
                <TouchableOpacity
                  style={styles.rapidMain}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={CATEGORY_IMAGE_MAP[product.category]}
                    style={styles.rapidThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.rapidMeta}>
                    <Text style={styles.rapidName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.rapidPrice}>${product.price.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rapidAdd}
                  onPress={() => addToCart(product)}
                  activeOpacity={0.85}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Ionicons name="add" size={16} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Nearest Sanctuary ──────────────────────────────── */}
        <View style={styles.sanctuaryCard}>
          <View style={styles.sanctuaryTop}>
            <View style={styles.pickupIcon}>
              <Ionicons name="storefront-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pickupLabel}>NEAREST SANCTUARY</Text>
              <Text style={styles.pickupAddress}>{store.address}, {store.city}</Text>
              <View style={styles.openRow}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>{store.hoursShort}</Text>
              </View>
            </View>
          </View>
          <View style={styles.sanctuaryActions}>
            <TouchableOpacity
              style={styles.sanctuaryBtnSecondary}
              onPress={() => setShowStoreSheet(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.sanctuaryBtnSecondaryText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sanctuaryBtnPrimary}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.sanctuaryBtnPrimaryText}>Shop</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Categories — text rail ─────────────────────────── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse the Humidor</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.textRail}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => navigateToCategory(cat.id)}
                activeOpacity={0.7}
                style={styles.textLink}
              >
                <Text style={styles.textLinkLabel}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Featured Reserves — stacked story cards ────────── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Reserves</Text>
            <TouchableOpacity style={styles.seeAllRow} activeOpacity={0.7} onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.storyStack}>
            {DEALS.map((deal, index) => (
              <TouchableOpacity
                key={deal.id}
                style={styles.storyCard}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/search')}
              >
                <LinearGradient
                  colors={deal.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.storyGradient}
                >
                  <View style={styles.storyTop}>
                    <View style={styles.storyBadge}>
                      <Text style={styles.storyBadgeText}>{deal.badge}</Text>
                    </View>
                    <Text style={styles.storyIndex}>0{index + 1}</Text>
                  </View>
                  <Text style={styles.storyTitle}>{deal.title}</Text>
                  <Text style={styles.storySubtitle}>{deal.subtitle}</Text>
                  <Text style={styles.storyCta}>Shop this offer →</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Curated Sections ───────────────────────────────── */}
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
          accentColor={theme.colors.primary}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Budget Finds"
          subtitle="Great value"
          products={BUDGET_FINDS}
          accentColor={theme.colors.primary}
          onProductPress={handleProductPress}
        />

        {/* ── Per-Category Sections ──────────────────────────── */}
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

        {/* ── Seal Footer ────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.seal}>
            <Text style={styles.sealLetter}>A</Text>
          </View>
          <Text style={styles.footerTitle}>Crafted for the quiet ritual.</Text>
          <Text style={styles.footerText}>Amber Reserve · {store.name}, {store.province}</Text>
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
    fontSize: 22,
    lineHeight: 30,
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: theme.colors.onPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 120,
  },

  // Full-bleed hero
  heroWrap: {
    marginBottom: theme.spacing.lg,
  },
  hero: {
    borderRadius: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl + 8,
    gap: theme.spacing.sm,
    minHeight: 240,
    justifyContent: 'flex-end',
  },
  heroEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 2,
    color: '#fff',
  },
  heroTitle: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 32,
    lineHeight: 38,
    color: '#fff',
  },
  heroSub: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: theme.spacing.xs,
    maxWidth: 320,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    color: theme.colors.primary,
  },

  // Rapid Re-order
  rapidScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  rapidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 220,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  rapidMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rapidThumb: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surfaceElevated,
  },
  rapidMeta: {
    flex: 1,
    gap: 2,
  },
  rapidName: {
    fontFamily: theme.fonts.serif,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 16,
  },
  rapidPrice: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  rapidAdd: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Nearest Sanctuary
  sanctuaryCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  sanctuaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pickupIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
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
  sanctuaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sanctuaryBtnSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  sanctuaryBtnSecondaryText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  sanctuaryBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
  },
  sanctuaryBtnPrimaryText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.onPrimary,
  },

  // Sections
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
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },

  // Text category rail
  textRail: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
    alignItems: 'center',
  },
  textLink: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  textLinkLabel: {
    fontFamily: theme.fonts.serif,
    fontSize: 15,
    color: theme.colors.textSecondary,
    letterSpacing: 0.2,
  },

  // Stacked story deals
  storyStack: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  storyCard: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  storyGradient: {
    padding: theme.spacing.lg,
    minHeight: 168,
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  storyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storyBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  storyBadgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  storyIndex: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 22,
    color: 'rgba(255,255,255,0.55)',
  },
  storyTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 24,
    lineHeight: 30,
    color: theme.colors.white,
  },
  storySubtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  storyCta: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 4,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: 6,
  },
  seal: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.md,
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
