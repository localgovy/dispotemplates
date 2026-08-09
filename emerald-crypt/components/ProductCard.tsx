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
  /** Flex fill — used in grid (2-column FlatList). Omit width when flex is set. */
  flex?: number;
}

export default function ProductCard({ product, onPress, width = 200, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const terpenes = product.terpenes?.slice(0, 3) ?? [];

  const sizeStyle = flex !== undefined ? { flex } : { width };

  return (
    <TouchableOpacity
      style={[styles.card, sizeStyle]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.imageWrap}>
        <Image
          source={CATEGORY_IMAGE_MAP[product.category]}
          style={styles.image}
          resizeMode="cover"
        />

        {['Indica','Sativa','Hybrid','CBD'].includes(product.strain) && (
          <View style={styles.strainBadge}>
            <Text style={styles.strainBadgeText}>{product.strain}</Text>
          </View>
        )}

        {product.thc !== null && (
          <View style={styles.thcBadge}>
            <Text style={styles.thcBadgeText}>THC {product.thc}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => toggle(product.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={14}
            color={fav ? theme.colors.danger : theme.colors.primaryLight}
          />
        </TouchableOpacity>

        {isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>
              -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>

        {terpenes.length > 0 && (
          <View style={styles.terpeneBlock}>
            {terpenes.map((t) => (
              <View key={t.name} style={styles.terpeneRow}>
                <View style={styles.terpeneLabelRow}>
                  <Text style={styles.terpeneName}>{t.name}</Text>
                  <Text style={styles.terpenePct}>{t.pct.toFixed(1)}%</Text>
                </View>
                <View style={styles.terpeneTrack}>
                  <View
                    style={[
                      styles.terpeneFill,
                      { width: `${Math.min(Math.max(t.pct * 12, 8), 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.priceRow}>
          {isOnSale && (
            <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
          )}
          <Text style={[styles.price, isOnSale && styles.salePrice]}>
            ${product.price.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.acquireBtn}
          onPress={() => addToCart(product)}
          activeOpacity={0.85}
        >
          <Text style={styles.acquireText}>
            {qty > 0 ? `Add to cart · ${qty}` : 'Add to cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.4,
    position: 'relative',
    backgroundColor: theme.colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  strainBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  strainBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: theme.colors.primaryLight,
  },
  thcBadge: {
    position: 'absolute',
    top: 6,
    right: 34,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 1,
    borderColor: theme.colors.thcGreen + '66',
  },
  thcBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: theme.colors.thcGreen,
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.saleBadge,
  },
  saleBadgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: theme.colors.primaryLight,
  },
  info: {
    padding: theme.spacing.sm + 2,
    gap: 6,
  },
  name: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  description: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  terpeneBlock: {
    gap: 5,
    marginTop: 2,
  },
  terpeneRow: {
    gap: 3,
  },
  terpeneLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  terpeneName: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    color: theme.colors.textSecondary,
  },
  terpenePct: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: theme.colors.primaryLight,
  },
  terpeneTrack: {
    height: 3,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 1,
    overflow: 'hidden',
  },
  terpeneFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  originalPrice: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  acquireBtn: {
    marginTop: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xs,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acquireText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: theme.colors.onPrimary,
  },
});
