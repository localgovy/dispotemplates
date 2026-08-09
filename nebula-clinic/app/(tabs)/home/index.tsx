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
  PRODUCTS,
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

const GRID_CATEGORIES: {
  id: Category;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { id: 'Flower', label: 'Flower', icon: 'flower-outline' },
  { id: 'Pre-Rolls', label: 'Pre-Rolls', icon: 'flame-outline' },
  { id: 'Vape', label: 'Vape', icon: 'cloud-outline' },
  { id: 'Edibles', label: 'Edibles', icon: 'nutrition-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { store, setStore } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStoreSheet, setShowStoreSheet] = useState(false);

  const protocolOfDay =
    PRODUCTS.find((p) => p.isFeatured) ??
    PRODUCTS.find((p) => p.isNew) ??
    PRODUCTS[0];

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
          <Ionicons name="location-sharp" size={14} color={theme.colors.accentDark} />
          <Text style={styles.locationText} numberOfLines={1}>{store.name}, {store.province}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.accentDark} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Nebula Clinic</Text>
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
        {/* Clinical Hero */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[theme.colors.backgroundLight, theme.colors.surfaceElevated, '#d4e8df']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroEyebrow}>CLINICAL WELLNESS JOURNAL</Text>
            </View>
            <Text style={styles.heroTitle}>Lab-tested picks for mindful routines.</Text>
            <Text style={styles.heroSub}>
              Clear profiles and curated wellness favourites — ready for clinic pickup.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>BROWSE THE SHOP</Text>
              <Ionicons name="arrow-forward" size={15} color={theme.colors.white} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Pickup */}
        <TouchableOpacity style={styles.pickupCard} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupIcon}>
            <Ionicons name="storefront-outline" size={20} color={theme.colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>CLINIC PICKUP</Text>
            <Text style={styles.pickupAddress}>{store.address}, {store.city}</Text>
            <View style={styles.openRow}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>{store.hoursShort}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        {/* 2×2 Category Grid */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop</Text>
          </View>
          <View style={styles.catGrid}>
            {GRID_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={() => navigateToCategory(cat.id)}
                activeOpacity={0.85}
              >
                <View style={styles.catIconWrap}>
                  <Ionicons name={cat.icon} size={22} color={theme.colors.primaryDark} />
                </View>
                <Text style={styles.catLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Protocol of the day */}
        {protocolOfDay && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today’s pick</Text>
            </View>
            <TouchableOpacity
              style={styles.protocolCard}
              activeOpacity={0.88}
              onPress={() => handleProductPress(protocolOfDay)}
            >
              <View style={styles.protocolBadge}>
                <View style={styles.protocolDot} />
                <Text style={styles.protocolEyebrow}>
                  {protocolOfDay.isFeatured ? 'FEATURED PICK' : 'NEW ARRIVAL'}
                </Text>
              </View>
              <Text style={styles.protocolTitle}>{protocolOfDay.name}</Text>
              <Text style={styles.protocolDesc} numberOfLines={2}>
                {protocolOfDay.description}
              </Text>
              <View style={styles.protocolMeta}>
                <Text style={styles.protocolBrand}>{protocolOfDay.brand}</Text>
                {protocolOfDay.thc != null && (
                  <Text style={styles.protocolMetric}>THC {protocolOfDay.thc}%</Text>
                )}
              </View>
              <View style={styles.protocolCtaRow}>
                <TouchableOpacity
                  style={styles.protocolCta}
                  onPress={() => handleProductPress(protocolOfDay)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.protocolCtaText}>VIEW PRODUCT</Text>
                  <Ionicons name="flask-outline" size={14} color={theme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.protocolShopBtn}
                  onPress={() => router.push('/(tabs)/search')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.protocolShopText}>Shop all</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Protocols — vertical list */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Clinic deals</Text>
            <TouchableOpacity
              style={styles.seeAllRow}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dealList}>
            {DEALS.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                fullWidth
                onPress={() => router.push('/(tabs)/search')}
              />
            ))}
          </View>
        </View>

        <SectionRow
          title="New & Now"
          subtitle="Just landed in clinic"
          products={NEW_PRODUCTS}
          accentColor={theme.colors.primaryDark}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Staff picks"
          subtitle="Highest potency on shelf"
          products={TOP_TESTERS}
          accentColor={theme.colors.primaryDark}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="Budget Finds"
          subtitle="Great value"
          products={BUDGET_FINDS}
          accentColor={theme.colors.primaryDark}
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
              accentColor={theme.colors.primaryDark}
              onProductPress={handleProductPress}
              onSeeAll={() => navigateToCategory(cat)}
            />
          );
        })}

        <View style={styles.footer}>
          <View style={styles.seal}>
            <Text style={styles.sealLetter}>N</Text>
          </View>
          <Text style={styles.footerTitle}>Stay consistent with your wellness routine.</Text>
          <Text style={styles.footerText}>Nebula Clinic · {store.name}, {store.province}</Text>
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
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.primaryDark,
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
    paddingTop: theme.spacing.md,
    paddingBottom: 120,
  },

  heroWrap: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  hero: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.small,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  heroEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: theme.colors.primaryDark,
  },
  heroTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  heroSub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.xs,
  },
  heroBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: theme.colors.white,
  },

  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickupIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupLabel: {
    ...theme.typography.label,
    color: theme.colors.primaryDark,
  },
  pickupAddress: {
    fontFamily: theme.fonts.semibold,
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
    color: theme.colors.primaryDark,
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
  dealList: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  protocolCard: {
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
    ...theme.shadows.small,
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  protocolDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  protocolEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.primaryDark,
  },
  protocolTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  protocolDesc: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  protocolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  protocolBrand: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  protocolMetric: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.primaryDark,
    backgroundColor: theme.colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  protocolCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  protocolCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  protocolCtaText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.6,
    color: theme.colors.white,
  },
  protocolShopBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 8,
  },
  protocolShopText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },

  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  catCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    gap: 8,
    ...theme.shadows.small,
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  catLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.text,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    gap: 6,
  },
  seal: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  sealLetter: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.onSecondaryContainer,
  },
  footerTitle: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    color: theme.colors.primaryDark,
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
