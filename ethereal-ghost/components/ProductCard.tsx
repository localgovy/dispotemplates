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

export default function ProductCard({ product, onPress, width = 280, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const hasStrain = ['Indica','Sativa','Hybrid','CBD'].includes(product.strain);

  const sizeStyle = flex !== undefined ? { flex } : { width };

  return (
    <TouchableOpacity
      style={[styles.card, sizeStyle]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => toggle(product.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={fav ? 'heart' : 'heart-outline'}
          size={16}
          color={fav ? theme.colors.danger : 'rgba(255,255,255,0.35)'}
        />
      </TouchableOpacity>

      {isOnSale && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleBadgeText}>
            -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
          </Text>
        </View>
      )}

      <View style={styles.imageWrap}>
        <Image
          source={CATEGORY_IMAGE_MAP[product.category]}
          style={styles.image}
          resizeMode="contain"
        />
        {hasStrain && (
          <View style={styles.orbRow}>
            <View style={styles.orb} />
            <Text style={styles.strainLabel}>{product.strain}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>

        <View style={styles.footer}>
          <View>
            {isOnSale && (
              <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
            )}
            <Text style={[styles.price, isOnSale && styles.salePrice]}>
              ${product.price.toFixed(2)}
            </Text>
          </View>

          {qty > 0 ? (
            <View style={styles.qtyPill}>
              <Text style={styles.qtyText}>{qty} IN BAG</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    ...theme.asymmetric,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.medium,
  },
  heartBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.saleBadge,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saleBadgeText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    fontSize: 9,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  image: {
    width: '78%',
    height: '78%',
  },
  orbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  orb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  strainLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    letterSpacing: 2.2,
  },
  info: {
    gap: 6,
  },
  name: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  originalPrice: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    backgroundColor: 'transparent',
  },
  addBtnText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: theme.colors.textPrimary,
  },
  qtyPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryContainer,
  },
  qtyText: {
    fontFamily: theme.fonts.bold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: theme.colors.onSecondaryContainer,
  },
});
