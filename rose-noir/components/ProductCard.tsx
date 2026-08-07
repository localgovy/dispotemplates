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

const STRAIN_COLORS: Record<string, string> = {
  Indica: theme.colors.indica,
  Sativa: theme.colors.sativa,
  Hybrid: theme.colors.hybrid,
  CBD: theme.colors.cbd,
  'N/A': theme.colors.textMuted,
};

export default function ProductCard({ product, onPress, width = 160, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const strainColor = STRAIN_COLORS[product.strain] ?? theme.colors.textMuted;
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
        <View style={styles.imageScrim} />

        {product.isNew && (
          <View style={[styles.badge, { backgroundColor: theme.colors.newBadge }]}>
            <Text style={styles.badgeText}>NEW</Text>
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
            color={fav ? theme.colors.saleRed : theme.colors.primaryLight}
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
          {product.strain !== 'N/A' && (
            <View style={[styles.strainPill, { borderColor: strainColor + '55' }]}>
              <Text style={[styles.strainText, { color: strainColor }]}>{product.strain}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 26, 26, 0.72)',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.15,
    position: 'relative',
    backgroundColor: theme.colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 10, 0.18)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryContainer,
  },
  saleBadgeOffset: {
    left: 48,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.primaryLight,
    fontSize: 9,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(10, 10, 10, 0.55)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  qtyBubble: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
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
    padding: theme.spacing.sm + 2,
    gap: 3,
  },
  brand: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: theme.colors.accent,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  name: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  thc: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.primaryLight,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
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
    fontSize: 17,
    color: theme.colors.textPrimary,
    lineHeight: 21,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  strainPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryContainer,
    borderWidth: 1,
  },
  strainText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 9,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
