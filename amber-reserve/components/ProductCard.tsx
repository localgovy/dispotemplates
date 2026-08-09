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

export default function ProductCard({ product, onPress, width = 160, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);

  const sizeStyle = flex !== undefined ? { flex } : { width };

  return (
    <TouchableOpacity
      style={[styles.card, sizeStyle]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrap}>
        <Image
          source={CATEGORY_IMAGE_MAP[product.category]}
          style={styles.image}
          resizeMode="cover"
        />

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
            size={14}
            color={fav ? theme.colors.danger : 'rgba(255,255,255,0.75)'}
          />
        </TouchableOpacity>

        {qty > 0 ? (
          <View style={styles.qtyBubble}>
            <Text style={styles.qtyBubbleText}>{qty}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(product)}
            activeOpacity={0.8}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="add" size={16} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {product.thc !== null && (
          <Text style={styles.thc}>THC {product.thc}%</Text>
        )}

        <View style={styles.footer}>
          <View>
            {isOnSale && (
              <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
            )}
            <Text style={[styles.price, isOnSale && styles.salePrice]}>
              ${product.price.toFixed(2)}
            </Text>
          </View>
          {['Indica','Sativa','Hybrid','CBD'].includes(product.strain) && (
            <View style={styles.strainChip}>
              <Text style={styles.strainText}>{product.strain}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
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
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  saleBadgeOffset: {
    left: 42,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
    fontSize: 9,
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBubble: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    minWidth: 26,
    height: 26,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  qtyBubbleText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
    fontSize: 11,
  },
  info: {
    padding: theme.spacing.sm,
    gap: 3,
    backgroundColor: theme.colors.surface,
  },
  brand: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.0,
    textTransform: 'uppercase' as const,
    color: theme.colors.textMuted,
  },
  name: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 19,
  },
  thc: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.thcGreen,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 3,
    gap: 4,
  },
  originalPrice: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
    lineHeight: 13,
  },
  price: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  /** Apothecary-label strain chip — parchment-ish elevated surface + serif */
  strainChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  strainText: {
    fontFamily: theme.fonts.serifRegular,
    fontSize: 10,
    lineHeight: 13,
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
});
