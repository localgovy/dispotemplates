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

const MOOD_PALETTE = [
  { bg: 'rgba(232, 93, 76, 0.16)', fg: '#C43D2E' },   // coral
  { bg: 'rgba(245, 197, 24, 0.28)', fg: '#9A7A00' },   // citrus
  { bg: 'rgba(60, 179, 113, 0.18)', fg: '#2A8F55' },   // lime
] as const;

function moodColorForLabel(label: string, index: number) {
  const key = label.toLowerCase();
  if (/relax|calm|sleep|ease|body/.test(key)) return MOOD_PALETTE[2];
  if (/uplift|energy|focus|creative|mind|happy/.test(key)) return MOOD_PALETTE[1];
  if (/euphor|social|arous|potent|heavy/.test(key)) return MOOD_PALETTE[0];
  return MOOD_PALETTE[index % MOOD_PALETTE.length];
}

function moodLabels(product: Product): string[] {
  if (product.effects && product.effects.length > 0) {
    return product.effects.map((e) => e.label).slice(0, 3);
  }
  return product.tags.slice(0, 2);
}

export default function ProductCard({ product, onPress, width = 160, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const moods = moodLabels(product);

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
            color={fav ? theme.colors.danger : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {moods.length > 0 && (
          <View style={styles.moodRow}>
            <Text style={styles.moodLabel}>Mood</Text>
            <View style={styles.chipRow}>
              {moods.map((label, i) => {
                const c = moodColorForLabel(label, i);
                return (
                  <View key={`${label}-${i}`} style={[styles.moodChip, { backgroundColor: c.bg }]}>
                    <Text style={[styles.moodChipText, { color: c.fg }]} numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.priceCol}>
            {isOnSale && (
              <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
            )}
            <Text style={[styles.price, isOnSale && styles.salePrice]}>
              ${product.price.toFixed(2)}
            </Text>
          </View>

          {qty > 0 ? (
            <View style={styles.qtyBubble}>
              <Text style={styles.qtyBubbleText}>{qty}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => addToCart(product)}
              activeOpacity={0.85}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="add" size={16} color={theme.colors.white} />
              <Text style={styles.ctaText}>Add</Text>
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
    borderWidth: 2,
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
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  info: {
    padding: theme.spacing.sm + 2,
    gap: 4,
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
  moodRow: {
    gap: 4,
    marginTop: 2,
  },
  moodLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  moodChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    maxWidth: '100%',
  },
  moodChipText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    lineHeight: 13,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 6,
  },
  priceCol: {
    flexShrink: 1,
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
    color: theme.colors.text,
    lineHeight: 21,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
  },
  ctaText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.white,
  },
  qtyBubble: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  qtyBubbleText: {
    ...theme.typography.label,
    color: theme.colors.white,
    fontSize: 12,
  },
});
