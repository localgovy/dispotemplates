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

function strainLabel(strain: string): string {
  if (strain === 'N/A') return 'MULTI SPECTRUM';
  return `${strain.toUpperCase()} DOMINANT`;
}

function terpDisplay(product: Product): string {
  const first = product.terpenes?.[0];
  if (!first) return '—';
  return `${first.pct.toFixed(1)}%`;
}

export default function ProductCard({ product, onPress, width, flex }: Props) {
  const { addToCart, getQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);

  const compact = width !== undefined && width < 200;
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
          <View style={[styles.badge, product.isNew ? styles.saleBadgeOffset : null, { backgroundColor: theme.colors.saleBadge }]}>
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
            color={fav ? theme.colors.danger : 'rgba(255,255,255,0.85)'}
          />
        </TouchableOpacity>

        <View style={[styles.strainTag, compact && styles.strainTagCompact]}>
          <Text style={styles.strainTagText} numberOfLines={1}>
            {strainLabel(product.strain)}
          </Text>
        </View>
      </View>

      <View style={[styles.info, compact && styles.infoCompact]}>
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={compact ? 2 : 2}>
          {product.name}
        </Text>

        {!compact && (
          <View style={styles.dataRow}>
            <View style={styles.dataCell}>
              <Text style={styles.dataLabel}>THC</Text>
              <Text style={styles.dataValue}>
                {product.thc !== null ? `${product.thc}%` : '—'}
              </Text>
            </View>
            <View style={styles.dataDivider} />
            <View style={styles.dataCell}>
              <Text style={styles.dataLabel}>CBD</Text>
              <Text style={styles.dataValue}>
                {product.cbd !== null ? `${product.cbd}%` : '—'}
              </Text>
            </View>
            <View style={styles.dataDivider} />
            <View style={styles.dataCell}>
              <Text style={styles.dataLabel}>TERP</Text>
              <Text style={styles.dataValue}>{terpDisplay(product)}</Text>
            </View>
          </View>
        )}

        {compact && product.thc !== null && (
          <Text style={styles.thcCompact}>THC {product.thc}%</Text>
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
              <Text style={styles.qtyBubbleText}>{qty}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
              activeOpacity={0.8}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="add" size={18} color={theme.colors.white} />
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
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
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
    aspectRatio: 1.15,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  saleBadgeOffset: {
    left: 48,
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
    borderRadius: 4,
    backgroundColor: 'rgba(13, 28, 45, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strainTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#dbe9ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
  },
  strainTagCompact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    bottom: 6,
    left: 6,
  },
  strainTagText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: theme.colors.accentDark,
    textTransform: 'uppercase',
  },
  info: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoCompact: {
    padding: theme.spacing.sm,
    gap: 4,
  },
  name: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: theme.colors.text,
    lineHeight: 22,
  },
  nameCompact: {
    fontSize: 13,
    lineHeight: 17,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    paddingVertical: 10,
  },
  dataCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  dataDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.divider,
  },
  dataLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 9,
    letterSpacing: 1,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  dataValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.primaryDark,
  },
  thcCompact: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.primary,
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
    lineHeight: 14,
  },
  price: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.text,
    lineHeight: 22,
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBubble: {
    backgroundColor: theme.colors.primary,
  },
  qtyBubbleText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.white,
  },
});
