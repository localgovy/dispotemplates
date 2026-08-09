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
  Sativa: theme.colors.gold,
  Hybrid: theme.colors.hybrid,
  CBD: theme.colors.cbd,
  Accessory: theme.colors.textMuted,
  Apparel: theme.colors.textMuted,
};

export default function ProductCard({ product, onPress, width, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const strainColor = STRAIN_COLORS[product.strain] ?? theme.colors.textMuted;
  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const compact = width !== undefined && width < 200;
  const effects = (product.effects ?? []).slice(0, compact ? 1 : 2);

  const sizeStyle =
    flex !== undefined
      ? { flex }
      : width !== undefined
        ? { width }
        : { width: '100%' as const };

  return (
    <TouchableOpacity
      style={[styles.card, sizeStyle, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
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
          <View
            style={[
              styles.badge,
              product.isNew ? styles.saleBadgeOffset : null,
              { backgroundColor: theme.colors.saleBadge },
            ]}
          >
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

        {product.thc !== null && (
          <View style={styles.thcBadge}>
            <Text style={styles.thcBadgeText}>THC {product.thc}%</Text>
          </View>
        )}
      </View>

      <View style={[styles.info, compact && styles.infoCompact]}>
        {['Indica','Sativa','Hybrid','CBD'].includes(product.strain) && (
          <View style={[styles.strainPill, { backgroundColor: strainColor + '22', borderColor: strainColor + '55' }]}>
            <Text style={[styles.strainText, { color: strainColor }]}>{product.strain}</Text>
          </View>
        )}

        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={2}>
          {product.name}
        </Text>

        {effects.length > 0 && (
          <View style={styles.effects}>
            {effects.map((fx) => (
              <View key={fx.label} style={styles.effectRow}>
                <View style={styles.effectLabelRow}>
                  <Text style={styles.effectLabel}>{fx.label}</Text>
                  <Text style={styles.effectPct}>{Math.round(fx.value)}%</Text>
                </View>
                <View style={styles.effectTrack}>
                  <View
                    style={[
                      styles.effectFill,
                      { width: `${Math.min(Math.max(fx.value, 8), 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
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

          {qty > 0 ? (
            <View style={[styles.addBtn, styles.qtyBubble]}>
              <Text style={styles.qtyText}>{qty}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
              activeOpacity={0.85}
            >
              <Ionicons name="cart-outline" size={14} color={theme.colors.white} />
              {!compact && <Text style={styles.addBtnText}>Add</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(191, 237, 209, 0.7)',
    ...theme.shadows.small,
  },
  cardCompact: {
    borderRadius: theme.radius.md,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.55,
    position: 'relative',
    backgroundColor: theme.colors.backgroundLight,
  },
  imageWrapCompact: {
    aspectRatio: 1.3,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thcBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  thcBadgeText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: theme.colors.white,
    letterSpacing: 0.3,
  },
  info: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoCompact: {
    padding: theme.spacing.sm,
    gap: 6,
  },
  strainPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  strainText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 18,
    color: theme.colors.text,
    lineHeight: 24,
  },
  nameCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
  effects: {
    gap: 6,
  },
  effectRow: {
    gap: 3,
  },
  effectLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  effectLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  effectPct: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    color: theme.colors.primary,
  },
  effectTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceLight,
    overflow: 'hidden',
  },
  effectFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.primaryLight,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    color: theme.colors.text,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  addBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.white,
  },
  qtyBubble: {
    minWidth: 36,
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.white,
    textAlign: 'center',
  },
});
