import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import type { Product } from '../data/products';
import { CATEGORY_IMAGE_MAP } from '../data/products';
import { useFavourites } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
  rank: number;
  onPress?: () => void;
}

const STRAIN_COLORS: Record<string, string> = {
  Indica: theme.colors.indica,
  Sativa: theme.colors.sativa,
  Hybrid: theme.colors.hybrid,
  CBD: theme.colors.cbd,
  Accessory: theme.colors.textMuted,
  Apparel: theme.colors.textMuted,
};

export default function AIPickCard({ product, rank, onPress }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const strainColor = STRAIN_COLORS[product.strain] ?? theme.colors.textMuted;
  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const showStrain = ['Indica', 'Sativa', 'Hybrid', 'CBD'].includes(product.strain);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>

      <View style={styles.imageWrap}>
        <Image
          source={CATEGORY_IMAGE_MAP[product.category]}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        <View style={styles.metaRow}>
          {product.thc !== null && (
            <Text style={styles.meta}>THC {product.thc}%</Text>
          )}
          {product.thc !== null && showStrain && <Text style={styles.metaDot}>·</Text>}
          {showStrain && (
            <View style={[styles.strainPill, { borderColor: strainColor + '66' }]}>
              <Text style={[styles.strainText, { color: strainColor }]}>{product.strain}</Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          {isOnSale && (
            <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
          )}
          <Text style={[styles.price, isOnSale && styles.salePrice]}>
            ${product.price.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => toggle(product.id)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={16}
            color={fav ? theme.colors.saleRed : theme.colors.textMuted}
          />
        </TouchableOpacity>

        {qty > 0 ? (
          <View style={styles.addBtn}>
            <Text style={styles.qtyText}>{qty}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(product)}
            activeOpacity={0.85}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 2,
    padding: theme.spacing.sm + 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    lineHeight: 14,
    color: theme.colors.onPrimary,
  },
  imageWrap: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceElevated,
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    paddingVertical: 2,
  },
  brand: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: theme.colors.textMuted,
  },
  name: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    lineHeight: 20,
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 1,
  },
  meta: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    color: theme.colors.primaryLight,
  },
  metaDot: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  strainPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    backgroundColor: theme.colors.secondaryContainer,
  },
  strainText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 9,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    fontFamily: theme.fonts.serifBold,
    fontSize: 17,
    lineHeight: 20,
    color: theme.colors.textPrimary,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexShrink: 0,
    paddingLeft: 2,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  qtyText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.onPrimary,
  },
});
