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
  /** Horizontal clinical list row layout */
  list?: boolean;
}

const STRAIN_STAMPS: Record<string, { bg: string; fg: string }> = {
  Indica: { bg: 'rgba(155, 140, 255, 0.28)', fg: '#5B4BB8' },
  Sativa: { bg: 'rgba(255, 122, 89, 0.22)', fg: '#E55A3A' },
  Hybrid: { bg: 'rgba(125, 211, 252, 0.35)', fg: '#2B8BB8' },
  CBD: { bg: 'rgba(91, 124, 250, 0.20)', fg: '#3D5BD9' },
  'N/A': { bg: 'rgba(138, 155, 184, 0.18)', fg: '#8A9BB8' },
};

function firstEffectLabel(product: Product): string | null {
  if (product.effects && product.effects.length > 0) {
    return product.effects[0].label;
  }
  return product.tags[0] ?? null;
}

export default function ProductCard({ product, onPress, width = 160, flex, list }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const stamp = STRAIN_STAMPS[product.strain] ?? STRAIN_STAMPS['N/A'];
  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const effectLabel = firstEffectLabel(product);

  if (list) {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.listImageWrap}>
          <Image
            source={CATEGORY_IMAGE_MAP[product.category]}
            style={styles.listImage}
            resizeMode="cover"
          />
          {isOnSale && (
            <View style={styles.listSaleBadge}>
              <Text style={styles.badgeText}>
                -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.listInfo}>
          <View style={styles.listTopRow}>
            {product.strain !== 'N/A' && (
              <View style={[styles.stamp, { backgroundColor: stamp.bg }]}>
                <Text style={[styles.stampText, { color: stamp.fg }]}>{product.strain}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => toggle(product.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={18}
                color={fav ? theme.colors.accent : theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.listName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>

          <View style={styles.chipRow}>
            {product.thc !== null && (
              <View style={styles.pastelChip}>
                <Text style={styles.pastelChipText}>THC {product.thc}%</Text>
              </View>
            )}
            {effectLabel && (
              <View style={[styles.pastelChip, styles.effectChip]}>
                <Text style={[styles.pastelChipText, { color: theme.colors.primaryDark }]}>
                  {effectLabel}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.listFooter}>
            <View>
              {isOnSale && (
                <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
              )}
              <Text style={[styles.price, isOnSale && styles.salePrice]}>
                ${product.price.toFixed(2)}
              </Text>
            </View>
            {qty > 0 ? (
              <View style={styles.addBtn}>
                <Text style={styles.qtyText}>{qty}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(product)} activeOpacity={0.85}>
                <Ionicons name="add" size={18} color={theme.colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

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
            color={fav ? theme.colors.accent : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        {product.strain !== 'N/A' && (
          <View style={[styles.stamp, { backgroundColor: stamp.bg, alignSelf: 'flex-start' }]}>
            <Text style={[styles.stampText, { color: stamp.fg }]}>{product.strain}</Text>
          </View>
        )}

        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>

        {effectLabel && (
          <View style={[styles.pastelChip, styles.effectChip, { alignSelf: 'flex-start' }]}>
            <Text style={[styles.pastelChipText, { color: theme.colors.primaryDark }]}>
              {effectLabel}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.thcPriceRow}>
            {product.thc !== null && (
              <Text style={styles.thc}>THC {product.thc}%</Text>
            )}
            <View style={styles.priceCol}>
              {isOnSale && (
                <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
              )}
              <Text style={[styles.price, isOnSale && styles.salePrice]}>
                ${product.price.toFixed(2)}
              </Text>
            </View>
          </View>

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
              <Ionicons name="add" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.2,
    position: 'relative',
    backgroundColor: theme.colors.surfaceElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
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
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  info: {
    padding: theme.spacing.sm + 2,
    gap: 4,
  },
  stamp: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  stampText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: theme.fonts.serif,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 19,
  },
  brand: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 14,
  },
  pastelChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(125, 211, 252, 0.35)',
  },
  effectChip: {
    backgroundColor: 'rgba(91, 124, 250, 0.14)',
  },
  pastelChipText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: '#2B8BB8',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 6,
  },
  thcPriceRow: {
    flex: 1,
    gap: 2,
  },
  thc: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.primary,
    lineHeight: 14,
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  originalPrice: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 20,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.white,
  },

  // Clinical list layout
  listCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
    marginBottom: theme.spacing.sm,
  },
  listImageWrap: {
    width: 88,
    height: 88,
    position: 'relative',
    backgroundColor: theme.colors.surfaceElevated,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listSaleBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: theme.colors.saleBadge,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  listInfo: {
    flex: 1,
    padding: theme.spacing.sm + 2,
    gap: 3,
  },
  listTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listName: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});
