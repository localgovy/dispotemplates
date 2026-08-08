import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import type { Product } from '../data/products';
import { CATEGORY_IMAGE_MAP } from '../data/products';
import { useFavourites } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
  onPress?: () => void;
  /** Fixed pixel width — used in horizontal scroll rows */
  width?: number;
  /** Flex fill — used in grid. Omit width when flex is set. */
  flex?: number;
}

const STRAIN_COLORS: Record<string, string> = {
  Indica: theme.colors.indica,
  Sativa: theme.colors.sativa,
  Hybrid: theme.colors.hybrid,
  CBD: theme.colors.cbd,
  'N/A': theme.colors.textMuted,
};

export default function ProductCard({ product, onPress, width, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const strainColor = STRAIN_COLORS[product.strain] ?? theme.colors.textMuted;
  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const terpenes = product.terpenes?.slice(0, 3) ?? [];
  const thcPct = product.thc ?? 0;
  const thcBarWidth = Math.min(100, Math.max(0, (thcPct / 35) * 100));

  const sizeStyle =
    flex !== undefined
      ? { flex }
      : width !== undefined
        ? { width }
        : { width: '100%' as const };

  return (
    <TouchableOpacity
      style={[styles.card, sizeStyle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrap}>
        <Image
          source={CATEGORY_IMAGE_MAP[product.category]}
          style={styles.image}
          resizeMode="cover"
        />

        {product.strain !== 'N/A' && (
          <View style={[styles.strainOnImage, { borderColor: strainColor }]}>
            <Text style={[styles.strainOnImageText, { color: strainColor }]}>
              {product.strain}
            </Text>
          </View>
        )}

        {product.isNew && (
          <View style={[styles.badge, { backgroundColor: theme.colors.newBadge }]}>
            <Text style={[styles.badgeText, { color: theme.colors.onPrimary }]}>NEW</Text>
          </View>
        )}

        {isOnSale && (
          <View style={[styles.badge, styles.saleBadgeOffset, { backgroundColor: theme.colors.saleBadge }]}>
            <Text style={styles.badgeText}>
              -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => toggle(product.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={16}
            color={fav ? theme.colors.danger : 'rgba(255,255,255,0.8)'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>

        <View style={styles.priceRow}>
          {isOnSale && (
            <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
          )}
          <Text style={[styles.price, isOnSale && styles.salePrice]}>
            ${product.price.toFixed(2)}
          </Text>
          {product.thc !== null && (
            <Text style={styles.thcInline}>THC {product.thc}%</Text>
          )}
        </View>

        {product.terpenes && product.terpenes.length > 0 && (
          <View style={styles.terpBox}>
            <Text style={styles.terpTitle}>Terpenes</Text>

            <View style={styles.potencyRow}>
              <Text style={styles.potencyLabel}>THC</Text>
              <Text style={styles.potencyValue}>{thcPct}%</Text>
            </View>
            <View style={styles.potencyTrack}>
              <View style={[styles.potencyFill, { width: `${thcBarWidth}%` }]} />
            </View>

            {terpenes.map((t) => (
              <View key={t.name} style={styles.terpRow}>
                <Text style={styles.terpName}>{t.name}</Text>
                <Text style={styles.terpPct}>{t.pct.toFixed(2)}%</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => addToCart(product)}
          activeOpacity={0.85}
        >
          <Text style={styles.addToCartText}>
            {qty > 0 ? `ADD TO CART (${qty})` : 'ADD TO CART'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.6,
    position: 'relative',
    backgroundColor: theme.colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  strainOnImage: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 1,
    borderRadius: 0,
  },
  strainOnImageText: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 0,
  },
  saleBadgeOffset: {
    left: 52,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
    fontSize: 9,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: theme.spacing.md,
    gap: 6,
  },
  name: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.text,
    lineHeight: 24,
  },
  brand: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 2,
  },
  originalPrice: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.primary,
    lineHeight: 26,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  thcInline: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.thcGreen,
    letterSpacing: 0.5,
  },
  terpBox: {
    marginTop: 6,
    padding: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    gap: 6,
  },
  terpTitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  potencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  potencyLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  potencyValue: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.primary,
  },
  potencyTrack: {
    height: 3,
    backgroundColor: theme.colors.border,
    marginBottom: 4,
  },
  potencyFill: {
    height: 3,
    backgroundColor: theme.colors.primary,
  },
  terpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.primary,
  },
  terpName: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  terpPct: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.primary,
  },
  addToCartBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  addToCartText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    letterSpacing: 1.6,
    color: theme.colors.onPrimary,
  },
});
