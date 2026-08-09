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
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import theme from '../../../theme';
import {
  DEALS,
  NEW_PRODUCTS,
  TOP_TESTERS,
  CATEGORIES,
  PRODUCTS,
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

export default function HomeScreen() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { store, setStore } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStoreSheet, setShowStoreSheet] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const archiveStats = useMemo(() => {
    const withThc = TOP_TESTERS.filter((p) => p.thc != null);
    const avgThc =
      withThc.length > 0
        ? withThc.reduce((sum, p) => sum + (p.thc ?? 0), 0) / withThc.length
        : 0;
    return {
      productCount: PRODUCTS.length,
      avgThc,
      dropLabel: 'This week',
    };
  }, []);

  const handleProductPress = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const navigateToCategory = useCallback((categoryId: string) => {
    setActiveTab(categoryId);
    router.push({ pathname: '/(tabs)/search', params: { category: categoryId } });
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationPill} activeOpacity={0.7} onPress={() => setShowStoreSheet(true)}>
          <Ionicons name="location-sharp" size={14} color={theme.colors.primaryLight} />
          <Text style={styles.locationText} numberOfLines={1}>{store.name}, {store.province}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.primaryLight} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Emerald Crypt</Text>
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

      {/* Vault stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>DROP</Text>
          <Text style={styles.statValue}>{archiveStats.dropLabel}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>STRAINS</Text>
          <Text style={styles.statValue}>{archiveStats.productCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>AVG THC</Text>
          <Text style={styles.statValue}>{archiveStats.avgThc.toFixed(1)}%</Text>
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
            <Text style={styles.heroEyebrow}>Fresh from the vault</Text>
            <Text style={styles.heroTitle}>Reserve strains from the vault.</Text>
            <Text style={styles.heroSub}>
              Lab-logged cultivars · terpene maps · sealed for pickup.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>OPEN THE VAULT</Text>
              <Ionicons name="arrow-forward" size={15} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.pickupCard} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupIcon}>
            <Ionicons name="storefront-outline" size={20} color={theme.colors.primaryLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupLabel}>VAULT PICKUP</Text>
            <Text style={styles.pickupAddress}>{store.address}, {store.city}</Text>
            <View style={styles.openRow}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>{store.hoursShort}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>

        {/* File-tab categories */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse the Vault</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRail}
          >
            <TouchableOpacity
              style={styles.fileTab}
              onPress={() => {
                setActiveTab('all');
                router.push('/(tabs)/search');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.fileTabText, activeTab === 'all' && styles.fileTabTextActive]}>
                ALL
              </Text>
              {activeTab === 'all' && <View style={styles.fileTabUnderline} />}
            </TouchableOpacity>
            {CATEGORIES.map((cat) => {
              const active = activeTab === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.fileTab}
                  onPress={() => navigateToCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.fileTabText, active && styles.fileTabTextActive]}>
                    {cat.name.toUpperCase()}
                  </Text>
                  {active && <View style={styles.fileTabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vault Specials</Text>
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

        {/* Emphasize Top Testers — first curated rail */}
        <SectionRow
          title="Staff picks"
          subtitle="Highest potency in the vault"
          products={TOP_TESTERS}
          accentColor={theme.colors.primaryLight}
          onProductPress={handleProductPress}
        />
        <SectionRow
          title="New & Now"
          subtitle="Just landed in store"
          products={NEW_PRODUCTS}
          accentColor={theme.colors.primaryLight}
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
              accentColor={theme.colors.primaryLight}
              onProductPress={handleProductPress}
              onSeeAll={() => navigateToCategory(cat)}
            />
          );
        })}

        <View style={styles.footer}>
          <View style={styles.seal}>
            <Text style={styles.sealLetter}>E</Text>
          </View>
          <Text style={styles.footerTitle}>Sealed strains. Vault-ready pickup.</Text>
          <Text style={styles.footerText}>Emerald Crypt · {store.name}, {store.province}</Text>
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
    color: theme.colors.primaryLight,
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
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    color: theme.colors.primaryLight,
  },
  statValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.textPrimary,
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
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
    ...theme.asymmetric,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  heroEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.gold,
  },
  heroTitle: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 30,
    lineHeight: 36,
    color: theme.colors.white,
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
    backgroundColor: theme.colors.gold,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.xs,
  },
  heroBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    letterSpacing: 1,
    color: theme.colors.primaryDark,
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
    color: theme.colors.primaryLight,
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
    color: theme.colors.primaryLight,
    textDecorationLine: 'underline',
  },
  tabRail: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
    alignItems: 'flex-end',
  },
  fileTab: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  fileTabText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
  },
  fileTabTextActive: {
    color: theme.colors.primaryLight,
  },
  fileTabUnderline: {
    marginTop: 6,
    height: 2,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.primary,
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
