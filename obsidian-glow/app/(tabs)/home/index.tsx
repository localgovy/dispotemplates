import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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

export default function HomeScreen() {
  const router = useRouter();
  const { totalItems } = useCart();
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.7} onPress={() => setShowStoreSheet(true)}>
          <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>{store.name}, {store.province}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Obsidian Lab</Text>
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
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroEyebrow}>HIGH-TECH APOTHECARY</Text>
            <Text style={styles.heroTitle}>Lab-verified strains under UV light.</Text>
            <Text style={styles.heroSub}>
              Terpene transparency and cyan-lit potency for the connoisseur.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>ENTER THE LAB</Text>
              <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.pickupCard} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupIcon}>
            <Ionicons name="storefront-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>Pickup</Text>
            <Text style={styles.pickupAddress}>{store.address}, {store.city}</Text>
            <View style={styles.openRow}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>{store.hoursShort}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        {/* Deal spotlight — split panels */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deal Spotlight</Text>
            <Text style={styles.metricHint}>LIVE OFFERS</Text>
          </View>
          {DEALS[0] && (
            <TouchableOpacity
              style={styles.dealSplitFeature}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={DEALS[0].gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dealSplitLeft}
              >
                <Text style={styles.dealSplitBadge}>{DEALS[0].badge}</Text>
                <Text style={styles.dealSplitEyebrow}>Today’s deal</Text>
              </LinearGradient>
              <View style={styles.dealSplitRight}>
                <Text style={styles.dealSplitTitle}>{DEALS[0].title}</Text>
                <Text style={styles.dealSplitSub}>{DEALS[0].subtitle}</Text>
                <Text style={styles.dealSplitCta}>Shop offer →</Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.dealSplitRow}>
            {DEALS.slice(1).map((deal) => (
              <TouchableOpacity
                key={deal.id}
                style={styles.dealSplitHalf}
                onPress={() => router.push('/(tabs)/search')}
                activeOpacity={0.88}
              >
                <View style={[styles.dealSplitHalfAccent, { backgroundColor: deal.color }]} />
                <View style={styles.dealSplitHalfBody}>
                  <Text style={styles.dealSplitHalfBadge}>{deal.badge}</Text>
                  <Text style={styles.dealSplitHalfTitle} numberOfLines={2}>{deal.title}</Text>
                  <Text style={styles.dealSplitHalfSub} numberOfLines={2}>{deal.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sharp segmented categories */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse the Archive</Text>
          </View>
          <View style={styles.segmentRow}>
            {CATEGORIES.slice(0, 5).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.segmentBtn}
                onPress={() => navigateToCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.segmentText} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.segmentRow, { marginTop: 1 }]}>
            {CATEGORIES.slice(5).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.segmentBtn}
                onPress={() => navigateToCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.segmentText} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
            <Text style={styles.sealLetter}>O</Text>
          </View>
          <Text style={styles.footerTitle}>Lab-verified. Cyan-lit. Ready for pickup.</Text>
          <Text style={styles.footerText}>Obsidian Lab · {store.name}, {store.province}</Text>
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
    borderRadius: 0,
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
    paddingTop: theme.spacing.md,
    paddingBottom: 120,
  },
  heroWrap: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  hero: {
    borderRadius: 0,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  heroEyebrow: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.onPrimary,
  },
  heroTitle: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 30,
    lineHeight: 36,
    color: theme.colors.onPrimary,
  },
  heroSub: {
    ...theme.typography.body,
    color: theme.colors.onPrimaryMuted,
    marginBottom: theme.spacing.xs,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: 0,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  heroBtnText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 1.2,
    color: theme.colors.primary,
  },
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  pickupIcon: {
    width: 44,
    height: 44,
    borderRadius: 0,
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
    borderRadius: 0,
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
  metricHint: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.textMuted,
  },
  dealSplitFeature: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    minHeight: 118,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  dealSplitLeft: {
    width: 108,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  dealSplitBadge: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.onPrimary,
  },
  dealSplitEyebrow: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: 'rgba(0, 54, 58, 0.7)',
  },
  dealSplitRight: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
    gap: 4,
  },
  dealSplitTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    lineHeight: 26,
    color: theme.colors.primary,
  },
  dealSplitSub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  dealSplitCta: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.primary,
    marginTop: 6,
  },
  dealSplitRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dealSplitHalf: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 112,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  dealSplitHalfAccent: {
    width: 6,
  },
  dealSplitHalfBody: {
    flex: 1,
    padding: theme.spacing.sm + 2,
    gap: 4,
    justifyContent: 'center',
  },
  dealSplitHalfBadge: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: theme.colors.primary,
  },
  dealSplitHalfTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    lineHeight: 20,
    color: theme.colors.text,
  },
  dealSplitHalfSub: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.primary,
  },
  segmentText: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    color: theme.colors.primary,
    textTransform: 'uppercase',
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
    borderRadius: 0,
    backgroundColor: theme.colors.secondaryContainer,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  sealLetter: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 28,
    color: theme.colors.primary,
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
