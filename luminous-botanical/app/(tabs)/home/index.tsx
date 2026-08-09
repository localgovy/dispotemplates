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

const CIRCLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');

const MOOD_CHIPS = ['Relax', 'Focus', 'Euphoria', 'Calm'] as const;

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
          <Ionicons name="location-sharp" size={14} color={theme.colors.accentDark} />
          <Text style={styles.locationText} numberOfLines={1}>{store.name}, {store.province}</Text>
          <Ionicons name="chevron-down" size={11} color={theme.colors.accentDark} />
        </TouchableOpacity>
        <Text style={styles.wordmark}>Luminous Botanical</Text>
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
        {/* Full-bleed image-style hero with overlay CTA */}
        <View style={styles.heroWrap}>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => router.push('/(tabs)/search')}
          >
            <View style={styles.hero}>
              <Image
                source={CATEGORY_IMAGE_MAP.Flower}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,33,18,0.55)', 'rgba(0,33,18,0.92)']}
                locations={[0, 0.45, 1]}
                style={styles.heroOverlay}
              >
                <Text style={styles.heroEyebrow}>LUMINOUS BOTANICAL</Text>
                <Text style={styles.heroTitle}>The Winter Collection</Text>
                <Text style={styles.heroSub}>
                  Soft botanicals for elevated well-being — curated with care.
                </Text>
                <View style={styles.heroBtn}>
                  <Text style={styles.heroBtnText}>Shop Collection</Text>
                  <Ionicons name="arrow-forward" size={15} color={theme.colors.primaryDark} />
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pickup pill chip */}
        <TouchableOpacity style={styles.pickupPill} activeOpacity={0.85} onPress={() => setShowStoreSheet(true)}>
          <View style={styles.pickupDot} />
          <Text style={styles.pickupPillText}>
            Pickup · {store.name} · {store.hoursShort}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Circular category row */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Botanicals</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.circleScroll}
          >
            {CIRCLE_CATEGORIES.map((cat) => {
              const imageKey = cat.id as Category;
              const image = CATEGORY_IMAGE_MAP[imageKey];
              if (!image) return null;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.circleItem}
                  onPress={() => navigateToCategory(cat.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.circleRing}>
                    <Image source={image} style={styles.circleImage} resizeMode="cover" />
                  </View>
                  <Text style={styles.circleLabel} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Effect mood strip */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScroll}
          >
            {MOOD_CHIPS.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={styles.moodChip}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/search',
                    params: { category: 'all', mood },
                  })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.moodChipText}>{mood}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Picks</Text>
            <TouchableOpacity
              style={styles.seeAllRow}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/search')}
            >
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
            <Text style={styles.sealLetter}>L</Text>
          </View>
          <Text style={styles.footerTitle}>Serenity in every leaf.</Text>
          <Text style={styles.footerText}>Luminous Botanical · {store.name}, {store.province}</Text>
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
    color: theme.colors.primary,
    overflow: 'visible',
    letterSpacing: -0.2,
    flex: 1,
    textAlign: 'center',
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
    backgroundColor: theme.colors.gold,
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
    color: theme.colors.primaryDark,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
  },

  heroWrap: {
    marginBottom: theme.spacing.md,
  },
  hero: {
    minHeight: 280,
    overflow: 'hidden',
    backgroundColor: theme.colors.primaryDark,
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    minHeight: 280,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  heroEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.gold,
  },
  heroTitle: {
    fontFamily: theme.fonts.serifItalic,
    fontSize: 32,
    lineHeight: 38,
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
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.xs,
  },
  heroBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.primaryDark,
  },

  pickupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(20, 66, 45, 0.12)',
  },
  pickupDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  pickupPillText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.primaryDark,
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
    color: theme.colors.accentDark,
    textDecorationLine: 'underline',
  },
  hScroll: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 2,
    paddingBottom: 6,
    gap: theme.spacing.md,
  },

  circleScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  circleItem: {
    alignItems: 'center',
    width: 72,
    gap: 6,
  },
  circleRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: theme.colors.secondaryContainer,
    padding: 2,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  circleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  circleLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  moodScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  moodChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryContainer,
    borderWidth: 1,
    borderColor: 'rgba(20, 66, 45, 0.12)',
  },
  moodChipText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.primaryDark,
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
